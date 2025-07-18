-- Remove all admin user roles from the profiles table
-- All admin users should only exist in the admin_users table

-- Step 1: Get all admin users from profiles table before deletion
DO $$
DECLARE
    admin_profile RECORD;
    existing_admin_user RECORD;
BEGIN
    -- Loop through all admin users in profiles table
    FOR admin_profile IN 
        SELECT id, email, name, role 
        FROM public.profiles 
        WHERE role IN ('edufam_admin', 'elimisha_admin', 'super_admin', 'support_hr', 'software_engineer', 'sales_marketing', 'finance')
    LOOP
        -- Check if this user already exists in admin_users table
        SELECT * INTO existing_admin_user 
        FROM public.admin_users 
        WHERE user_id = admin_profile.id;
        
        -- If not in admin_users table, create entry
        IF NOT FOUND THEN
            INSERT INTO public.admin_users (
                user_id,
                email,
                name,
                role,
                is_active,
                created_at,
                updated_at
            ) VALUES (
                admin_profile.id,
                admin_profile.email,
                admin_profile.name,
                -- Map edufam_admin to super_admin, keep others as is
                CASE 
                    WHEN admin_profile.role = 'edufam_admin' THEN 'super_admin'::admin_role
                    ELSE admin_profile.role::admin_role
                END,
                true,
                now(),
                now()
            );
            
            RAISE NOTICE 'Migrated admin user % with role % to admin_users table', admin_profile.email, admin_profile.role;
        ELSE
            RAISE NOTICE 'Admin user % already exists in admin_users table', admin_profile.email;
        END IF;
    END LOOP;
END $$;

-- Step 2: Remove all admin user roles from profiles table
DELETE FROM public.profiles 
WHERE role IN ('edufam_admin', 'elimisha_admin', 'super_admin', 'support_hr', 'software_engineer', 'sales_marketing', 'finance');

-- Step 3: Update the profiles table role enum to only include school-related roles
-- First, check what roles are currently used in profiles table
DO $$
BEGIN
    -- Create a temporary type with only school roles
    CREATE TYPE public.school_role AS ENUM (
        'school_director',
        'principal', 
        'teacher',
        'parent',
        'finance_officer',
        'hr'
    );
    
    -- Add a new column with the school_role type
    ALTER TABLE public.profiles ADD COLUMN new_role public.school_role;
    
    -- Update the new column with existing valid school roles
    UPDATE public.profiles 
    SET new_role = role::public.school_role 
    WHERE role IN ('school_director', 'principal', 'teacher', 'parent', 'finance_officer', 'hr');
    
    -- Drop the old role column
    ALTER TABLE public.profiles DROP COLUMN role;
    
    -- Rename the new column to role
    ALTER TABLE public.profiles RENAME COLUMN new_role TO role;
    
    -- Make role NOT NULL
    ALTER TABLE public.profiles ALTER COLUMN role SET NOT NULL;
    
    RAISE NOTICE 'Updated profiles table to only include school roles';
END $$;

-- Step 4: Update all existing database functions that reference admin roles in profiles
-- Update the get_current_user_role function to work with the new structure
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $function$
  -- First check if user is an admin user
  SELECT COALESCE(
    (SELECT au.role::text FROM public.admin_users au WHERE au.user_id = auth.uid() AND au.is_active = true),
    (SELECT p.role::text FROM public.profiles p WHERE p.id = auth.uid())
  );
$function$;

-- Create a helper function to check if current user is an admin
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid() AND is_active = true
  );
$function$;

-- Update the is_edufam_admin function to check for super_admin
CREATE OR REPLACE FUNCTION public.is_edufam_admin(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = is_edufam_admin.user_id AND role = 'super_admin' AND is_active = true
  );
$function$;

-- Create a function to get current admin user role
CREATE OR REPLACE FUNCTION public.get_current_admin_role()
RETURNS admin_role
LANGUAGE sql
STABLE SECURITY DEFINER
AS $function$
  SELECT role FROM public.admin_users 
  WHERE user_id = auth.uid() AND is_active = true;
$function$;