-- Step 1: Update all existing school_owner roles to school_director in profiles table
UPDATE public.profiles 
SET role = 'school_director' 
WHERE role = 'school_owner';

-- Step 2: Update all role constraints to include school_director instead of school_owner
-- First, let's drop existing constraints and recreate them

-- Update profiles table constraint
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('school_director', 'principal', 'teacher', 'parent', 'finance_officer', 'edufam_admin', 'elimisha_admin', 'hr'));

-- Step 3: Update database functions to use school_director instead of school_owner

-- Update handle_new_user function
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
        user_role := 'school_director';
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

-- Update create_admin_user function
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
  result jsonb;
  validation_result jsonb;
BEGIN
  -- Validate password strength
  SELECT public.validate_password_strength(user_password) INTO validation_result;
  
  IF NOT (validation_result->>'valid')::boolean THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Password does not meet strength requirements',
      'validation_errors', validation_result->'errors'
    );
  END IF;

  -- Validate role
  IF user_role NOT IN ('school_director', 'principal', 'teacher', 'parent', 'finance_officer', 'edufam_admin', 'elimisha_admin', 'hr') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid role specified');
  END IF;

  -- Check if email already exists
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = user_email) THEN
    RETURN jsonb_build_object('success', false, 'error', 'User with this email already exists');
  END IF;

  -- Create user in auth.users with admin flag
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
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
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    jsonb_build_object('created_by_admin', true, 'name', user_name, 'role', user_role, 'school_id', user_school_id),
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  ) RETURNING id INTO new_user_id;

  -- Create profile
  INSERT INTO public.profiles (id, email, name, role, school_id)
  VALUES (new_user_id, user_email, user_name, user_role, user_school_id);

  RETURN jsonb_build_object(
    'success', true,
    'user_id', new_user_id,
    'message', 'User created successfully'
  );

EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'create_admin_user error: %', SQLERRM;
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$function$;

-- Update update_user_role function
CREATE OR REPLACE FUNCTION public.update_user_role(target_user_id uuid, new_role text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  current_user_role text;
BEGIN
  -- Check if the current user is an admin
  SELECT role INTO current_user_role 
  FROM public.profiles 
  WHERE id = auth.uid();
  
  -- Only admins can update roles
  IF current_user_role NOT IN ('elimisha_admin', 'edufam_admin') THEN
    RAISE EXCEPTION 'Only administrators can update user roles';
  END IF;
  
  -- Validate the new role
  IF new_role NOT IN ('school_director', 'principal', 'teacher', 'parent', 'finance_officer', 'edufam_admin', 'elimisha_admin', 'hr') THEN
    RAISE EXCEPTION 'Invalid role specified';
  END IF;
  
  -- Update the user's role
  UPDATE public.profiles 
  SET role = new_role, updated_at = now()
  WHERE id = target_user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;
END;
$function$;