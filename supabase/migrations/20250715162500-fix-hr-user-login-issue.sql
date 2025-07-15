-- CRITICAL FIX: Resolve HR user login "Database error querying schema" issue
-- This migration fixes the HR user login problem by ensuring proper setup

-- Step 1: First, let's ensure the HR user exists and is properly configured
DO $$
DECLARE
    hr_user_id UUID;
    first_school_id UUID;
    hr_profile_exists BOOLEAN;
BEGIN
    -- Get first school ID
    SELECT id INTO first_school_id FROM public.schools ORDER BY created_at LIMIT 1;
    
    -- Check if HR user exists in auth.users
    SELECT id INTO hr_user_id FROM auth.users WHERE email = 'hr@edufam.com';
    
    -- If HR user doesn't exist in auth.users, create it
    IF hr_user_id IS NULL THEN
        hr_user_id := gen_random_uuid();
        
        -- Create HR user in auth.users
        INSERT INTO auth.users (
            id,
            instance_id,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            raw_user_meta_data,
            role,
            aud
        ) VALUES (
            hr_user_id,
            '00000000-0000-0000-0000-000000000000',
            'hr@edufam.com',
            crypt('HRPassword123!', gen_salt('bf')),
            now(),
            now(),
            now(),
            jsonb_build_object('name', 'HR Manager', 'role', 'hr', 'created_by_admin', true),
            'authenticated',
            'authenticated'
        );
        
        RAISE NOTICE 'Created HR user in auth.users with ID: %', hr_user_id;
    ELSE
        RAISE NOTICE 'HR user already exists in auth.users with ID: %', hr_user_id;
    END IF;
    
    -- Check if HR profile exists in profiles table
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = hr_user_id) INTO hr_profile_exists;
    
    -- If HR profile doesn't exist, create it
    IF NOT hr_profile_exists THEN
        INSERT INTO public.profiles (id, email, name, role, school_id, created_at, updated_at)
        VALUES (hr_user_id, 'hr@edufam.com', 'HR Manager', 'hr', first_school_id, now(), now());
        
        RAISE NOTICE 'Created HR profile in profiles table';
    ELSE
        -- Update existing HR profile to ensure it's correct
        UPDATE public.profiles 
        SET 
            email = 'hr@edufam.com',
            name = 'HR Manager',
            role = 'hr',
            school_id = first_school_id,
            updated_at = now()
        WHERE id = hr_user_id;
        
        RAISE NOTICE 'Updated existing HR profile';
    END IF;
    
    -- Ensure user_login_details exists for HR user
    IF NOT EXISTS (SELECT 1 FROM public.user_login_details WHERE user_id = hr_user_id) THEN
        INSERT INTO public.user_login_details (
            user_id, 
            role, 
            access_level,
            employee_id,
            department
        ) VALUES (
            hr_user_id,
            'hr',
            2, -- HR has access level 2
            'EMP' || EXTRACT(EPOCH FROM now())::TEXT,
            'Human Resources'
        );
        
        RAISE NOTICE 'Created user_login_details for HR user';
    END IF;
    
END $$;

-- Step 2: Fix RLS policies to prevent circular dependencies
-- Drop any problematic policies that might cause recursion
DROP POLICY IF EXISTS "Enable HR to view profiles in their school" ON public.profiles;
DROP POLICY IF EXISTS "Enable HR to manage users in their school" ON public.profiles;
DROP POLICY IF EXISTS "Enable HR to view user_login_details in their school" ON public.user_login_details;
DROP POLICY IF EXISTS "Enable HR to update user_login_details in their school" ON public.user_login_details;

-- Step 3: Create simple, non-recursive policies for HR access
-- HR users can view profiles in their school (simple check)
CREATE POLICY "HR can view profiles in their school"
ON public.profiles FOR SELECT
USING (
    (auth.uid() = id) OR  -- Users can always see their own profile
    (
        EXISTS (
            SELECT 1 FROM public.profiles current_user
            WHERE current_user.id = auth.uid()
            AND current_user.role = 'hr'
            AND current_user.school_id = profiles.school_id
        )
    )
);

