-- CLEAN MIGRATION: Admin Role Enum and Dashboard Access
-- This version drops all existing policies first to avoid conflicts

-- 1. DROP ALL EXISTING POLICIES TO AVOID CONFLICTS
DROP POLICY IF EXISTS "admin_users_view_all" ON public.admin_users;
DROP POLICY IF EXISTS "admin_users_view_own" ON public.admin_users;
DROP POLICY IF EXISTS "admin_users_insert" ON public.admin_users;
DROP POLICY IF EXISTS "admin_users_update" ON public.admin_users;
DROP POLICY IF EXISTS "admin_users_delete" ON public.admin_users;
DROP POLICY IF EXISTS "admin_audit_logs_view_all" ON public.admin_audit_logs;
DROP POLICY IF EXISTS "admin_audit_logs_insert" ON public.admin_audit_logs;
DROP POLICY IF EXISTS "Super admins can manage all admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Admin users can view their own record" ON public.admin_users;
DROP POLICY IF EXISTS "Super admins can view all audit logs" ON public.admin_audit_logs;
DROP POLICY IF EXISTS "All admin users can create audit logs" ON public.admin_audit_logs;

-- 2. ENSURE ADMIN_ROLE ENUM EXISTS WITH ALL REQUIRED VALUES
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
    END IF;
END $$;

-- 3. RECREATE RLS POLICIES
-- Super admins can view all admin users
CREATE POLICY "admin_users_view_all" 
ON public.admin_users 
FOR SELECT 
USING (public.is_super_admin());

-- Admin users can view their own record
CREATE POLICY "admin_users_view_own" 
ON public.admin_users 
FOR SELECT 
USING (user_id = auth.uid());

-- Super admin policies for management
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

-- Audit log policies
CREATE POLICY "admin_audit_logs_view_all" 
ON public.admin_audit_logs 
FOR SELECT 
USING (public.is_super_admin());

CREATE POLICY "admin_audit_logs_insert" 
ON public.admin_audit_logs 
FOR INSERT 
WITH CHECK (public.is_admin_user());

-- 4. MIGRATE EXISTING EDUFAM_ADMIN USERS TO SUPER_ADMIN
UPDATE public.admin_users 
SET role = 'super_admin',
    updated_at = now()
WHERE role = 'edufam_admin' 
AND is_active = true;

UPDATE public.profiles 
SET role = 'super_admin',
    updated_at = now()
WHERE role = 'edufam_admin';

-- 5. ENSURE AT LEAST ONE SUPER ADMIN EXISTS
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
                "view_system_analytics": true
            }'::jsonb,
            NOW(),
            NOW()
        );
        RAISE NOTICE 'Created default super admin user';
    END IF;
END $$;