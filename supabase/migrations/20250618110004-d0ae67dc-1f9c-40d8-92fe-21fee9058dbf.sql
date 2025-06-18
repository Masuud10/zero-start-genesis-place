
-- Fix the multiple relationship issue between grades and subjects
-- and enforce strict multi-tenancy with proper school_id constraints

-- First, let's add missing school_id columns and constraints where needed
ALTER TABLE public.subjects 
ADD COLUMN IF NOT EXISTS school_id uuid REFERENCES public.schools(id) ON DELETE CASCADE;

-- Update existing subjects to have proper school_id if missing
UPDATE public.subjects 
SET school_id = (
  SELECT c.school_id 
  FROM public.classes c 
  WHERE c.id = subjects.class_id
)
WHERE school_id IS NULL AND class_id IS NOT NULL;

-- Ensure grades table has proper school_id constraint
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_grades_school_id' 
    AND table_name = 'grades'
  ) THEN
    ALTER TABLE public.grades 
    ADD CONSTRAINT fk_grades_school_id 
    FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Ensure subject_teacher_assignments has proper constraints
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_subject_teacher_assignments_school_id' 
    AND table_name = 'subject_teacher_assignments'
  ) THEN
    ALTER TABLE public.subject_teacher_assignments 
    ADD CONSTRAINT fk_subject_teacher_assignments_school_id 
    FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add unique constraint to prevent duplicate subject codes per school
ALTER TABLE public.subjects 
DROP CONSTRAINT IF EXISTS unique_subject_code_per_school;

ALTER TABLE public.subjects 
ADD CONSTRAINT unique_subject_code_per_school 
UNIQUE (school_id, code);

-- Fix the multiple relationship issue by ensuring proper foreign key structure
-- Only add the constraint if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_grades_subject_id' 
    AND table_name = 'grades'
  ) THEN
    ALTER TABLE public.grades 
    ADD CONSTRAINT fk_grades_subject_id 
    FOREIGN KEY (subject_id) REFERENCES public.subjects(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Ensure classes have proper school_id constraint
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_classes_school_id' 
    AND table_name = 'classes'
  ) THEN
    ALTER TABLE public.classes 
    ADD CONSTRAINT fk_classes_school_id 
    FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Enable RLS on tables if not already enabled
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for strict multi-tenancy on subjects
DROP POLICY IF EXISTS "Multi-tenant subjects access" ON public.subjects;
CREATE POLICY "Multi-tenant subjects access" ON public.subjects
FOR ALL USING (
  school_id = public.get_current_user_school_id() OR
  public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin')
);

-- Create RLS policies for grades with strict school isolation
DROP POLICY IF EXISTS "Multi-tenant grades access" ON public.grades;
CREATE POLICY "Multi-tenant grades access" ON public.grades
FOR ALL USING (
  school_id = public.get_current_user_school_id() OR
  public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin')
);

-- Create RLS policies for classes with strict school isolation
DROP POLICY IF EXISTS "Multi-tenant classes access" ON public.classes;
CREATE POLICY "Multi-tenant classes access" ON public.classes
FOR ALL USING (
  school_id = public.get_current_user_school_id() OR
  public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin')
);

-- Ensure all existing data has proper school_id values
UPDATE public.grades 
SET school_id = (
  SELECT s.school_id 
  FROM public.students s 
  WHERE s.id = grades.student_id
)
WHERE school_id IS NULL;

-- Clean up any inconsistent data
DELETE FROM public.grades 
WHERE school_id IS NULL 
OR student_id NOT IN (SELECT id FROM public.students)
OR subject_id NOT IN (SELECT id FROM public.subjects)
OR class_id NOT IN (SELECT id FROM public.classes);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subjects_school_id ON public.subjects(school_id);
CREATE INDEX IF NOT EXISTS idx_grades_school_id ON public.grades(school_id);
CREATE INDEX IF NOT EXISTS idx_classes_school_id ON public.classes(school_id);
CREATE INDEX IF NOT EXISTS idx_subject_teacher_assignments_school_id ON public.subject_teacher_assignments(school_id);

-- Create function for school_id consistency
CREATE OR REPLACE FUNCTION public.ensure_school_id_consistency()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  user_school_id uuid;
  user_role text;
BEGIN
  -- Get current user's school_id and role
  SELECT school_id, role INTO user_school_id, user_role
  FROM public.profiles 
  WHERE id = auth.uid();

  -- For non-admin users, enforce school_id consistency
  IF user_role NOT IN ('elimisha_admin', 'edufam_admin') THEN
    -- Set school_id if not already set
    IF NEW.school_id IS NULL THEN
      NEW.school_id := user_school_id;
    -- Prevent users from setting school_id to other schools
    ELSIF NEW.school_id != user_school_id THEN
      RAISE EXCEPTION 'Cannot create/modify records for other schools. User school: %, Record school: %', user_school_id, NEW.school_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

-- Apply triggers to enforce school_id consistency
DROP TRIGGER IF EXISTS ensure_school_id_consistency_trigger ON public.subjects;
CREATE TRIGGER ensure_school_id_consistency_trigger
  BEFORE INSERT OR UPDATE ON public.subjects
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_school_id_consistency();

DROP TRIGGER IF EXISTS ensure_school_id_consistency_trigger ON public.classes;
CREATE TRIGGER ensure_school_id_consistency_trigger
  BEFORE INSERT OR UPDATE ON public.classes
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_school_id_consistency();

DROP TRIGGER IF EXISTS ensure_school_id_consistency_trigger ON public.subject_teacher_assignments;
CREATE TRIGGER ensure_school_id_consistency_trigger
  BEFORE INSERT OR UPDATE ON public.subject_teacher_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_school_id_consistency();
