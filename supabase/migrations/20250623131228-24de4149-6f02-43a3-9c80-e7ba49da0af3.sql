
-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Principals can view submitted grades in their school" ON public.grades;
DROP POLICY IF EXISTS "Principals can update grade status" ON public.grades;

-- Add RLS policy for principals to view submitted grades
CREATE POLICY "Principals can view submitted grades in their school"
ON public.grades
FOR SELECT
USING (
  public.get_current_user_role() = 'principal' 
  AND school_id = public.get_current_user_school_id()
  AND status IN ('submitted', 'approved', 'rejected', 'released')
);

-- Ensure principals can update grade status (approve/reject)
CREATE POLICY "Principals can update grade status"
ON public.grades
FOR UPDATE
USING (
  public.get_current_user_role() = 'principal' 
  AND school_id = public.get_current_user_school_id()
  AND status IN ('submitted', 'approved')
);
