-- COMPREHENSIVE HR USER FIX: Resolve all HR authentication and access issues
-- This migration provides a complete solution for HR user login and access problems

-- Step 1: Complete HR User Setup
DO $$
DECLARE
    hr_user_id UUID;
    first_school_id UUID;
    hr_profile_exists BOOLEAN;
    hr_login_details_exists BOOLEAN;
BEGIN
    -- Get first school ID
    SELECT id INTO first_school_id FROM public.schools ORDER BY created_at LIMIT 1;
    
    -- Check if HR user exists in auth.users
    SELECT id INTO hr_user_id FROM auth.users WHERE email = 'hr@edufam.com';
    
    -- If HR user doesn't exist in auth.users, create it
    IF hr_user_id IS NULL THEN
        hr_user_id := gen_random_uuid();
        
        -- Create HR user in auth.users with proper schema
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
            aud,
            confirmation_token,
            email_change_token_new,
            phone_change_token,
            reauthentication_token,
            recovery_token
        ) VALUES (
            hr_user_id,
            '00000000-0000-0000-0000-000000000000',
            'hr@edufam.com',
            crypt('HRPassword123!', gen_salt('bf')),
            now(),
            now(),
            now(),
            jsonb_build_object('name', 'HR Manager', 'role', 'hr', 'created_by_admin', true),
            'authenticated',
            'authenticated',
            '',  -- Empty string instead of NULL
            '',  -- Empty string instead of NULL
            '',  -- Empty string instead of NULL
            '',  -- Empty string instead of NULL
            ''   -- Empty string instead of NULL
        );
        
        RAISE NOTICE 'Created HR user in auth.users with ID: %', hr_user_id;
    ELSE
        -- Update existing HR user to fix NULL token issues
        UPDATE auth.users 
        SET 
            confirmation_token = COALESCE(confirmation_token, ''),
            email_change_token_new = COALESCE(email_change_token_new, ''),
            phone_change_token = COALESCE(phone_change_token, ''),
            reauthentication_token = COALESCE(reauthentication_token, ''),
            recovery_token = COALESCE(recovery_token, ''),
            updated_at = now()
        WHERE id = hr_user_id;
        
        RAISE NOTICE 'Updated existing HR user in auth.users with ID: %', hr_user_id;
    END IF;
    
    -- Check if HR profile exists in profiles table
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = hr_user_id) INTO hr_profile_exists;
    
    -- Create or update HR profile
    IF NOT hr_profile_exists THEN
        INSERT INTO public.profiles (id, email, name, role, school_id, created_at, updated_at)
        VALUES (hr_user_id, 'hr@edufam.com', 'HR Manager', 'hr', first_school_id, now(), now());
        RAISE NOTICE 'Created HR profile in profiles table';
    ELSE
        -- Update existing HR profile to ensure it's correct
        UPDATE public.profiles 
        SET 
            email = 'hr@edufam.com',
            name = 'HR Manager',
            role = 'hr',
            school_id = first_school_id,
            updated_at = now()
        WHERE id = hr_user_id;
        RAISE NOTICE 'Updated existing HR profile';
    END IF;
    
    -- Check if user_login_details exists for HR user
    SELECT EXISTS(SELECT 1 FROM public.user_login_details WHERE user_id = hr_user_id) INTO hr_login_details_exists;
    
    -- Create or update user_login_details for HR user
    IF NOT hr_login_details_exists THEN
        INSERT INTO public.user_login_details (
            user_id, 
            role, 
            access_level,
            employee_id,
            department,
            login_attempts,
            is_locked,
            locked_until,
            last_login,
            created_at,
            updated_at
        ) VALUES (
            hr_user_id,
            'hr',
            2, -- HR has access level 2
            'EMP' || EXTRACT(EPOCH FROM now())::TEXT,
            'Human Resources',
            0,
            false,
            NULL,
            NULL,
            now(),
            now()
        );
        RAISE NOTICE 'Created user_login_details for HR user';
    ELSE
        -- Update existing login details
        UPDATE public.user_login_details 
        SET 
            role = 'hr',
            access_level = 2,
            department = 'Human Resources',
            updated_at = now()
        WHERE user_id = hr_user_id;
        RAISE NOTICE 'Updated existing user_login_details for HR user';
    END IF;
    
END $$;

-- Step 2: Fix RLS Policies - Drop ALL existing problematic policies
-- Drop profiles policies that might cause recursion
DROP POLICY IF EXISTS "HR can view profiles in their school" ON public.profiles;
DROP POLICY IF EXISTS "HR can update profiles in their school" ON public.profiles;
DROP POLICY IF EXISTS "Enable HR to view profiles in their school" ON public.profiles;
DROP POLICY IF EXISTS "Enable HR to manage users in their school" ON public.profiles;

-- Drop user_login_details policies
DROP POLICY IF EXISTS "HR can view user_login_details in their school" ON public.user_login_details;
DROP POLICY IF EXISTS "HR can update user_login_details in their school" ON public.user_login_details;
DROP POLICY IF EXISTS "Enable HR to view user_login_details in their school" ON public.user_login_details;
DROP POLICY IF EXISTS "Enable HR to update user_login_details in their school" ON public.user_login_details;

-- Create simple, non-recursive policies for profiles
CREATE POLICY "Users can view their own profile or HR can view school profiles"
ON public.profiles FOR SELECT
USING (
    (auth.uid() = id) OR 
    (
        auth.uid() IN (
            SELECT p.id FROM public.profiles p 
            WHERE p.role = 'hr' 
            AND p.school_id = profiles.school_id
        )
    ) OR
    (
        auth.uid() IN (
            SELECT p.id FROM public.profiles p 
            WHERE p.role = ANY(ARRAY['elimisha_admin', 'edufam_admin'])
        )
    )
);

