-- Fix function parameter conflicts and create missing helper functions

-- Drop and recreate is_parent_authorized_for_student with correct parameter name
DROP FUNCTION IF EXISTS public.is_parent_authorized_for_student(uuid);

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

-- Create is_parent_authorized_for_student function with correct parameter
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

-- Test all the core admin functions work
SELECT 'Functions test completed' as status;