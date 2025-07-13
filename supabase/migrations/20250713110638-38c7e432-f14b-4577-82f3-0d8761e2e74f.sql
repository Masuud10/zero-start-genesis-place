-- Remove unnecessary columns from schools table
-- These fields are either redundant or handled in separate tables

ALTER TABLE public.schools 
DROP COLUMN IF EXISTS principal_id,
DROP COLUMN IF EXISTS principal_name,
DROP COLUMN IF EXISTS principal_email, 
DROP COLUMN IF EXISTS principal_contact,
DROP COLUMN IF EXISTS subscription_plan,
DROP COLUMN IF EXISTS max_students,
DROP COLUMN IF EXISTS timezone;

-- Update any existing code/functions that might reference these columns
-- The create_comprehensive_school function may need updating to handle the new schema