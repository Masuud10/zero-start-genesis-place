-- Apply RPC Functions to Supabase Database
-- Run this in your Supabase SQL Editor

-- =====================================================
-- ANALYTICS FUNCTIONS
-- =====================================================

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

-- =====================================================
-- USER MANAGEMENT FUNCTIONS
-- =====================================================

-- Function to get user profile with school information
CREATE OR REPLACE FUNCTION public.get_user_profile(p_user_id UUID DEFAULT auth.uid())
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'user_id', p.id,
    'email', p.email,
    'first_name', p.first_name,
    'last_name', p.last_name,
    'role', p.role,
    'school_id', p.school_id,
    'school_name', s.name,
    'school_status', s.status,
    'is_active', p.is_active,
    'created_at', p.created_at,
    'last_login', p.last_login,
    'phone', p.phone,
    'address', p.address,
    'profile_image', p.profile_image
  )
  INTO result
  FROM public.profiles p
  LEFT JOIN public.schools s ON p.school_id = s.id
  WHERE p.id = p_user_id;
  
  RETURN result;
END;
$$;

-- Function to get users by role and school
CREATE OR REPLACE FUNCTION public.get_users_by_role(
  p_role TEXT,
  p_school_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'role', p_role,
    'school_id', p_school_id,
    'users', jsonb_agg(
      jsonb_build_object(
        'user_id', p.id,
        'email', p.email,
        'first_name', p.first_name,
        'last_name', p.last_name,
        'role', p.role,
        'school_id', p.school_id,
        'is_active', p.is_active,
        'created_at', p.created_at,
        'last_login', p.last_login
      )
    )
  )
  INTO result
  FROM public.profiles p
  WHERE p.role = p_role
    AND (p_school_id IS NULL OR p.school_id = p_school_id)
    AND p.is_active = true;
  
  RETURN result;
END;
$$;

-- =====================================================
-- DATA EXPORT AND SEARCH FUNCTIONS
-- =====================================================

-- Function to export school data
CREATE OR REPLACE FUNCTION public.export_school_data(p_school_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'school_info', (
      SELECT jsonb_build_object(
        'id', s.id,
        'name', s.name,
        'address', s.address,
        'phone', s.phone,
        'email', s.email,
        'status', s.status,
        'created_at', s.created_at
      )
      FROM public.schools s
      WHERE s.id = p_school_id
    ),
    'classes', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', c.id,
          'name', c.name,
          'grade_level', c.grade_level,
          'capacity', c.capacity,
          'created_at', c.created_at
        )
      )
      FROM public.classes c
      WHERE c.school_id = p_school_id
    ),
    'students', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', s.id,
          'first_name', s.first_name,
          'last_name', s.last_name,
          'class_id', s.class_id,
          'admission_number', s.admission_number,
          'date_of_birth', s.date_of_birth,
          'gender', s.gender,
          'is_active', s.is_active,
          'created_at', s.created_at
        )
      )
      FROM public.students s
      WHERE s.school_id = p_school_id
    ),
    'teachers', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', p.id,
          'first_name', p.first_name,
          'last_name', p.last_name,
          'email', p.email,
          'role', p.role,
          'is_active', p.is_active,
          'created_at', p.created_at
        )
      )
      FROM public.profiles p
      WHERE p.school_id = p_school_id AND p.role = 'teacher'
    ),
    'subjects', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', sub.id,
          'name', sub.name,
          'code', sub.code,
          'description', sub.description,
          'created_at', sub.created_at
        )
      )
      FROM public.subjects sub
      WHERE sub.school_id = p_school_id
    ),
    'fees', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', f.id,
          'student_id', f.student_id,
          'class_id', f.class_id,
          'amount', f.amount,
          'paid_amount', f.paid_amount,
          'status', f.status,
          'due_date', f.due_date,
          'created_at', f.created_at
        )
      )
      FROM public.fees f
      WHERE f.school_id = p_school_id
    ),
    'attendance', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', a.id,
          'student_id', a.student_id,
          'class_id', a.class_id,
          'date', a.date,
          'status', a.status,
          'created_at', a.created_at
        )
      )
      FROM public.attendance a
      WHERE a.school_id = p_school_id
    ),
    'grades', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', g.id,
          'student_id', g.student_id,
          'subject_id', g.subject_id,
          'score', g.score,
          'max_score', g.max_score,
          'term', g.term,
          'year', g.year,
          'created_at', g.created_at
        )
      )
      FROM public.grades g
      JOIN public.students s ON g.student_id = s.id
      WHERE s.school_id = p_school_id
    ),
    'export_date', now()
  )
  INTO result;
  
  RETURN result;
