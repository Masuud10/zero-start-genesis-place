-- Add unique constraint to grades table for upsert operations
-- This ensures one grade per student per subject per term per exam type per academic year
ALTER TABLE public.grades 
ADD CONSTRAINT grades_unique_constraint 
UNIQUE (student_id, subject_id, term, exam_type, academic_year, class_id);