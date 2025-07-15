-- Fix the academic_year column size in grades table
-- The current varchar(4) limitation is causing data truncation errors
-- when teachers save or submit grades

ALTER TABLE public.grades 
ALTER COLUMN academic_year TYPE character varying(50);

-- Add a comment to document this change
COMMENT ON COLUMN public.grades.academic_year IS 'Academic year - increased from varchar(4) to varchar(50) to accommodate various academic year formats';