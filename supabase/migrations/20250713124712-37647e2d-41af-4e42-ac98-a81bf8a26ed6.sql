-- Add academic_year column to grades table if it doesn't exist
ALTER TABLE public.grades 
ADD COLUMN IF NOT EXISTS academic_year VARCHAR(4) DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;

-- Update existing records to have the current year if academic_year is NULL
UPDATE public.grades 
SET academic_year = EXTRACT(YEAR FROM CURRENT_DATE)::TEXT 
WHERE academic_year IS NULL;

-- Make academic_year NOT NULL after setting default values
ALTER TABLE public.grades 
ALTER COLUMN academic_year SET NOT NULL;

-- Add index for better performance on academic_year queries
CREATE INDEX IF NOT EXISTS idx_grades_academic_year ON public.grades (academic_year);

-- Add index for combined queries with academic_year and school_id
CREATE INDEX IF NOT EXISTS idx_grades_school_academic_year ON public.grades (school_id, academic_year);