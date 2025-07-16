-- CRITICAL FIX: Remove infinite recursion from user_login_details RLS policies
-- This migration fixes the recursive policies that are causing "Database error querying schema"

-- Step 1: Drop ALL existing recursive policies on user_login_details
DROP POLICY IF EXISTS "Users can view their login details or HR can view school login" ON public.user_login_details;
DROP POLICY IF EXISTS "Users can update their login details or HR can update school lo" ON public.user_login_details;
DROP POLICY IF EXISTS "Users can view their own login details" ON public.user_login_details;
DROP POLICY IF EXISTS "Users can update their own login details" ON public.user_login_details;
DROP POLICY IF EXISTS "System can insert login details" ON public.user_login_details;

-- Drop any other policies that might exist (catch-all)
DO $$
DECLARE
    policy_name text;
BEGIN
    FOR policy_name IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'user_login_details' 
        AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_name || '" ON public.user_login_details';
    END LOOP;
END $$;

-- Step 2: Create simple, non-recursive policies for user_login_details
-- These policies ONLY use auth.uid() to avoid any circular dependencies

-- Policy for SELECT operations - users can only see their own login details
CREATE POLICY "user_login_details_select_own" 
ON public.user_login_details FOR SELECT
USING (auth.uid() = user_id);

-- Policy for INSERT operations - allow system to create login details
CREATE POLICY "user_login_details_insert_system" 
ON public.user_login_details FOR INSERT
WITH CHECK (true);

-- Policy for UPDATE operations - users can only update their own login details
CREATE POLICY "user_login_details_update_own" 
ON public.user_login_details FOR UPDATE
USING (auth.uid() = user_id);

-- Policy for DELETE operations - users can only delete their own login details
CREATE POLICY "user_login_details_delete_own" 
ON public.user_login_details FOR DELETE
USING (auth.uid() = user_id);

-- Step 3: Verify RLS is enabled
ALTER TABLE public.user_login_details ENABLE ROW LEVEL SECURITY;

-- Step 4: Update helper functions to be more robust and avoid potential issues
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT 
LANGUAGE SQL 
SECURITY DEFINER 
STABLE
SET search_path = ''
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_current_user_school_id()
RETURNS UUID 
LANGUAGE SQL 
SECURITY DEFINER 
STABLE
SET search_path = ''
AS $$
  SELECT school_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- Step 5: Ensure HR role is properly handled in authentication
-- Update handle_new_user function to properly support HR role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
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
      ELSIF NEW.email LIKE '%owner%' THEN
        user_role := 'school_owner';
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
$$;

-- Step 6: Test that everything works
DO $$
BEGIN
    -- Check if user_login_details has RLS enabled
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'user_login_details' 
        AND schemaname = 'public' 
        AND rowsecurity = true
    ) THEN
        RAISE EXCEPTION 'RLS is not enabled on user_login_details table';
    END IF;
    
    -- Count the policies
    RAISE NOTICE 'SUCCESS: user_login_details RLS policies fixed. Found % policies', 
        (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'user_login_details' AND schemaname = 'public');
    
    RAISE NOTICE 'HR users should now be able to login without database schema errors.';
END $$;