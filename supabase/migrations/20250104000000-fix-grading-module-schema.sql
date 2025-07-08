-- Comprehensive Grading Module Schema Fixes
-- This migration addresses curriculum detection, grade submission, and approval workflow issues

-- 1. Ensure classes table has proper curriculum columns
ALTER TABLE public.classes 
ADD COLUMN IF NOT EXISTS curriculum_type TEXT DEFAULT 'standard',
ADD COLUMN IF NOT EXISTS curriculum TEXT DEFAULT 'standard';

-- Add check constraint for curriculum types
ALTER TABLE public.classes 
DROP CONSTRAINT IF EXISTS classes_curriculum_type_check;

ALTER TABLE public.classes 
ADD CONSTRAINT classes_curriculum_type_check 
CHECK (curriculum_type IN ('cbc', 'igcse', 'standard', 'CBC', 'IGCSE', 'Standard'));

-- 2. Ensure grades table has all required columns for curriculum support
ALTER TABLE public.grades 
ADD COLUMN IF NOT EXISTS curriculum_type TEXT DEFAULT 'standard',
ADD COLUMN IF NOT EXISTS competency_id UUID,
ADD COLUMN IF NOT EXISTS strand_scores JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS coursework_score NUMERIC,
ADD COLUMN IF NOT EXISTS exam_score NUMERIC,
ADD COLUMN IF NOT EXISTS raw_score NUMERIC,
ADD COLUMN IF NOT EXISTS grade_boundary_applied BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS competency_level TEXT,
ADD COLUMN IF NOT EXISTS submission_batch_id UUID,
ADD COLUMN IF NOT EXISTS approval_workflow_stage TEXT DEFAULT 'draft' CHECK (approval_workflow_stage IN ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'released', 'published')),
ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS submitted_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS rejected_reason TEXT,
ADD COLUMN IF NOT EXISTS overridden_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS overridden_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS principal_notes TEXT,
ADD COLUMN IF NOT EXISTS released_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS released_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_released BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_immutable BOOLEAN DEFAULT FALSE;

-- 3. Create grade submission batches table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.grade_submission_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id),
  
  batch_name TEXT NOT NULL,
  curriculum_type TEXT NOT NULL,
  term TEXT NOT NULL,
  exam_type TEXT NOT NULL,
  academic_year TEXT NOT NULL,
  
  submitted_by UUID NOT NULL REFERENCES auth.users(id),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  total_students INTEGER DEFAULT 0,
  grades_entered INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'released')),
  
  principal_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Create grade audit logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.grade_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grade_id UUID REFERENCES public.grades(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  user_role TEXT NOT NULL,
  action TEXT NOT NULL,
  old_values JSONB DEFAULT '{}'::jsonb,
  new_values JSONB DEFAULT '{}'::jsonb,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. Create CBC competencies table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.cbc_competencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id),
  class_id UUID REFERENCES public.classes(id),
  
  competency_name TEXT NOT NULL,
  competency_code TEXT NOT NULL,
  description TEXT,
  strands JSONB DEFAULT '[]'::jsonb,
  sub_strands JSONB DEFAULT '[]'::jsonb,
  weighting NUMERIC DEFAULT 1.0,
  assessment_types JSONB DEFAULT '[]'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 6. Create IGCSE subjects table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.igcse_subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  subject_name TEXT NOT NULL,
  subject_code TEXT NOT NULL,
  subject_type TEXT NOT NULL CHECK (subject_type IN ('core', 'extended')),
  components JSONB NOT NULL DEFAULT '[]'::jsonb,
  grade_boundaries JSONB DEFAULT '{"A*": 90, "A": 80, "B": 70, "C": 60, "D": 50, "E": 40, "F": 30, "G": 20, "U": 0}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 7. Add proper indexes for performance
CREATE INDEX IF NOT EXISTS idx_grades_school_id ON public.grades(school_id);
CREATE INDEX IF NOT EXISTS idx_grades_class_id ON public.grades(class_id);
CREATE INDEX IF NOT EXISTS idx_grades_student_id ON public.grades(student_id);
CREATE INDEX IF NOT EXISTS idx_grades_subject_id ON public.grades(subject_id);
CREATE INDEX IF NOT EXISTS idx_grades_term ON public.grades(term);
CREATE INDEX IF NOT EXISTS idx_grades_exam_type ON public.grades(exam_type);
CREATE INDEX IF NOT EXISTS idx_grades_status ON public.grades(status);
CREATE INDEX IF NOT EXISTS idx_grades_curriculum_type ON public.grades(curriculum_type);
CREATE INDEX IF NOT EXISTS idx_grades_submitted_by ON public.grades(submitted_by);
CREATE INDEX IF NOT EXISTS idx_grades_submitted_at ON public.grades(submitted_at);
CREATE INDEX IF NOT EXISTS idx_grades_class_term_exam ON public.grades(class_id, term, exam_type);
CREATE INDEX IF NOT EXISTS idx_grades_student_term ON public.grades(student_id, term);

