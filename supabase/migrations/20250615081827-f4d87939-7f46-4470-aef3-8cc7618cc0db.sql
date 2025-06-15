
-- Step 1: Add curriculum_type to schools table
ALTER TABLE public.schools
  ADD COLUMN IF NOT EXISTS curriculum_type TEXT NOT NULL DEFAULT 'cbc';

-- Allow only supported values
ALTER TABLE public.schools
  ADD CONSTRAINT schools_curriculum_type_check CHECK (curriculum_type IN ('cbc', 'igcse'));

-- Set all existing rows to CBC by default, admins can update as needed
UPDATE public.schools
  SET curriculum_type = 'cbc'
  WHERE curriculum_type IS NULL;

-- COMMENT: Curriculum type can now be 'cbc' (Kenyan CBC) or 'igcse' (British International IGCSE).
-- To update for a school, run: UPDATE public.schools SET curriculum_type = 'igcse' WHERE id = '<school_id>';
