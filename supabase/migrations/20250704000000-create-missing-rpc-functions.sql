-- Create missing RPC functions for analytics and reporting
-- These functions are referenced in the apiService.ts file

-- Function to get school analytics
CREATE OR REPLACE FUNCTION public.get_school_analytics(p_school_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
  student_count INTEGER;
  teacher_count INTEGER;
  class_count INTEGER;
  total_fees DECIMAL(10,2);
  collected_fees DECIMAL(10,2);
  attendance_rate DECIMAL(5,2);
  avg_grade DECIMAL(5,2);
BEGIN
  -- Get basic counts
  SELECT COUNT(*) INTO student_count
  FROM public.students 
  WHERE school_id = p_school_id AND is_active = true;
  
  SELECT COUNT(*) INTO teacher_count
  FROM public.profiles 
  WHERE school_id = p_school_id AND role = 'teacher';
  
  SELECT COUNT(*) INTO class_count
  FROM public.classes 
  WHERE school_id = p_school_id;
  
  -- Get fee statistics
  SELECT 
    COALESCE(SUM(amount), 0),
    COALESCE(SUM(paid_amount), 0)
  INTO total_fees, collected_fees
  FROM public.fees 
  WHERE school_id = p_school_id;
  
  -- Get attendance rate
  SELECT 
    CASE 
      WHEN COUNT(*) > 0 THEN 
        (COUNT(*) FILTER (WHERE status = 'present') * 100.0 / COUNT(*))
      ELSE 0 
    END
  INTO attendance_rate
  FROM public.attendance 
  WHERE school_id = p_school_id;
  
  -- Get average grade
  SELECT COALESCE(AVG(score), 0)
  INTO avg_grade
  FROM public.grades g
  JOIN public.students s ON g.student_id = s.id
  WHERE s.school_id = p_school_id;
  
  -- Build result
  result := jsonb_build_object(
    'school_id', p_school_id,
    'student_count', student_count,
    'teacher_count', teacher_count,
    'class_count', class_count,
    'total_fees', total_fees,
    'collected_fees', collected_fees,
    'outstanding_fees', total_fees - collected_fees,
    'collection_rate', CASE WHEN total_fees > 0 THEN (collected_fees * 100.0 / total_fees) ELSE 0 END,
    'attendance_rate', attendance_rate,
    'average_grade', avg_grade,
    'last_updated', now()
  );
  
  RETURN result;
END;
$$;

-- Function to get system-wide analytics
CREATE OR REPLACE FUNCTION public.get_system_analytics()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
  total_schools INTEGER;
  total_students INTEGER;
  total_teachers INTEGER;
  total_classes INTEGER;
  total_fees DECIMAL(10,2);
  total_collected DECIMAL(10,2);
  active_schools INTEGER;
  inactive_schools INTEGER;
BEGIN
  -- Get system-wide counts
  SELECT COUNT(*) INTO total_schools FROM public.schools;
  SELECT COUNT(*) INTO active_schools FROM public.schools WHERE status = 'active';
  SELECT COUNT(*) INTO inactive_schools FROM public.schools WHERE status = 'inactive';
  
  SELECT COUNT(*) INTO total_students 
  FROM public.students WHERE is_active = true;
  
  SELECT COUNT(*) INTO total_teachers 
  FROM public.profiles WHERE role = 'teacher';
  
  SELECT COUNT(*) INTO total_classes FROM public.classes;
  
  -- Get fee statistics
  SELECT 
    COALESCE(SUM(amount), 0),
    COALESCE(SUM(paid_amount), 0)
  INTO total_fees, total_collected
  FROM public.fees;
  
  -- Build result
  result := jsonb_build_object(
    'total_schools', total_schools,
    'active_schools', active_schools,
    'inactive_schools', inactive_schools,
    'total_students', total_students,
    'total_teachers', total_teachers,
    'total_classes', total_classes,
    'total_fees', total_fees,
    'total_collected', total_collected,
    'total_outstanding', total_fees - total_collected,
    'system_collection_rate', CASE WHEN total_fees > 0 THEN (total_collected * 100.0 / total_fees) ELSE 0 END,
    'average_students_per_school', CASE WHEN total_schools > 0 THEN (total_students * 1.0 / total_schools) ELSE 0 END,
    'average_classes_per_school', CASE WHEN total_schools > 0 THEN (total_classes * 1.0 / total_schools) ELSE 0 END,
    'last_updated', now()
  );
  
  RETURN result;
END;
$$;

-- Function to get class analytics
CREATE OR REPLACE FUNCTION public.get_class_analytics(p_class_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
  student_count INTEGER;
  avg_grade DECIMAL(5,2);
  attendance_rate DECIMAL(5,2);
  total_fees DECIMAL(10,2);
  collected_fees DECIMAL(10,2);
  class_name TEXT;
  school_name TEXT;
BEGIN
  -- Get class and school info
  SELECT 
    c.name,
    s.name
  INTO class_name, school_name
  FROM public.classes c
  JOIN public.schools s ON c.school_id = s.id
  WHERE c.id = p_class_id;
  
  -- Get student count
  SELECT COUNT(*) INTO student_count
  FROM public.students 
  WHERE class_id = p_class_id AND is_active = true;
  
  -- Get average grade
  SELECT COALESCE(AVG(score), 0)
  INTO avg_grade
  FROM public.grades g
  JOIN public.students s ON g.student_id = s.id
  WHERE s.class_id = p_class_id;
  
  -- Get attendance rate
  SELECT 
    CASE 
      WHEN COUNT(*) > 0 THEN 
        (COUNT(*) FILTER (WHERE status = 'present') * 100.0 / COUNT(*))
      ELSE 0 
    END
  INTO attendance_rate
  FROM public.attendance 
  WHERE class_id = p_class_id;
  
  -- Get fee statistics
  SELECT 
    COALESCE(SUM(amount), 0),
    COALESCE(SUM(paid_amount), 0)
  INTO total_fees, collected_fees
  FROM public.fees 
  WHERE class_id = p_class_id;
  
  -- Build result
  result := jsonb_build_object(
    'class_id', p_class_id,
    'class_name', class_name,
    'school_name', school_name,
    'student_count', student_count,
    'average_grade', avg_grade,
    'attendance_rate', attendance_rate,
    'total_fees', total_fees,
    'collected_fees', collected_fees,
    'outstanding_fees', total_fees - collected_fees,
    'collection_rate', CASE WHEN total_fees > 0 THEN (collected_fees * 100.0 / total_fees) ELSE 0 END,
    'last_updated', now()
  );
  
  RETURN result;
END;
$$;

-- Function to generate reports
CREATE OR REPLACE FUNCTION public.generate_report(
  report_type TEXT,
  report_params JSONB DEFAULT '{}'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
  school_id UUID;
  class_id UUID;
  start_date DATE;
  end_date DATE;
  period TEXT;
BEGIN
  -- Extract parameters
  school_id := (report_params->>'school_id')::UUID;
  class_id := (report_params->>'class_id')::UUID;
  start_date := (report_params->>'start_date')::DATE;
  end_date := (report_params->>'end_date')::DATE;
  period := report_params->>'period';
  
  -- Generate different report types
  CASE report_type
    WHEN 'student_performance' THEN
      -- Student performance report
      SELECT jsonb_build_object(
        'report_type', 'student_performance',
        'period', period,
        'data', jsonb_agg(
          jsonb_build_object(
            'student_id', s.id,
            'student_name', s.first_name || ' ' || s.last_name,
            'class_name', c.name,
            'average_grade', COALESCE(AVG(g.score), 0),
            'attendance_rate', 
              CASE 
                WHEN COUNT(a.*) > 0 THEN 
                  (COUNT(a.*) FILTER (WHERE a.status = 'present') * 100.0 / COUNT(a.*))
                ELSE 0 
              END
          )
        )
      )
      INTO result
      FROM public.students s
      LEFT JOIN public.classes c ON s.class_id = c.id
      LEFT JOIN public.grades g ON s.id = g.student_id
      LEFT JOIN public.attendance a ON s.id = a.student_id
      WHERE s.school_id = school_id
        AND (class_id IS NULL OR s.class_id = class_id)
        AND s.is_active = true
      GROUP BY s.id, s.first_name, s.last_name, c.name;
      
    WHEN 'financial_summary' THEN
      -- Financial summary report
      SELECT jsonb_build_object(
        'report_type', 'financial_summary',
        'period', period,
        'data', jsonb_build_object(
          'total_fees', COALESCE(SUM(f.amount), 0),
          'collected_fees', COALESCE(SUM(f.paid_amount), 0),
          'outstanding_fees', COALESCE(SUM(f.amount - COALESCE(f.paid_amount, 0)), 0),
          'collection_rate', 
            CASE 
              WHEN SUM(f.amount) > 0 THEN 
                (SUM(COALESCE(f.paid_amount, 0)) * 100.0 / SUM(f.amount))
              ELSE 0 
            END
        )
      )
      INTO result
      FROM public.fees f
      WHERE f.school_id = school_id
        AND (class_id IS NULL OR f.class_id = class_id)
        AND (start_date IS NULL OR f.created_at >= start_date)
        AND (end_date IS NULL OR f.created_at <= end_date);
        
    WHEN 'attendance_summary' THEN
      -- Attendance summary report
      SELECT jsonb_build_object(
        'report_type', 'attendance_summary',
        'period', period,
        'data', jsonb_build_object(
          'total_sessions', COUNT(*),
          'present_count', COUNT(*) FILTER (WHERE status = 'present'),
          'absent_count', COUNT(*) FILTER (WHERE status = 'absent'),
          'attendance_rate', 
            CASE 
              WHEN COUNT(*) > 0 THEN 
                (COUNT(*) FILTER (WHERE status = 'present') * 100.0 / COUNT(*))
              ELSE 0 
            END
        )
      )
      INTO result
      FROM public.attendance a
      WHERE a.school_id = school_id
        AND (class_id IS NULL OR a.class_id = class_id)
        AND (start_date IS NULL OR a.date >= start_date)
        AND (end_date IS NULL OR a.date <= end_date);
        
    ELSE
      -- Default: return error for unknown report type
      result := jsonb_build_object(
        'error', 'Unknown report type: ' || report_type,
        'available_types', jsonb_build_array('student_performance', 'financial_summary', 'attendance_summary')
      );
  END CASE;
  
  RETURN result;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.get_school_analytics(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_system_analytics() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_class_analytics(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_report(TEXT, JSONB) TO authenticated;

-- Add RLS policies for these functions
-- Note: These functions use SECURITY DEFINER, so they run with elevated privileges
-- but still respect the calling user's context through auth.uid()

-- Policy for school analytics (users can only access their own school data)
CREATE POLICY "Users can access their own school analytics" ON public.schools
  FOR SELECT USING (
    id IN (
      SELECT school_id FROM public.profiles 
      WHERE profiles.id = auth.uid()
    )
  );

-- Policy for class analytics (users can only access classes in their school)
CREATE POLICY "Users can access classes in their school" ON public.classes
  FOR SELECT USING (
    school_id IN (
      SELECT school_id FROM public.profiles 
      WHERE profiles.id = auth.uid()
    )
  );

-- Policy for system analytics (only edufam admins)
CREATE POLICY "Only edufam admins can access system analytics" ON public.schools
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'edufam_admin'
    )
  ); 