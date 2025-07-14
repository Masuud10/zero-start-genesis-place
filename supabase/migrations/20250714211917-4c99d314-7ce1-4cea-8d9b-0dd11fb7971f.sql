-- Consolidate curriculum fields in classes table to use only curriculum_type
-- Remove curriculum column and keep only curriculum_type for consistency

-- First, copy any data from curriculum column to curriculum_type where curriculum_type is null
UPDATE public.classes 
SET curriculum_type = curriculum 
WHERE curriculum_type IS NULL 
  AND curriculum IS NOT NULL;

-- Now drop the curriculum column since we're standardizing on curriculum_type
ALTER TABLE public.classes DROP COLUMN IF EXISTS curriculum;