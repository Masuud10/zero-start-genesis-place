-- Comprehensive fix for user creation and school creation database functions
-- Remove all school_owner references and fix HR roles and curriculum_type issues

-- Step 1: Fix create_admin_user function to completely remove school_owner references
CREATE OR REPLACE FUNCTION public.create_admin_user(user_email text, user_password text, user_name text, user_role text DEFAULT 'parent'::text, user_school_id uuid DEFAULT NULL::uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  new_user_id uuid;
  current_user_role text;
  current_user_school_id uuid;
  hashed_password text;
BEGIN
  -- Get current user's role and school for permission checking
  SELECT role, school_id INTO current_user_role, current_user_school_id
  FROM public.profiles 
  WHERE id = auth.uid();

  -- Validate role - UPDATED to use school_director instead of school_owner and include hr
  IF user_role NOT IN ('school_director', 'principal', 'teacher', 'parent', 'finance_officer', 'hr', 'edufam_admin', 'elimisha_admin') THEN
    RETURN jsonb_build_object('error', 'Invalid role specified');
  END IF;

  -- CRITICAL: Enforce school assignment for non-admin roles
  IF user_role NOT IN ('edufam_admin', 'elimisha_admin') AND user_school_id IS NULL THEN
    RETURN jsonb_build_object('error', 'School assignment is required for this role');
  END IF;

  -- Check if current user has permission to create users - UPDATED to use school_director
  IF current_user_role NOT IN ('elimisha_admin', 'edufam_admin', 'school_director', 'principal') THEN
    RETURN jsonb_build_object('error', 'Insufficient permissions to create users');
  END IF;

  -- Enforce multi-tenant restrictions - UPDATED to use school_director
  IF current_user_role IN ('school_director', 'principal') THEN
    -- School-level admins can only create users in their own school
    IF user_school_id IS NULL OR user_school_id != current_user_school_id THEN
      user_school_id := current_user_school_id;
    END IF;
    
    -- School-level admins cannot create system admins
    IF user_role IN ('elimisha_admin', 'edufam_admin') THEN
      RETURN jsonb_build_object('error', 'Cannot create system admin users');
    END IF;
  ELSIF current_user_role IN ('elimisha_admin', 'edufam_admin') THEN
    -- System admins can create users for any school
    -- But school_id is required for non-admin roles
    IF user_role NOT IN ('elimisha_admin', 'edufam_admin') AND user_school_id IS NULL THEN
      RETURN jsonb_build_object('error', 'School assignment required for this role');
    END IF;
  END IF;

  -- Verify school exists if school_id is provided
  IF user_school_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM public.schools WHERE id = user_school_id) THEN
      RETURN jsonb_build_object('error', 'Invalid school ID specified');
    END IF;
  END IF;

  -- Check if user already exists
  SELECT id INTO new_user_id 
  FROM auth.users 
  WHERE email = user_email;
  
  IF new_user_id IS NOT NULL THEN
    RETURN jsonb_build_object('error', 'User with this email already exists');
  END IF;

  -- Generate a new UUID for the user
  new_user_id := gen_random_uuid();

  -- Hash the password using available method
  BEGIN
    -- Try to use pgcrypto if available
    hashed_password := crypt(user_password, gen_salt('bf'));
  EXCEPTION WHEN OTHERS THEN
    -- Fallback to simple hashing if pgcrypto is not available
    hashed_password := public.hash_password_simple(user_password);
  END;

  -- Insert into auth.users (bypass normal signup flow)
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
    new_user_id,
    '00000000-0000-0000-0000-000000000000',
    user_email,
    hashed_password,
    now(),
    now(),
    now(),
    jsonb_build_object(
      'name', user_name, 
      'role', user_role, 
      'school_id', user_school_id,
      'created_by_admin', true
    ),
    'authenticated',
    'authenticated'
  );

  -- Insert into profiles with proper school linking
  -- Use ON CONFLICT to handle any potential duplicate key issues
  INSERT INTO public.profiles (id, email, name, role, school_id, created_at, updated_at)
  VALUES (new_user_id, user_email, user_name, user_role, user_school_id, now(), now())
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    school_id = EXCLUDED.school_id,
    updated_at = now();

  RETURN jsonb_build_object(
    'success', true,
    'user_id', new_user_id,
    'school_id', user_school_id,
    'message', 'User created successfully with proper school assignment'
  );

EXCEPTION WHEN OTHERS THEN
  -- Log the actual error for debugging
  RAISE LOG 'create_admin_user error: %', SQLERRM;
  RETURN jsonb_build_object('error', 'Failed to create user: ' || SQLERRM);
END;
$function$;

