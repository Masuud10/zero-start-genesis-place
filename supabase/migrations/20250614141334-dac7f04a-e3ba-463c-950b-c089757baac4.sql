
-- First, let's add missing foreign key constraints and junction tables for proper relationships

-- Add foreign key constraints that might be missing
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS fk_profiles_school_id;

ALTER TABLE public.profiles 
ADD CONSTRAINT fk_profiles_school_id 
FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE SET NULL;

-- Ensure students table has proper foreign keys
ALTER TABLE public.students 
DROP CONSTRAINT IF EXISTS fk_students_school_id,
DROP CONSTRAINT IF EXISTS fk_students_class_id,
DROP CONSTRAINT IF EXISTS fk_students_parent_id;

ALTER TABLE public.students 
ADD CONSTRAINT fk_students_school_id 
FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_students_class_id 
FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE SET NULL,
ADD CONSTRAINT fk_students_parent_id 
FOREIGN KEY (parent_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Ensure classes table has proper foreign keys
ALTER TABLE public.classes 
DROP CONSTRAINT IF EXISTS fk_classes_school_id,
DROP CONSTRAINT IF EXISTS fk_classes_teacher_id;

ALTER TABLE public.classes 
ADD CONSTRAINT fk_classes_school_id 
FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_classes_teacher_id 
FOREIGN KEY (teacher_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Create teacher_classes junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS public.teacher_classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  subject_id uuid REFERENCES public.subjects(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(teacher_id, class_id, subject_id)
);

-- Create student_classes junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS public.student_classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  academic_year text NOT NULL DEFAULT EXTRACT(year FROM now())::text,
  enrollment_date date DEFAULT CURRENT_DATE,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(student_id, class_id, academic_year)
);

-- Create parent_students junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS public.parent_students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  relationship_type text DEFAULT 'parent',
  is_primary_contact boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(parent_id, student_id)
);

-- Enable RLS on new tables
ALTER TABLE public.teacher_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_students ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for new tables
CREATE POLICY "Multi-tenant teacher_classes access" ON public.teacher_classes
FOR ALL USING (
  class_id IN (
    SELECT id FROM public.classes 
    WHERE school_id = public.get_current_user_school_id()
  ) OR
  public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin')
);

CREATE POLICY "Multi-tenant student_classes access" ON public.student_classes
FOR ALL USING (
  class_id IN (
    SELECT id FROM public.classes 
    WHERE school_id = public.get_current_user_school_id()
  ) OR
  public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin')
);

CREATE POLICY "Multi-tenant parent_students access" ON public.parent_students
FOR ALL USING (
  student_id IN (
    SELECT id FROM public.students 
    WHERE school_id = public.get_current_user_school_id()
  ) OR
  public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin')
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_teacher_classes_teacher_id ON public.teacher_classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_classes_class_id ON public.teacher_classes(class_id);
CREATE INDEX IF NOT EXISTS idx_student_classes_student_id ON public.student_classes(student_id);
CREATE INDEX IF NOT EXISTS idx_student_classes_class_id ON public.student_classes(class_id);
CREATE INDEX IF NOT EXISTS idx_parent_students_parent_id ON public.parent_students(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_students_student_id ON public.parent_students(student_id);
