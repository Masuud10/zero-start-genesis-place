-- Phase 1: Update database constraints to include new roles and existing ones
-- Update the valid_roles constraint to include all existing roles plus new ones
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS valid_roles;

ALTER TABLE public.profiles 
ADD CONSTRAINT valid_roles 
CHECK (role IN ('school_owner', 'school_director', 'principal', 'teacher', 'parent', 'finance_officer', 'hr', 'edufam_admin', 'elimisha_admin', 'support_hr', 'super_admin'));

-- Also update admin_users enum if it exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'admin_role') THEN
        ALTER TYPE admin_role ADD VALUE IF NOT EXISTS 'support_hr';
    END IF;
END $$;