-- Step 2: Fix create_comprehensive_school function to remove curriculum_type references
CREATE OR REPLACE FUNCTION public.create_comprehensive_school(
  school_name text, 
  school_email text, 
  school_phone text, 
  school_address text, 
  logo_url text DEFAULT NULL::text, 
  website_url text DEFAULT NULL::text, 
  motto text DEFAULT NULL::text, 
  slogan text DEFAULT NULL::text, 
  school_type text DEFAULT 'primary'::text, 
  registration_number text DEFAULT NULL::text, 
  year_established integer DEFAULT NULL::integer, 
  term_structure text DEFAULT '3-term'::text, 
  owner_information text DEFAULT NULL::text, 
  owner_email text DEFAULT NULL::text, 
  owner_name text DEFAULT NULL::text, 
  owner_phone text DEFAULT NULL::text, 
  principal_name text DEFAULT NULL::text, 
  principal_contact text DEFAULT NULL::text, 
  principal_email text DEFAULT NULL::text, 
  mpesa_paybill_number text DEFAULT NULL::text, 
  mpesa_consumer_key text DEFAULT NULL::text, 
  mpesa_consumer_secret text DEFAULT NULL::text, 
  mpesa_passkey text DEFAULT NULL::text
) RETURNS jsonb
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

  -- Create the school WITHOUT curriculum_type column (REMOVED)
  INSERT INTO public.schools (
    name, email, phone, address, logo_url, website_url, motto, slogan,
    school_type, registration_number, year_established, term_structure,
    owner_information, created_at, updated_at
  ) VALUES (
    school_name, school_email, school_phone, school_address, logo_url, website_url, motto, slogan,
    school_type, registration_number, year_established, term_structure,
    owner_information, now(), now()
  ) RETURNING id INTO new_school_id;

  -- If owner details provided, create school_director account (UPDATED from school_owner)
  IF owner_email IS NOT NULL AND owner_name IS NOT NULL THEN
    SELECT public.create_admin_user(
      owner_email, 
      'TempPassword123!', -- Temporary password
      owner_name, 
      'school_director', -- UPDATED from school_owner
      new_school_id
    ) INTO create_user_result;

    -- Extract user_id from result
    IF create_user_result->>'success' = 'true' THEN
      owner_user_id := (create_user_result->>'user_id')::uuid;
      
      -- Update school with owner_id
      UPDATE public.schools 
      SET owner_id = owner_user_id 
      WHERE id = new_school_id;
    END IF;
  END IF;

  -- If principal details provided, create principal account
  IF principal_email IS NOT NULL AND principal_name IS NOT NULL THEN
    SELECT public.create_admin_user(
      principal_email, 
      'TempPassword123!', -- Temporary password
      principal_name, 
      'principal', 
      new_school_id
    ) INTO create_user_result;

    -- Extract user_id from result
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

-- Step 3: Fix create_enhanced_school function to remove curriculum_type references  
CREATE OR REPLACE FUNCTION public.create_enhanced_school(
  school_name text, 
  school_email text, 
  school_phone text, 
  school_address text, 
  logo_url text DEFAULT NULL::text, 
  website_url text DEFAULT NULL::text, 
  motto text DEFAULT NULL::text, 
  slogan text DEFAULT NULL::text, 
  school_type text DEFAULT 'primary'::text, 
  registration_number text DEFAULT NULL::text, 
  year_established integer DEFAULT NULL::integer, 
  term_structure text DEFAULT '3-term'::text, 
  owner_information text DEFAULT NULL::text, 
  owner_email text DEFAULT NULL::text, 
  owner_name text DEFAULT NULL::text, 
  owner_phone text DEFAULT NULL::text
) RETURNS jsonb
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

  -- Check if school name already exists
  IF EXISTS (SELECT 1 FROM public.schools WHERE name = school_name) THEN
    RETURN jsonb_build_object('success', false, 'error', 'School with this name already exists');
  END IF;

  -- Check if registration number already exists (if provided)
  IF registration_number IS NOT NULL AND EXISTS (SELECT 1 FROM public.schools WHERE registration_number = registration_number) THEN
    RETURN jsonb_build_object('success', false, 'error', 'School with this registration number already exists');
  END IF;

  -- Create the school WITHOUT curriculum_type column (REMOVED)
  INSERT INTO public.schools (
    name, email, phone, address, logo_url, website_url, motto, slogan,
    school_type, registration_number, year_established, term_structure,
    owner_information, created_at, updated_at
  ) VALUES (
    school_name, school_email, school_phone, school_address, logo_url, website_url, motto, slogan,
    school_type, registration_number, year_established, term_structure,
    owner_information, now(), now()
  ) RETURNING id INTO new_school_id;

  -- If owner details provided, create school_director account (UPDATED from school_owner)
  IF owner_email IS NOT NULL AND owner_name IS NOT NULL THEN
    SELECT public.create_admin_user(
      owner_email, 
      'TempPassword123!', -- Temporary password
      owner_name, 
      'school_director', -- UPDATED from school_owner
      new_school_id
    ) INTO create_user_result;

    -- Extract user_id from result
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