CREATE INDEX IF NOT EXISTS idx_classes_curriculum_type ON public.classes(curriculum_type);
CREATE INDEX IF NOT EXISTS idx_classes_school_id ON public.classes(school_id);

CREATE INDEX IF NOT EXISTS idx_cbc_competencies_school_id ON public.cbc_competencies(school_id);
CREATE INDEX IF NOT EXISTS idx_cbc_competencies_subject_id ON public.cbc_competencies(subject_id);
CREATE INDEX IF NOT EXISTS idx_cbc_competencies_class_id ON public.cbc_competencies(class_id);

CREATE INDEX IF NOT EXISTS idx_igcse_subjects_school_id ON public.igcse_subjects(school_id);

CREATE INDEX IF NOT EXISTS idx_grade_audit_logs_grade_id ON public.grade_audit_logs(grade_id);
CREATE INDEX IF NOT EXISTS idx_grade_audit_logs_user_id ON public.grade_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_grade_audit_logs_created_at ON public.grade_audit_logs(created_at);

-- 8. Add unique constraints to prevent duplicates
ALTER TABLE public.grades 
DROP CONSTRAINT IF EXISTS grades_unique_constraint;

ALTER TABLE public.grades 
ADD CONSTRAINT grades_unique_constraint 
UNIQUE (school_id, student_id, subject_id, class_id, term, exam_type);

-- 9. Create RLS policies for grades table
DROP POLICY IF EXISTS "Users can view grades in their school" ON public.grades;
CREATE POLICY "Users can view grades in their school" ON public.grades
  FOR SELECT USING (
    school_id = public.get_current_user_school_id() OR
    public.get_current_user_role() IN ('edufam_admin', 'elimisha_admin')
  );

DROP POLICY IF EXISTS "Teachers can create grades for their subjects" ON public.grades;
CREATE POLICY "Teachers can create grades for their subjects" ON public.grades
  FOR INSERT WITH CHECK (
    school_id = public.get_current_user_school_id() AND
    (
      public.get_current_user_role() IN ('teacher', 'principal', 'school_owner') OR
      submitted_by = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Teachers can update their own grades" ON public.grades;
CREATE POLICY "Teachers can update their own grades" ON public.grades
  FOR UPDATE USING (
    school_id = public.get_current_user_school_id() AND
    (
      (submitted_by = auth.uid() AND status IN ('draft', 'submitted')) OR
      public.get_current_user_role() IN ('principal', 'school_owner', 'edufam_admin')
    )
  );

DROP POLICY IF EXISTS "Principals can approve/reject grades" ON public.grades;
CREATE POLICY "Principals can approve/reject grades" ON public.grades
  FOR UPDATE USING (
    school_id = public.get_current_user_school_id() AND
    public.get_current_user_role() IN ('principal', 'school_owner', 'edufam_admin')
  );

-- 10. Create RLS policies for other tables
DROP POLICY IF EXISTS "Users can view CBC competencies in their school" ON public.cbc_competencies;
CREATE POLICY "Users can view CBC competencies in their school" ON public.cbc_competencies
  FOR SELECT USING (
    school_id = public.get_current_user_school_id() OR
    public.get_current_user_role() IN ('edufam_admin', 'elimisha_admin')
  );

DROP POLICY IF EXISTS "Users can view IGCSE subjects in their school" ON public.igcse_subjects;
CREATE POLICY "Users can view IGCSE subjects in their school" ON public.igcse_subjects
  FOR SELECT USING (
    school_id = public.get_current_user_school_id() OR
    public.get_current_user_role() IN ('edufam_admin', 'elimisha_admin')
  );

DROP POLICY IF EXISTS "Users can view grade audit logs in their school" ON public.grade_audit_logs;
CREATE POLICY "Users can view grade audit logs in their school" ON public.grade_audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.grades g 
      WHERE g.id = grade_audit_logs.grade_id 
      AND g.school_id = public.get_current_user_school_id()
    ) OR
    public.get_current_user_role() IN ('edufam_admin', 'elimisha_admin')
  );

