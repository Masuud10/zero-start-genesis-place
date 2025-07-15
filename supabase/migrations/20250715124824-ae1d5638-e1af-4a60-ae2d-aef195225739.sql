-- Force drop the user_login_details role constraint and recreate it
ALTER TABLE public.user_login_details DROP CONSTRAINT IF EXISTS user_login_details_role_check CASCADE;

-- Create fresh constraint that includes HR role
ALTER TABLE public.user_login_details ADD CONSTRAINT user_login_details_role_check 
CHECK (role = ANY (ARRAY['teacher'::text, 'school_owner'::text, 'principal'::text, 'parent'::text, 'finance_officer'::text, 'elimisha_admin'::text, 'edufam_admin'::text, 'hr'::text]));

-- Now create the test HR user
DO $$
DECLARE
    hr_user_id UUID;
    first_school_id UUID;
BEGIN
    -- Get first school ID
    SELECT id INTO first_school_id FROM public.schools ORDER BY created_at LIMIT 1;
    
    -- Check if HR user already exists
    SELECT id INTO hr_user_id FROM auth.users WHERE email = 'hr@edufam.com';
    
    -- If user doesn't exist, create it
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
            'hr@edufam.com',
            crypt('HRPassword123!', gen_salt('bf')),
            now(),
            now(),
            now(),
            jsonb_build_object('name', 'HR Manager', 'role', 'hr', 'created_by_admin', true),
            'authenticated',
            'authenticated'
        );
    END IF;
    
    -- Create profile for HR test user
    INSERT INTO public.profiles (id, email, name, role, school_id, created_at, updated_at)
    VALUES (hr_user_id, 'hr@edufam.com', 'HR Manager', 'hr', first_school_id, now(), now())
    ON CONFLICT (id) DO UPDATE SET
        role = 'hr',
        name = 'HR Manager',
        school_id = first_school_id,
        updated_at = now();
        
    -- Log success
    RAISE NOTICE 'HR user created successfully with ID: %', hr_user_id;
END $$;