END;
$$;

-- Function to get dashboard statistics
CREATE OR REPLACE FUNCTION public.get_dashboard_stats(p_school_id UUID DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
  user_role TEXT;
  user_school_id UUID;
BEGIN
  -- Get current user's role and school
  SELECT role, school_id INTO user_role, user_school_id
  FROM public.profiles
  WHERE id = auth.uid();
  
  -- If no school_id provided, use user's school
  IF p_school_id IS NULL THEN
    p_school_id := user_school_id;
  END IF;
  
  -- Build stats based on user role
  IF user_role = 'edufam_admin' THEN
    -- System-wide stats for edufam admin
    SELECT jsonb_build_object(
      'total_schools', (SELECT COUNT(*) FROM public.schools),
      'active_schools', (SELECT COUNT(*) FROM public.schools WHERE status = 'active'),
      'total_students', (SELECT COUNT(*) FROM public.students WHERE is_active = true),
      'total_teachers', (SELECT COUNT(*) FROM public.profiles WHERE role = 'teacher'),
      'total_classes', (SELECT COUNT(*) FROM public.classes),
      'total_fees', (SELECT COALESCE(SUM(amount), 0) FROM public.fees),
      'collected_fees', (SELECT COALESCE(SUM(paid_amount), 0) FROM public.fees),
      'recent_activities', (
        SELECT jsonb_agg(
          jsonb_build_object(
            'type', 'school_created',
            'school_name', name,
            'created_at', created_at
          )
        )
        FROM public.schools
        WHERE created_at >= now() - INTERVAL '7 days'
        ORDER BY created_at DESC
        LIMIT 5
      )
    )
    INTO result;
  ELSE
    -- School-specific stats for other roles
    SELECT jsonb_build_object(
      'school_id', p_school_id,
      'school_name', (SELECT name FROM public.schools WHERE id = p_school_id),
      'total_students', (SELECT COUNT(*) FROM public.students WHERE school_id = p_school_id AND is_active = true),
      'total_teachers', (SELECT COUNT(*) FROM public.profiles WHERE school_id = p_school_id AND role = 'teacher'),
      'total_classes', (SELECT COUNT(*) FROM public.classes WHERE school_id = p_school_id),
      'total_fees', (SELECT COALESCE(SUM(amount), 0) FROM public.fees WHERE school_id = p_school_id),
      'collected_fees', (SELECT COALESCE(SUM(paid_amount), 0) FROM public.fees WHERE school_id = p_school_id),
      'attendance_rate', (
        SELECT CASE 
          WHEN COUNT(*) > 0 THEN 
            (COUNT(*) FILTER (WHERE status = 'present') * 100.0 / COUNT(*))
          ELSE 0 
        END
        FROM public.attendance 
        WHERE school_id = p_school_id
      ),
      'average_grade', (
        SELECT COALESCE(AVG(score), 0)
        FROM public.grades g
        JOIN public.students s ON g.student_id = s.id
        WHERE s.school_id = p_school_id
      ),
      'recent_activities', (
        SELECT jsonb_agg(
          jsonb_build_object(
            'type', 'student_added',
            'student_name', first_name || ' ' || last_name,
            'created_at', created_at
          )
        )
        FROM public.students
        WHERE school_id = p_school_id AND created_at >= now() - INTERVAL '7 days'
        ORDER BY created_at DESC
        LIMIT 5
      )
    )
    INTO result;
  END IF;
  
  RETURN result;
END;
$$;

-- Function to search across multiple tables
CREATE OR REPLACE FUNCTION public.search_data(
  search_term TEXT,
  search_tables TEXT[] DEFAULT ARRAY['students', 'teachers', 'classes', 'subjects'],
  p_school_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
  user_school_id UUID;
  table_name TEXT;
  table_results JSONB;
BEGIN
  -- Get user's school if not provided
  IF p_school_id IS NULL THEN
    SELECT school_id INTO user_school_id
    FROM public.profiles
    WHERE id = auth.uid();
    p_school_id := user_school_id;
  END IF;
  
  result := '{}'::jsonb;
  
  -- Search in each specified table
  FOREACH table_name IN ARRAY search_tables
  LOOP
    CASE table_name
      WHEN 'students' THEN
        SELECT jsonb_build_object(
          'table', 'students',
          'results', jsonb_agg(
            jsonb_build_object(
              'id', s.id,
              'name', s.first_name || ' ' || s.last_name,
              'admission_number', s.admission_number,
              'class_name', c.name
            )
          )
        )
        INTO table_results
        FROM public.students s
        LEFT JOIN public.classes c ON s.class_id = c.id
        WHERE s.school_id = p_school_id
          AND s.is_active = true
          AND (
            s.first_name ILIKE '%' || search_term || '%'
            OR s.last_name ILIKE '%' || search_term || '%'
            OR s.admission_number ILIKE '%' || search_term || '%'
          );
        
      WHEN 'teachers' THEN
        SELECT jsonb_build_object(
          'table', 'teachers',
          'results', jsonb_agg(
            jsonb_build_object(
              'id', p.id,
              'name', p.first_name || ' ' || p.last_name,
              'email', p.email,
              'role', p.role
            )
          )
        )
        INTO table_results
        FROM public.profiles p
        WHERE p.school_id = p_school_id
          AND p.role = 'teacher'
          AND p.is_active = true
          AND (
            p.first_name ILIKE '%' || search_term || '%'
            OR p.last_name ILIKE '%' || search_term || '%'
            OR p.email ILIKE '%' || search_term || '%'
          );
        
      WHEN 'classes' THEN
        SELECT jsonb_build_object(
          'table', 'classes',
          'results', jsonb_agg(
            jsonb_build_object(
              'id', c.id,
              'name', c.name,
              'grade_level', c.grade_level,
              'student_count', (
                SELECT COUNT(*) 
                FROM public.students 
                WHERE class_id = c.id AND is_active = true
              )
            )
          )
        )
        INTO table_results
        FROM public.classes c
        WHERE c.school_id = p_school_id
          AND (
            c.name ILIKE '%' || search_term || '%'
            OR c.grade_level ILIKE '%' || search_term || '%'
          );
        
      WHEN 'subjects' THEN
        SELECT jsonb_build_object(
          'table', 'subjects',
          'results', jsonb_agg(
            jsonb_build_object(
              'id', sub.id,
              'name', sub.name,
              'code', sub.code,
              'description', sub.description
            )
          )
        )
        INTO table_results
        FROM public.subjects sub
        WHERE sub.school_id = p_school_id
          AND (
            sub.name ILIKE '%' || search_term || '%'
            OR sub.code ILIKE '%' || search_term || '%'
            OR sub.description ILIKE '%' || search_term || '%'
          );
    END CASE;
    
    -- Add table results to main result
    IF table_results IS NOT NULL THEN
      result := result || table_results;
    END IF;
  END LOOP;
  
  RETURN result;
END;
$$;

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.get_school_analytics(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_system_analytics() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_class_analytics(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_report(TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_profile(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_users_by_role(TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.export_school_data(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_dashboard_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_data(TEXT, TEXT[], UUID) TO authenticated;

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Policy for school analytics (users can only access their own school data)
DROP POLICY IF EXISTS "Users can access their own school analytics" ON public.schools;
CREATE POLICY "Users can access their own school analytics" ON public.schools
  FOR SELECT USING (
    id IN (
      SELECT school_id FROM public.profiles 
      WHERE profiles.id = auth.uid()
    )
  );

-- Policy for class analytics (users can only access classes in their school)
DROP POLICY IF EXISTS "Users can access classes in their school" ON public.classes;
CREATE POLICY "Users can access classes in their school" ON public.classes
  FOR SELECT USING (
    school_id IN (
      SELECT school_id FROM public.profiles 
      WHERE profiles.id = auth.uid()
    )
  );

-- Policy for system analytics (only edufam admins)
DROP POLICY IF EXISTS "Only edufam admins can access system analytics" ON public.schools;
CREATE POLICY "Only edufam admins can access system analytics" ON public.schools
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'edufam_admin'
    )
  );

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Test the functions (uncomment to test)
-- SELECT public.get_system_analytics();
-- SELECT public.get_dashboard_stats();
-- SELECT public.get_user_profile(); 