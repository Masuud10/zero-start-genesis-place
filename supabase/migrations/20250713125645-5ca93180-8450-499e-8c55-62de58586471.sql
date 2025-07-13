-- Add marks column to grades table as alias for score
-- This resolves PGRST204 error: Could not find the 'marks' column of 'grades' in the schema cache

ALTER TABLE public.grades 
ADD COLUMN marks NUMERIC GENERATED ALWAYS AS (score) STORED;