-- Fix edufam_admin enum issue
-- This migration ensures edufam_admin is properly included in the admin_role enum
-- and handles any remaining edufam_admin references

-- First, let's check if edufam_admin exists in the enum
DO $$ 
BEGIN
    -- Add edufam_admin to enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'edufam_admin' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'admin_role')) THEN
        ALTER TYPE admin_role ADD VALUE 'edufam_admin';
        RAISE NOTICE 'Added edufam_admin to admin_role enum';
    ELSE
        RAISE NOTICE 'edufam_admin already exists in admin_role enum';
    END IF;
END $$;

-- Update any remaining edufam_admin users in admin_users table to super_admin
UPDATE public.admin_users 
SET role = 'super_admin',
    updated_at = now()
WHERE role = 'edufam_admin' 
AND is_active = true;

-- Update any remaining edufam_admin profiles to super_admin
UPDATE public.profiles 
SET role = 'super_admin',
    updated_at = now()
WHERE role = 'edufam_admin';

-- Ensure all admin_users have proper permissions for super_admin
UPDATE public.admin_users 
SET permissions = '{
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
WHERE role = 'super_admin' 
AND is_active = true;

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

-- Create a function to check if user is edufam admin (for backward compatibility)
CREATE OR REPLACE FUNCTION public.is_edufam_admin()
RETURNS BOOLEAN AS $$
DECLARE
    user_role admin_role;
BEGIN
    SELECT role INTO user_role
    FROM public.admin_users 
    WHERE user_id = auth.uid() AND is_active = true;
    
    RETURN user_role IN ('super_admin', 'edufam_admin');
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Log the migration
INSERT INTO public.admin_audit_logs (action, resource, success, error_message)
VALUES (
    'migration_executed',
    '20250110000006-fix-edufam-admin-enum-issue',
    true,
    'Fixed edufam_admin enum issue and ensured proper role conversion'
);

-- Verify the fix
DO $$
DECLARE
    enum_count INTEGER;
    admin_users_count INTEGER;
    profiles_count INTEGER;
BEGIN
    -- Check enum values
    SELECT COUNT(*) INTO enum_count
    FROM pg_enum 
    WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'admin_role')
    AND enumlabel IN ('super_admin', 'edufam_admin');
    
    -- Check admin_users
    SELECT COUNT(*) INTO admin_users_count
    FROM public.admin_users 
    WHERE role IN ('super_admin', 'edufam_admin') AND is_active = true;
    
    -- Check profiles
    SELECT COUNT(*) INTO profiles_count
    FROM public.profiles 
    WHERE role IN ('super_admin', 'edufam_admin');
    
    RAISE NOTICE 'Migration verification:';
    RAISE NOTICE '- Enum values (super_admin, edufam_admin): %', enum_count;
    RAISE NOTICE '- Active admin users: %', admin_users_count;
    RAISE NOTICE '- Profiles with admin roles: %', profiles_count;
    
    IF enum_count >= 2 AND admin_users_count > 0 THEN
        RAISE NOTICE '✅ Migration successful - edufam_admin enum issue fixed';
    ELSE
        RAISE NOTICE '⚠️  Migration may need attention - check results above';
    END IF;
END $$;