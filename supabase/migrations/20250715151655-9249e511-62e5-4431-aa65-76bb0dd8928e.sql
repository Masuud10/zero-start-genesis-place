-- Update the valid_roles constraint to include 'hr' role
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS valid_roles;

ALTER TABLE public.profiles 
ADD CONSTRAINT valid_roles 
CHECK (role IN ('school_owner', 'principal', 'teacher', 'parent', 'finance_officer', 'hr', 'edufam_admin', 'elimisha_admin'));