-- Phase 1: Teacher Dashboard Critical Database Security Fixes

-- CRITICAL FIX 1: Add missing teacher-specific indexes for performance
-- These indexes are essential for teacher dashboard performance
CREATE INDEX IF NOT EXISTS idx_grades_teacher_id_status 
ON public.grades (submitted_by, status, submitted_at DESC) 
WHERE submitted_by IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_grades_subject_teacher_class 
ON public.grades (subject_id, class_id, submitted_by) 
WHERE submitted_by IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_attendance_submitted_by_date 
ON public.attendance (submitted_by, date DESC, class_id) 
WHERE submitted_by IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_subject_teacher_assignments_teacher 
ON public.subject_teacher_assignments (teacher_id, class_id, subject_id) 
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_students_class_active 
ON public.students (class_id, is_active) 
WHERE is_active = true;

-- CRITICAL FIX 2: Create secure teacher authorization function
-- This function checks if a teacher is authorized for a specific class/subject
CREATE OR REPLACE FUNCTION public.is_teacher_authorized_for_class(p_class_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.subject_teacher_assignments sta
    WHERE sta.teacher_id = auth.uid() 
    AND sta.class_id = p_class_id
    AND sta.is_active = true
  ) OR (
    SELECT role FROM public.profiles WHERE id = auth.uid()
  ) IN ('principal', 'school_owner', 'edufam_admin', 'elimisha_admin');
$$;

-- CRITICAL FIX 3: Create secure teacher-subject authorization function
CREATE OR REPLACE FUNCTION public.is_teacher_authorized_for_subject(p_subject_id uuid, p_class_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.subject_teacher_assignments sta
    WHERE sta.teacher_id = auth.uid() 
    AND sta.subject_id = p_subject_id 
    AND sta.class_id = p_class_id
    AND sta.is_active = true
  ) OR (
    SELECT role FROM public.profiles WHERE id = auth.uid()
  ) IN ('principal', 'school_owner', 'edufam_admin', 'elimisha_admin');
$$;

-- CRITICAL FIX 4: Enhanced RLS policy for grades table with teacher granular permissions
DROP POLICY IF EXISTS "Teachers can manage grades for their assigned subjects" ON public.grades;
CREATE POLICY "Teachers can manage grades for their assigned subjects" 
ON public.grades 
FOR ALL 
USING (
  -- System admins can access all
  (get_current_user_role() = ANY (ARRAY['elimisha_admin', 'edufam_admin'])) OR
  -- School admins can access their school's data
  ((get_current_user_role() = ANY (ARRAY['principal', 'school_owner'])) AND (school_id = get_current_user_school_id())) OR
  -- Teachers can only access grades for subjects/classes they are assigned to
  ((get_current_user_role() = 'teacher') AND (school_id = get_current_user_school_id()) AND 
   public.is_teacher_authorized_for_subject(subject_id, class_id)) OR
  -- Parents can view their children's grades
  ((get_current_user_role() = 'parent') AND 
   (student_id IN (SELECT student_id FROM public.parent_students WHERE parent_id = auth.uid())))
)
WITH CHECK (
  -- System admins can modify all
  (get_current_user_role() = ANY (ARRAY['elimisha_admin', 'edufam_admin'])) OR
  -- School admins can modify their school's data
  ((get_current_user_role() = ANY (ARRAY['principal', 'school_owner'])) AND (school_id = get_current_user_school_id())) OR
  -- Teachers can only create/modify grades for their assigned subjects/classes
  ((get_current_user_role() = 'teacher') AND (school_id = get_current_user_school_id()) AND 
   public.is_teacher_authorized_for_subject(subject_id, class_id) AND
   (submitted_by = auth.uid() OR submitted_by IS NULL))
);

-- CRITICAL FIX 5: Enhanced RLS policy for attendance table with teacher granular permissions
DROP POLICY IF EXISTS "Teachers can manage attendance for their classes" ON public.attendance;
CREATE POLICY "Teachers can manage attendance for their classes" 
ON public.attendance 
FOR ALL 
USING (
  -- System admins can access all
  (get_current_user_role() = ANY (ARRAY['elimisha_admin', 'edufam_admin'])) OR
  -- School admins can access their school's data
  ((get_current_user_role() = ANY (ARRAY['principal', 'school_owner'])) AND (school_id = get_current_user_school_id())) OR
  -- Teachers can only access attendance for classes they are assigned to
  ((get_current_user_role() = 'teacher') AND (school_id = get_current_user_school_id()) AND 
   public.is_teacher_authorized_for_class(class_id)) OR
  -- Parents can view their children's attendance
  ((get_current_user_role() = 'parent') AND 
   (student_id IN (SELECT student_id FROM public.parent_students WHERE parent_id = auth.uid())))
)
WITH CHECK (
  -- System admins can modify all
  (get_current_user_role() = ANY (ARRAY['elimisha_admin', 'edufam_admin'])) OR
  -- School admins can modify their school's data
  ((get_current_user_role() = ANY (ARRAY['principal', 'school_owner'])) AND (school_id = get_current_user_school_id())) OR
  -- Teachers can only create/modify attendance for their assigned classes
  ((get_current_user_role() = 'teacher') AND (school_id = get_current_user_school_id()) AND 
   public.is_teacher_authorized_for_class(class_id) AND
   (submitted_by = auth.uid() OR submitted_by IS NULL))
);

-- CRITICAL FIX 6: Enhanced grade submission validation function for teachers
CREATE OR REPLACE FUNCTION public.validate_teacher_grade_submission(
    p_grade_data jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    v_user_role text;
    v_user_school_id uuid;
    v_subject_id uuid;
    v_class_id uuid;
    v_student_id uuid;
    v_score numeric;
    v_max_score numeric;
BEGIN
    -- Get user context
    SELECT role, school_id INTO v_user_role, v_user_school_id
    FROM public.profiles WHERE id = auth.uid();
    
    -- Extract grade data
    v_subject_id := (p_grade_data->>'subject_id')::uuid;
    v_class_id := (p_grade_data->>'class_id')::uuid;
    v_student_id := (p_grade_data->>'student_id')::uuid;
    v_score := (p_grade_data->>'score')::numeric;
    v_max_score := (p_grade_data->>'max_score')::numeric;
    
    -- Validation 1: Required fields
    IF v_subject_id IS NULL OR v_class_id IS NULL OR v_student_id IS NULL THEN
        RETURN jsonb_build_object('valid', false, 'error', 'Missing required fields: subject_id, class_id, or student_id');
    END IF;
    
    -- Validation 2: Score validation
    IF v_score IS NOT NULL AND v_max_score IS NOT NULL THEN
        IF v_score < 0 OR v_score > v_max_score THEN
            RETURN jsonb_build_object('valid', false, 'error', 'Score must be between 0 and max_score');
        END IF;
    END IF;
    
    -- Validation 3: Teacher authorization (most critical)
    IF v_user_role = 'teacher' THEN
        IF NOT public.is_teacher_authorized_for_subject(v_subject_id, v_class_id) THEN
            RETURN jsonb_build_object('valid', false, 'error', 'Teacher not authorized for this subject/class combination');
        END IF;
    END IF;
    
    -- Validation 4: Student belongs to the class
    IF NOT EXISTS (
        SELECT 1 FROM public.students 
        WHERE id = v_student_id 
        AND class_id = v_class_id 
        AND school_id = v_user_school_id
        AND is_active = true
    ) THEN
        RETURN jsonb_build_object('valid', false, 'error', 'Student not found in the specified class');
    END IF;
    
    RETURN jsonb_build_object('valid', true, 'message', 'Grade data is valid');
END;
$$;