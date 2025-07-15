-- CRITICAL FIX: Resolve infinite recursion in profiles table RLS policies
-- This migration fixes the "infinite recursion detected in policy for relation 'profiles'" error

-- Step 1: Drop ALL existing policies on the profiles table to eliminate the recursive policy
-- This is necessary to break the infinite loop that's preventing user login

-- Drop all known policy names that might exist
DROP POLICY IF EXISTS "Enable read access for users based on user_id" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "School users can view profiles in their school" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles in their school" ON public.profiles;
DROP POLICY IF EXISTS "Multi-tenant profiles access" ON public.profiles;
DROP POLICY IF EXISTS "User creation policy" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Drop any other policies that might exist (catch-all)
DO $$
DECLARE
    policy_name text;
BEGIN
    FOR policy_name IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_name || '" ON public.profiles';
    END LOOP;
END $$;

-- Step 2: Create the ONLY safe, non-recursive SELECT policy
-- This is the only policy that should exist for reading profiles
-- It only depends on auth.uid() which is known before accessing the table
CREATE POLICY "Enable users to read their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

-- Step 3: Create a minimal INSERT policy for user creation during signup
-- This allows users to create their own profile during the signup process
CREATE POLICY "Enable users to insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- Step 4: Create a minimal UPDATE policy for profile updates
-- This allows users to update their own profile
CREATE POLICY "Enable users to update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- Step 5: Create a minimal DELETE policy (if needed)
-- This allows users to delete their own profile (rarely used)
CREATE POLICY "Enable users to delete their own profile"
ON public.profiles FOR DELETE
USING (auth.uid() = id);

-- Step 6: Verify the fix by testing the policy
-- This will help confirm the infinite recursion is resolved
DO $$
BEGIN
    -- Check if the table has RLS enabled
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'profiles' 
        AND schemaname = 'public' 
        AND rowsecurity = true
    ) THEN
        RAISE NOTICE 'RLS is not enabled on profiles table. Enabling it now.';
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    END IF;
    
    -- Count the policies to ensure we have the correct number
    IF (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'profiles' AND schemaname = 'public') != 4 THEN
        RAISE WARNING 'Expected 4 policies on profiles table, found %', 
            (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'profiles' AND schemaname = 'public');
    ELSE
        RAISE NOTICE 'Profiles table RLS policies have been successfully reset. Infinite recursion should be resolved.';
    END IF;
END $$;

-- Step 7: Update the handle_new_user trigger to work with the new policy
-- This ensures the trigger can still create profiles during signup
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
    -- This will work because the trigger runs with SECURITY DEFINER
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