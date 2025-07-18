-- MANUAL FIX: Admin Role Enum and Dashboard Access
-- Run this script in your Supabase SQL Editor to fix the admin_role enum issue
-- Date: 2025-01-20

-- 1. ENSURE ADMIN_ROLE ENUM EXISTS WITH ALL REQUIRED VALUES
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
        RAISE NOTICE 'Created admin_role enum';
    ELSE
        RAISE NOTICE 'admin_role enum already exists';
    END IF;
    
    -- Add missing enum values if they don't exist
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'super_admin' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'admin_role')) THEN
        ALTER TYPE admin_role ADD VALUE 'super_admin';
        RAISE NOTICE 'Added super_admin to admin_role enum';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'edufam_admin' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'admin_role')) THEN
        ALTER TYPE admin_role ADD VALUE 'edufam_admin';
        RAISE NOTICE 'Added edufam_admin to admin_role enum';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'software_engineer' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'admin_role')) THEN
        ALTER TYPE admin_role ADD VALUE 'software_engineer';
        RAISE NOTICE 'Added software_engineer to admin_role enum';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'support_hr' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'admin_role')) THEN
        ALTER TYPE admin_role ADD VALUE 'support_hr';
        RAISE NOTICE 'Added support_hr to admin_role enum';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'sales_marketing' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'admin_role')) THEN
        ALTER TYPE admin_role ADD VALUE 'sales_marketing';
        RAISE NOTICE 'Added sales_marketing to admin_role enum';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'finance' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'admin_role')) THEN
        ALTER TYPE admin_role ADD VALUE 'finance';
        RAISE NOTICE 'Added finance to admin_role enum';
    END IF;
END $$;

-- 2. ENSURE ADMIN_USERS TABLE EXISTS WITH CORRECT STRUCTURE
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

-- 3. CREATE ADMIN_AUDIT_LOGS TABLE IF NOT EXISTS
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

-- 4. ENABLE RLS ON ADMIN TABLES
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- 5. DROP EXISTING RLS POLICIES TO RECREATE THEM
DROP POLICY IF EXISTS "Super admins can manage all admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Admin users can view their own record" ON public.admin_users;
DROP POLICY IF EXISTS "Super admins can view all audit logs" ON public.admin_audit_logs;
DROP POLICY IF EXISTS "All admin users can create audit logs" ON public.admin_audit_logs;

-- 6. CREATE SECURE RLS POLICIES USING SECURITY DEFINER FUNCTIONS
-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admin_users 
        WHERE user_id = auth.uid() AND is_active = true
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Function to check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admin_users 
        WHERE user_id = auth.uid() AND role = 'super_admin' AND is_active = true
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Function to check if user is edufam admin (for backward compatibility)
CREATE OR REPLACE FUNCTION public.is_edufam_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admin_users 
        WHERE user_id = auth.uid() AND role IN ('super_admin', 'edufam_admin') AND is_active = true
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 7. CREATE RLS POLICIES
-- Super admins can manage all admin users
CREATE POLICY "admin_users_view_all" 
ON public.admin_users 
FOR SELECT 
USING (public.is_super_admin());

-- Admin users can view their own record
CREATE POLICY "admin_users_view_own" 
ON public.admin_users 
FOR SELECT 
USING (user_id = auth.uid());

-- Super admin policies
CREATE POLICY "admin_users_insert" 
ON public.admin_users 
FOR INSERT 
WITH CHECK (public.is_super_admin());

CREATE POLICY "admin_users_update" 
ON public.admin_users 
FOR UPDATE 
USING (public.is_super_admin());

CREATE POLICY "admin_users_delete" 
ON public.admin_users 
FOR DELETE 
USING (public.is_super_admin());

-- Super admins can view all audit logs
CREATE POLICY "admin_audit_logs_view_all" 
ON public.admin_audit_logs 
FOR SELECT 
USING (public.is_super_admin());

-- All admin users can create audit logs
CREATE POLICY "admin_audit_logs_insert" 
ON public.admin_audit_logs 
FOR INSERT 
WITH CHECK (public.is_admin_user());

