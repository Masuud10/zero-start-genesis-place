-- Migration: 20250110000001-comprehensive-database-fixes.sql
-- Fix all database functions and constraints for user/school creation

-- 1. Update create_admin_user function to handle HR roles and school_director properly
CREATE OR REPLACE FUNCTION public.create_admin_user(
  user_email text,
  user_password text,
  user_name text,
  user_role text,
  user_school_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  new_user_id uuid;
  auth_result jsonb;
  profile_result jsonb;
  result jsonb;
BEGIN
  -- Validate role
  IF user_role NOT IN ('school_director', 'principal', 'teacher', 'parent', 'finance_officer', 'hr', 'edufam_admin', 'elimisha_admin') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid role specified');
  END IF;

  -- Check school assignment requirements
  IF user_role IN ('school_director', 'principal', 'teacher', 'parent', 'finance_officer') AND user_school_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'School assignment is required for this role');
  END IF;

  -- HR and admin roles should not have school assignment
  IF user_role IN ('hr', 'edufam_admin', 'elimisha_admin') THEN
    user_school_id := NULL;
  END IF;

  -- Check if user already exists
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = user_email) THEN
    RETURN jsonb_build_object('success', false, 'error', 'User with this email already exists');
  END IF;

  -- Create user in auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    user_email,
    crypt(user_password, gen_salt('bf')),
    now(),
    jsonb_build_object('name', user_name, 'role', user_role),
    now(),
    now(),
    '',
    '',
    '',
    ''
  ) RETURNING id INTO new_user_id;

  -- Create profile
  INSERT INTO public.profiles (
    id,
    email,
    name,
    role,
    school_id,
    created_at,
    updated_at
  ) VALUES (
    new_user_id,
    user_email,
    user_name,
    user_role,
    user_school_id,
    now(),
    now()
  );

  RETURN jsonb_build_object(
    'success', true,
    'user_id', new_user_id,
    'message', 'User created successfully'
  );

EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'create_admin_user error: %', SQLERRM;
  RETURN jsonb_build_object('success', false, 'error', 'Failed to create user: ' || SQLERRM);
END;
$function$;

-- 2. Update create_comprehensive_school function
CREATE OR REPLACE FUNCTION public.create_comprehensive_school(
  school_data jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  new_school_id uuid;
  director_user_id uuid;
  principal_user_id uuid;
  result jsonb;
BEGIN
  -- Validate required fields
  IF school_data->>'name' IS NULL OR trim(school_data->>'name') = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'School name is required');
  END IF;

  -- Create school record (without curriculum_type)
  INSERT INTO public.schools (
    name,
    email,
    phone,
    address,
    logo_url,
    website_url,
    motto,
    slogan,
    school_type,
    registration_number,
    year_established,
    term_structure,
    owner_information
  ) VALUES (
    school_data->>'name',
    school_data->>'email',
    school_data->>'phone',
    school_data->>'address',
    school_data->>'logo_url',
    school_data->>'website_url',
    school_data->>'motto',
    school_data->>'slogan',
    COALESCE(school_data->>'school_type', 'primary'),
    school_data->>'registration_number',
    (school_data->>'year_established')::integer,
    COALESCE(school_data->>'term_structure', '3-term'),
    school_data->>'owner_information'
  ) RETURNING id INTO new_school_id;

  -- Create school director if details provided
  IF school_data->>'director_email' IS NOT NULL AND school_data->>'director_name' IS NOT NULL THEN
    SELECT public.create_admin_user(
      school_data->>'director_email',
      COALESCE(school_data->>'director_password', 'TempPassword123!'),
      school_data->>'director_name',
      'school_director',
      new_school_id
    ) INTO result;

    IF result->>'success' = 'true' THEN
      director_user_id := (result->>'user_id')::uuid;
      
      -- Update school with director_id
      UPDATE public.schools 
      SET director_id = director_user_id 
      WHERE id = new_school_id;
    END IF;
  END IF;

  -- Create principal if details provided
  IF school_data->>'principal_email' IS NOT NULL AND school_data->>'principal_name' IS NOT NULL THEN
    SELECT public.create_admin_user(
      school_data->>'principal_email',
      COALESCE(school_data->>'principal_password', 'TempPassword123!'),
      school_data->>'principal_name',
      'principal',
      new_school_id
    ) INTO result;

    IF result->>'success' = 'true' THEN
      principal_user_id := (result->>'user_id')::uuid;
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'school_id', new_school_id,
    'director_id', director_user_id,
    'principal_id', principal_user_id,
    'message', 'School created successfully'
  );

EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'create_comprehensive_school error: %', SQLERRM;
  RETURN jsonb_build_object('success', false, 'error', 'Failed to create school: ' || SQLERRM);
END;
$function$;

