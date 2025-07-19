-- Part 1: Create the is_super_admin() function as requested
-- This will check the profiles table for super_admin role
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid() AND role = 'super_admin'
  );
$$;

-- Part 2: Drop the conflicting get_school_users_data() function without parameters
DROP FUNCTION IF EXISTS public.get_school_users_data();