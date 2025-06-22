
-- First, let's identify and remove duplicate entries in grade_submission_batches
-- Keep only the most recent entry for each unique combination
WITH duplicates AS (
  SELECT id, 
         ROW_NUMBER() OVER (
           PARTITION BY school_id, class_id, term, exam_type, submitted_by 
           ORDER BY created_at DESC
         ) as rn
  FROM public.grade_submission_batches
)
DELETE FROM public.grade_submission_batches 
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- Now let's check for duplicates in grades table and clean them up too
WITH grade_duplicates AS (
  SELECT id, 
         ROW_NUMBER() OVER (
           PARTITION BY school_id, student_id, subject_id, class_id, term, exam_type, submitted_by 
           ORDER BY created_at DESC
         ) as rn
  FROM public.grades
)
DELETE FROM public.grades 
WHERE id IN (
  SELECT id FROM grade_duplicates WHERE rn > 1
);

-- Clean up attendance duplicates - using updated_at instead of created_at
WITH attendance_duplicates AS (
  SELECT id, 
         ROW_NUMBER() OVER (
           PARTITION BY school_id, class_id, student_id, date, session 
           ORDER BY updated_at DESC
         ) as rn
  FROM public.attendance
)
DELETE FROM public.attendance 
WHERE id IN (
  SELECT id FROM attendance_duplicates WHERE rn > 1
);

-- Now add the unique constraints
ALTER TABLE public.grades DROP CONSTRAINT IF EXISTS grades_unique_constraint;
ALTER TABLE public.grades 
ADD CONSTRAINT grades_unique_constraint 
UNIQUE (school_id, student_id, subject_id, class_id, term, exam_type, submitted_by);

ALTER TABLE public.grade_submission_batches DROP CONSTRAINT IF EXISTS grade_submission_batches_unique_constraint;
ALTER TABLE public.grade_submission_batches
ADD CONSTRAINT grade_submission_batches_unique_constraint
UNIQUE (school_id, class_id, term, exam_type, submitted_by);

ALTER TABLE public.attendance DROP CONSTRAINT IF EXISTS attendance_unique_constraint;
ALTER TABLE public.attendance 
ADD CONSTRAINT attendance_unique_constraint 
UNIQUE (school_id, class_id, student_id, date, session);

-- Add indexes to improve performance
CREATE INDEX IF NOT EXISTS idx_grades_unique_constraint ON public.grades (school_id, student_id, subject_id, class_id, term, exam_type, submitted_by);
CREATE INDEX IF NOT EXISTS idx_grade_submission_batches_unique ON public.grade_submission_batches (school_id, class_id, term, exam_type, submitted_by);
CREATE INDEX IF NOT EXISTS idx_attendance_unique ON public.attendance (school_id, class_id, student_id, date, session);
