-- COMPLETE DATABASE INTEGRITY FIX
-- Date: 2025-07-19
-- This migration fixes all database integrity issues

-- 1. ENSURE ADMIN_ROLE ENUM HAS ALL REQUIRED VALUES
DO $$ 
BEGIN
    -- Add missing enum values if they don't exist
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'super_admin' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'admin_role')) THEN
        ALTER TYPE admin_role ADD VALUE 'super_admin';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'edufam_admin' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'admin_role')) THEN
        ALTER TYPE admin_role ADD VALUE 'edufam_admin';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'software_engineer' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'admin_role')) THEN
        ALTER TYPE admin_role ADD VALUE 'software_engineer';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'support_hr' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'admin_role')) THEN
        ALTER TYPE admin_role ADD VALUE 'support_hr';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'sales_marketing' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'admin_role')) THEN
        ALTER TYPE admin_role ADD VALUE 'sales_marketing';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'finance' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'admin_role')) THEN
        ALTER TYPE admin_role ADD VALUE 'finance';
    END IF;
END $$;

-- 2. CLEAN ORPHANED ADMIN_USERS RECORDS
-- Remove admin_users that don't have corresponding auth.users
DELETE FROM public.admin_users 
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- Remove admin_users that don't have corresponding profiles
DELETE FROM public.admin_users 
WHERE user_id NOT IN (SELECT id FROM public.profiles);

-- 3. FIX DUPLICATE EMAILS IN ADMIN_USERS
-- Keep only the most recent record for each email
DELETE FROM public.admin_users 
WHERE id NOT IN (
    SELECT DISTINCT ON (email) id 
    FROM public.admin_users 
    ORDER BY email, created_at DESC
);

-- 4. FIX DUPLICATE USER_IDS IN ADMIN_USERS
-- Keep only the most recent record for each user_id
DELETE FROM public.admin_users 
WHERE id NOT IN (
    SELECT DISTINCT ON (user_id) id 
    FROM public.admin_users 
    ORDER BY user_id, created_at DESC
);

-- 5. FIX INVALID ROLES IN ADMIN_USERS
-- Update invalid roles to super_admin (safe default)
UPDATE public.admin_users 
SET role = 'super_admin'::admin_role
WHERE role::text NOT IN (
    SELECT unnest(enum_range(NULL::admin_role))::text
);

-- 6. FIX ORPHANED ADMIN_AUDIT_LOGS
-- Remove audit logs that reference non-existent admin_users
DELETE FROM public.admin_audit_logs 
WHERE admin_user_id IS NOT NULL 
AND admin_user_id NOT IN (SELECT id FROM public.admin_users);

-- 7. ENSURE ALL ADMIN_USERS HAVE REQUIRED FIELDS
-- Set default values for missing required fields
UPDATE public.admin_users 
SET 
    email = COALESCE(email, 'unknown@edufam.com'),
    name = COALESCE(name, 'Unknown User'),
    role = COALESCE(role, 'super_admin'::admin_role),
    app_type = COALESCE(app_type, 'admin'),
    is_active = COALESCE(is_active, true),
    permissions = COALESCE(permissions, '{}'::jsonb),
    created_at = COALESCE(created_at, NOW()),
    updated_at = COALESCE(updated_at, NOW())
WHERE 
    email IS NULL OR 
    name IS NULL OR 
    role IS NULL OR 
    app_type IS NULL OR 
    is_active IS NULL OR 
    permissions IS NULL OR 
    created_at IS NULL OR 
    updated_at IS NULL;

-- 8. ENSURE PROFILES TABLE HAS CORRECT ADMIN ROLES
-- Update profiles to have correct admin roles
UPDATE public.profiles 
SET role = 'super_admin'
WHERE role IN ('edufam_admin', 'elimisha_admin') 
AND id IN (SELECT user_id FROM public.admin_users WHERE role = 'super_admin');

UPDATE public.profiles 
SET role = 'edufam_admin'
WHERE role IN ('super_admin', 'elimisha_admin') 
AND id IN (SELECT user_id FROM public.admin_users WHERE role = 'edufam_admin');

