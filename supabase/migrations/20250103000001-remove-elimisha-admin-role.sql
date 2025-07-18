-- Migration to remove elimisha_admin role references
-- This migration removes all references to the elimisha_admin role from the database

-- Update role constraints to remove elimisha_admin
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('edufam_admin', 'school_owner', 'principal', 'teacher', 'parent', 'finance_officer'));

-- Update the get_current_user_role function to remove elimisha_admin references
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_role text;
BEGIN
    SELECT role INTO user_role
    FROM profiles
    WHERE id = auth.uid();
    
    RETURN user_role;
END;
$$;

-- Update admin role validation functions
CREATE OR REPLACE FUNCTION public.is_admin_role(role text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN role IN ('edufam_admin');
END;
$$;

-- Update the strict role validation function
CREATE OR REPLACE FUNCTION public.validate_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    admin_roles TEXT[] := ARRAY['edufam_admin'];
    school_roles TEXT[] := ARRAY['school_owner', 'principal', 'teacher', 'parent', 'finance_officer'];
    valid_roles TEXT[] := admin_roles || school_roles;
BEGIN
    -- Check if role is valid
    IF NEW.role IS NULL OR NOT (NEW.role = ANY(valid_roles)) THEN
        RAISE EXCEPTION 'Invalid role: %. Valid roles are: %', NEW.role, array_to_string(valid_roles, ', ');
    END IF;
    
    -- Check school_id assignment based on role
    IF NEW.role = ANY(admin_roles) THEN
        -- Admin roles should not have school_id
        IF NEW.school_id IS NOT NULL THEN
            RAISE EXCEPTION 'Admin roles cannot be assigned to a specific school';
        END IF;
    ELSE
        -- School roles must have school_id
        IF NEW.school_id IS NULL THEN
            RAISE EXCEPTION 'School roles must be assigned to a specific school';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Update RLS policies to remove elimisha_admin references
-- Note: This will need to be done for each table that has RLS policies
-- The specific policies will depend on the existing table structure

-- Update any existing functions that reference elimisha_admin
-- This is a general pattern - specific functions may need individual updates

COMMENT ON FUNCTION public.get_current_user_role() IS 'Returns the role of the currently authenticated user (updated to remove elimisha_admin)';
COMMENT ON FUNCTION public.is_admin_role(text) IS 'Checks if a role is an admin role (updated to remove elimisha_admin)';
COMMENT ON FUNCTION public.validate_user_role() IS 'Validates user role assignment and school_id constraints (updated to remove elimisha_admin)'; 