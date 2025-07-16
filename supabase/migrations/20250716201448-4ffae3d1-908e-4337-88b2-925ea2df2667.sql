-- COMPREHENSIVE FIX: Ensure all HR users can login to HR dashboard
-- This migration fixes mary@gmail.com, sharon@gmail.com, and hr@edufam.com HR users

-- Step 1: Create a function to properly setup HR users
CREATE OR REPLACE FUNCTION public.setup_hr_user(
    user_email TEXT,
    user_name TEXT,
    school_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    hr_user_id UUID;
    target_school_id UUID;
    profile_exists BOOLEAN;
    login_details_exists BOOLEAN;
    result JSONB;
BEGIN
    -- Get school ID if not provided
    IF school_id IS NULL THEN
        SELECT id INTO target_school_id FROM public.schools ORDER BY created_at LIMIT 1;
    ELSE
        target_school_id := school_id;
    END IF;
    
    IF target_school_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'No schools found in database'
        );
    END IF;
    
    -- Check if user exists in auth.users
    SELECT id INTO hr_user_id FROM auth.users WHERE email = user_email;
    
    -- Create or update auth user
    IF hr_user_id IS NULL THEN
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
            user_email,
            crypt('HRPassword123!', gen_salt('bf')),
            now(),
            now(),
            now(),
            jsonb_build_object('name', user_name, 'role', 'hr', 'created_by_admin', true),
            'authenticated',
            'authenticated'
        );
        
        RAISE NOTICE 'Created HR user in auth.users: %', user_email;
    ELSE
        -- Update existing auth user
        UPDATE auth.users 
        SET 
            encrypted_password = crypt('HRPassword123!', gen_salt('bf')),
            email_confirmed_at = now(),
            raw_user_meta_data = jsonb_build_object('name', user_name, 'role', 'hr', 'created_by_admin', true),
            updated_at = now()
        WHERE id = hr_user_id;
        
        RAISE NOTICE 'Updated HR user in auth.users: %', user_email;
    END IF;
    
    -- Check if profile exists
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = hr_user_id) INTO profile_exists;
    
    -- Create or update profile
    IF NOT profile_exists THEN
        INSERT INTO public.profiles (
            id, 
            email, 
            name, 
            role, 
            school_id, 
            status,
            created_at, 
            updated_at
        ) VALUES (
            hr_user_id,
            user_email,
            user_name,
            'hr',
            target_school_id,
            'active',
            now(),
            now()
        );
        RAISE NOTICE 'Created HR profile: %', user_email;
    ELSE
        UPDATE public.profiles 
        SET 
            email = user_email,
            name = user_name,
            role = 'hr',
            school_id = target_school_id,
            status = 'active',
            updated_at = now()
        WHERE id = hr_user_id;
        RAISE NOTICE 'Updated HR profile: %', user_email;
    END IF;
    
    -- Check if login details exist
    SELECT EXISTS(SELECT 1 FROM public.user_login_details WHERE user_id = hr_user_id) INTO login_details_exists;
    
    -- Create or update login details
    IF NOT login_details_exists THEN
        INSERT INTO public.user_login_details (
            user_id,
            role,
            access_level,
            employee_id,
            department,
            login_attempts,
            is_locked,
            locked_until,
            force_password_change,
            created_at,
            updated_at
        ) VALUES (
            hr_user_id,
            'hr',
            2,
            'EMP' || EXTRACT(EPOCH FROM now())::TEXT,
            'Human Resources',
            0,
            false,
            NULL,
            false,
            now(),
            now()
        );
        RAISE NOTICE 'Created HR login details: %', user_email;
    ELSE
        UPDATE public.user_login_details 
        SET 
            role = 'hr',
            access_level = 2,
            department = 'Human Resources',
            login_attempts = 0,
            is_locked = false,
            locked_until = NULL,
            force_password_change = false,
            updated_at = now()
        WHERE user_id = hr_user_id;
        RAISE NOTICE 'Updated HR login details: %', user_email;
    END IF;
    
    RETURN jsonb_build_object(
        'success', true,
        'user_id', hr_user_id,
        'email', user_email,
        'name', user_name,
        'role', 'hr',
        'school_id', target_school_id,
        'message', 'HR user setup completed successfully'
    );
    
END;
$$;

-- Step 2: Setup all HR users
DO $$
DECLARE
    result JSONB;
BEGIN
    -- Setup hr@edufam.com
    SELECT public.setup_hr_user('hr@edufam.com', 'HR Manager') INTO result;
    RAISE NOTICE 'hr@edufam.com setup result: %', result;
    
    -- Setup mary@gmail.com
    SELECT public.setup_hr_user('mary@gmail.com', 'Mary HR') INTO result;
    RAISE NOTICE 'mary@gmail.com setup result: %', result;
    
    -- Setup sharon@gmail.com
    SELECT public.setup_hr_user('sharon@gmail.com', 'Sharon HR') INTO result;
    RAISE NOTICE 'sharon@gmail.com setup result: %', result;
    
END $$;