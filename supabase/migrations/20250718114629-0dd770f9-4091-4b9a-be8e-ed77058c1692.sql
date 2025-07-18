-- Fix admin authentication setup with correct enum values
-- This migration ensures proper admin user setup and fixes authentication issues

-- First, let's ensure the admin_users table exists and has the correct structure
DO $$ 
BEGIN
    -- Create admin_role enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'admin_role') THEN
        CREATE TYPE admin_role AS ENUM (
            'super_admin',
            'edufam_admin',
            'software_engineer', 
            'support_hr',
            'sales_marketing',
            'finance'
        );
    ELSE
        -- Add missing enum values if they don't exist
        BEGIN
            ALTER TYPE admin_role ADD VALUE IF NOT EXISTS 'edufam_admin';
        EXCEPTION WHEN duplicate_object THEN
            -- Value already exists, continue
        END;
    END IF;
END $$;

-- Create admin_users table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    role admin_role NOT NULL,
    app_type TEXT NOT NULL DEFAULT 'admin',
    permissions JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID REFERENCES public.admin_users(id)
);

-- Create admin_audit_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id UUID REFERENCES public.admin_users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource TEXT,
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
    success BOOLEAN DEFAULT true,
    error_message TEXT
);

-- Enable RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Super admins can manage all admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Admin users can view their own record" ON public.admin_users;
DROP POLICY IF EXISTS "Super admins can view all audit logs" ON public.admin_audit_logs;
DROP POLICY IF EXISTS "All admin users can create audit logs" ON public.admin_audit_logs;

-- Create RLS Policies for admin_users
CREATE POLICY "Super admins can manage all admin users" 
ON public.admin_users 
FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.admin_users au 
        WHERE au.user_id = auth.uid() AND au.role IN ('super_admin', 'edufam_admin') AND au.is_active = true
    )
);

CREATE POLICY "Admin users can view their own record" 
ON public.admin_users 
FOR SELECT 
USING (user_id = auth.uid());

-- Create RLS Policies for admin_audit_logs
CREATE POLICY "Super admins can view all audit logs" 
ON public.admin_audit_logs 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.admin_users au 
        WHERE au.user_id = auth.uid() AND au.role IN ('super_admin', 'edufam_admin') AND au.is_active = true
    )
);

CREATE POLICY "All admin users can create audit logs" 
ON public.admin_audit_logs 
FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.admin_users au 
        WHERE au.user_id = auth.uid() AND au.is_active = true
    )
);

-- Create function to get current admin user role
CREATE OR REPLACE FUNCTION public.get_current_admin_role()
RETURNS admin_role AS $$
DECLARE
    user_role admin_role;
BEGIN
    SELECT role INTO user_role
    FROM public.admin_users 
    WHERE user_id = auth.uid() AND is_active = true;
    
    RETURN user_role;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Create function to check admin permissions
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

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_admin_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS admin_users_updated_at ON public.admin_users;
CREATE TRIGGER admin_users_updated_at
    BEFORE UPDATE ON public.admin_users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_admin_updated_at();

-- Log the migration
INSERT INTO public.admin_audit_logs (action, resource, success, error_message)
VALUES (
    'migration_executed',
    '20250110000004-fix-admin-authentication-setup',
    true,
    'Admin authentication setup migration completed successfully'
);