-- 3. Update create_enhanced_school function
CREATE OR REPLACE FUNCTION public.create_enhanced_school(
  school_name text,
  school_email text,
  school_phone text,
  school_address text,
  logo_url text DEFAULT NULL,
  website_url text DEFAULT NULL,
  motto text DEFAULT NULL,
  slogan text DEFAULT NULL,
  school_type text DEFAULT 'primary',
  registration_number text DEFAULT NULL,
  year_established integer DEFAULT NULL,
  term_structure text DEFAULT '3-term',
  owner_information text DEFAULT NULL,
  owner_email text DEFAULT NULL,
  owner_name text DEFAULT NULL,
  owner_phone text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  new_school_id uuid;
  current_user_role text;
  director_user_id uuid;
  create_user_result jsonb;
BEGIN
  -- Check if current user is edufam_admin
  SELECT role INTO current_user_role
  FROM public.profiles 
  WHERE id = auth.uid();

  IF current_user_role != 'edufam_admin' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Only EduFam Admin can create schools');
  END IF;

  -- Check if school name already exists
  IF EXISTS (SELECT 1 FROM public.schools WHERE name = school_name) THEN
    RETURN jsonb_build_object('success', false, 'error', 'School with this name already exists');
  END IF;

  -- Check if registration number already exists (if provided)
  IF registration_number IS NOT NULL AND EXISTS (SELECT 1 FROM public.schools WHERE registration_number = registration_number) THEN
    RETURN jsonb_build_object('success', false, 'error', 'School with this registration number already exists');
  END IF;

  -- Create the school (without curriculum_type)
  INSERT INTO public.schools (
    name, email, phone, address, logo_url, website_url, motto, slogan,
    school_type, registration_number, year_established, term_structure,
    owner_information, created_at, updated_at
  ) VALUES (
    school_name, school_email, school_phone, school_address, logo_url, website_url, motto, slogan,
    school_type, registration_number, year_established, term_structure,
    owner_information, now(), now()
  ) RETURNING id INTO new_school_id;

  -- If owner details provided, create school director account
  IF owner_email IS NOT NULL AND owner_name IS NOT NULL THEN
    SELECT public.create_admin_user(
      owner_email, 
      'TempPassword123!', -- Temporary password
      owner_name, 
      'school_director', 
      new_school_id
    ) INTO create_user_result;

    -- Extract user_id from result
    IF create_user_result->>'success' = 'true' THEN
      director_user_id := (create_user_result->>'user_id')::uuid;
      
      -- Update school with director_id
      UPDATE public.schools 
      SET director_id = director_user_id 
      WHERE id = new_school_id;
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'school_id', new_school_id,
    'director_id', director_user_id,
    'message', 'School created successfully'
  );

EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'create_enhanced_school error: %', SQLERRM;
  RETURN jsonb_build_object('success', false, 'error', 'Failed to create school: ' || SQLERRM);
END;
$function$;

-- 4. Update handle_new_user trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  user_role text := 'parent'; -- default role
  user_school_id uuid := null;
BEGIN
  -- Determine role based on email patterns
  IF NEW.email LIKE '%@edufam.com' THEN
    user_role := 'edufam_admin';
  ELSIF NEW.email LIKE '%@elimisha.com' THEN
    user_role := 'elimisha_admin';
  ELSIF NEW.email LIKE '%hr@%' OR NEW.email LIKE '%human.resources@%' THEN
    user_role := 'hr';
  ELSIF NEW.email LIKE '%principal@%' OR NEW.email LIKE '%headteacher@%' THEN
    user_role := 'principal';
    -- Try to get school_id from the first available school
    SELECT id INTO user_school_id FROM public.schools LIMIT 1;
  ELSIF NEW.email LIKE '%director@%' OR NEW.email LIKE '%owner@%' THEN
    user_role := 'school_director';
    -- Try to get school_id from the first available school
    SELECT id INTO user_school_id FROM public.schools LIMIT 1;
  ELSIF NEW.email LIKE '%teacher@%' THEN
    user_role := 'teacher';
    -- Try to get school_id from the first available school
    SELECT id INTO user_school_id FROM public.schools LIMIT 1;
  ELSIF NEW.email LIKE '%finance@%' THEN
    user_role := 'finance_officer';
    -- Try to get school_id from the first available school
    SELECT id INTO user_school_id FROM public.schools LIMIT 1;
  END IF;

  -- Get role and school_id from metadata if provided
  IF NEW.raw_user_meta_data IS NOT NULL THEN
    IF NEW.raw_user_meta_data->>'role' IS NOT NULL THEN
      user_role := NEW.raw_user_meta_data->>'role';
    END IF;
    IF NEW.raw_user_meta_data->>'school_id' IS NOT NULL THEN
      user_school_id := (NEW.raw_user_meta_data->>'school_id')::uuid;
    END IF;
  END IF;

  -- Insert into profiles
  INSERT INTO public.profiles (
    id,
    email,
    name,
    role,
    school_id,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    user_role,
    user_school_id,
    now(),
    now()
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't block user creation
  RAISE LOG 'handle_new_user error: %', SQLERRM;
  RETURN NEW;
END;
$function$;

-- 5. Ensure schools table doesn't have curriculum_type column
-- (This will only run if the column exists)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'schools' 
    AND column_name = 'curriculum_type'
  ) THEN
    ALTER TABLE public.schools DROP COLUMN curriculum_type;
  END IF;
END $$;

-- 6. Add director_id column to schools if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'schools' 
    AND column_name = 'director_id'
  ) THEN
    ALTER TABLE public.schools ADD COLUMN director_id uuid REFERENCES public.profiles(id);
  END IF;
END $$;