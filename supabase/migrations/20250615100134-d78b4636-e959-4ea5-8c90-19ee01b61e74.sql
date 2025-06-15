
-- Harden SECURITY DEFINER functions with explicit search_path for the public schema

-- 1. get_current_user_role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$function$;

-- 2. get_user_role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT role FROM public.profiles WHERE id = user_id LIMIT 1;
$function$;

-- 3. update_user_role
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
  IF new_role NOT IN ('school_owner', 'principal', 'teacher', 'parent', 'finance_officer', 'edufam_admin', 'elimisha_admin') THEN
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

-- 4. log_security_event
CREATE OR REPLACE FUNCTION public.log_security_event(p_action text, p_resource text, p_resource_id uuid DEFAULT NULL::uuid, p_success boolean DEFAULT true, p_error_message text DEFAULT NULL::text, p_metadata jsonb DEFAULT '{}'::jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.security_audit_logs (
    user_id,
    action,
    resource,
    resource_id,
    success,
    error_message,
    metadata
  ) VALUES (
    auth.uid(),
    p_action,
    p_resource,
    p_resource_id,
    p_success,
    p_error_message,
    p_metadata
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$function$;

-- 5. check_rate_limit
CREATE OR REPLACE FUNCTION public.check_rate_limit(p_identifier text, p_action text, p_max_attempts integer DEFAULT 5, p_window_minutes integer DEFAULT 15)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  current_attempts INTEGER := 0;
  window_start TIMESTAMP WITH TIME ZONE;
  is_blocked BOOLEAN := false;
BEGIN
  -- Check if currently blocked
  SELECT blocked_until > now() INTO is_blocked
  FROM public.rate_limits
  WHERE identifier = p_identifier AND action = p_action;
  
  IF is_blocked THEN
    RETURN false;
  END IF;
  
  -- Get current attempts in window
  SELECT attempts, rate_limits.window_start INTO current_attempts, window_start
  FROM public.rate_limits
  WHERE identifier = p_identifier 
    AND action = p_action
    AND window_start > now() - (p_window_minutes || ' minutes')::interval;
  
  -- If no record or window expired, create/reset
  IF current_attempts IS NULL OR window_start < now() - (p_window_minutes || ' minutes')::interval THEN
    INSERT INTO public.rate_limits (identifier, action, attempts, window_start)
    VALUES (p_identifier, p_action, 1, now())
    ON CONFLICT (identifier, action) 
    DO UPDATE SET 
      attempts = 1,
      window_start = now(),
      blocked_until = NULL,
      updated_at = now();
    RETURN true;
  END IF;
  
  -- Increment attempts
  current_attempts := current_attempts + 1;
  
  -- Block if exceeded
  IF current_attempts > p_max_attempts THEN
    UPDATE public.rate_limits 
    SET 
      attempts = current_attempts,
      blocked_until = now() + (p_window_minutes || ' minutes')::interval,
      updated_at = now()
    WHERE identifier = p_identifier AND action = p_action;
    RETURN false;
  END IF;
  
  -- Update attempts
  UPDATE public.rate_limits 
  SET 
    attempts = current_attempts,
    updated_at = now()
  WHERE identifier = p_identifier AND action = p_action;
  
  RETURN true;
END;
$function$;

-- 6. validate_password_strength
CREATE OR REPLACE FUNCTION public.validate_password_strength(password text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  result JSONB := '{"valid": false, "errors": []}'::JSONB;
  errors TEXT[] := '{}';
BEGIN
  -- Check minimum length
  IF length(password) < 8 THEN
    errors := array_append(errors, 'Password must be at least 8 characters long');
  END IF;

  -- Check for uppercase
  IF password !~ '[A-Z]' THEN
    errors := array_append(errors, 'Password must contain at least one uppercase letter');
  END IF;

  -- Check for lowercase
  IF password !~ '[a-z]' THEN
    errors := array_append(errors, 'Password must contain at least one lowercase letter');
  END IF;

  -- Check for numbers
  IF password !~ '[0-9]' THEN
    errors := array_append(errors, 'Password must contain at least one number');
  END IF;

  -- Check for special characters
  IF password !~ '[!@#$%^&*(),.?":{}|<>]' THEN
    errors := array_append(errors, 'Password must contain at least one special character');
  END IF;

  -- Return result
  IF array_length(errors, 1) IS NULL THEN
    result := '{"valid": true, "errors": []}'::JSONB;
  ELSE
    result := jsonb_build_object('valid', false, 'errors', errors);
  END IF;

  RETURN result;
END;
$function$;

-- 7. assign_school_to_user
CREATE OR REPLACE FUNCTION public.assign_school_to_user(target_user_id uuid, target_school_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  current_user_role text;
  current_user_school_id uuid;
  target_user_role text;
  target_user_email text;
BEGIN
  -- Get current user's role and school
  SELECT role, school_id INTO current_user_role, current_user_school_id
  FROM public.profiles 
  WHERE id = auth.uid();

  -- Get target user's role and email
  SELECT role, email INTO target_user_role, target_user_email
  FROM public.profiles 
  WHERE id = target_user_id;

  -- Check permissions
  IF current_user_role NOT IN ('elimisha_admin', 'edufam_admin', 'school_owner', 'principal') THEN
    RETURN jsonb_build_object('error', 'Insufficient permissions to assign schools');
  END IF;

  -- Verify school exists
  IF NOT EXISTS (SELECT 1 FROM public.schools WHERE id = target_school_id) THEN
    RETURN jsonb_build_object('error', 'Invalid school ID specified');
  END IF;

  -- Verify target user exists
  IF target_user_role IS NULL THEN
    RETURN jsonb_build_object('error', 'Target user not found');
  END IF;

  -- For school-level admins, they can only assign users to their own school
  IF current_user_role IN ('school_owner', 'principal') THEN
    IF target_school_id != current_user_school_id THEN
      RETURN jsonb_build_object('error', 'Cannot assign users to other schools');
    END IF;
  END IF;

  -- Update user's school assignment
  UPDATE public.profiles 
  SET school_id = target_school_id, updated_at = now()
  WHERE id = target_user_id;

  -- Also update auth metadata if possible
  UPDATE auth.users 
  SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}')::jsonb || jsonb_build_object('school_id', target_school_id)
  WHERE id = target_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'user_id', target_user_id,
    'school_id', target_school_id,
    'message', 'School assigned successfully to ' || target_user_email
  );

EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'assign_school_to_user error: %', SQLERRM;
  RETURN jsonb_build_object('error', 'Failed to assign school: ' || SQLERRM);
END;
$function$;

-- 8. create_admin_user
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
BEGIN
  -- Get current user's role and school for permission checking
  SELECT role, school_id INTO current_user_role, current_user_school_id
  FROM public.profiles 
  WHERE id = auth.uid();

  -- Validate role
  IF user_role NOT IN ('school_owner', 'principal', 'teacher', 'parent', 'finance_officer', 'edufam_admin', 'elimisha_admin') THEN
    RETURN jsonb_build_object('error', 'Invalid role specified');
  END IF;

  -- CRITICAL: Enforce school assignment for non-admin roles
  IF user_role NOT IN ('edufam_admin', 'elimisha_admin') AND user_school_id IS NULL THEN
    RETURN jsonb_build_object('error', 'School assignment is required for this role');
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

  -- Insert into profiles with proper school linking
  INSERT INTO public.profiles (id, email, name, role, school_id, created_at, updated_at)
  VALUES (new_user_id, user_email, user_name, user_role, user_school_id, now(), now());

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

-- 9. create_school
CREATE OR REPLACE FUNCTION public.create_school(
  school_name text,
  school_email text,
  school_phone text,
  school_address text,
  owner_email text DEFAULT NULL,
  owner_name text DEFAULT NULL
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

  -- If owner details provided, create owner account
  IF owner_email IS NOT NULL AND owner_name IS NOT NULL THEN
    -- Create school owner user
    SELECT public.create_admin_user(
      owner_email, 
      'TempPassword123!', -- Temporary password
      owner_name, 
      'school_owner', 
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

-- 10. auto_set_school_id
CREATE OR REPLACE FUNCTION public.auto_set_school_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  user_school_id uuid;
  user_role text;
BEGIN
  -- Get current user's school_id and role
  SELECT school_id, role INTO user_school_id, user_role
  FROM public.profiles 
  WHERE id = auth.uid();

  -- For non-admin users, automatically set school_id
  IF user_role NOT IN ('elimisha_admin', 'edufam_admin') THEN
    IF TG_TABLE_NAME IN ('students', 'classes', 'subjects', 'announcements', 'messages', 'support_tickets', 'timetables') THEN
      -- Set school_id if not already set
      IF NEW.school_id IS NULL THEN
        NEW.school_id := user_school_id;
      -- Prevent users from setting school_id to other schools
      ELSIF NEW.school_id != user_school_id THEN
        RAISE EXCEPTION 'Cannot create records for other schools';
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

-- 11. audit_rls_access
CREATE OR REPLACE FUNCTION public.audit_rls_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  -- Log access attempt
  PERFORM public.log_security_event(
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    true,
    NULL,
    jsonb_build_object('table', TG_TABLE_NAME, 'operation', TG_OP)
  );
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$function$;

-- 12. handle_login_attempt
CREATE OR REPLACE FUNCTION public.handle_login_attempt(user_email text, success boolean DEFAULT false)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  user_record record;
  result jsonb;
BEGIN
  -- Get user and login details
  SELECT 
    p.id,
    p.role,
    uld.login_attempts,
    uld.is_locked,
    uld.locked_until
  INTO user_record
  FROM public.profiles p
  LEFT JOIN public.user_login_details uld ON p.id = uld.user_id AND p.role = uld.role
  WHERE p.email = user_email;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'User not found');
  END IF;

  -- Check if account is locked
  IF user_record.is_locked AND (user_record.locked_until IS NULL OR user_record.locked_until > now()) THEN
    RETURN jsonb_build_object('error', 'Account is locked', 'locked_until', user_record.locked_until);
  END IF;

  IF success THEN
    -- Reset login attempts on successful login
    UPDATE public.user_login_details 
    SET 
      login_attempts = 0,
      last_login = now(),
      is_locked = false,
      locked_until = NULL,
      updated_at = now()
    WHERE user_id = user_record.id AND role = user_record.role;
    
    RETURN jsonb_build_object('success', true);
  ELSE
    -- Increment login attempts on failed login
    UPDATE public.user_login_details 
    SET 
      login_attempts = COALESCE(login_attempts, 0) + 1,
      is_locked = CASE WHEN COALESCE(login_attempts, 0) + 1 >= 5 THEN true ELSE false END,
      locked_until = CASE WHEN COALESCE(login_attempts, 0) + 1 >= 5 THEN now() + interval '30 minutes' ELSE NULL END,
      updated_at = now()
    WHERE user_id = user_record.id AND role = user_record.role;
    
    RETURN jsonb_build_object(
      'error', 'Invalid credentials',
      'attempts', COALESCE(user_record.login_attempts, 0) + 1,
      'locked', COALESCE(user_record.login_attempts, 0) + 1 >= 5
    );
  END IF;
END;
$function$;
