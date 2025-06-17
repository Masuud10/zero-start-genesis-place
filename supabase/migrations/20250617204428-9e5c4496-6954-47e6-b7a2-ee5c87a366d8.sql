
-- Fix RLS policies for reports table
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view reports from their school or system admins can view all"
ON public.reports FOR SELECT
USING (
  public.get_current_user_role() IN ('edufam_admin', 'elimisha_admin') OR
  school_id = public.get_current_user_school_id()
);

CREATE POLICY "Authorized users can create reports"
ON public.reports FOR INSERT
WITH CHECK (
  public.get_current_user_role() IN ('principal', 'finance_officer', 'edufam_admin', 'elimisha_admin') AND
  (
    public.get_current_user_role() IN ('edufam_admin', 'elimisha_admin') OR
    school_id = public.get_current_user_school_id()
  )
);

CREATE POLICY "Users can update their school reports"
ON public.reports FOR UPDATE
USING (
  public.get_current_user_role() IN ('principal', 'finance_officer', 'edufam_admin', 'elimisha_admin') AND
  (
    public.get_current_user_role() IN ('edufam_admin', 'elimisha_admin') OR
    school_id = public.get_current_user_school_id()
  )
);

CREATE POLICY "Users can delete their school reports"
ON public.reports FOR DELETE
USING (
  public.get_current_user_role() IN ('principal', 'edufam_admin', 'elimisha_admin') AND
  (
    public.get_current_user_role() IN ('edufam_admin', 'elimisha_admin') OR
    school_id = public.get_current_user_school_id()
  )
);

-- Fix RLS policies for certificates table
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view certificates from their school or system admins can view all"
ON public.certificates FOR SELECT
USING (
  public.get_current_user_role() IN ('edufam_admin', 'elimisha_admin') OR
  school_id = public.get_current_user_school_id()
);

CREATE POLICY "Authorized users can create certificates"
ON public.certificates FOR INSERT
WITH CHECK (
  public.get_current_user_role() IN ('principal', 'edufam_admin', 'elimisha_admin') AND
  (
    public.get_current_user_role() IN ('edufam_admin', 'elimisha_admin') OR
    school_id = public.get_current_user_school_id()
  )
);

CREATE POLICY "Users can update their school certificates"
ON public.certificates FOR UPDATE
USING (
  public.get_current_user_role() IN ('principal', 'edufam_admin', 'elimisha_admin') AND
  (
    public.get_current_user_role() IN ('edufam_admin', 'elimisha_admin') OR
    school_id = public.get_current_user_school_id()
  )
);

CREATE POLICY "Users can delete their school certificates"
ON public.certificates FOR DELETE
USING (
  public.get_current_user_role() IN ('principal', 'edufam_admin', 'elimisha_admin') AND
  (
    public.get_current_user_role() IN ('edufam_admin', 'elimisha_admin') OR
    school_id = public.get_current_user_school_id()
  )
);

-- Add triggers to automatically set school_id for reports and certificates
CREATE OR REPLACE FUNCTION public.auto_set_school_id_for_reports()
RETURNS TRIGGER AS $$
DECLARE
  user_school_id uuid;
  user_role text;
BEGIN
  -- Get current user's school_id and role
  SELECT school_id, role INTO user_school_id, user_role
  FROM public.profiles 
  WHERE id = auth.uid();

  -- For non-admin users, automatically set school_id
  IF user_role NOT IN ('elimisha_admin', 'edufam_admin') THEN
    -- Set school_id if not already set
    IF NEW.school_id IS NULL THEN
      NEW.school_id := user_school_id;
    -- Prevent users from setting school_id to other schools
    ELSIF NEW.school_id != user_school_id THEN
      RAISE EXCEPTION 'Cannot create records for other schools';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.auto_set_school_id_for_certificates()
RETURNS TRIGGER AS $$
DECLARE
  user_school_id uuid;
  user_role text;
BEGIN
  -- Get current user's school_id and role
  SELECT school_id, role INTO user_school_id, user_role
  FROM public.profiles 
  WHERE id = auth.uid();

  -- For non-admin users, automatically set school_id
  IF user_role NOT IN ('elimisha_admin', 'edufam_admin') THEN
    -- Set school_id if not already set
    IF NEW.school_id IS NULL THEN
      NEW.school_id := user_school_id;
    -- Prevent users from setting school_id to other schools
    ELSIF NEW.school_id != user_school_id THEN
      RAISE EXCEPTION 'Cannot create records for other schools';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
CREATE TRIGGER set_school_id_for_reports
  BEFORE INSERT OR UPDATE ON public.reports
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_set_school_id_for_reports();

CREATE TRIGGER set_school_id_for_certificates
  BEFORE INSERT OR UPDATE ON public.certificates
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_set_school_id_for_certificates();

-- Update the certificate data function to include proper school info
CREATE OR REPLACE FUNCTION public.get_student_certificate_data(p_student_id uuid, p_academic_year text, p_class_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    student_data jsonb;
    performance_data jsonb;
    attendance_data jsonb;
    school_data jsonb;
    result jsonb;
BEGIN
    -- Get student basic info with school information
    SELECT jsonb_build_object(
        'id', s.id,
        'name', s.name,
        'admission_number', s.admission_number,
        'roll_number', s.roll_number,
        'school_id', s.school_id
    )
    INTO student_data
    FROM public.students s
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
        'motto', sc.motto,
        'slogan', sc.slogan,
        'principal_name', sc.principal_name,
        'principal_contact', sc.principal_contact
    )
    INTO school_data
    FROM public.schools sc
    JOIN public.students s ON s.school_id = sc.id
    WHERE s.id = p_student_id;
    
    -- Get performance summary for the academic year
    SELECT jsonb_build_object(
        'total_marks', COALESCE(SUM(g.score), 0),
        'possible_marks', COALESCE(SUM(g.max_score), 0),
        'average_score', COALESCE(AVG(g.percentage), 0),
        'grade_letter', mode() WITHIN GROUP (ORDER BY g.letter_grade),
        'total_subjects', COUNT(DISTINCT g.subject_id),
        'class_position', MIN(g.position),
        'subjects_performance', jsonb_agg(
            jsonb_build_object(
                'subject_name', sub.name,
                'subject_code', sub.code,
                'score', g.score,
                'max_score', g.max_score,
                'percentage', g.percentage,
                'grade', g.letter_grade
            )
        )
    )
    INTO performance_data
    FROM public.grades g
    JOIN public.subjects sub ON g.subject_id = sub.id
    WHERE g.student_id = p_student_id 
    AND g.class_id = p_class_id
    AND g.status = 'released'
    AND EXTRACT(year FROM g.created_at)::text = p_academic_year;
    
    -- Get attendance summary
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
    )
    INTO attendance_data
    FROM public.attendance a
    WHERE a.student_id = p_student_id 
    AND a.class_id = p_class_id
    AND a.academic_year = p_academic_year;
    
    -- Combine all data
    result := jsonb_build_object(
        'student', student_data,
        'school', COALESCE(school_data, '{}'),
        'performance', COALESCE(performance_data, '{}'),
        'attendance', COALESCE(attendance_data, '{}'),
        'academic_year', p_academic_year,
        'class_id', p_class_id
    );
    
    RETURN result;
END;
$function$