-- 8. FIX THE GET_ADMIN_SCHOOLS_DATA FUNCTION
CREATE OR REPLACE FUNCTION public.get_admin_schools_data()
RETURNS TABLE (
  id uuid,
  name text,
  email text,
  phone text,
  address text,
  location text,
  created_at timestamptz,
  updated_at timestamptz,
  owner_id uuid,
  logo_url text,
  website_url text,
  motto text,
  slogan text,
  registration_number text,
  year_established integer,
  owner_information text,
  school_type text,
  status text,
  term_structure text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT 
    s.id, s.name, s.email, s.phone, s.address, s.location,
    s.created_at, s.updated_at, s.owner_id, s.logo_url, s.website_url,
    s.motto, s.slogan, s.registration_number, s.year_established,
    s.owner_information, s.school_type, s.status, s.term_structure
  FROM public.schools s
  WHERE public.is_edufam_admin()
  ORDER BY s.created_at DESC;
$$;

-- 9. FIX THE GET_ADMIN_USERS_DATA FUNCTION
CREATE OR REPLACE FUNCTION public.get_admin_users_data()
RETURNS TABLE (
  id uuid,
  name text,
  email text,
  role text,
  created_at timestamptz,
  updated_at timestamptz,
  status text,
  school_id uuid,
  school_name text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT 
    p.id, p.name, p.email, p.role, p.created_at, p.updated_at, p.status, p.school_id,
    s.name as school_name
  FROM public.profiles p
  LEFT JOIN public.schools s ON p.school_id = s.id
  WHERE public.is_edufam_admin()
  ORDER BY p.created_at DESC;
$$;

-- 10. CREATE SYSTEM ANALYTICS FUNCTION
CREATE OR REPLACE FUNCTION public.get_system_analytics()
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  total_schools integer;
  total_users integer;
  active_users integer;
  new_users_this_month integer;
  new_schools_this_month integer;
  user_role_distribution jsonb;
  result jsonb;
BEGIN
  -- Check if user is admin
  IF NOT public.is_edufam_admin() THEN
    RAISE EXCEPTION 'Access denied. Only EduFam administrators can access system analytics.';
  END IF;

  -- Get total schools count
  SELECT COUNT(*) INTO total_schools FROM public.schools;
  
  -- Get total users count
  SELECT COUNT(*) INTO total_users FROM public.profiles;
  
  -- Get active users (those with recent activity)
  SELECT COUNT(*) INTO active_users 
  FROM public.profiles 
  WHERE created_at > NOW() - INTERVAL '30 days';
  
  -- Get new users this month
  SELECT COUNT(*) INTO new_users_this_month 
  FROM public.profiles 
  WHERE created_at >= date_trunc('month', NOW());
  
  -- Get new schools this month
  SELECT COUNT(*) INTO new_schools_this_month 
  FROM public.schools 
  WHERE created_at >= date_trunc('month', NOW());
  
  -- Get user role distribution
  SELECT jsonb_object_agg(role, role_count) INTO user_role_distribution
  FROM (
    SELECT role, COUNT(*) as role_count 
    FROM public.profiles 
    GROUP BY role
  ) role_stats;
  
  -- Build result
  result := jsonb_build_object(
    'total_schools', total_schools,
    'total_users', total_users,
    'active_users', active_users,
    'new_users_this_month', new_users_this_month,
    'new_schools_this_month', new_schools_this_month,
    'user_role_distribution', COALESCE(user_role_distribution, '{}'::jsonb),
    'last_updated', NOW()
  );
  
  RETURN result;
END;
$$;

-- 11. CREATE SYSTEM HEALTH FUNCTION
CREATE OR REPLACE FUNCTION public.get_system_health()
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  uptime_percentage numeric;
  performance_score numeric;
  recent_errors integer;
  result jsonb;
BEGIN
  -- Check if user is admin
  IF NOT public.is_edufam_admin() THEN
    RAISE EXCEPTION 'Access denied. Only EduFam administrators can access system health.';
  END IF;

  -- Calculate uptime (simulated - in real implementation, this would come from monitoring)
  uptime_percentage := 99.9;
  
  -- Calculate performance score (simulated)
  performance_score := 95.5;
  
  -- Get recent errors from audit logs
  SELECT COUNT(*) INTO recent_errors
  FROM public.admin_audit_logs
  WHERE success = false 
  AND timestamp > NOW() - INTERVAL '24 hours';
  
  -- Build result
  result := jsonb_build_object(
    'uptime_percentage', uptime_percentage,
    'performance_score', performance_score,
    'recent_errors', recent_errors,
    'last_updated', NOW()
  );
  
  RETURN result;
END;
$$;

-- 12. MIGRATE EXISTING EDUFAM_ADMIN USERS TO SUPER_ADMIN
-- Update admin_users table
UPDATE public.admin_users 
SET role = 'super_admin',
    updated_at = now()
WHERE role = 'edufam_admin' 
AND is_active = true;

-- Update profiles table
UPDATE public.profiles 
SET role = 'super_admin',
    updated_at = now()
WHERE role = 'edufam_admin';

-- 13. ENSURE ALL ADMIN_USERS HAVE PROPER PERMISSIONS
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

-- 14. CREATE MISSING ADMIN_USERS FOR PROFILES WITH ADMIN ROLES
INSERT INTO public.admin_users (user_id, email, name, role, app_type, is_active, permissions, created_at, updated_at)
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
    }'::jsonb,
    COALESCE(p.created_at, NOW()),
    COALESCE(p.updated_at, NOW())
FROM public.profiles p
WHERE p.role = 'super_admin'
AND p.id NOT IN (SELECT user_id FROM public.admin_users WHERE user_id IS NOT NULL)
ON CONFLICT (user_id) DO NOTHING;

-- 15. ENSURE AT LEAST ONE SUPER ADMIN EXISTS
DO $$
DECLARE
    super_admin_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO super_admin_count
    FROM public.admin_users 
    WHERE role = 'super_admin' AND is_active = true;
    
    IF super_admin_count = 0 THEN
        -- Create a default super admin if none exists
        INSERT INTO public.admin_users (user_id, email, name, role, app_type, is_active, permissions, created_at, updated_at)
        VALUES (
            gen_random_uuid(),
            'admin@edufam.com',
            'EduFam Super Admin',
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
            }'::jsonb,
            NOW(),
            NOW()
        );
        RAISE NOTICE 'Created default super admin user';
    END IF;
