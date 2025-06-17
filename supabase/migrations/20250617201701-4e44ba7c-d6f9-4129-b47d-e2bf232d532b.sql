
-- Update schools table to include all required details for certificates and reports
ALTER TABLE public.schools 
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS website_url text,
ADD COLUMN IF NOT EXISTS motto text,
ADD COLUMN IF NOT EXISTS slogan text,
ADD COLUMN IF NOT EXISTS principal_name text,
ADD COLUMN IF NOT EXISTS principal_contact text;

-- Update profiles table to include comprehensive user details
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS national_id text,
ADD COLUMN IF NOT EXISTS date_of_birth date,
ADD COLUMN IF NOT EXISTS gender text,
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS profile_photo_url text;

-- Create reports table to track generated reports
CREATE TABLE IF NOT EXISTS public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id),
  generated_by uuid NOT NULL REFERENCES public.profiles(id),
  report_type text NOT NULL CHECK (report_type IN ('individual_academic', 'class_academic', 'financial', 'attendance')),
  report_data jsonb NOT NULL,
  filters jsonb DEFAULT '{}',
  generated_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on reports table
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for reports
CREATE POLICY "Principals can manage their school reports" ON public.reports
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'principal' 
      AND school_id = reports.school_id
    )
  );

CREATE POLICY "School owners can view their school reports" ON public.reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'school_owner' 
      AND school_id = reports.school_id
    )
  );

CREATE POLICY "Finance officers can manage financial reports" ON public.reports
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'finance_officer' 
      AND school_id = reports.school_id
    )
    AND report_type = 'financial'
  );

CREATE POLICY "Parents can view their child reports" ON public.reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.parent_students ps ON p.id = ps.parent_id
      WHERE p.id = auth.uid() 
      AND p.role = 'parent'
      AND reports.report_data->>'student_id' = ps.student_id::text
    )
  );

CREATE POLICY "EduFam admins can manage all reports" ON public.reports
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'edufam_admin'
    )
  );

