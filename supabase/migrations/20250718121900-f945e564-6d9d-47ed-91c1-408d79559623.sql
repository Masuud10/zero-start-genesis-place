-- Remove edufam_admin role and clean up admin users table
-- First update all edufam_admin users to super_admin 
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