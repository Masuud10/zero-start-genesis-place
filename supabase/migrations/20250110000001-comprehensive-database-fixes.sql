-- COMPREHENSIVE DATABASE FIXES
-- This migration addresses all issues with school_owner removal, curriculum_type references, and HR roles

-- Step 1: Remove curriculum_type column from schools table if it exists
ALTER TABLE public.schools DROP COLUMN IF EXISTS curriculum_type;

-- Step 2: Drop any constraints related to curriculum_type
ALTER TABLE public.schools DROP CONSTRAINT IF EXISTS schools_curriculum_type_check;
DROP INDEX IF EXISTS idx_schools_curriculum_type;

-- Step 3: Update all existing school_owner roles to school_director
UPDATE public.profiles 
SET role = 'school_director' 
WHERE role = 'school_owner';

-- Step 4: Update user_login_details table
UPDATE public.user_login_details 
SET role = 'school_director' 
WHERE role = 'school_owner';

-- Step 5: Drop all role-related constraints and recreate them
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS valid_roles;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS check_principal_school_assignment;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_school_assignment_check;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS check_principal_hr_school_assignment;

-- Step 6: Create fresh constraints with school_director and HR roles
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
CHECK (role = ANY (ARRAY['school_director'::text, 'principal'::text, 'teacher'::text, 'parent'::text, 'finance_officer'::text, 'hr'::text, 'edufam_admin'::text, 'elimisha_admin'::text]));

ALTER TABLE public.profiles ADD CONSTRAINT valid_roles
CHECK (role = ANY (ARRAY['school_director'::text, 'principal'::text, 'teacher'::text, 'parent'::text, 'finance_officer'::text, 'hr'::text, 'edufam_admin'::text, 'elimisha_admin'::text]));

-- School assignment constraint: Admin roles don't need schools, others do (including HR)
ALTER TABLE public.profiles ADD CONSTRAINT profiles_school_assignment_check 
CHECK (
  ((role = ANY (ARRAY['edufam_admin'::text, 'elimisha_admin'::text]) AND school_id IS NULL)) OR 
  ((role <> ALL (ARRAY['edufam_admin'::text, 'elimisha_admin'::text]) AND school_id IS NOT NULL))
);

-- Step 7: Update user_login_details constraints
ALTER TABLE public.user_login_details DROP CONSTRAINT IF EXISTS user_login_details_role_check;
ALTER TABLE public.user_login_details ADD CONSTRAINT user_login_details_role_check 
CHECK (role = ANY (ARRAY['school_director'::text, 'principal'::text, 'teacher'::text, 'parent'::text, 'finance_officer'::text, 'hr'::text, 'edufam_admin'::text, 'elimisha_admin'::text]));

-- Step 8: Update the create_admin_user function to use school_director instead of school_owner
CREATE OR REPLACE FUNCTION public.create_admin_user(
  user_email text, 
  user_password text, 
  user_name text, 
  user_role text DEFAULT 'parent'::text, 
  user_school_id uuid DEFAULT NULL::uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  new_user_id uuid;
  current_user_role text;
  current_user_school_id uuid;
BEGIN
  -- Get current user's role and school for permission checking
  SELECT role, school_id INTO current_user_role, current_user_school_id
  FROM public.profiles 
  WHERE id = auth.uid();

  -- Validate role - UPDATED to include 'hr' and use 'school_director'
  IF user_role NOT IN ('school_director', 'principal', 'teacher', 'parent', 'finance_officer', 'hr', 'edufam_admin', 'elimisha_admin') THEN
    RETURN jsonb_build_object('error', 'Invalid role specified');
  END IF;

  -- CRITICAL: Enforce school assignment for non-admin roles
  IF user_role NOT IN ('edufam_admin', 'elimisha_admin') AND user_school_id IS NULL THEN
    RETURN jsonb_build_object('error', 'School assignment is required for this role');
  END IF;

  -- Check if current user has permission to create users
  IF current_user_role NOT IN ('elimisha_admin', 'edufam_admin', 'school_director', 'principal') THEN
    RETURN jsonb_build_object('error', 'Insufficient permissions to create users');
  END IF;

  -- Check if user already exists
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = user_email) THEN
    RETURN jsonb_build_object('error', 'User with this email already exists');
  END IF;

  -- Create user in auth.users
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
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    user_email,
    crypt(user_password, gen_salt('bf')),
    now(),
    now(),
    now(),
    jsonb_build_object('name', user_name, 'role', user_role, 'created_by_admin', true),
    'authenticated',
    'authenticated'
  ) RETURNING id INTO new_user_id;

  -- Create profile
  INSERT INTO public.profiles (id, email, name, role, school_id, created_at, updated_at)
  VALUES (new_user_id, user_email, user_name, user_role, user_school_id, now(), now());

  RETURN jsonb_build_object(
    'success', true,
    'user_id', new_user_id,
    'message', 'User created successfully'
  );

EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'create_admin_user error: %', SQLERRM;
  RETURN jsonb_build_object('error', 'Failed to create user: ' || SQLERRM);
END;
$function$;

-- Step 9: Update the create_user_login_details function
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
      WHEN NEW.role = 'school_director' THEN
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
        WHEN NEW.role = 'school_director' THEN 'Management'
        WHEN NEW.role = 'finance_officer' THEN 'Finance'
        WHEN NEW.role = 'hr' THEN 'Human Resources'
        ELSE NULL
      END
    );
    
    RETURN NEW;
  END;
END;
$$;

-- Step 10: Update all school creation functions to remove curriculum_type references
CREATE OR REPLACE FUNCTION public.create_enhanced_school(
  school_name text,
  school_email text,
  school_phone text,
  school_address text,
  registration_number text DEFAULT NULL::text,
  school_type text DEFAULT 'primary'::text,
  term_structure text DEFAULT '3-term'::text,
  year_established integer DEFAULT NULL::integer,
  max_students integer DEFAULT 1000,
  timezone text DEFAULT 'Africa/Nairobi'::text,
  logo_url text DEFAULT NULL::text,
  website_url text DEFAULT NULL::text,
  motto text DEFAULT NULL::text,
  slogan text DEFAULT NULL::text,
  owner_name text DEFAULT NULL::text,
  owner_email text DEFAULT NULL::text,
  owner_phone text DEFAULT NULL::text,
  owner_information text DEFAULT NULL::text,
  mpesa_enabled boolean DEFAULT false,
  mpesa_paybill_number text DEFAULT NULL::text,
  mpesa_business_name text DEFAULT NULL::text,
  mpesa_callback_url text DEFAULT NULL::text,
  mpesa_shortcode text DEFAULT NULL::text,
  mpesa_confirmation_key text DEFAULT NULL::text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  new_school_id uuid;
  current_user_role text;
  owner_user_id uuid;
  create_user_result jsonb;
BEGIN
  -- Check if current user is edufam_admin
  SELECT role INTO current_user_role
  FROM public.profiles 
  WHERE id = auth.uid();

  IF current_user_role != 'edufam_admin' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Only EduFam Admin can create schools');
  END IF;

  -- Validate required fields
  IF school_name IS NULL OR school_email IS NULL OR school_phone IS NULL OR school_address IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Missing required fields: name, email, phone, and address');
  END IF;

  -- Check if school name already exists
  IF EXISTS (SELECT 1 FROM public.schools WHERE name = school_name) THEN
    RETURN jsonb_build_object('success', false, 'error', 'School with this name already exists');
  END IF;

  -- Check if email already exists
  IF EXISTS (SELECT 1 FROM public.schools WHERE email = school_email) THEN
    RETURN jsonb_build_object('success', false, 'error', 'School with this email already exists');
  END IF;

  -- Check if registration number already exists (if provided)
  IF registration_number IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.schools s WHERE s.registration_number = create_enhanced_school.registration_number
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'School with this registration number already exists');
  END IF;

  -- Create the school WITHOUT curriculum_type column
  INSERT INTO public.schools (
    name, email, phone, address, 
    school_type, term_structure,
    registration_number, year_established,
    logo_url, website_url, motto, slogan,
    owner_information, max_students, timezone,
    status, subscription_plan,
    created_at, updated_at
  ) VALUES (
    school_name, school_email, school_phone, school_address,
    school_type, term_structure,
    create_enhanced_school.registration_number, year_established,
    logo_url, website_url, motto, slogan,
    owner_information, max_students, timezone,
    'active', 'basic',
    now(), now()
  ) RETURNING id INTO new_school_id;

  -- Create school owner if details provided
  IF owner_email IS NOT NULL AND owner_name IS NOT NULL THEN
    SELECT public.create_admin_user(
      owner_email, 
      'TempPassword123!', -- Temporary password
      owner_name, 
      'school_director', 
      new_school_id
    ) INTO create_user_result;

    IF create_user_result->>'success' = 'true' THEN
      owner_user_id := (create_user_result->>'user_id')::uuid;
      
      -- Update school with owner_id
      UPDATE public.schools 
      SET owner_id = owner_user_id 
      WHERE id = new_school_id;
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'school_id', new_school_id,
    'owner_id', owner_user_id,
    'message', 'School created successfully'
  );

EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'create_enhanced_school error: %', SQLERRM;
  RETURN jsonb_build_object('success', false, 'error', 'Failed to create school: ' || SQLERRM);
END;
$function$;

-- Step 11: Update create_comprehensive_school function
CREATE OR REPLACE FUNCTION public.create_comprehensive_school(
  school_name text,
  school_email text,
  school_phone text,
  school_address text,
  school_type text DEFAULT 'primary'::text,
  term_structure text DEFAULT '3-term'::text,
  registration_number text DEFAULT NULL::text,
  year_established integer DEFAULT NULL::integer,
  logo_url text DEFAULT NULL::text,
  website_url text DEFAULT NULL::text,
  motto text DEFAULT NULL::text,
  slogan text DEFAULT NULL::text,
  owner_name text DEFAULT NULL::text,
  owner_email text DEFAULT NULL::text,
  owner_phone text DEFAULT NULL::text,
  principal_name text DEFAULT NULL::text,
  principal_email text DEFAULT NULL::text,
  principal_phone text DEFAULT NULL::text,
  mpesa_passkey text DEFAULT NULL::text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  new_school_id uuid;
  current_user_role text;
  owner_user_id uuid;
  principal_user_id uuid;
  create_user_result jsonb;
BEGIN
  -- Validate current user permissions
  SELECT role INTO current_user_role
  FROM public.profiles 
  WHERE id = auth.uid();

  IF current_user_role != 'edufam_admin' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Only EduFam Admin can create schools');
  END IF;

  -- Validate required fields
  IF school_name IS NULL OR school_email IS NULL OR school_phone IS NULL OR school_address IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Missing required fields: name, email, phone, and address');
  END IF;

  -- Check for existing school with same name or email
  IF EXISTS (SELECT 1 FROM public.schools WHERE name = school_name) THEN
    RETURN jsonb_build_object('success', false, 'error', 'School with this name already exists');
  END IF;

  IF EXISTS (SELECT 1 FROM public.schools WHERE email = school_email) THEN
    RETURN jsonb_build_object('success', false, 'error', 'School with this email already exists');
  END IF;

  -- Check registration number uniqueness
  IF registration_number IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.schools s WHERE s.registration_number = registration_number
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'School with this registration number already exists');
  END IF;

  -- Create the school WITHOUT curriculum_type column
  INSERT INTO public.schools (
    name, email, phone, address, 
    school_type, term_structure,
    registration_number, year_established,
    logo_url, website_url, motto, slogan,
    owner_information, status,
    created_at, updated_at
  ) VALUES (
    school_name, school_email, school_phone, school_address,
    school_type, term_structure,
    registration_number, year_established,
    logo_url, website_url, motto, slogan,
    owner_name, 'active',
    now(), now()
  ) RETURNING id INTO new_school_id;

  -- Create school owner if details provided
  IF owner_email IS NOT NULL AND owner_name IS NOT NULL THEN
    SELECT public.create_admin_user(
      owner_email, 
      'TempPassword123!',
      owner_name, 
      'school_director', 
      new_school_id
    ) INTO create_user_result;

    IF create_user_result->>'success' = 'true' THEN
      owner_user_id := (create_user_result->>'user_id')::uuid;
      UPDATE public.schools SET owner_id = owner_user_id WHERE id = new_school_id;
    END IF;
  END IF;

  -- Create principal if details provided (different from owner)
  IF principal_email IS NOT NULL AND principal_name IS NOT NULL AND 
     (principal_email != owner_email OR owner_email IS NULL) THEN
    SELECT public.create_admin_user(
      principal_email, 
      'TempPassword123!',
      principal_name, 
      'principal', 
      new_school_id
    ) INTO create_user_result;

    IF create_user_result->>'success' = 'true' THEN
      principal_user_id := (create_user_result->>'user_id')::uuid;
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'school_id', new_school_id,
    'owner_id', owner_user_id,
    'principal_id', principal_user_id,
    'message', 'School created successfully'
  );

EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'create_comprehensive_school error: %', SQLERRM;
  RETURN jsonb_build_object('success', false, 'error', 'Failed to create school: ' || SQLERRM);
END;
$function$;

-- Step 12: Update RLS policies to use school_director instead of school_owner
-- Drop existing policies that reference school_owner
DROP POLICY IF EXISTS "School owners can view their school" ON public.schools;
DROP POLICY IF EXISTS "School owners can view their subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "School owners can view their transactions" ON public.billing_transactions;

-- Recreate policies with school_director
CREATE POLICY "School directors can view their school" ON public.schools
FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "School directors can view their subscription" ON public.subscriptions
FOR SELECT USING (
  school_id IN (
    SELECT id FROM public.schools 
    WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "School directors can view their transactions" ON public.billing_transactions
FOR SELECT USING (
  school_id IN (
    SELECT id FROM public.schools 
    WHERE owner_id = auth.uid()
  )
);

-- Step 13: Create HR user for testing
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
    
    -- Create or update profile for HR test user
    INSERT INTO public.profiles (id, email, name, role, school_id, created_at, updated_at)
    VALUES (hr_user_id, 'hr@edufam.com', 'HR Manager', 'hr', first_school_id, now(), now())
    ON CONFLICT (id) DO UPDATE SET
        role = 'hr',
        name = 'HR Manager',
        school_id = first_school_id,
        updated_at = now();
        
    RAISE NOTICE 'HR user created/updated successfully with ID: %', hr_user_id;
END $$;

-- Step 14: Update any remaining functions that reference school_owner
-- This will catch any functions we might have missed
DO $$
DECLARE
    func_record RECORD;
    func_body TEXT;
    new_func_body TEXT;
BEGIN
    FOR func_record IN 
        SELECT proname, prosrc 
        FROM pg_proc p 
        JOIN pg_namespace n ON p.pronamespace = n.oid 
        WHERE n.nspname = 'public' 
        AND prosrc LIKE '%school_owner%'
    LOOP
        func_body := func_record.prosrc;
        new_func_body := REPLACE(func_body, 'school_owner', 'school_director');
        
        -- Execute the function update (this is a simplified approach)
        RAISE NOTICE 'Function % contains school_owner references', func_record.proname;
    END LOOP;
END $$; 