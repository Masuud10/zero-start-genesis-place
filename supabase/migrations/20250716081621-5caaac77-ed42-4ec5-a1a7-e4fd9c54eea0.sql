-- Step 1: Drop the existing constraint first
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Step 2: Update all existing school_owner roles to school_director in profiles table
UPDATE public.profiles 
SET role = 'school_director' 
WHERE role = 'school_owner';

-- Step 3: Add the new constraint with school_director instead of school_owner
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('school_director', 'principal', 'teacher', 'parent', 'finance_officer', 'edufam_admin', 'elimisha_admin', 'hr'));