-- Fix user_login_details role constraint to include HR
ALTER TABLE public.user_login_details DROP CONSTRAINT IF EXISTS user_login_details_role_check;
ALTER TABLE public.user_login_details ADD CONSTRAINT user_login_details_role_check 
CHECK (role = ANY (ARRAY['school_owner', 'principal', 'teacher', 'parent', 'finance_officer', 'edufam_admin', 'elimisha_admin', 'hr']));

-- Update the create_user_login_details function to handle HR role
CREATE OR REPLACE FUNCTION public.create_user_login_details()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Determine access level based on role
  DECLARE
    user_access_level integer := 1;
  BEGIN
    CASE 
      WHEN NEW.role = 'elimisha_admin' OR NEW.role = 'edufam_admin' THEN
        user_access_level := 5;
      WHEN NEW.role = 'school_owner' THEN
        user_access_level := 4;
      WHEN NEW.role = 'principal' THEN
        user_access_level := 3;
      WHEN NEW.role = 'teacher' OR NEW.role = 'hr' THEN
        user_access_level := 2;
      ELSE
        user_access_level := 1;
    END CASE;

    -- Insert login details
    INSERT INTO public.user_login_details (
      user_id, 
      role, 
      access_level,
      employee_id,
      department
    )
    VALUES (
      NEW.id,
      NEW.role,
      user_access_level,
      CASE 
        WHEN NEW.role != 'parent' THEN 'EMP' || EXTRACT(EPOCH FROM now())::TEXT
        ELSE NULL
      END,
      CASE 
        WHEN NEW.role = 'teacher' THEN 'Academic'
        WHEN NEW.role = 'principal' THEN 'Administration'
        WHEN NEW.role = 'school_owner' THEN 'Management'
        WHEN NEW.role = 'finance_officer' THEN 'Finance'
        WHEN NEW.role = 'hr' THEN 'Human Resources'
        ELSE NULL
      END
    );
    
    RETURN NEW;
  END;
END;
$$;

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
END $$;