-- Create function to generate comprehensive student report data
CREATE OR REPLACE FUNCTION public.get_student_report_data(
  p_student_id uuid,
  p_academic_year text,
  p_term text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  student_data jsonb;
  academic_data jsonb;
  attendance_data jsonb;
  financial_data jsonb;
  result jsonb;
BEGIN
  -- Get student basic information
  SELECT jsonb_build_object(
    'id', s.id,
    'name', s.name,
    'admission_number', s.admission_number,
    'roll_number', s.roll_number,
    'date_of_birth', s.date_of_birth,
    'gender', s.gender,
    'class', jsonb_build_object(
      'id', c.id,
      'name', c.name,
      'level', c.level,
      'stream', c.stream
    ),
    'school', jsonb_build_object(
      'id', sc.id,
      'name', sc.name,
      'location', sc.location,
      'address', sc.address,
      'phone', sc.phone,
      'email', sc.email,
      'logo_url', sc.logo_url,
      'motto', sc.motto,
      'slogan', sc.slogan,
      'principal_name', sc.principal_name,
      'principal_contact', sc.principal_contact
    )
  )
  INTO student_data
  FROM public.students s
  LEFT JOIN public.classes c ON s.class_id = c.id
  LEFT JOIN public.schools sc ON s.school_id = sc.id
  WHERE s.id = p_student_id;

  -- Get academic performance data
  SELECT jsonb_build_object(
    'total_marks', COALESCE(SUM(g.score), 0),
    'possible_marks', COALESCE(SUM(g.max_score), 0),
    'average_percentage', COALESCE(AVG(g.percentage), 0),
    'overall_grade', mode() WITHIN GROUP (ORDER BY g.letter_grade),
    'class_position', MIN(g.position),
    'total_subjects', COUNT(DISTINCT g.subject_id),
    'subjects_performance', jsonb_agg(
      jsonb_build_object(
        'subject_name', sub.name,
        'subject_code', sub.code,
        'score', g.score,
        'max_score', g.max_score,
        'percentage', g.percentage,
        'grade', g.letter_grade,
        'position', g.position,
        'comments', g.comments
      )
    )
  )
  INTO academic_data
  FROM public.grades g
  JOIN public.subjects sub ON g.subject_id = sub.id
  WHERE g.student_id = p_student_id
  AND EXTRACT(year FROM g.created_at)::text = p_academic_year
  AND (p_term IS NULL OR g.term = p_term)
  AND g.status = 'released';

  -- Get attendance data
  SELECT jsonb_build_object(
    'total_days', COUNT(*),
    'present_days', COUNT(CASE WHEN a.status = 'present' THEN 1 END),
    'absent_days', COUNT(CASE WHEN a.status = 'absent' THEN 1 END),
    'late_days', COUNT(CASE WHEN a.status = 'late' THEN 1 END),
    'attendance_percentage', 
    CASE 
      WHEN COUNT(*) > 0 THEN 
        ROUND((COUNT(CASE WHEN a.status = 'present' THEN 1 END) * 100.0 / COUNT(*)), 2)
      ELSE 0 
    END
  )
  INTO attendance_data
  FROM public.attendance a
  WHERE a.student_id = p_student_id
  AND a.academic_year = p_academic_year
  AND (p_term IS NULL OR a.term = p_term);

  -- Get financial data
  SELECT jsonb_build_object(
    'total_fees', COALESCE(SUM(f.amount), 0),
    'paid_amount', COALESCE(SUM(f.paid_amount), 0),
    'outstanding_amount', COALESCE(SUM(f.amount - f.paid_amount), 0),
    'fee_breakdown', jsonb_agg(
      jsonb_build_object(
        'category', f.category,
        'term', f.term,
        'amount', f.amount,
        'paid_amount', f.paid_amount,
        'status', f.status,
        'due_date', f.due_date
      )
    )
  )
  INTO financial_data
  FROM public.fees f
  WHERE f.student_id = p_student_id
  AND f.academic_year = p_academic_year
  AND (p_term IS NULL OR f.term = p_term);

  -- Combine all data
  result := jsonb_build_object(
    'student', COALESCE(student_data, '{}'),
    'academic_performance', COALESCE(academic_data, '{}'),
    'attendance', COALESCE(attendance_data, '{}'),
    'financial', COALESCE(financial_data, '{}'),
    'generated_at', now(),
    'academic_year', p_academic_year,
    'term', p_term
  );

  RETURN result;
END;
$$;

-- Create function to generate class report data
CREATE OR REPLACE FUNCTION public.get_class_report_data(
  p_class_id uuid,
  p_academic_year text,
  p_term text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  class_data jsonb;
  performance_data jsonb;
  attendance_data jsonb;
  result jsonb;
BEGIN
  -- Get class basic information
  SELECT jsonb_build_object(
    'id', c.id,
    'name', c.name,
    'level', c.level,
    'stream', c.stream,
    'teacher', jsonb_build_object(
      'name', p.name,
      'email', p.email
    ),
    'school', jsonb_build_object(
      'id', s.id,
      'name', s.name,
      'location', s.location,
      'address', s.address,
      'phone', s.phone,
      'email', s.email,
      'logo_url', s.logo_url,
      'motto', s.motto,
      'slogan', s.slogan,
      'principal_name', s.principal_name,
      'principal_contact', s.principal_contact
    ),
    'total_students', (
      SELECT COUNT(*) FROM public.students st 
      WHERE st.class_id = c.id AND st.is_active = true
    )
  )
  INTO class_data
  FROM public.classes c
  LEFT JOIN public.profiles p ON c.teacher_id = p.id
  LEFT JOIN public.schools s ON c.school_id = s.id
  WHERE c.id = p_class_id;

  -- Get class performance summary
  SELECT jsonb_build_object(
    'class_average', COALESCE(AVG(g.percentage), 0),
    'highest_score', COALESCE(MAX(g.percentage), 0),
    'lowest_score', COALESCE(MIN(g.percentage), 0),
    'total_subjects', COUNT(DISTINCT g.subject_id),
    'top_performers', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'student_name', st.name,
          'admission_number', st.admission_number,
          'average_score', student_avg.avg_score,
          'position', ROW_NUMBER() OVER (ORDER BY student_avg.avg_score DESC)
        )
      )
      FROM (
        SELECT g2.student_id, AVG(g2.percentage) as avg_score
        FROM public.grades g2
        WHERE g2.class_id = p_class_id
        AND EXTRACT(year FROM g2.created_at)::text = p_academic_year
        AND (p_term IS NULL OR g2.term = p_term)
        AND g2.status = 'released'
        GROUP BY g2.student_id
        ORDER BY avg_score DESC
        LIMIT 3
      ) student_avg
      JOIN public.students st ON student_avg.student_id = st.id
    ),
    'subject_performance', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'subject_name', sub.name,
          'subject_code', sub.code,
          'class_average', COALESCE(AVG(g3.percentage), 0),
          'highest_score', COALESCE(MAX(g3.percentage), 0),
          'lowest_score', COALESCE(MIN(g3.percentage), 0)
        )
      )
      FROM public.grades g3
      JOIN public.subjects sub ON g3.subject_id = sub.id
      WHERE g3.class_id = p_class_id
      AND EXTRACT(year FROM g3.created_at)::text = p_academic_year
      AND (p_term IS NULL OR g3.term = p_term)
      AND g3.status = 'released'
      GROUP BY sub.id, sub.name, sub.code
    )
  )
  INTO performance_data
  FROM public.grades g
  WHERE g.class_id = p_class_id
  AND EXTRACT(year FROM g.created_at)::text = p_academic_year
  AND (p_term IS NULL OR g.term = p_term)
  AND g.status = 'released';

  -- Get class attendance summary
  SELECT jsonb_build_object(
    'total_attendance_records', COUNT(*),
    'class_attendance_rate', 
    CASE 
      WHEN COUNT(*) > 0 THEN 
        ROUND((COUNT(CASE WHEN a.status = 'present' THEN 1 END) * 100.0 / COUNT(*)), 2)
      ELSE 0 
    END,
    'students_with_low_attendance', (
      SELECT COUNT(DISTINCT a2.student_id)
      FROM public.attendance a2
      WHERE a2.class_id = p_class_id
      AND a2.academic_year = p_academic_year
      AND (p_term IS NULL OR a2.term = p_term)
      GROUP BY a2.student_id
      HAVING (
        COUNT(CASE WHEN a2.status = 'present' THEN 1 END) * 100.0 / COUNT(*)
      ) < 75
    )
  )
  INTO attendance_data
  FROM public.attendance a
  WHERE a.class_id = p_class_id
  AND a.academic_year = p_academic_year
  AND (p_term IS NULL OR a.term = p_term);

  -- Combine all data
  result := jsonb_build_object(
    'class_info', COALESCE(class_data, '{}'),
    'performance_summary', COALESCE(performance_data, '{}'),
    'attendance_summary', COALESCE(attendance_data, '{}'),
    'generated_at', now(),
    'academic_year', p_academic_year,
    'term', p_term
  );

  RETURN result;
END;
$$;
