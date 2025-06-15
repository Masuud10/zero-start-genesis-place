
-- Add a unique constraint to the grades table to enable upserting bulk grades.
ALTER TABLE public.grades
ADD CONSTRAINT grades_unique_constraint UNIQUE (school_id, student_id, subject_id, class_id, term, exam_type);