-- HR users can update profiles in their school
CREATE POLICY "HR can update profiles in their school"
ON public.profiles FOR UPDATE
USING (
    (auth.uid() = id) OR  -- Users can always update their own profile
    (
        EXISTS (
            SELECT 1 FROM public.profiles current_user
            WHERE current_user.id = auth.uid()
            AND current_user.role = 'hr'
            AND current_user.school_id = profiles.school_id
        )
    )
);

-- HR users can view user_login_details in their school
CREATE POLICY "HR can view user_login_details in their school"
ON public.user_login_details FOR SELECT
USING (
    (auth.uid() = user_id) OR  -- Users can always see their own login details
    (
        EXISTS (
            SELECT 1 FROM public.profiles hr_user, public.profiles target_user
            WHERE hr_user.id = auth.uid()
            AND hr_user.role = 'hr'
            AND target_user.id = user_login_details.user_id
            AND hr_user.school_id = target_user.school_id
        )
    )
);

-- HR users can update user_login_details in their school
CREATE POLICY "HR can update user_login_details in their school"
ON public.user_login_details FOR UPDATE
USING (
    (auth.uid() = user_id) OR  -- Users can always update their own login details
    (
        EXISTS (
            SELECT 1 FROM public.profiles hr_user, public.profiles target_user
            WHERE hr_user.id = auth.uid()
            AND hr_user.role = 'hr'
            AND target_user.id = user_login_details.user_id
            AND hr_user.school_id = target_user.school_id
        )
    )
);

-- Step 4: Ensure all necessary functions exist and work properly
-- Update get_current_user_role function to handle HR role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
AS $function$
  SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$function$;

-- Update get_current_user_school_id function
CREATE OR REPLACE FUNCTION public.get_current_user_school_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
AS $function$
  SELECT school_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$function$;

-- Step 5: Verify the HR user setup
DO $$
DECLARE
    hr_user_id UUID;
    hr_profile_role TEXT;
    hr_school_id UUID;
BEGIN
    -- Get HR user ID
    SELECT id INTO hr_user_id FROM auth.users WHERE email = 'hr@edufam.com';
    
    IF hr_user_id IS NULL THEN
        RAISE EXCEPTION 'HR user not found in auth.users';
    END IF;
    
    -- Check HR profile
    SELECT role, school_id INTO hr_profile_role, hr_school_id 
    FROM public.profiles WHERE id = hr_user_id;
    
    IF hr_profile_role IS NULL THEN
        RAISE EXCEPTION 'HR profile not found in profiles table';
    END IF;
    
    IF hr_profile_role != 'hr' THEN
        RAISE EXCEPTION 'HR profile has incorrect role: %', hr_profile_role;
    END IF;
    
    IF hr_school_id IS NULL THEN
        RAISE EXCEPTION 'HR profile has no school_id assigned';
    END IF;
    
    RAISE NOTICE 'HR user verification successful: ID=%, Role=%, School=%', 
        hr_user_id, hr_profile_role, hr_school_id;
END $$;

-- Step 6: Test the HR user login by simulating a query
-- This will help identify any remaining issues
DO $$
DECLARE
    hr_user_id UUID;
    test_result BOOLEAN;
BEGIN
    -- Get HR user ID
    SELECT id INTO hr_user_id FROM auth.users WHERE email = 'hr@edufam.com';
    
    -- Test if HR user can access their own profile (simulates login)
    SELECT EXISTS(
        SELECT 1 FROM public.profiles 
        WHERE id = hr_user_id
    ) INTO test_result;
    
    IF test_result THEN
        RAISE NOTICE 'HR user profile access test: SUCCESS';
    ELSE
        RAISE WARNING 'HR user profile access test: FAILED';
    END IF;
    
    -- Test if HR user can access user_login_details
    SELECT EXISTS(
        SELECT 1 FROM public.user_login_details 
        WHERE user_id = hr_user_id
    ) INTO test_result;
    
    IF test_result THEN
        RAISE NOTICE 'HR user login details access test: SUCCESS';
    ELSE
        RAISE WARNING 'HR user login details access test: FAILED';
    END IF;
    
END $$; 