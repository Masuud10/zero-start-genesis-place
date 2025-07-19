-- Fix schema issues and ensure proper admin role enum
-- First, let's check and fix the admin role enum type

-- Check if admin_role enum exists and create/update it
DO $$
BEGIN
    -- Check if the admin_role type exists
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'admin_role') THEN
        -- Create the admin role enum if it doesn't exist
        CREATE TYPE public.admin_role AS ENUM (
            'super_admin',
            'edufam_admin',
            'elimisha_admin',
            'support_hr',
            'sales_marketing', 
            'finance',
            'software_engineer',
            'school_director',
            'principal'
        );
        RAISE NOTICE 'Created admin_role enum type';
    ELSE
        -- Add new values to existing enum if they don't exist
        BEGIN
            ALTER TYPE public.admin_role ADD VALUE IF NOT EXISTS 'support_hr';
            ALTER TYPE public.admin_role ADD VALUE IF NOT EXISTS 'sales_marketing';
            ALTER TYPE public.admin_role ADD VALUE IF NOT EXISTS 'finance';
            ALTER TYPE public.admin_role ADD VALUE IF NOT EXISTS 'software_engineer';
            RAISE NOTICE 'Updated admin_role enum type';
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'admin_role enum values already exist or error: %', SQLERRM;
        END;
    END IF;
END $$;

-- Now update the admin_users table to use the correct enum type
DO $$
BEGIN
    -- Check if role column exists and update its type
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'admin_users' 
        AND column_name = 'role' 
        AND table_schema = 'public'
    ) THEN
        -- Update the column type to use the admin_role enum
        ALTER TABLE public.admin_users 
        ALTER COLUMN role TYPE public.admin_role 
        USING role::text::public.admin_role;
        RAISE NOTICE 'Updated admin_users.role column to use admin_role enum';
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error updating admin_users role column: %', SQLERRM;
END $$;

-- Test the is_super_admin function
SELECT public.is_super_admin() as test_is_super_admin;

-- Test if admin_users table is accessible
SELECT COUNT(*) as admin_users_count FROM public.admin_users;