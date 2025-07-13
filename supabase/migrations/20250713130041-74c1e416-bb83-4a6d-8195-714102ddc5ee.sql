-- Add teacher_id column to grades table as alias for submitted_by
-- This resolves PGRST204 error: Could not find the 'teacher_id' column of 'grades' in the schema cache

ALTER TABLE public.grades 
ADD COLUMN teacher_id UUID GENERATED ALWAYS AS (submitted_by) STORED;