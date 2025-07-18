-- Fix the function dependency first, then update the enum
-- Drop the function that depends on the old enum
DROP FUNCTION IF EXISTS get_current_admin_role();

-- Update edufam_admin users to super_admin 
UPDATE admin_users 
SET role = 'super_admin'::admin_role,
    updated_at = now()
WHERE role = 'edufam_admin'::admin_role;

-- Update the enum to remove edufam_admin
ALTER TYPE admin_role RENAME TO admin_role_old;
CREATE TYPE admin_role AS ENUM ('super_admin', 'software_engineer', 'support_hr', 'sales_marketing', 'finance');

-- Update the admin_users table to use the new enum
ALTER TABLE admin_users 
ALTER COLUMN role TYPE admin_role USING role::text::admin_role;

-- Drop the old enum
DROP TYPE admin_role_old;

-- Recreate the function with the new enum
CREATE OR REPLACE FUNCTION public.get_current_admin_role()
RETURNS admin_role
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $function$
DECLARE
    user_role admin_role;
BEGIN
    SELECT role INTO user_role
    FROM public.admin_users 
    WHERE user_id = auth.uid() AND is_active = true;
    
    RETURN user_role;
END;
$function$;