-- Drop existing role check constraints
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS valid_roles;

-- Create new role check constraint including HR
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
CHECK (role = ANY (ARRAY['school_owner', 'principal', 'teacher', 'parent', 'finance_officer', 'edufam_admin', 'elimisha_admin', 'hr']));

-- Update school assignment check to include HR role (HR requires school assignment)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_school_assignment_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_school_assignment_check 
CHECK (
  ((role = ANY (ARRAY['edufam_admin', 'elimisha_admin']) AND school_id IS NULL)) OR 
  ((role <> ALL (ARRAY['edufam_admin', 'elimisha_admin']) AND school_id IS NOT NULL))
);

-- Update check_principal_school_assignment to include HR
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS check_principal_school_assignment;
ALTER TABLE public.profiles ADD CONSTRAINT check_principal_school_assignment 
CHECK (
  (role NOT IN ('principal', 'hr')) OR 
  ((role IN ('principal', 'hr')) AND school_id IS NOT NULL)
);

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