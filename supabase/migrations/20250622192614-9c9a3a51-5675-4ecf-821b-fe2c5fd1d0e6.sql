
-- Create CBC-specific grading tables
CREATE TABLE IF NOT EXISTS public.cbc_learning_areas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID NOT NULL,
  subject_id UUID REFERENCES public.subjects(id),
  learning_area_name TEXT NOT NULL,
  learning_area_code TEXT NOT NULL,
  description TEXT,
  grade_level TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create CBC performance descriptors table
CREATE TABLE IF NOT EXISTS public.cbc_performance_descriptors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID NOT NULL,
  learning_area_id UUID REFERENCES public.cbc_learning_areas(id),
  performance_level TEXT NOT NULL CHECK (performance_level IN ('EM', 'AP', 'PR', 'EX')),
  descriptor_text TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create CBC grades table
CREATE TABLE IF NOT EXISTS public.cbc_grades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID NOT NULL,
  student_id UUID NOT NULL,
  class_id UUID NOT NULL,
  learning_area_id UUID REFERENCES public.cbc_learning_areas(id),
  term TEXT NOT NULL,
  academic_year TEXT NOT NULL DEFAULT EXTRACT(year FROM now())::TEXT,
  performance_level TEXT NOT NULL CHECK (performance_level IN ('EM', 'AP', 'PR', 'EX')),
  performance_descriptor TEXT,
  teacher_remarks TEXT,
  teacher_id UUID NOT NULL,
  assessment_date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')),
  submitted_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(school_id, student_id, learning_area_id, term, academic_year)
);

-- Create CBC grade submission batches for tracking
CREATE TABLE IF NOT EXISTS public.cbc_grade_batches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID NOT NULL,
  class_id UUID NOT NULL,
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

-- Add RLS policies for CBC tables
ALTER TABLE public.cbc_learning_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cbc_performance_descriptors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cbc_grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cbc_grade_batches ENABLE ROW LEVEL SECURITY;

-- RLS policies for cbc_learning_areas
CREATE POLICY "Users can view learning areas for their school" ON public.cbc_learning_areas
  FOR SELECT USING (school_id = public.get_current_user_school_id());

CREATE POLICY "Teachers and admins can manage learning areas" ON public.cbc_learning_areas
  FOR ALL USING (
    school_id = public.get_current_user_school_id() AND
    public.get_current_user_role() IN ('teacher', 'principal', 'school_owner', 'edufam_admin')
  );

-- RLS policies for cbc_performance_descriptors
CREATE POLICY "Users can view descriptors for their school" ON public.cbc_performance_descriptors
  FOR SELECT USING (school_id = public.get_current_user_school_id());

CREATE POLICY "Teachers and admins can manage descriptors" ON public.cbc_performance_descriptors
  FOR ALL USING (
    school_id = public.get_current_user_school_id() AND
    public.get_current_user_role() IN ('teacher', 'principal', 'school_owner', 'edufam_admin')
  );

-- RLS policies for cbc_grades
CREATE POLICY "Users can view grades for their school" ON public.cbc_grades
  FOR SELECT USING (school_id = public.get_current_user_school_id());

CREATE POLICY "Teachers can manage their own grades" ON public.cbc_grades
  FOR ALL USING (
    school_id = public.get_current_user_school_id() AND
    (teacher_id = auth.uid() OR public.get_current_user_role() IN ('principal', 'school_owner', 'edufam_admin'))
  );

-- RLS policies for cbc_grade_batches
CREATE POLICY "Users can view batches for their school" ON public.cbc_grade_batches
  FOR SELECT USING (school_id = public.get_current_user_school_id());

CREATE POLICY "Teachers can manage their own batches" ON public.cbc_grade_batches
  FOR ALL USING (
    school_id = public.get_current_user_school_id() AND
    (teacher_id = auth.uid() OR public.get_current_user_role() IN ('principal', 'school_owner', 'edufam_admin'))
  );

-- Insert default CBC learning areas for different grade levels
INSERT INTO public.cbc_learning_areas (school_id, learning_area_name, learning_area_code, description, grade_level)
SELECT 
  s.id as school_id,
  unnest(ARRAY[
    'English Activities', 'Kiswahili Activities', 'Mathematical Activities', 
    'Environmental Activities', 'Psychomotor and Creative Activities',
    'Religious Education Activities'
  ]) as learning_area_name,
  unnest(ARRAY['ENG', 'KIS', 'MATH', 'ENV', 'PCA', 'REL']) as learning_area_code,
  unnest(ARRAY[
    'Communication and language development', 
    'Mother tongue and cultural identity',
    'Numeracy and problem solving',
    'Understanding the world around us',
    'Physical development and creativity',
    'Moral and spiritual development'
  ]) as description,
  'PP1-PP2' as grade_level
FROM public.schools s 
WHERE s.curriculum_type = 'cbc'
ON CONFLICT DO NOTHING;

-- Insert default performance descriptors
INSERT INTO public.cbc_performance_descriptors (school_id, learning_area_id, performance_level, descriptor_text, is_default)
SELECT 
  la.school_id,
  la.id as learning_area_id,
  pl.level,
  pl.description,
  true
FROM public.cbc_learning_areas la
CROSS JOIN (
  VALUES 
    ('EM', 'The learner is beginning to show understanding and requires significant support'),
    ('AP', 'The learner shows developing understanding with some support needed'),
    ('PR', 'The learner demonstrates adequate understanding and can work independently'),
    ('EX', 'The learner shows exceptional understanding and can extend learning to new contexts')
) as pl(level, description)
WHERE EXISTS (SELECT 1 FROM public.schools s WHERE s.id = la.school_id AND s.curriculum_type = 'cbc')
ON CONFLICT DO NOTHING;

-- Create function to auto-set school_id for CBC tables
CREATE OR REPLACE FUNCTION public.auto_set_school_id_for_cbc()
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
      RAISE EXCEPTION 'Cannot create CBC records for other schools';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Add triggers for auto school_id setting
CREATE TRIGGER set_school_id_cbc_learning_areas
  BEFORE INSERT ON public.cbc_learning_areas
  FOR EACH ROW EXECUTE FUNCTION public.auto_set_school_id_for_cbc();

CREATE TRIGGER set_school_id_cbc_performance_descriptors
  BEFORE INSERT ON public.cbc_performance_descriptors
  FOR EACH ROW EXECUTE FUNCTION public.auto_set_school_id_for_cbc();

CREATE TRIGGER set_school_id_cbc_grades
  BEFORE INSERT ON public.cbc_grades
  FOR EACH ROW EXECUTE FUNCTION public.auto_set_school_id_for_cbc();

CREATE TRIGGER set_school_id_cbc_grade_batches
  BEFORE INSERT ON public.cbc_grade_batches
  FOR EACH ROW EXECUTE FUNCTION public.auto_set_school_id_for_cbc();
