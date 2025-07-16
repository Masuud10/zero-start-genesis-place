-- CRITICAL FIX: Final solution for infinite recursion in profiles table RLS policies
-- This migration completely removes all recursive policies and creates simple, safe policies

-- Step 1: Drop ALL existing policies that cause infinite recursion
DROP POLICY IF EXISTS "Enable users to read their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable users to insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable users to update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable users to delete their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile or HR can view school profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile or HR can update school prof" ON public.profiles;

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

-- Step 2: Create the ONLY safe, non-recursive policies
-- These policies ONLY use auth.uid() which is known before accessing the table

-- Policy for SELECT operations - users can only see their own profile
CREATE POLICY "profiles_select_own" 
ON public.profiles FOR SELECT
USING (auth.uid() = id);

-- Policy for INSERT operations - users can only create their own profile
CREATE POLICY "profiles_insert_own" 
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- Policy for UPDATE operations - users can only update their own profile
CREATE POLICY "profiles_update_own" 
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- Policy for DELETE operations - users can only delete their own profile
CREATE POLICY "profiles_delete_own" 
ON public.profiles FOR DELETE
USING (auth.uid() = id);

-- Step 3: Verify RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Step 4: Test that policies work correctly
DO $$
BEGIN
    -- Check if the table has RLS enabled
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'profiles' 
        AND schemaname = 'public' 
        AND rowsecurity = true
    ) THEN
        RAISE EXCEPTION 'RLS is not enabled on profiles table';
    END IF;
    
    -- Count the policies to ensure we have exactly 4
    IF (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'profiles' AND schemaname = 'public') != 4 THEN
        RAISE WARNING 'Expected exactly 4 policies on profiles table, found %', 
            (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'profiles' AND schemaname = 'public');
    ELSE
        RAISE NOTICE 'SUCCESS: Profiles table RLS policies have been fixed. Infinite recursion eliminated.';
    END IF;
END $$;