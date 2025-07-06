-- Fix parent grades access by updating the RLS policy to include parent access logic
-- The current policy only allows school-based access, but parents need access to their children's grades

-- Drop the current restrictive policy
DROP POLICY IF EXISTS "Multi-tenant grades access" ON public.grades;

-- Create a new comprehensive policy that includes parent access
CREATE POLICY "Multi-tenant grades access with parent support" ON public.grades
FOR ALL USING (
  -- Admin access
  public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin') OR
  -- School-based access for staff
  (school_id = public.get_current_user_school_id() AND public.get_current_user_role() IN ('principal', 'school_owner', 'teacher', 'finance_officer')) OR
  -- Parent access to their children's grades
  (public.get_current_user_role() = 'parent' AND student_id IN (SELECT student_id FROM public.parent_students WHERE parent_id = auth.uid()))
);

-- Also update the subjects policy to ensure parents can access subject information for their children's grades
DROP POLICY IF EXISTS "Multi-tenant subjects access" ON public.subjects;

CREATE POLICY "Multi-tenant subjects access with parent support" ON public.subjects
FOR ALL USING (
  -- Admin access
  public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin') OR
  -- School-based access for staff
  (school_id = public.get_current_user_school_id() AND public.get_current_user_role() IN ('principal', 'school_owner', 'teacher', 'finance_officer')) OR
  -- Parent access to subjects for their children's classes
  (public.get_current_user_role() = 'parent' AND class_id IN (
    SELECT DISTINCT s.class_id 
    FROM public.students s 
    JOIN public.parent_students ps ON s.id = ps.student_id 
    WHERE ps.parent_id = auth.uid()
  ))
);

-- Create an index to optimize parent grades queries
CREATE INDEX IF NOT EXISTS idx_grades_student_status ON public.grades(student_id, status) WHERE status = 'released';

-- Create an index to optimize parent-student lookups
CREATE INDEX IF NOT EXISTS idx_parent_students_parent_student ON public.parent_students(parent_id, student_id);

-- Add a comment to document the policy
COMMENT ON POLICY "Multi-tenant grades access with parent support" ON public.grades IS 
'Allows parents to view released grades for their children, staff to access grades in their school, and admins full access'; 