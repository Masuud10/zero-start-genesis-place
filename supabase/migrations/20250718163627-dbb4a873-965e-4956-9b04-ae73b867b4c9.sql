-- 20250110000006-fix-edufam-admin-enum-issue.sql
-- Fix edufam_admin enum issues and ensure proper migration

-- First, check and add the edufam_admin value to admin_role enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'edufam_admin' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'admin_role')) THEN
        ALTER TYPE admin_role ADD VALUE 'edufam_admin';
    END IF;
END $$;

-- Migrate any existing edufam_admin users from profiles to admin_users table
INSERT INTO public.admin_users (user_id, email, name, role, app_type, is_active, permissions)
SELECT 
    p.id,
    p.email,
    COALESCE(p.name, p.email),
    'edufam_admin'::admin_role,
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
    role = 'edufam_admin'::admin_role,
    permissions = EXCLUDED.permissions,
    is_active = true,
    updated_at = now();

-- Update permission checking functions to handle edufam_admin correctly
CREATE OR REPLACE FUNCTION public.has_admin_permission(permission_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    user_permissions JSONB;
    user_role admin_role;
BEGIN
    -- Get user role and permissions from admin_users table
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