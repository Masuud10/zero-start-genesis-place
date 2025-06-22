
-- First, let's see what values are allowed for exam_type
SELECT constraint_name, check_clause 
FROM information_schema.check_constraints 
WHERE constraint_name = 'grades_exam_type_check';

-- If the constraint is too restrictive, let's update it to allow the exam types being used
ALTER TABLE public.grades DROP CONSTRAINT IF EXISTS grades_exam_type_check;

-- Add a more permissive check constraint that allows common exam types
ALTER TABLE public.grades ADD CONSTRAINT grades_exam_type_check 
CHECK (exam_type IN ('OPENER', 'MID_TERM', 'END_TERM', 'CAT', 'ASSIGNMENT', 'PROJECT', 'EXAM'));

-- Ensure the status column allows 'draft' status for saving work in progress
ALTER TABLE public.grades DROP CONSTRAINT IF EXISTS grades_status_check;
ALTER TABLE public.grades ADD CONSTRAINT grades_status_check 
CHECK (status IN ('draft', 'submitted', 'approved', 'rejected', 'released'));
