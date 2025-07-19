-- Create missing helper functions referenced in RLS policies

-- Create get_current_user_school_id function
CREATE OR REPLACE FUNCTION public.get_current_user_school_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT school_id FROM public.profiles WHERE id = auth.uid();
$$;

-- Create get_current_user_role function  
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Create get_current_user_owned_school_id function
CREATE OR REPLACE FUNCTION public.get_current_user_owned_school_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT id FROM public.schools WHERE owner_id = auth.uid();
$$;

-- Create is_parent_authorized_for_student function
CREATE OR REPLACE FUNCTION public.is_parent_authorized_for_student(student_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.students 
    WHERE id = student_id AND parent_id = auth.uid()
  );
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_current_user_school_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_current_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_current_user_owned_school_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_parent_authorized_for_student(uuid) TO authenticated;

-- Test all the functions
SELECT 
  public.is_super_admin() as is_super_admin_test,
  public.is_admin_user() as is_admin_user_test,
  public.is_edufam_admin() as is_edufam_admin_test;
  
-- Verify admin users table access
SELECT email, role FROM public.admin_users ORDER BY created_at DESC LIMIT 5;