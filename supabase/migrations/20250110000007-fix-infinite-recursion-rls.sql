-- Fix infinite recursion in admin_users RLS policies
-- This migration completely removes the problematic RLS policies and recreates them properly

-- First, disable RLS temporarily to fix the policies
ALTER TABLE public.admin_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies that might cause recursion
DROP POLICY IF EXISTS "Super admins can manage all admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Admin users can view their own record" ON public.admin_users;
DROP POLICY IF EXISTS "Super admins can view all audit logs" ON public.admin_audit_logs;
DROP POLICY IF EXISTS "All admin users can create audit logs" ON public.admin_audit_logs;

-- Drop the problematic function
DROP FUNCTION IF EXISTS public.is_super_admin();

-- Create a new function that checks admin status without triggering RLS
CREATE OR REPLACE FUNCTION public.check_admin_status()
RETURNS TABLE(is_admin BOOLEAN, role admin_role) AS $$
BEGIN
    -- Use a direct query without RLS to check admin status
    RETURN QUERY
    SELECT 
        au.is_active,
        au.role
    FROM public.admin_users au
    WHERE au.user_id = auth.uid();
    
    -- If no record found, return false
    IF NOT FOUND THEN
        RETURN QUERY SELECT false, null::admin_role;
    END IF;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Create a simple function to check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
DECLARE
    admin_status RECORD;
BEGIN
    SELECT * INTO admin_status FROM public.check_admin_status();
    RETURN admin_status.is_admin AND admin_status.role IN ('super_admin', 'edufam_admin');
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Create a function to check if user is any admin
CREATE OR REPLACE FUNCTION public.is_any_admin()
RETURNS BOOLEAN AS $$
DECLARE
    admin_status RECORD;
BEGIN
    SELECT * INTO admin_status FROM public.check_admin_status();
    RETURN admin_status.is_admin;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Re-enable RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Create new, non-recursive RLS policies
CREATE POLICY "Super admins can manage all admin users" 
ON public.admin_users 
FOR ALL 
USING (public.is_super_admin());

CREATE POLICY "Admin users can view their own record" 
ON public.admin_users 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Super admins can view all audit logs" 
ON public.admin_audit_logs 
FOR SELECT 
USING (public.is_super_admin());

CREATE POLICY "All admin users can create audit logs" 
ON public.admin_audit_logs 
FOR INSERT 
WITH CHECK (public.is_any_admin());

-- Create a policy for admin_users INSERT (for creating new admin users)
CREATE POLICY "Super admins can insert admin users" 
ON public.admin_users 
FOR INSERT 
WITH CHECK (public.is_super_admin());

-- Create a policy for admin_users UPDATE (for updating admin users)
CREATE POLICY "Super admins can update admin users" 
ON public.admin_users 
FOR UPDATE 
USING (public.is_super_admin());

-- Create a policy for admin_users DELETE (for deleting admin users)
CREATE POLICY "Super admins can delete admin users" 
ON public.admin_users 
FOR DELETE 
USING (public.is_super_admin());

-- Test the functions to ensure they work
DO $$
DECLARE
    test_result BOOLEAN;
BEGIN
    -- Test the check_admin_status function
    SELECT is_admin INTO test_result FROM public.check_admin_status();
    RAISE NOTICE 'check_admin_status test completed';
    
    -- Test the is_super_admin function
    SELECT public.is_super_admin() INTO test_result;
    RAISE NOTICE 'is_super_admin test completed';
    
    -- Test the is_any_admin function
    SELECT public.is_any_admin() INTO test_result;
    RAISE NOTICE 'is_any_admin test completed';
    
    RAISE NOTICE 'All function tests completed successfully';
END $$;

-- Log the migration
INSERT INTO public.admin_audit_logs (action, resource, success, error_message)
VALUES (
    'migration_executed',
    '20250110000007-fix-infinite-recursion-rls',
    true,
    'Fixed infinite recursion in RLS policies for admin_users table'
); 