-- Phase 1: Standardize existing role data to lowercase
UPDATE public.profiles SET role = LOWER(role) WHERE role IS NOT NULL;

-- Phase 2: Add CHECK constraint to enforce lowercase roles
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_role_lowercase_check 
CHECK (role IS NULL OR role = LOWER(role));

-- Phase 3: Update any other tables that might store role data
-- Check if there are any user_roles, user_login_details, or other role-related tables
DO $$
BEGIN
    -- Update user_login_details if it exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_login_details') THEN
        UPDATE public.user_login_details SET role = LOWER(role) WHERE role IS NOT NULL;
        ALTER TABLE public.user_login_details 
        ADD CONSTRAINT user_login_details_role_lowercase_check 
        CHECK (role IS NULL OR role = LOWER(role));
    END IF;
    
    -- Update user_roles if it exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_roles') THEN
        UPDATE public.user_roles SET role = LOWER(role::text)::public.app_role WHERE role IS NOT NULL;
    END IF;
END $$;