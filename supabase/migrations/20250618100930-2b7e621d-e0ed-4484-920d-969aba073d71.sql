
-- Ensure proper timetable table structure and constraints
ALTER TABLE public.timetables ADD COLUMN IF NOT EXISTS room text;
ALTER TABLE public.timetables ADD COLUMN IF NOT EXISTS created_by_principal_id uuid;
ALTER TABLE public.timetables ADD COLUMN IF NOT EXISTS is_published boolean DEFAULT false;

-- Add foreign key constraints for timetables
ALTER TABLE public.timetables 
DROP CONSTRAINT IF EXISTS fk_timetables_created_by_principal;

ALTER TABLE public.timetables 
ADD CONSTRAINT fk_timetables_created_by_principal 
FOREIGN KEY (created_by_principal_id) REFERENCES public.profiles(id);

-- Enhance grades table for principal workflow
ALTER TABLE public.grades ADD COLUMN IF NOT EXISTS approved_by_principal boolean DEFAULT false;
ALTER TABLE public.grades ADD COLUMN IF NOT EXISTS overridden_grade numeric;
ALTER TABLE public.grades ADD COLUMN IF NOT EXISTS released_to_parents boolean DEFAULT false;
ALTER TABLE public.grades ADD COLUMN IF NOT EXISTS principal_notes text;

-- Create subject_teacher_assignments table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.subject_teacher_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  teacher_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  assigned_by uuid REFERENCES public.profiles(id),
  assigned_at timestamp with time zone DEFAULT now(),
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(teacher_id, subject_id, class_id, school_id)
);

-- RLS policies for timetables
DROP POLICY IF EXISTS "Multi-tenant timetables access" ON public.timetables;
CREATE POLICY "Multi-tenant timetables access" ON public.timetables
FOR ALL USING (
  school_id = public.get_current_user_school_id() OR
  public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin')
);

-- RLS policies for subject_teacher_assignments
ALTER TABLE public.subject_teacher_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Multi-tenant subject assignments access" ON public.subject_teacher_assignments;
CREATE POLICY "Multi-tenant subject assignments access" ON public.subject_teacher_assignments
FOR ALL USING (
  school_id = public.get_current_user_school_id() OR
  public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin')
);

-- Enhanced RLS for grades with principal permissions
DROP POLICY IF EXISTS "Enhanced grades access with principal permissions" ON public.grades;
CREATE POLICY "Enhanced grades access with principal permissions" ON public.grades
FOR ALL USING (
  school_id = public.get_current_user_school_id() OR
  public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin') OR
  (public.get_current_user_role() = 'principal' AND school_id = public.get_current_user_school_id())
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_timetables_school_class ON public.timetables(school_id, class_id);
CREATE INDEX IF NOT EXISTS idx_subject_assignments_teacher_school ON public.subject_teacher_assignments(teacher_id, school_id);
CREATE INDEX IF NOT EXISTS idx_grades_status_school ON public.grades(status, school_id);

-- Function to auto-generate timetable
CREATE OR REPLACE FUNCTION public.generate_timetable(
  p_school_id uuid,
  p_class_id uuid,
  p_created_by uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  subjects_count integer;
  periods_per_day integer := 8;
  days_per_week integer := 5;
  result jsonb;
BEGIN
  -- Check if user has permission
  IF public.get_current_user_role() NOT IN ('principal', 'elimisha_admin', 'edufam_admin') THEN
    RETURN jsonb_build_object('error', 'Insufficient permissions');
  END IF;
  
  -- Get subject count for the class
  SELECT COUNT(*) INTO subjects_count
  FROM public.subjects s
  WHERE s.class_id = p_class_id AND s.school_id = p_school_id;
  
  IF subjects_count = 0 THEN
    RETURN jsonb_build_object('error', 'No subjects found for this class');
  END IF;
  
  -- Delete existing timetable for this class
  DELETE FROM public.timetables 
  WHERE class_id = p_class_id AND school_id = p_school_id;
  
  -- Generate timetable (simplified logic - can be enhanced with AI)
  INSERT INTO public.timetables (
    school_id, class_id, subject_id, teacher_id, 
    day_of_week, start_time, end_time, room, 
    created_by_principal_id, is_published
  )
  SELECT 
    p_school_id,
    p_class_id,
    s.id,
    COALESCE(sta.teacher_id, s.teacher_id),
    CASE ((ROW_NUMBER() OVER (ORDER BY s.name) - 1) / periods_per_day) % days_per_week
      WHEN 0 THEN 'monday'
      WHEN 1 THEN 'tuesday' 
      WHEN 2 THEN 'wednesday'
      WHEN 3 THEN 'thursday'
      ELSE 'friday'
    END,
    ('08:00'::time + (((ROW_NUMBER() OVER (ORDER BY s.name) - 1) % periods_per_day) * interval '40 minutes'))::time,
    ('08:40'::time + (((ROW_NUMBER() OVER (ORDER BY s.name) - 1) % periods_per_day) * interval '40 minutes'))::time,
    'Room ' || (((ROW_NUMBER() OVER (ORDER BY s.name) - 1) % 10) + 1),
    p_created_by,
    false
  FROM public.subjects s
  LEFT JOIN public.subject_teacher_assignments sta ON sta.subject_id = s.id AND sta.class_id = s.class_id
  WHERE s.class_id = p_class_id AND s.school_id = p_school_id;
  
  RETURN jsonb_build_object('success', true, 'message', 'Timetable generated successfully');
END;
$$;
