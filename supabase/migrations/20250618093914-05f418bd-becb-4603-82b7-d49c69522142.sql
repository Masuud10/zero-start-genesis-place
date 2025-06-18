
-- First, let's check if we have the proper foreign key constraints and relationships

-- Add missing school_id column to teacher_classes if not exists
ALTER TABLE public.teacher_classes 
ADD COLUMN IF NOT EXISTS school_id uuid;

-- Update existing records to have proper school_id
UPDATE public.teacher_classes 
SET school_id = (
  SELECT c.school_id 
  FROM public.classes c 
  WHERE c.id = teacher_classes.class_id
)
WHERE school_id IS NULL;

-- Add the foreign key constraint for school_id in teacher_classes
ALTER TABLE public.teacher_classes 
DROP CONSTRAINT IF EXISTS fk_teacher_classes_school_id;

ALTER TABLE public.teacher_classes 
ADD CONSTRAINT fk_teacher_classes_school_id 
FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE;

-- Ensure RLS policy exists for teacher_classes table
DROP POLICY IF EXISTS "Multi-tenant teacher_classes access" ON public.teacher_classes;

CREATE POLICY "Multi-tenant teacher_classes access" ON public.teacher_classes
FOR ALL USING (
  school_id = public.get_current_user_school_id() OR
  public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin')
);

-- Create indexes for better performance on teacher assignments query
CREATE INDEX IF NOT EXISTS idx_teacher_classes_teacher_school ON public.teacher_classes(teacher_id, school_id);
CREATE INDEX IF NOT EXISTS idx_teacher_classes_subject_class ON public.teacher_classes(subject_id, class_id);

-- Fix any orphaned teacher_classes records that don't have proper relationships
DELETE FROM public.teacher_classes 
WHERE teacher_id NOT IN (SELECT id FROM public.profiles WHERE role = 'teacher')
OR class_id NOT IN (SELECT id FROM public.classes)
OR (subject_id IS NOT NULL AND subject_id NOT IN (SELECT id FROM public.subjects));
