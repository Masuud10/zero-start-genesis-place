
-- Function to get comprehensive student certificate data
CREATE OR REPLACE FUNCTION get_student_certificate_data(
  p_student_id UUID,
  p_academic_year TEXT,
  p_class_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
  student_info JSONB;
  school_info JSONB;
  performance_data JSONB;
  attendance_data JSONB;
  subjects_performance JSONB[];
  subject_record RECORD;
BEGIN
  -- Get student information
  SELECT jsonb_build_object(
    'id', s.id,
    'name', s.name,
    'admission_number', s.admission_number,
    'roll_number', s.roll_number,
    'school_id', s.school_id
  ) INTO student_info
  FROM students s
  WHERE s.id = p_student_id;

  -- Get school information
  SELECT jsonb_build_object(
    'id', sc.id,
    'name', sc.name,
    'location', sc.location,
    'address', sc.address,
    'phone', sc.phone,
    'email', sc.email,
    'logo_url', sc.logo_url,
    'website_url', sc.website_url,
    'motto', sc.motto,
    'slogan', sc.slogan,
    'principal_name', sc.principal_name,
    'principal_contact', sc.principal_contact
  ) INTO school_info
  FROM students st
  JOIN schools sc ON st.school_id = sc.id
  WHERE st.id = p_student_id;

  -- Get subjects performance
  FOR subject_record IN
    SELECT 
      sub.name as subject_name,
      sub.code as subject_code,
      COALESCE(g.score, 0) as score,
      COALESCE(g.max_score, 100) as max_score,
      COALESCE(g.percentage, 0) as percentage,
      COALESCE(g.letter_grade, 'N/A') as grade
    FROM subjects sub
    LEFT JOIN grades g ON g.subject_id = sub.id AND g.student_id = p_student_id
    WHERE sub.class_id = p_class_id
      AND (g.academic_year IS NULL OR g.academic_year = p_academic_year)
      AND (g.status IS NULL OR g.status = 'released')
    ORDER BY sub.name
  LOOP
    subjects_performance := array_append(subjects_performance, jsonb_build_object(
      'subject_name', subject_record.subject_name,
      'subject_code', subject_record.subject_code,
      'score', subject_record.score,
      'max_score', subject_record.max_score,
      'percentage', subject_record.percentage,
      'grade', subject_record.grade
    ));
  END LOOP;

  -- Calculate performance summary
  SELECT jsonb_build_object(
    'total_marks', COALESCE(SUM(g.score), 0),
    'possible_marks', COALESCE(SUM(g.max_score), 0),
    'average_score', COALESCE(AVG(g.percentage), 0),
    'grade_letter', mode() WITHIN GROUP (ORDER BY g.letter_grade),
    'total_subjects', COUNT(DISTINCT g.subject_id),
    'class_position', MIN(g.position),
    'subjects_performance', COALESCE(array_to_json(subjects_performance), '[]'::json)
  ) INTO performance_data
  FROM grades g
  WHERE g.student_id = p_student_id
    AND g.class_id = p_class_id
    AND g.status = 'released'
    AND (g.academic_year IS NULL OR g.academic_year = p_academic_year);

  -- Get attendance data
  SELECT jsonb_build_object(
    'total_days', COUNT(*),
    'present_days', COUNT(CASE WHEN a.status = 'present' THEN 1 END),
    'absent_days', COUNT(CASE WHEN a.status = 'absent' THEN 1 END),
    'attendance_percentage', 
    CASE 
      WHEN COUNT(*) > 0 THEN 
        ROUND((COUNT(CASE WHEN a.status = 'present' THEN 1 END) * 100.0 / COUNT(*)), 2)
      ELSE 0 
    END
  ) INTO attendance_data
  FROM attendance a
  WHERE a.student_id = p_student_id
    AND a.academic_year = p_academic_year;

  -- Build final result
  result := jsonb_build_object(
    'student', COALESCE(student_info, '{}'::jsonb),
    'school', COALESCE(school_info, '{}'::jsonb),
    'performance', COALESCE(performance_data, '{}'::jsonb),
    'attendance', COALESCE(attendance_data, '{}'::jsonb),
    'academic_year', p_academic_year,
    'class_id', p_class_id
  );

  RETURN result;
END;
$$;
