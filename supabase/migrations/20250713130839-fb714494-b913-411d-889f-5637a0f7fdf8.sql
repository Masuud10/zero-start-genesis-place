-- Add teacher_remarks column to grades table as alias for comments
-- This resolves PGRST204 error: Could not find the 'teacher_remarks' column of 'grades' in the schema cache

ALTER TABLE public.grades 
ADD COLUMN teacher_remarks TEXT GENERATED ALWAYS AS (comments) STORED;