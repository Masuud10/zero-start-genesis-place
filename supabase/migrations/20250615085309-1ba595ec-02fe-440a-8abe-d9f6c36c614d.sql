
-- Add school_id columns and foreign key constraints for multi-tenancy

-- For grades
ALTER TABLE public.grades
  ADD COLUMN IF NOT EXISTS school_id uuid;

-- For attendance
ALTER TABLE public.attendance
  ADD COLUMN IF NOT EXISTS school_id uuid;

-- For fees
ALTER TABLE public.fees
  ADD COLUMN IF NOT EXISTS school_id uuid;

-- Set school_id for existing records based on joined student->school for legacy data
UPDATE public.grades
SET school_id = s.school_id
FROM public.students s
WHERE public.grades.student_id = s.id AND public.grades.school_id IS NULL;

UPDATE public.attendance
SET school_id = s.school_id
FROM public.students s
WHERE public.attendance.student_id = s.id AND public.attendance.school_id IS NULL;

UPDATE public.fees
SET school_id = s.school_id
FROM public.students s
WHERE public.fees.student_id = s.id AND public.fees.school_id IS NULL;

-- Add foreign key constraints
ALTER TABLE public.grades
  ADD CONSTRAINT fk_grades_school_id FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE SET NULL;

ALTER TABLE public.attendance
  ADD CONSTRAINT fk_attendance_school_id FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE SET NULL;

ALTER TABLE public.fees
  ADD CONSTRAINT fk_fees_school_id FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_grades_school_id ON public.grades(school_id);
CREATE INDEX IF NOT EXISTS idx_attendance_school_id ON public.attendance(school_id);
CREATE INDEX IF NOT EXISTS idx_fees_school_id ON public.fees(school_id);
