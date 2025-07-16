-- Drop all role-related constraints
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS valid_roles;

-- Update all existing school_owner roles to school_director
UPDATE public.profiles 
SET role = 'school_director' 
WHERE role = 'school_owner';

-- Recreate constraints with school_director instead of school_owner
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
CHECK (role = ANY (ARRAY['school_director'::text, 'principal'::text, 'teacher'::text, 'parent'::text, 'finance_officer'::text, 'hr'::text, 'edufam_admin'::text, 'elimisha_admin'::text]));

ALTER TABLE public.profiles ADD CONSTRAINT valid_roles
CHECK (role = ANY (ARRAY['school_director'::text, 'principal'::text, 'teacher'::text, 'parent'::text, 'finance_officer'::text, 'hr'::text, 'edufam_admin'::text, 'elimisha_admin'::text]));

-- Update the school assignment check constraint
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_school_assignment_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_school_assignment_check 
CHECK (((role = ANY (ARRAY['edufam_admin'::text, 'elimisha_admin'::text])) AND (school_id IS NULL)) OR ((role <> ALL (ARRAY['edufam_admin'::text, 'elimisha_admin'::text])) AND (school_id IS NOT NULL)));