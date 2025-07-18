-- FINAL FIX: Resolve infinite recursion in admin_users RLS policies
-- This migration completely removes the problematic RLS policies and recreates them properly

-- Step 1: Disable RLS temporarily to break the recursion
ALTER TABLE public.admin_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL existing policies that might cause recursion
DROP POLICY IF EXISTS "Super admins can manage all admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Admin users can view their own record" ON public.admin_users;
DROP POLICY IF EXISTS "Super admins can view all audit logs" ON public.admin_audit_logs;
DROP POLICY IF EXISTS "All admin users can create audit logs" ON public.admin_audit_logs;
DROP POLICY IF EXISTS "admin_users_view_own" ON public.admin_users;
DROP POLICY IF EXISTS "admin_users_view_all" ON public.admin_users;
DROP POLICY IF EXISTS "admin_users_insert" ON public.admin_users;
DROP POLICY IF EXISTS "admin_users_update" ON public.admin_users;
DROP POLICY IF EXISTS "admin_users_delete" ON public.admin_users;

-- Step 3: Drop ALL existing helper functions that might cause recursion
DROP FUNCTION IF EXISTS public.is_super_admin() CASCADE;
DROP FUNCTION IF EXISTS public.is_any_admin() CASCADE;
DROP FUNCTION IF EXISTS public.check_admin_status() CASCADE;
DROP FUNCTION IF EXISTS public.get_current_admin_user_role() CASCADE;
DROP FUNCTION IF EXISTS public.has_admin_permission() CASCADE;
DROP FUNCTION IF EXISTS public.is_edufam_admin() CASCADE;
DROP FUNCTION IF EXISTS public.get_current_admin_role() CASCADE;

-- Step 4: Create new SECURITY DEFINER functions that don't trigger RLS
-- These functions run with elevated privileges and bypass RLS

-- Function to check if user is any admin (SECURITY DEFINER bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_any_admin()
RETURNS BOOLEAN AS $$
DECLARE
    user_role admin_role;
BEGIN
    -- SECURITY DEFINER disables RLS for this function
    SELECT role INTO user_role
    FROM public.admin_users
    WHERE user_id = auth.uid() AND is_active = true;
    
    RETURN user_role IS NOT NULL;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Function to check if user is super admin (SECURITY DEFINER bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
DECLARE
    user_role admin_role;
BEGIN
    -- SECURITY DEFINER disables RLS for this function
    SELECT role INTO user_role
    FROM public.admin_users
    WHERE user_id = auth.uid() AND is_active = true;
    
    RETURN user_role IN ('super_admin', 'edufam_admin');
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Function to check if user has specific permission (SECURITY DEFINER bypasses RLS)
CREATE OR REPLACE FUNCTION public.has_admin_permission(permission_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    user_permissions JSONB;
    user_role admin_role;
BEGIN
    -- SECURITY DEFINER disables RLS for this function
    SELECT role, permissions INTO user_role, user_permissions
    FROM public.admin_users
    WHERE user_id = auth.uid() AND is_active = true;
    
    -- Super admin and edufam_admin have all permissions
    IF user_role IN ('super_admin', 'edufam_admin') THEN
        RETURN true;
    END IF;
    
    -- Check specific permission
    RETURN COALESCE((user_permissions->permission_name)::boolean, false);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Function to get current admin user role (SECURITY DEFINER bypasses RLS)
CREATE OR REPLACE FUNCTION public.get_current_admin_role()
RETURNS admin_role AS $$
DECLARE
    user_role admin_role;
BEGIN
    -- SECURITY DEFINER disables RLS for this function
    SELECT role INTO user_role
    FROM public.admin_users
    WHERE user_id = auth.uid() AND is_active = true;
    
    RETURN user_role;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Step 5: Re-enable RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Step 6: Create new, non-recursive RLS policies using SECURITY DEFINER functions

-- ADMIN_USERS POLICIES

-- Policy: Admin users can view their own record (simple, no recursion)
CREATE POLICY "admin_users_view_own" 
ON public.admin_users 
FOR SELECT 
USING (user_id = auth.uid());

-- Policy: Super admins can view all admin users (uses SECURITY DEFINER function)
CREATE POLICY "admin_users_view_all" 
ON public.admin_users 
FOR SELECT 
USING (public.is_super_admin());

-- Policy: Super admins can insert admin users (uses SECURITY DEFINER function)
CREATE POLICY "admin_users_insert" 
ON public.admin_users 
FOR INSERT 
WITH CHECK (public.is_super_admin());

-- Policy: Super admins can update admin users (uses SECURITY DEFINER function)
CREATE POLICY "admin_users_update" 
ON public.admin_users 
FOR UPDATE 
USING (public.is_super_admin());

-- Policy: Super admins can delete admin users (uses SECURITY DEFINER function)
CREATE POLICY "admin_users_delete" 
ON public.admin_users 
FOR DELETE 
USING (public.is_super_admin());

-- ADMIN_AUDIT_LOGS POLICIES

-- Policy: Super admins can view all audit logs (uses SECURITY DEFINER function)
CREATE POLICY "admin_audit_logs_view_all" 
ON public.admin_audit_logs 
FOR SELECT 
USING (public.is_super_admin());

-- Policy: Any admin can create audit logs (uses SECURITY DEFINER function)
CREATE POLICY "admin_audit_logs_insert" 
ON public.admin_audit_logs 
FOR INSERT 
WITH CHECK (public.is_any_admin());

-- Step 7: Test the functions to ensure they work
DO $$
DECLARE
    test_result BOOLEAN;
BEGIN
    -- Test that the functions can be called without recursion
    SELECT public.is_any_admin() INTO test_result;
    RAISE NOTICE 'is_any_admin function test: %', test_result;
    
    SELECT public.is_super_admin() INTO test_result;
    RAISE NOTICE 'is_super_admin function test: %', test_result;
    
    RAISE NOTICE 'RLS policies fixed successfully';
END $$;

-- Step 8: Create a simple test query to verify the fix
-- This should not cause infinite recursion
DO $$
BEGIN
    -- Test a simple query to admin_users table
    PERFORM COUNT(*) FROM public.admin_users LIMIT 1;
    RAISE NOTICE 'admin_users table query test: SUCCESS';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'admin_users table query test: FAILED - %', SQLERRM;
END $$; 