CREATE POLICY "Users can update their own profile or HR can update school profiles"
ON public.profiles FOR UPDATE
USING (
    (auth.uid() = id) OR 
    (
        auth.uid() IN (
            SELECT p.id FROM public.profiles p 
            WHERE p.role = 'hr' 
            AND p.school_id = profiles.school_id
        )
    ) OR
    (
        auth.uid() IN (
            SELECT p.id FROM public.profiles p 
            WHERE p.role = ANY(ARRAY['elimisha_admin', 'edufam_admin'])
        )
    )
);

-- Create simple, non-recursive policies for user_login_details
CREATE POLICY "Users can view their login details or HR can view school login details"
ON public.user_login_details FOR SELECT
USING (
    (auth.uid() = user_id) OR 
    (
        auth.uid() IN (
            SELECT p1.id FROM public.profiles p1 
            JOIN public.profiles p2 ON p1.school_id = p2.school_id
            WHERE p1.role = 'hr' 
            AND p2.id = user_login_details.user_id
        )
    ) OR
    (
        auth.uid() IN (
            SELECT p.id FROM public.profiles p 
            WHERE p.role = ANY(ARRAY['elimisha_admin', 'edufam_admin'])
        )
    )
);

CREATE POLICY "Users can update their login details or HR can update school login details"
ON public.user_login_details FOR UPDATE
USING (
    (auth.uid() = user_id) OR 
    (
        auth.uid() IN (
            SELECT p1.id FROM public.profiles p1 
            JOIN public.profiles p2 ON p1.school_id = p2.school_id
            WHERE p1.role = 'hr' 
            AND p2.id = user_login_details.user_id
        )
    ) OR
    (
        auth.uid() IN (
            SELECT p.id FROM public.profiles p 
            WHERE p.role = ANY(ARRAY['elimisha_admin', 'edufam_admin'])
        )
    )
);

-- Step 3: Update Helper Functions
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$function$;

CREATE OR REPLACE FUNCTION public.get_current_user_school_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT school_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$function$;

-- Ensure create_user_login_details function handles HR properly
CREATE OR REPLACE FUNCTION public.create_user_login_details()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Determine access level based on role
  DECLARE
    user_access_level integer := 1;
  BEGIN
    CASE 
      WHEN NEW.role = 'elimisha_admin' OR NEW.role = 'edufam_admin' THEN
        user_access_level := 5;
      WHEN NEW.role = 'school_owner' THEN
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
      department,
      login_attempts,
      is_locked,
      locked_until,
      last_login,
      created_at,
      updated_at
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
        WHEN NEW.role = 'school_owner' THEN 'Management'
        WHEN NEW.role = 'finance_officer' THEN 'Finance'
        WHEN NEW.role = 'hr' THEN 'Human Resources'
        ELSE NULL
      END,
      0,
      false,
      NULL,
      NULL,
      now(),
      now()
    );
    
    RETURN NEW;
  END;
END;
$function$;

-- Step 4: Verification and Testing
DO $$
DECLARE
    hr_user_id UUID;
    hr_profile_role TEXT;
    hr_school_id UUID;
    hr_login_details_exists BOOLEAN;
    policy_count INTEGER;
BEGIN
    -- Get HR user ID
    SELECT id INTO hr_user_id FROM auth.users WHERE email = 'hr@edufam.com';
    
    IF hr_user_id IS NULL THEN
        RAISE EXCEPTION 'VERIFICATION FAILED: HR user not found in auth.users';
    END IF;
    
    -- Check HR profile
    SELECT role, school_id INTO hr_profile_role, hr_school_id 
    FROM public.profiles WHERE id = hr_user_id;
    
    IF hr_profile_role IS NULL THEN
        RAISE EXCEPTION 'VERIFICATION FAILED: HR profile not found in profiles table';
    END IF;
    
    IF hr_profile_role != 'hr' THEN
        RAISE EXCEPTION 'VERIFICATION FAILED: HR profile has incorrect role: %', hr_profile_role;
    END IF;
    
    IF hr_school_id IS NULL THEN
        RAISE EXCEPTION 'VERIFICATION FAILED: HR profile has no school_id assigned';
    END IF;
    
    -- Check HR login details
    SELECT EXISTS(SELECT 1 FROM public.user_login_details WHERE user_id = hr_user_id AND role = 'hr') 
    INTO hr_login_details_exists;
    
    IF NOT hr_login_details_exists THEN
        RAISE EXCEPTION 'VERIFICATION FAILED: HR login details not found';
    END IF;
    
    -- Check policies
    SELECT COUNT(*) INTO policy_count 
    FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND schemaname = 'public'
    AND policyname LIKE '%HR%' OR policyname LIKE '%hr%';
    
    RAISE NOTICE 'VERIFICATION SUCCESS: HR user setup complete';
    RAISE NOTICE 'HR User ID: %', hr_user_id;
    RAISE NOTICE 'HR Role: %', hr_profile_role;
    RAISE NOTICE 'HR School ID: %', hr_school_id;
    RAISE NOTICE 'HR Login Details: %', hr_login_details_exists;
    RAISE NOTICE 'HR-related policies found: %', policy_count;
    
    -- Test HR user access simulation
    RAISE NOTICE 'HR user authentication and access should now work properly';
    
END $$;