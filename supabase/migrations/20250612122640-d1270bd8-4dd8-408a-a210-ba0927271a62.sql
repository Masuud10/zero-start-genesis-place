
-- Fix the create_admin_user function to handle existing users and enforce multi-tenancy
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
AS $function$
DECLARE
  new_user_id uuid;
  result jsonb;
  current_user_role text;
  current_user_school_id uuid;
BEGIN
  -- Get current user's role and school for permission checking
  SELECT role, school_id INTO current_user_role, current_user_school_id
  FROM public.profiles 
  WHERE id = auth.uid();

  -- Validate role
  IF user_role NOT IN ('school_owner', 'principal', 'teacher', 'parent', 'finance_officer', 'edufam_admin', 'elimisha_admin') THEN
    RETURN jsonb_build_object('error', 'Invalid role specified');
  END IF;

  -- Check if current user has permission to create users
  IF current_user_role NOT IN ('elimisha_admin', 'edufam_admin', 'school_owner', 'principal') THEN
    RETURN jsonb_build_object('error', 'Insufficient permissions to create users');
  END IF;

  -- Enforce multi-tenant restrictions
  IF current_user_role IN ('school_owner', 'principal') THEN
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

  -- Check if user already exists
  SELECT id INTO new_user_id 
  FROM auth.users 
  WHERE email = user_email;
  
  IF new_user_id IS NOT NULL THEN
    RETURN jsonb_build_object('error', 'User with this email already exists');
  END IF;

  -- Generate a new UUID for the user
  new_user_id := gen_random_uuid();

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
    crypt(user_password, gen_salt('bf')),
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

  -- Insert into profiles (this will bypass the trigger since we're doing it manually)
  INSERT INTO public.profiles (id, email, name, role, school_id, created_at, updated_at)
  VALUES (new_user_id, user_email, user_name, user_role, user_school_id, now(), now());

  RETURN jsonb_build_object(
    'success', true,
    'user_id', new_user_id,
    'message', 'User created successfully and linked to school'
  );

EXCEPTION WHEN OTHERS THEN
  -- Log the actual error for debugging
  RAISE LOG 'create_admin_user error: %', SQLERRM;
  RETURN jsonb_build_object('error', 'Failed to create user: ' || SQLERRM);
END;
$function$;

-- Update the handle_new_user trigger to prevent conflicts with admin-created users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
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
      ELSIF NEW.email LIKE '%principal%' THEN
        user_role := 'principal';
      ELSIF NEW.email LIKE '%teacher%' THEN
        user_role := 'teacher';
      ELSIF NEW.email LIKE '%owner%' THEN
        user_role := 'school_owner';
      ELSIF NEW.email LIKE '%finance%' THEN
        user_role := 'finance_officer';
      ELSE
        user_role := 'parent'; -- Default role
      END IF;
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

-- Update RLS policies to ensure proper multi-tenant access
DROP POLICY IF EXISTS "Multi-tenant profiles access" ON public.profiles;

CREATE POLICY "Multi-tenant profiles access" ON public.profiles
FOR ALL USING (
  -- Users can access their own profile
  auth.uid() = id OR 
  -- Users can access profiles in their school (if they have a school)
  (school_id IS NOT NULL AND school_id = public.get_current_user_school_id()) OR
  -- System admins can access all profiles
  public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin')
);

-- Ensure school isolation for user creation
DROP POLICY IF EXISTS "User creation policy" ON public.profiles;

CREATE POLICY "User creation policy" ON public.profiles
FOR INSERT WITH CHECK (
  -- System admins can create any user
  public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin') OR
  -- School admins can only create users in their school
  (public.get_current_user_role() IN ('school_owner', 'principal') AND 
   school_id = public.get_current_user_school_id()) OR
  -- Users can create their own profile during signup
  auth.uid() = id
);
