-- Fix RLS policies for admin_users to ensure proper access
-- The issue is that when a user first signs in, they may not have admin permissions yet
-- but we need to check if they're an admin user

-- Drop and recreate the admin users policies with better logic
DROP POLICY IF EXISTS "Super admins can manage all admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Admin users can view their own record" ON public.admin_users;

-- Policy for admin users to view their own record (this should always work)
CREATE POLICY "Admin users can view their own record" 
ON public.admin_users 
FOR SELECT 
USING (user_id = auth.uid());

-- Policy for super admins to manage all admin users
CREATE POLICY "Super admins can manage all admin users" 
ON public.admin_users 
FOR ALL 
USING (
    -- Allow if user is checking their own record OR if they are a super admin
    user_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.admin_users au 
        WHERE au.user_id = auth.uid() 
        AND au.role IN ('super_admin', 'edufam_admin') 
        AND au.is_active = true
    )
);

-- Also update the is_edufam_admin function to handle cases where user might not be in admin_users yet
CREATE OR REPLACE FUNCTION public.is_edufam_admin(user_id uuid DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
DECLARE
    user_role admin_role;
    profile_role text;
BEGIN
    -- First check admin_users table
    SELECT role INTO user_role
    FROM public.admin_users 
    WHERE user_id = is_edufam_admin.user_id AND is_active = true;
    
    -- If found in admin_users, check if it's a super admin role
    IF user_role IS NOT NULL THEN
        RETURN user_role IN ('super_admin', 'edufam_admin');
    END IF;
    
    -- Fallback: check profiles table for backward compatibility
    SELECT role INTO profile_role
    FROM public.profiles 
    WHERE id = is_edufam_admin.user_id;
    
    RETURN profile_role IN ('super_admin', 'edufam_admin');
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Log the fix
INSERT INTO public.admin_audit_logs (action, resource, success, error_message)
VALUES (
    'rls_policy_fix',
    'admin_users_policies',
    true,
    'Fixed RLS policies to allow users to check their own admin status'
);