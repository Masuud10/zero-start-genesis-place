
-- Create IGCSE-specific grading tables
CREATE TABLE IF NOT EXISTS public.igcse_subjects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID NOT NULL,
  subject_name TEXT NOT NULL,
  subject_code TEXT NOT NULL,
  subject_type TEXT NOT NULL CHECK (subject_type IN ('core', 'extended')),
  components JSONB NOT NULL DEFAULT '[]'::jsonb, -- e.g., ["theory", "practical", "coursework"]
  grade_boundaries JSONB DEFAULT '{"A*": 90, "A": 80, "B": 70, "C": 60, "D": 50, "E": 40, "F": 30, "G": 20, "U": 0}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create IGCSE grades table
CREATE TABLE IF NOT EXISTS public.igcse_grades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID NOT NULL,
  student_id UUID NOT NULL,
  class_id UUID NOT NULL,
  subject_id UUID REFERENCES public.igcse_subjects(id),
  component TEXT DEFAULT 'overall', -- 'theory', 'practical', 'coursework', 'overall'
  marks NUMERIC CHECK (marks >= 0 AND marks <= 100),
  letter_grade TEXT NOT NULL CHECK (letter_grade IN ('A*', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'U')),
  teacher_remarks TEXT,
  term TEXT NOT NULL,
  academic_year TEXT NOT NULL DEFAULT EXTRACT(year FROM now())::TEXT,
  assessment_date DATE DEFAULT CURRENT_DATE,
  teacher_id UUID NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')),
  submitted_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(school_id, student_id, subject_id, component, term, academic_year)
);

-- Create IGCSE grade submission batches
CREATE TABLE IF NOT EXISTS public.igcse_grade_batches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID NOT NULL,
  class_id UUID NOT NULL,
  subject_id UUID REFERENCES public.igcse_subjects(id),
  term TEXT NOT NULL,
  academic_year TEXT NOT NULL,
  teacher_id UUID NOT NULL,
  batch_name TEXT NOT NULL,
  total_students INTEGER DEFAULT 0,
  grades_entered INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')),
  submitted_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies for IGCSE tables
ALTER TABLE public.igcse_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.igcse_grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.igcse_grade_batches ENABLE ROW LEVEL SECURITY;

-- RLS policies for igcse_subjects
CREATE POLICY "Users can view IGCSE subjects for their school" ON public.igcse_subjects
  FOR SELECT USING (school_id = public.get_current_user_school_id());

CREATE POLICY "Teachers and admins can manage IGCSE subjects" ON public.igcse_subjects
  FOR ALL USING (
    school_id = public.get_current_user_school_id() AND
    public.get_current_user_role() IN ('teacher', 'principal', 'school_owner', 'edufam_admin')
  );

-- RLS policies for igcse_grades
CREATE POLICY "Users can view IGCSE grades for their school" ON public.igcse_grades
  FOR SELECT USING (school_id = public.get_current_user_school_id());

CREATE POLICY "Teachers can manage their own IGCSE grades" ON public.igcse_grades
  FOR ALL USING (
    school_id = public.get_current_user_school_id() AND
    (teacher_id = auth.uid() OR public.get_current_user_role() IN ('principal', 'school_owner', 'edufam_admin'))
  );

-- RLS policies for igcse_grade_batches
CREATE POLICY "Users can view IGCSE batches for their school" ON public.igcse_grade_batches
  FOR SELECT USING (school_id = public.get_current_user_school_id());

CREATE POLICY "Teachers can manage their own IGCSE batches" ON public.igcse_grade_batches
  FOR ALL USING (
    school_id = public.get_current_user_school_id() AND
    (teacher_id = auth.uid() OR public.get_current_user_role() IN ('principal', 'school_owner', 'edufam_admin'))
  );

-- Insert default IGCSE subjects for schools with IGCSE curriculum
INSERT INTO public.igcse_subjects (school_id, subject_name, subject_code, subject_type, components)
SELECT 
  s.id as school_id,
  unnest(ARRAY[
    'English Language', 'English Literature', 'Mathematics', 'Biology', 'Chemistry', 
    'Physics', 'History', 'Geography', 'Economics', 'Business Studies',
    'Computer Science', 'Art & Design', 'Music', 'Physical Education'
  ]) as subject_name,
  unnest(ARRAY[
    'ENG-L', 'ENG-LIT', 'MATH', 'BIO', 'CHEM', 
    'PHY', 'HIST', 'GEO', 'ECON', 'BUS',
    'CS', 'ART', 'MUS', 'PE'
  ]) as subject_code,
  unnest(ARRAY[
    'core', 'extended', 'core', 'extended', 'extended',
    'extended', 'extended', 'extended', 'extended', 'extended',
    'extended', 'extended', 'extended', 'core'
  ]) as subject_type,
  unnest(ARRAY[
    '["theory", "coursework"]'::jsonb, '["theory", "coursework"]'::jsonb, '["theory"]'::jsonb, 
    '["theory", "practical"]'::jsonb, '["theory", "practical"]'::jsonb,
    '["theory", "practical"]'::jsonb, '["theory", "coursework"]'::jsonb, '["theory", "coursework"]'::jsonb,
    '["theory", "coursework"]'::jsonb, '["theory", "coursework"]'::jsonb,
    '["theory", "practical"]'::jsonb, '["coursework"]'::jsonb, '["theory", "practical"]'::jsonb, '["practical"]'::jsonb
  ]) as components
FROM public.schools s 
WHERE s.curriculum_type = 'igcse'
ON CONFLICT DO NOTHING;

-- Create function to auto-set school_id for IGCSE tables
CREATE OR REPLACE FUNCTION public.auto_set_school_id_for_igcse()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_school_id UUID;
  user_role TEXT;
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
      RAISE EXCEPTION 'Cannot create IGCSE records for other schools';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Add triggers for auto school_id setting
CREATE TRIGGER set_school_id_igcse_subjects
  BEFORE INSERT ON public.igcse_subjects
  FOR EACH ROW EXECUTE FUNCTION public.auto_set_school_id_for_igcse();

CREATE TRIGGER set_school_id_igcse_grades
  BEFORE INSERT ON public.igcse_grades
  FOR EACH ROW EXECUTE FUNCTION public.auto_set_school_id_for_igcse();

CREATE TRIGGER set_school_id_igcse_grade_batches
  BEFORE INSERT ON public.igcse_grade_batches
  FOR EACH ROW EXECUTE FUNCTION public.auto_set_school_id_for_igcse();
