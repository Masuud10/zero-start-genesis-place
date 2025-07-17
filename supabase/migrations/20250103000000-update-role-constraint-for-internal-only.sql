-- Update role constraint to only allow internal company roles
-- This migration removes all school-specific roles and only allows internal company roles

-- First, drop the old constraint to be safe
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS role_must_be_lowercase; 

-- Then, create the new, definitive constraint for internal roles only
ALTER TABLE public.profiles ADD CONSTRAINT role_must_be_lowercase CHECK (role IN (
    'super_admin', 
    'support_hr', 
    'software_engineer', 
    'sales_marketing', 
    'finance'
    -- DO NOT include school roles like 'principal', 'teacher', etc.
));

-- Update any existing users with school roles to have a default internal role
-- This is a safety measure in case there are any existing school users
UPDATE public.profiles 
SET role = 'support_hr' 
WHERE role NOT IN ('super_admin', 'support_hr', 'software_engineer', 'sales_marketing', 'finance');

-- Add comment to document the change
COMMENT ON CONSTRAINT role_must_be_lowercase ON public.profiles IS 
'Restricts roles to internal company roles only. School-specific roles have been removed.'; 