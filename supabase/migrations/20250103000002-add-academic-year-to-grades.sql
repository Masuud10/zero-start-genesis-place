-- Add academic_year column to grades table
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

-- Add index for combined queries with academic_year
CREATE INDEX IF NOT EXISTS idx_grades_school_academic_year ON public.grades (school_id, academic_year);

-- Update the unique constraint to include academic_year
ALTER TABLE public.grades DROP CONSTRAINT IF EXISTS grades_unique_constraint;
ALTER TABLE public.grades 
ADD CONSTRAINT grades_unique_constraint 
UNIQUE (school_id, student_id, subject_id, class_id, term, exam_type, academic_year, submitted_by);

-- Update the index to include academic_year
DROP INDEX IF EXISTS idx_grades_unique_constraint;
CREATE INDEX IF NOT EXISTS idx_grades_unique_constraint 
ON public.grades (school_id, student_id, subject_id, class_id, term, exam_type, academic_year, submitted_by); 