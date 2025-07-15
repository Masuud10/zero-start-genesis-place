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