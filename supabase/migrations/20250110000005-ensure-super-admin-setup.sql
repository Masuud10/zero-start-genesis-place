-- Ensure super_admin setup and migrate edufam_admin users
-- This migration ensures proper super_admin role setup

-- First, let's ensure the admin_role enum includes all necessary roles
DO $$ 
BEGIN
    -- Add edufam_admin to enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'edufam_admin' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'admin_role')) THEN
        ALTER TYPE admin_role ADD VALUE 'edufam_admin';
    END IF;
END $$;

-- Update existing edufam_admin users to super_admin role
UPDATE public.admin_users 
SET role = 'super_admin' 
WHERE role = 'edufam_admin' 
AND is_active = true;

-- Ensure all profiles with edufam_admin role are in admin_users table
INSERT INTO public.admin_users (user_id, email, name, role, app_type, is_active, permissions)
SELECT 
    p.id,
    p.email,
    COALESCE(p.name, p.email),
    'super_admin',
    'admin',
    true,
    '{
        "manage_admin_users": true,
        "view_admin_users": true,
        "manage_schools": true,
        "view_schools": true,
        "view_system_analytics": true,
        "view_school_analytics": true,
        "export_reports": true,
        "view_logs": true,
        "manage_database": true,
        "manage_deployments": true,
        "view_api_usage": true,
        "manage_support_tickets": true,
        "view_support_tickets": true,
        "manage_hr_records": true,
        "view_hr_records": true,
        "manage_marketing_campaigns": true,
        "view_marketing_analytics": true,
        "manage_events": true,
        "send_notifications": true,
        "manage_billing": true,
        "view_billing": true,
        "export_financial_reports": true,
        "manage_global_settings": true,
        "view_audit_logs": true
    }'::jsonb
FROM public.profiles p
WHERE p.role = 'edufam_admin' 
    AND p.id IS NOT NULL
    AND p.id NOT IN (SELECT user_id FROM public.admin_users WHERE user_id IS NOT NULL)
ON CONFLICT (email) DO UPDATE SET
    role = 'super_admin',
    permissions = EXCLUDED.permissions,
    is_active = true,
    updated_at = now();

-- Create a default super_admin user if none exists
INSERT INTO public.admin_users (user_id, email, name, role, app_type, is_active, permissions)
SELECT 
    p.id,
    p.email,
    COALESCE(p.name, p.email),
    'super_admin',
    'admin',
    true,
    '{
        "manage_admin_users": true,
        "view_admin_users": true,
        "manage_schools": true,
        "view_schools": true,
        "view_system_analytics": true,
        "view_school_analytics": true,
        "export_reports": true,
        "view_logs": true,
        "manage_database": true,
        "manage_deployments": true,
        "view_api_usage": true,
        "manage_support_tickets": true,
        "view_support_tickets": true,
        "manage_hr_records": true,
        "view_hr_records": true,
        "manage_marketing_campaigns": true,
        "view_marketing_analytics": true,
        "manage_events": true,
        "send_notifications": true,
        "manage_billing": true,
        "view_billing": true,
        "export_financial_reports": true,
        "manage_global_settings": true,
        "view_audit_logs": true
    }'::jsonb
FROM public.profiles p
WHERE p.role = 'super_admin' 
    AND p.id IS NOT NULL
    AND p.id NOT IN (SELECT user_id FROM public.admin_users WHERE user_id IS NOT NULL)
ON CONFLICT (email) DO NOTHING;

-- Update RLS policies to allow super_admin and edufam_admin access
DROP POLICY IF EXISTS "Super admins can manage all admin users" ON public.admin_users;
CREATE POLICY "Super admins can manage all admin users" 
ON public.admin_users 
FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.admin_users au 
        WHERE au.user_id = auth.uid() AND au.role IN ('super_admin', 'edufam_admin') AND au.is_active = true
    )
);

-- Update audit logs policy
DROP POLICY IF EXISTS "Super admins can view all audit logs" ON public.admin_audit_logs;
CREATE POLICY "Super admins can view all audit logs" 
ON public.admin_audit_logs 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.admin_users au 
        WHERE au.user_id = auth.uid() AND au.role IN ('super_admin', 'edufam_admin') AND au.is_active = true
    )
);

-- Update permission function to include edufam_admin
CREATE OR REPLACE FUNCTION public.has_admin_permission(permission_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    user_permissions JSONB;
    user_role admin_role;
BEGIN
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

-- Log the migration
INSERT INTO public.admin_audit_logs (action, resource, success, error_message)
VALUES (
    'migration_executed',
    '20250110000005-ensure-super-admin-setup',
    true,
    'Super admin setup migration completed successfully'
); 