-- 9. CREATE MISSING ADMIN_USERS FOR PROFILES WITH ADMIN ROLES
INSERT INTO public.admin_users (user_id, email, name, role, app_type, is_active, permissions, created_at, updated_at)
SELECT 
    p.id,
    p.email,
    COALESCE(p.name, p.email),
    CASE 
        WHEN p.role = 'super_admin' THEN 'super_admin'::admin_role
        WHEN p.role = 'edufam_admin' THEN 'edufam_admin'::admin_role
        ELSE 'super_admin'::admin_role
    END,
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
WHERE p.role IN ('super_admin', 'edufam_admin')
AND p.id NOT IN (SELECT user_id FROM public.admin_users WHERE user_id IS NOT NULL)
ON CONFLICT (user_id) DO NOTHING;

-- 10. ENSURE AT LEAST ONE SUPER ADMIN EXISTS
-- Create default super admin if none exists
DO $$
DECLARE
    super_admin_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO super_admin_count 
    FROM public.admin_users 
    WHERE role = 'super_admin' AND is_active = true;
    
    IF super_admin_count = 0 THEN
        -- Create a default super admin user
        INSERT INTO public.admin_users (
            user_id, 
            email, 
            name, 
            role, 
            app_type, 
            is_active, 
            permissions, 
            created_at, 
            updated_at
        ) VALUES (
            gen_random_uuid(), -- This will be updated when auth user is created
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
        
        RAISE NOTICE 'Created default super admin user (admin@edufam.com)';
    END IF;
END $$;

-- 11. LOG THE INTEGRITY FIX
INSERT INTO public.admin_audit_logs (action, resource, success, error_message)
VALUES (
    'database_integrity_fix',
    'admin_users',
    true,
    'Completed comprehensive database integrity fix - cleaned orphaned records, fixed enum values, ensured data consistency'
);

-- 12. SHOW INTEGRITY CHECK RESULTS
DO $$
DECLARE
    orphaned_admin_users INTEGER;
    duplicate_emails INTEGER;
    duplicate_user_ids INTEGER;
    invalid_roles INTEGER;
    total_admin_users INTEGER;
BEGIN
    -- Count remaining issues
    SELECT COUNT(*) INTO orphaned_admin_users 
    FROM public.admin_users au
    WHERE NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = au.user_id);
    
    SELECT COUNT(*) INTO duplicate_emails 
    FROM (
        SELECT email, COUNT(*) 
        FROM public.admin_users 
        GROUP BY email 
        HAVING COUNT(*) > 1
    ) AS duplicates;
    
    SELECT COUNT(*) INTO duplicate_user_ids 
    FROM (
        SELECT user_id, COUNT(*) 
        FROM public.admin_users 
        GROUP BY user_id 
        HAVING COUNT(*) > 1
    ) AS duplicates;
    
    SELECT COUNT(*) INTO invalid_roles 
    FROM public.admin_users
    WHERE role::text NOT IN (SELECT unnest(enum_range(NULL::admin_role))::text);
    
    SELECT COUNT(*) INTO total_admin_users FROM public.admin_users;
    
    RAISE NOTICE 'Database Integrity Fix Results:';
    RAISE NOTICE '- Total admin users: %', total_admin_users;
    RAISE NOTICE '- Orphaned admin users: %', orphaned_admin_users;
    RAISE NOTICE '- Duplicate emails: %', duplicate_emails;
    RAISE NOTICE '- Duplicate user IDs: %', duplicate_user_ids;
    RAISE NOTICE '- Invalid roles: %', invalid_roles;
    
    IF orphaned_admin_users = 0 AND duplicate_emails = 0 AND duplicate_user_ids = 0 AND invalid_roles = 0 THEN
        RAISE NOTICE '✅ Database integrity fix completed successfully!';
    ELSE
        RAISE WARNING '⚠️ Some issues remain - manual intervention may be required';
    END IF;
END $$; 