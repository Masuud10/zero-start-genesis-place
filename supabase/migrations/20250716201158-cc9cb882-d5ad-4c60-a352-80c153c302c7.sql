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

-- Continue with the rest of the migration steps...
-- (The migration is too long, continuing in next call)