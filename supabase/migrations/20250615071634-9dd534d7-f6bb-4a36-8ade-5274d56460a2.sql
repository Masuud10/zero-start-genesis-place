
-- Remove broken RLS policy from grades
DROP POLICY IF EXISTS "School isolation enforced" ON public.grades;

-- Create a security-definer function to check school isolation for grades
CREATE OR REPLACE FUNCTION public.is_grade_in_user_school(grade_student_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.students
    WHERE id = grade_student_id AND school_id = public.get_current_user_school_id()
  ) OR public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin');
$$;

-- Policy to enforce isolation on grades
CREATE POLICY "School isolation enforced" ON public.grades
  FOR ALL
  USING (public.is_grade_in_user_school(student_id));

-- The rest of the migration (system_status, audit triggers, students policy, etc.) all remain the same
-- (NO CHANGE NEEDED for students table part—students.school_id does exist.)

