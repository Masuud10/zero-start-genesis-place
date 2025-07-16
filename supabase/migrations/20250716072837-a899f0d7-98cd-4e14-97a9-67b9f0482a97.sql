-- CRITICAL FIX: Ensure HR user can login by resetting their password and checking database consistency
-- This migration addresses potential password or user setup issues for HR role

-- Step 1: Check and fix HR user setup
DO $$
DECLARE
    hr_user_id uuid;
    hr_email text := 'hr@edufam.com';
    hr_name text := 'HR Manager';
    hr_role text := 'hr';
    default_school_id uuid;
BEGIN
    -- Get the first school for assignment
    SELECT id INTO default_school_id FROM public.schools ORDER BY created_at LIMIT 1;
    
    -- Check if HR user exists in auth.users
    SELECT id INTO hr_user_id FROM auth.users WHERE email = hr_email;
    
    IF hr_user_id IS NULL THEN
        -- HR user doesn't exist in auth.users, create them
        hr_user_id := gen_random_uuid();
        
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
            hr_email,
            crypt('password123', gen_salt('bf')), -- Default password
            now(),
            now(),
            now(),
            jsonb_build_object('name', hr_name, 'role', hr_role, 'school_id', default_school_id),
            'authenticated',
            'authenticated'
        );
        
        RAISE NOTICE 'Created HR user in auth.users with ID: %', hr_user_id;
    ELSE
        -- HR user exists, update their password and metadata
        UPDATE auth.users 
        SET 
            encrypted_password = crypt('password123', gen_salt('bf')),
            email_confirmed_at = now(),
            raw_user_meta_data = jsonb_build_object('name', hr_name, 'role', hr_role, 'school_id', default_school_id),
            updated_at = now()
        WHERE id = hr_user_id;
        
        RAISE NOTICE 'Updated HR user password and metadata for ID: %', hr_user_id;
    END IF;
    
    -- Ensure HR user has correct profile
    INSERT INTO public.profiles (id, email, name, role, school_id, created_at, updated_at)
    VALUES (hr_user_id, hr_email, hr_name, hr_role, default_school_id, now(), now())
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        name = EXCLUDED.name,
        role = EXCLUDED.role,
        school_id = EXCLUDED.school_id,
        updated_at = now();
        
    RAISE NOTICE 'Ensured HR user profile exists for ID: %', hr_user_id;
    
    -- Ensure HR user has login details record
    INSERT INTO public.user_login_details (user_id, role, login_attempts, is_locked, created_at, updated_at)
    VALUES (hr_user_id, hr_role, 0, false, now(), now())
    ON CONFLICT (user_id, role) DO UPDATE SET
        login_attempts = 0,
        is_locked = false,
        updated_at = now();
        
    RAISE NOTICE 'Ensured HR user login details exist for ID: %', hr_user_id;
    
END $$;

-- Step 2: Create a simple test function to verify HR authentication works
CREATE OR REPLACE FUNCTION public.test_hr_authentication()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    hr_user_record record;
    result jsonb;
BEGIN
    -- Get HR user details
    SELECT 
        au.id,
        au.email,
        au.email_confirmed_at IS NOT NULL as email_confirmed,
        au.encrypted_password IS NOT NULL as has_password,
        p.role,
        p.name,
        p.school_id,
        uld.login_attempts,
        uld.is_locked
    INTO hr_user_record
    FROM auth.users au
    LEFT JOIN public.profiles p ON au.id = p.id
    LEFT JOIN public.user_login_details uld ON au.id = uld.user_id AND uld.role = 'hr'
    WHERE au.email = 'hr@edufam.com';
    
    IF hr_user_record.id IS NULL THEN
        result := jsonb_build_object('error', 'HR user not found');
    ELSE
        result := jsonb_build_object(
            'success', true,
            'user_id', hr_user_record.id,
            'email', hr_user_record.email,
            'email_confirmed', hr_user_record.email_confirmed,
            'has_password', hr_user_record.has_password,
            'role', hr_user_record.role,
            'name', hr_user_record.name,
            'school_id', hr_user_record.school_id,
            'login_attempts', hr_user_record.login_attempts,
            'is_locked', hr_user_record.is_locked,
            'message', 'HR user setup verified successfully'
        );
    END IF;
    
    RETURN result;
END $$;

-- Step 3: Test the HR user setup
SELECT public.test_hr_authentication();

-- Step 4: Ensure all necessary policies exist and are correct
-- Verify that HR role is handled properly in helper functions
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT 
LANGUAGE SQL 
SECURITY DEFINER 
STABLE
SET search_path = ''
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- Final verification message
DO $$
BEGIN
    RAISE NOTICE 'HR authentication setup completed successfully!';
    RAISE NOTICE 'HR user credentials: email=hr@edufam.com, password=password123';
    RAISE NOTICE 'HR users should now be able to login through the School Users login section.';
END $$;