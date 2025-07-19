-- Create missing helper functions without dropping existing ones

-- Create get_current_user_school_id function if it doesn't exist
CREATE OR REPLACE FUNCTION public.get_current_user_school_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT school_id FROM public.profiles WHERE id = auth.uid();
$$;

-- Create get_current_user_role function if it doesn't exist
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Create get_current_user_owned_school_id function if it doesn't exist
CREATE OR REPLACE FUNCTION public.get_current_user_owned_school_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT id FROM public.schools WHERE owner_id = auth.uid();
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_current_user_school_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_current_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_current_user_owned_school_id() TO authenticated;

-- Now let's verify all our admin functions and admin users exist and work
DO $$
DECLARE
    function_count int;
    admin_count int;
BEGIN
    -- Check if our functions exist
    SELECT COUNT(*) INTO function_count
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    AND p.proname IN ('is_super_admin', 'is_admin_user', 'get_admin_users_data', 'admin_update_user_status');
    
    RAISE NOTICE 'Found % admin functions', function_count;
    
    -- Check admin users count
    SELECT COUNT(*) INTO admin_count FROM public.admin_users;
    RAISE NOTICE 'Found % admin users', admin_count;
    
    -- Test function access
    PERFORM public.is_super_admin();
    PERFORM public.is_admin_user();
    
    RAISE NOTICE 'All functions are accessible';
END $$;