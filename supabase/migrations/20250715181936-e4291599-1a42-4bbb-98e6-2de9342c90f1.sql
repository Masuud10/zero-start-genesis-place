-- Fix user_login_details role constraint to include 'hr' role

-- Drop the existing constraint
ALTER TABLE public.user_login_details
DROP CONSTRAINT IF EXISTS user_login_details_role_check;

-- Add the new constraint with 'hr' included
ALTER TABLE public.user_login_details
ADD CONSTRAINT user_login_details_role_check CHECK (role IN (
    'principal',
    'teacher', 
    'parent',
    'finance_officer',
    'school_owner',
    'edufam_admin',
    'elimisha_admin',
    'hr'
));