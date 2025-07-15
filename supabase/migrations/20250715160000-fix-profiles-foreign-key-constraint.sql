-- Fix profiles foreign key constraint issue
-- This migration addresses the "profiles_id_fkey" constraint violation during user creation

-- First, let's check if the constraint exists and drop it if it's causing issues
DO $$
BEGIN
    -- Drop the problematic foreign key constraint if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'profiles_id_fkey' 
        AND table_name = 'profiles'
    ) THEN
        ALTER TABLE public.profiles DROP CONSTRAINT profiles_id_fkey;
    END IF;
    
    -- Also check for any other foreign key constraints on the id column
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name LIKE '%profiles%id%' 
        AND table_name = 'profiles'
        AND constraint_type = 'FOREIGN KEY'
    ) THEN
        -- Get the constraint name and drop it
        EXECUTE (
            'ALTER TABLE public.profiles DROP CONSTRAINT ' || 
            (SELECT constraint_name FROM information_schema.table_constraints 
             WHERE constraint_name LIKE '%profiles%id%' 
             AND table_name = 'profiles'
             AND constraint_type = 'FOREIGN KEY'
             LIMIT 1)
        );
    END IF;
END $$;

-- Now recreate the foreign key constraint properly
-- The profiles.id should reference auth.users.id
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_id_fkey 
FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Ensure the profiles table has the correct structure
-- Add any missing columns that might be needed
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS id UUID PRIMARY KEY,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS role TEXT,
ADD COLUMN IF NOT EXISTS school_id UUID,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Update the create_admin_user function to handle the constraint properly
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

  -- Validate role - UPDATED to include 'hr'
  IF user_role NOT IN ('school_owner', 'principal', 'teacher', 'parent', 'finance_officer', 'hr', 'edufam_admin', 'elimisha_admin') THEN
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