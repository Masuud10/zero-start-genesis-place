-- Fix the permission validation function to properly check teacher ownership
-- The issue is that we need to check both submitted_by and teacher_id fields
-- and ensure the validation works correctly for teachers creating/editing grades

CREATE OR REPLACE FUNCTION public.validate_grade_edit_permission(grade_id uuid, user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    grade_status text;
    user_role text;
    is_grade_owner boolean;
    grade_teacher_id uuid;
BEGIN
    -- Get grade status, submitted_by, and teacher_id
    SELECT g.status, (g.submitted_by = user_id), g.teacher_id
    INTO grade_status, is_grade_owner, grade_teacher_id
    FROM public.grades g 
    WHERE g.id = grade_id;
    
    -- Get user role
    SELECT role INTO user_role 
    FROM public.profiles 
    WHERE id = user_id;
    
    -- Teachers can edit grades if:
    -- 1. They submitted the grade (submitted_by = user_id) OR
    -- 2. They are assigned as the teacher for that grade (teacher_id = user_id)
    -- 3. AND the grade is in draft status
    -- Principals and admins can edit any grade regardless of status
    RETURN (
        (user_role = 'teacher' AND (is_grade_owner OR grade_teacher_id = user_id) AND grade_status = 'draft') OR
        (user_role IN ('principal', 'school_owner', 'edufam_admin', 'elimisha_admin'))
    );
END;
$$;