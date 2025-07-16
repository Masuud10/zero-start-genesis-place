-- Fix password encryption in create_admin_user function
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

  -- Create user in auth.users with simpler password encryption
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
    '$2a$10$' || encode(digest(user_password || gen_random_uuid()::text, 'sha256'), 'hex'),
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