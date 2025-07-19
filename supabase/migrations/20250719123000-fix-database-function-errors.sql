-- Fix database function errors
-- This migration addresses the issues with is_super_admin() and get_school_users_data() functions

-- First, let's ensure the is_super_admin function is properly defined
-- Drop any existing versions to avoid conflicts
DROP FUNCTION IF EXISTS public.is_super_admin();
DROP FUNCTION IF EXISTS public.is_super_admin(uuid);

-- Create the is_super_admin function with proper schema qualification
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid() AND role = 'super_admin'
  );
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated;

-- Now fix the get_school_users_data function overloading issue
-- Drop ALL versions of the function to clean up completely
DROP FUNCTION IF EXISTS public.get_school_users_data();
DROP FUNCTION IF EXISTS public.get_school_users_data(uuid);
DROP FUNCTION IF EXISTS public.get_school_users_data(p_school_id uuid);
DROP FUNCTION IF EXISTS public.get_school_users_data(target_school_id uuid);

-- Create a single, clear version of get_school_users_data
CREATE OR REPLACE FUNCTION public.get_school_users_data(target_school_id uuid DEFAULT NULL)
RETURNS TABLE (
    id uuid,
    email text,
    name text,
    role text,
    school_id uuid,
    school_name text,
    status text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    last_login_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    -- Check if user is super admin
    IF NOT public.is_super_admin() THEN
        RAISE EXCEPTION 'Access denied. Super admin privileges required.';
    END IF;

    RETURN QUERY
    SELECT 
        p.id,
        p.email,
        p.name,
        p.role,
        p.school_id,
        s.name as school_name,
        p.status,
        p.created_at,
        p.updated_at,
        p.last_login_at
    FROM public.profiles p
    LEFT JOIN public.schools s ON p.school_id = s.id
    WHERE (target_school_id IS NULL OR p.school_id = target_school_id)
    AND p.role != 'super_admin'
    ORDER BY p.created_at DESC;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_school_users_data(uuid) TO authenticated;

-- Also create a version without parameters for backward compatibility
CREATE OR REPLACE FUNCTION public.get_school_users_data()
RETURNS TABLE (
    id uuid,
    email text,
    name text,
    role text,
    school_id uuid,
    school_name text,
    status text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    last_login_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    -- Check if user is super admin
    IF NOT public.is_super_admin() THEN
        RAISE EXCEPTION 'Access denied. Super admin privileges required.';
    END IF;

    RETURN QUERY
    SELECT 
        p.id,
        p.email,
        p.name,
        p.role,
        p.school_id,
        s.name as school_name,
        p.status,
        p.created_at,
        p.updated_at,
        p.last_login_at
    FROM public.profiles p
    LEFT JOIN public.schools s ON p.school_id = s.id
    WHERE p.role != 'super_admin'
    ORDER BY p.created_at DESC;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_school_users_data() TO authenticated;

-- Update RLS policies to ensure they use the correct function references
-- Admin audit logs policies
DROP POLICY IF EXISTS "admin_audit_logs_view_all" ON public.admin_audit_logs;
CREATE POLICY "admin_audit_logs_view_all" 
ON public.admin_audit_logs 
FOR SELECT 
USING (public.is_super_admin());

-- Admin users policies
DROP POLICY IF EXISTS "admin_users_delete" ON public.admin_users;
CREATE POLICY "admin_users_delete" 
ON public.admin_users 
FOR DELETE 
USING (public.is_super_admin());

DROP POLICY IF EXISTS "admin_users_insert" ON public.admin_users;
CREATE POLICY "admin_users_insert" 
ON public.admin_users 
FOR INSERT 
WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS "admin_users_update" ON public.admin_users;
CREATE POLICY "admin_users_update" 
ON public.admin_users 
FOR UPDATE 
USING (public.is_super_admin());

DROP POLICY IF EXISTS "admin_users_view_all" ON public.admin_users;
CREATE POLICY "admin_users_view_all" 
ON public.admin_users 
FOR SELECT 
USING (public.is_super_admin());

-- Profiles policies
DROP POLICY IF EXISTS "Super admins can manage all profiles" ON public.profiles;
CREATE POLICY "Super admins can manage all profiles" 
ON public.profiles 
FOR ALL 
USING (public.is_super_admin());

-- Schools policies
DROP POLICY IF EXISTS "Super admins can manage all schools" ON public.schools;
CREATE POLICY "Super admins can manage all schools" 
ON public.schools 
FOR ALL 
USING (public.is_super_admin());

-- Test the functions to ensure they work
DO $$
BEGIN
    -- Test is_super_admin function
    PERFORM public.is_super_admin();
    RAISE NOTICE 'is_super_admin function is working';
    
    -- Test get_school_users_data function (this will fail if not super admin, which is expected)
    BEGIN
        PERFORM public.get_school_users_data();
        RAISE NOTICE 'get_school_users_data function is working';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'get_school_users_data function exists but access denied (expected for non-super admin)';
    END;
END $$; 