END $$;

-- 16. CREATE TRIGGER TO UPDATE UPDATED_AT
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

-- 17. LOG THE MIGRATION
INSERT INTO public.admin_audit_logs (action, resource, success, error_message)
VALUES (
    'migration_executed',
    'fix-admin-role-enum-manual',
    true,
    'Fixed admin_role enum issue and ensured super_admin access to EduFam dashboard'
);

-- 18. VERIFICATION
DO $$
DECLARE
    enum_count INTEGER;
    admin_users_count INTEGER;
    super_admin_count INTEGER;
    profiles_count INTEGER;
BEGIN
    -- Check enum values
    SELECT COUNT(*) INTO enum_count
    FROM pg_enum 
    WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'admin_role')
    AND enumlabel IN ('super_admin', 'edufam_admin', 'software_engineer', 'support_hr', 'sales_marketing', 'finance');
    
    -- Check admin_users
    SELECT COUNT(*) INTO admin_users_count
    FROM public.admin_users 
    WHERE is_active = true;
    
    -- Check super_admin users
    SELECT COUNT(*) INTO super_admin_count
    FROM public.admin_users 
    WHERE role = 'super_admin' AND is_active = true;
    
    -- Check profiles
    SELECT COUNT(*) INTO profiles_count
    FROM public.profiles 
    WHERE role = 'super_admin';
    
    RAISE NOTICE 'Migration verification:';
    RAISE NOTICE '- Enum values: %', enum_count;
    RAISE NOTICE '- Active admin users: %', admin_users_count;
    RAISE NOTICE '- Super admin users: %', super_admin_count;
    RAISE NOTICE '- Profiles with super_admin role: %', profiles_count;
    
    IF enum_count >= 6 AND super_admin_count > 0 THEN
        RAISE NOTICE '✅ Migration successful - admin_role enum fixed and super_admin access ensured';
    ELSE
        RAISE NOTICE '⚠️  Migration may need attention - check results above';
    END IF;
END $$;