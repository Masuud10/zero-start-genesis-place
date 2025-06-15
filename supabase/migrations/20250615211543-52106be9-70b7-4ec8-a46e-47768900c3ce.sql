
-- Allow score and max_score to be nullable for non-numeric grading systems
ALTER TABLE public.grades ALTER COLUMN score DROP NOT NULL;
ALTER TABLE public.grades ALTER COLUMN max_score DROP NOT NULL;

-- Add columns for specific curriculum grading
ALTER TABLE public.grades ADD COLUMN letter_grade TEXT;
COMMENT ON COLUMN public.grades.letter_grade IS 'For IGCSE letter grades (A*, A, B, etc.)';

ALTER TABLE public.grades ADD COLUMN cbc_performance_level TEXT;
COMMENT ON COLUMN public.grades.cbc_performance_level IS 'For CBC performance levels (EM, AP, PR, EX)';
