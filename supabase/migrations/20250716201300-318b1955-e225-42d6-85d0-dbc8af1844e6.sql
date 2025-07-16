-- CRITICAL FIX: Resolve HR user login "Database error querying schema" issue
-- This migration fixes the infinite recursion in RLS policies that prevents HR login

-- Step 1: Drop ALL existing policies that cause infinite recursion
-- Drop profiles policies
DROP POLICY IF EXISTS "Enable users to read their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable users to insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable users to update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable users to delete their own profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "School users can view profiles in their school" ON public.profiles;
DROP POLICY IF EXISTS "Multi-tenant profiles access" ON public.profiles;
DROP POLICY IF EXISTS "User creation policy" ON public.profiles;
DROP POLICY IF EXISTS "HR can view profiles in their school" ON public.profiles;
DROP POLICY IF EXISTS "HR can update profiles in their school" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile or HR can view school profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile or HR can update school profiles" ON public.profiles;

-- Drop user_login_details policies
DROP POLICY IF EXISTS "user_login_details_select_own" ON public.user_login_details;
DROP POLICY IF EXISTS "user_login_details_insert_system" ON public.user_login_details;
DROP POLICY IF EXISTS "user_login_details_update_own" ON public.user_login_details;
DROP POLICY IF EXISTS "user_login_details_delete_own" ON public.user_login_details;
DROP POLICY IF EXISTS "Users can view their login details or HR can view school login details" ON public.user_login_details;
DROP POLICY IF EXISTS "Users can update their login details or HR can update school login details" ON public.user_login_details;
DROP POLICY IF EXISTS "HR can view user_login_details in their school" ON public.user_login_details;
DROP POLICY IF EXISTS "HR can update user_login_details in their school" ON public.user_login_details;

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
    
    FOR policy_name IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'user_login_details' 
        AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_name || '" ON public.user_login_details';
    END LOOP;
END $$;

-- Step 2: Create the ONLY safe, non-recursive policies
-- These policies ONLY use auth.uid() which is known before accessing the table

-- Profiles table policies - users can only access their own profile
CREATE POLICY "profiles_select_own" 
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" 
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" 
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "profiles_delete_own" 
ON public.profiles FOR DELETE
USING (auth.uid() = id);

-- User login details table policies - users can only access their own login details
CREATE POLICY "user_login_details_select_own" 
ON public.user_login_details FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "user_login_details_insert_system" 
ON public.user_login_details FOR INSERT
WITH CHECK (true);

CREATE POLICY "user_login_details_update_own" 
ON public.user_login_details FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "user_login_details_delete_own" 
ON public.user_login_details FOR DELETE
USING (auth.uid() = user_id);

-- Step 3: Ensure RLS is enabled on both tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_login_details ENABLE ROW LEVEL SECURITY;

-- Step 4: Update helper functions to be more robust
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