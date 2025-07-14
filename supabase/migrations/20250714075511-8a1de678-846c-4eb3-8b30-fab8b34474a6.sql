-- Fix existing edufam_admin users who should not require school_id
-- This query ensures admin users are properly configured
-- Only admin roles (edufam_admin, elimisha_admin) are allowed to have NULL school_id

-- First, let's update any profiles that have inconsistent state for admin roles
UPDATE public.profiles 
SET school_id = NULL 
WHERE role IN ('edufam_admin', 'elimisha_admin') 
AND school_id IS NOT NULL;

-- Add a check constraint to enforce proper school assignment rules
-- This will prevent future data integrity issues
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_school_assignment_check 
CHECK (
  -- Admin roles can have NULL school_id
  (role IN ('edufam_admin', 'elimisha_admin') AND school_id IS NULL) 
  OR 
  -- Non-admin roles must have school_id
  (role NOT IN ('edufam_admin', 'elimisha_admin') AND school_id IS NOT NULL)
);