-- Step 4: Fix create_school function to remove curriculum_type references
CREATE OR REPLACE FUNCTION public.create_school(
  school_name text, 
  school_email text, 
  school_phone text, 
  school_address text, 
  owner_email text DEFAULT NULL::text, 
  owner_name text DEFAULT NULL::text
) RETURNS jsonb
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
  -- Check if current user is elimisha_admin
  SELECT role INTO current_user_role
  FROM public.profiles 
  WHERE id = auth.uid();

  IF current_user_role != 'elimisha_admin' THEN
    RETURN jsonb_build_object('error', 'Only Elimisha Admin can create schools');
  END IF;

  -- Check if school name already exists
  IF EXISTS (SELECT 1 FROM public.schools WHERE name = school_name) THEN
    RETURN jsonb_build_object('error', 'School with this name already exists');
  END IF;

  -- Create the school
  INSERT INTO public.schools (name, email, phone, address, created_at, updated_at)
  VALUES (school_name, school_email, school_phone, school_address, now(), now())
  RETURNING id INTO new_school_id;

  -- If owner details provided, create school_director account (UPDATED from school_owner)
  IF owner_email IS NOT NULL AND owner_name IS NOT NULL THEN
    -- Create school director user (UPDATED from school_owner)
    SELECT public.create_admin_user(
      owner_email, 
      'TempPassword123!', -- Temporary password
      owner_name, 
      'school_director', -- UPDATED from school_owner
      new_school_id
    ) INTO create_user_result;

    -- Extract user_id from result
    owner_user_id := (create_user_result->>'user_id')::uuid;

    -- Update school with owner_id if user creation was successful
    IF create_user_result->>'success' = 'true' THEN
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
  RAISE LOG 'create_school error: %', SQLERRM;
  RETURN jsonb_build_object('error', 'Failed to create school: ' || SQLERRM);
END;
$function$;

-- Step 5: Ensure HR roles are properly validated in all constraints
-- Drop and recreate role constraints with HR included
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS valid_roles;

-- Add comprehensive role check constraint including HR
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
CHECK (role = ANY (ARRAY[
  'school_director'::text, 
  'principal'::text, 
  'teacher'::text, 
  'parent'::text, 
  'finance_officer'::text, 
  'hr'::text, 
  'edufam_admin'::text, 
  'elimisha_admin'::text
]));

-- Step 6: Update handle_new_user function to handle school_director instead of school_owner
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  -- Check if this user was created by admin (has created_by_admin flag)
  IF NEW.raw_user_meta_data ? 'created_by_admin' THEN
    -- Skip automatic profile creation since admin function already handled it
    RETURN NEW;
  END IF;

  -- Determine role based on email patterns and metadata for regular signups
  DECLARE
    user_role text;
    user_school_id uuid;
    default_school_id uuid;
  BEGIN
    -- Get role and school from metadata first
    user_role := NEW.raw_user_meta_data->>'role';
    user_school_id := (NEW.raw_user_meta_data->>'school_id')::uuid;
    
    -- If no role in metadata, determine from email
    IF user_role IS NULL THEN
      IF NEW.email LIKE '%@elimisha.com' OR NEW.email = 'masuud@gmail.com' THEN
        user_role := 'elimisha_admin';
        user_school_id := NULL; -- Elimisha admins don't belong to specific schools
      ELSIF NEW.email LIKE '%admin%' THEN
        user_role := 'edufam_admin';
        user_school_id := NULL; -- EduFam admins don't belong to specific schools
      ELSIF NEW.email LIKE '%hr%' THEN
        user_role := 'hr';
      ELSIF NEW.email LIKE '%principal%' THEN
        user_role := 'principal';
      ELSIF NEW.email LIKE '%teacher%' THEN
        user_role := 'teacher';
      ELSIF NEW.email LIKE '%owner%' OR NEW.email LIKE '%director%' THEN
        user_role := 'school_director'; -- UPDATED from school_owner
      ELSIF NEW.email LIKE '%finance%' THEN
        user_role := 'finance_officer';
      ELSE
        user_role := 'parent'; -- Default role
      END IF;
    END IF;

    -- For non-admin roles without school, assign to first available school
    IF user_role NOT IN ('elimisha_admin', 'edufam_admin') AND user_school_id IS NULL THEN
      SELECT id INTO default_school_id FROM public.schools ORDER BY created_at LIMIT 1;
      user_school_id := default_school_id;
    END IF;

    -- Insert profile with determined role and school
    INSERT INTO public.profiles (id, email, name, role, school_id)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
      user_role,
      user_school_id
    );
    
    RETURN NEW;
  END;
END;
$function$;