-- 11. Create functions for automatic grade calculations
CREATE OR REPLACE FUNCTION update_grade_percentage()
RETURNS trigger AS $$
BEGIN
  -- Calculate percentage when score is updated
  IF NEW.score IS NOT NULL AND NEW.max_score IS NOT NULL AND NEW.max_score > 0 THEN
    NEW.percentage := ROUND((NEW.score / NEW.max_score) * 100, 2);
  ELSE
    NEW.percentage := NULL;
  END IF;
  
  -- Calculate letter grade based on percentage for standard curriculum
  IF NEW.percentage IS NOT NULL AND NEW.curriculum_type = 'standard' THEN
    IF NEW.percentage >= 90 THEN
      NEW.letter_grade := 'A+';
    ELSIF NEW.percentage >= 80 THEN
      NEW.letter_grade := 'A';
    ELSIF NEW.percentage >= 70 THEN
      NEW.letter_grade := 'B+';
    ELSIF NEW.percentage >= 60 THEN
      NEW.letter_grade := 'B';
    ELSIF NEW.percentage >= 50 THEN
      NEW.letter_grade := 'C+';
    ELSIF NEW.percentage >= 40 THEN
      NEW.letter_grade := 'C';
    ELSIF NEW.percentage >= 30 THEN
      NEW.letter_grade := 'D+';
    ELSIF NEW.percentage >= 20 THEN
      NEW.letter_grade := 'D';
    ELSE
      NEW.letter_grade := 'E';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic grade calculations
DROP TRIGGER IF EXISTS trigger_update_grade_percentage ON public.grades;
CREATE TRIGGER trigger_update_grade_percentage
  BEFORE INSERT OR UPDATE ON public.grades
  FOR EACH ROW
  EXECUTE FUNCTION update_grade_percentage();

-- 12. Create function to ensure school_id consistency
CREATE OR REPLACE FUNCTION ensure_grade_school_id_consistency()
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
  IF user_role NOT IN ('edufam_admin', 'elimisha_admin') THEN
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

-- Create trigger for school_id consistency
DROP TRIGGER IF EXISTS trigger_ensure_grade_school_id_consistency ON public.grades;
CREATE TRIGGER trigger_ensure_grade_school_id_consistency
  BEFORE INSERT OR UPDATE ON public.grades
  FOR EACH ROW
  EXECUTE FUNCTION ensure_grade_school_id_consistency();

-- 13. Update existing data to ensure consistency
UPDATE public.classes 
SET 
  curriculum_type = COALESCE(curriculum_type, 'standard'),
  curriculum = COALESCE(curriculum, 'standard')
WHERE curriculum_type IS NULL OR curriculum IS NULL;

UPDATE public.grades 
SET 
  curriculum_type = COALESCE(curriculum_type, 'standard'),
  school_id = COALESCE(school_id, (
    SELECT s.school_id 
    FROM public.students s 
    WHERE s.id = grades.student_id
  ))
WHERE curriculum_type IS NULL OR school_id IS NULL;

-- 14. Insert default CBC competencies for schools with CBC curriculum
INSERT INTO public.cbc_competencies (school_id, subject_id, class_id, competency_name, competency_code, description, strands, assessment_types)
SELECT 
  c.school_id,
  s.id as subject_id,
  c.id as class_id,
  'General Competency' as competency_name,
  'GEN-001' as competency_code,
  'General competency assessment for ' || s.name as description,
  '["Communication", "Problem Solving", "Application", "Understanding"]'::jsonb as strands,
  '["observation", "written_work", "project_work"]'::jsonb as assessment_types
FROM public.classes c
JOIN public.subjects s ON s.class_id = c.id
WHERE c.curriculum_type IN ('cbc', 'CBC')
  AND NOT EXISTS (
    SELECT 1 FROM public.cbc_competencies cc 
    WHERE cc.school_id = c.school_id 
    AND cc.subject_id = s.id 
    AND cc.class_id = c.id
  )
ON CONFLICT DO NOTHING;

-- 15. Insert default IGCSE subjects for schools with IGCSE curriculum
INSERT INTO public.igcse_subjects (school_id, subject_name, subject_code, subject_type, components)
SELECT 
  c.school_id,
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
FROM public.classes c
WHERE c.curriculum_type IN ('igcse', 'IGCSE')
  AND NOT EXISTS (
    SELECT 1 FROM public.igcse_subjects isub 
    WHERE isub.school_id = c.school_id
  )
ON CONFLICT DO NOTHING;

-- 16. Analyze tables for better query planning
ANALYZE public.grades;
ANALYZE public.classes;
ANALYZE public.cbc_competencies;
ANALYZE public.igcse_subjects;
ANALYZE public.grade_audit_logs;
ANALYZE public.grade_submission_batches; 