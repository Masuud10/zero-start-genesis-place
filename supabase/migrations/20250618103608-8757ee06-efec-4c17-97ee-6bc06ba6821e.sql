
-- First, let's ensure the subjects table has the correct structure
ALTER TABLE public.subjects 
ADD COLUMN IF NOT EXISTS school_id uuid REFERENCES public.schools(id);

-- Ensure subject_teacher_assignments table exists with correct structure
CREATE TABLE IF NOT EXISTS public.subject_teacher_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id),
  subject_id uuid NOT NULL REFERENCES public.subjects(id),
  teacher_id uuid NOT NULL REFERENCES public.profiles(id),
  class_id uuid NOT NULL REFERENCES public.classes(id),
  assigned_by uuid REFERENCES public.profiles(id),
  assigned_at timestamp with time zone DEFAULT now(),
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(school_id, subject_id, teacher_id, class_id)
);

-- Enable RLS on both tables
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subject_teacher_assignments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Principals can manage subjects for their school" ON public.subjects;
DROP POLICY IF EXISTS "Teachers can view subjects for their school" ON public.subjects;
DROP POLICY IF EXISTS "Admins can manage all subjects" ON public.subjects;

DROP POLICY IF EXISTS "Principals can manage teacher assignments for their school" ON public.subject_teacher_assignments;
DROP POLICY IF EXISTS "Teachers can view their assignments" ON public.subject_teacher_assignments;
DROP POLICY IF EXISTS "Admins can manage all assignments" ON public.subject_teacher_assignments;

-- Create RLS policies for subjects table
CREATE POLICY "Principals can manage subjects for their school"
ON public.subjects
FOR ALL
TO authenticated
USING (
  school_id IN (
    SELECT school_id FROM public.profiles WHERE id = auth.uid()
  ) OR public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin')
)
WITH CHECK (
  school_id IN (
    SELECT school_id FROM public.profiles WHERE id = auth.uid()
  ) OR public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin')
);

CREATE POLICY "Teachers can view subjects for their school"
ON public.subjects
FOR SELECT
TO authenticated
USING (
  school_id IN (
    SELECT school_id FROM public.profiles WHERE id = auth.uid()
  ) OR public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin')
);

-- Create RLS policies for subject_teacher_assignments table
CREATE POLICY "Principals can manage teacher assignments for their school"
ON public.subject_teacher_assignments
FOR ALL
TO authenticated
USING (
  school_id IN (
    SELECT school_id FROM public.profiles WHERE id = auth.uid()
  ) OR public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin')
)
WITH CHECK (
  school_id IN (
    SELECT school_id FROM public.profiles WHERE id = auth.uid()
  ) OR public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin')
);

CREATE POLICY "Teachers can view their assignments"
ON public.subject_teacher_assignments
FOR SELECT
TO authenticated
USING (
  teacher_id = auth.uid() OR 
  school_id IN (
    SELECT school_id FROM public.profiles WHERE id = auth.uid()
  ) OR 
  public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin')
);

-- Create trigger to auto-set school_id for subjects
CREATE OR REPLACE FUNCTION public.auto_set_school_id_for_subjects()
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

  -- For non-admin users, automatically set school_id
  IF user_role NOT IN ('elimisha_admin', 'edufam_admin') THEN
    -- Set school_id if not already set
    IF NEW.school_id IS NULL THEN
      NEW.school_id := user_school_id;
    -- Prevent users from setting school_id to other schools
    ELSIF NEW.school_id != user_school_id THEN
      RAISE EXCEPTION 'Cannot create subjects for other schools';
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

-- Create trigger for subjects
DROP TRIGGER IF EXISTS auto_set_school_id_subjects_trigger ON public.subjects;
CREATE TRIGGER auto_set_school_id_subjects_trigger
  BEFORE INSERT OR UPDATE ON public.subjects
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_set_school_id_for_subjects();

-- Create trigger to auto-set school_id for subject_teacher_assignments
CREATE OR REPLACE FUNCTION public.auto_set_school_id_for_assignments()
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

  -- For non-admin users, automatically set school_id
  IF user_role NOT IN ('elimisha_admin', 'edufam_admin') THEN
    -- Set school_id if not already set
    IF NEW.school_id IS NULL THEN
      NEW.school_id := user_school_id;
    -- Prevent users from setting school_id to other schools
    ELSIF NEW.school_id != user_school_id THEN
      RAISE EXCEPTION 'Cannot create assignments for other schools';
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

-- Create trigger for subject_teacher_assignments
DROP TRIGGER IF EXISTS auto_set_school_id_assignments_trigger ON public.subject_teacher_assignments;
CREATE TRIGGER auto_set_school_id_assignments_trigger
  BEFORE INSERT OR UPDATE ON public.subject_teacher_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_set_school_id_for_assignments();
