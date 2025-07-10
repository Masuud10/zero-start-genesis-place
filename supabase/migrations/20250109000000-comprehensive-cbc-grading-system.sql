-- Comprehensive CBC Grading System Migration
-- This migration creates a complete CBC (Competency-Based Curriculum) grading system
-- with strands, sub-strands, learning outcomes, assessments, and performance tracking

-- 1. CBC STRANDS TABLE
CREATE TABLE IF NOT EXISTS public.cbc_strands (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  strand_name TEXT NOT NULL,
  strand_code TEXT NOT NULL,
  description TEXT,
  grade_level TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(school_id, subject_id, class_id, strand_code)
);

-- 2. CBC SUB-STRANDS TABLE
CREATE TABLE IF NOT EXISTS public.cbc_sub_strands (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  strand_id UUID NOT NULL REFERENCES public.cbc_strands(id) ON DELETE CASCADE,
  sub_strand_name TEXT NOT NULL,
  sub_strand_code TEXT NOT NULL,
  description TEXT,
  learning_outcomes JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(school_id, strand_id, sub_strand_code)
);

-- 3. CBC LEARNING OUTCOMES TABLE
CREATE TABLE IF NOT EXISTS public.cbc_learning_outcomes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  sub_strand_id UUID NOT NULL REFERENCES public.cbc_sub_strands(id) ON DELETE CASCADE,
  outcome_code TEXT NOT NULL,
  outcome_description TEXT NOT NULL,
  outcome_type TEXT CHECK (outcome_type IN ('knowledge', 'skill', 'attitude', 'value')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(school_id, sub_strand_id, outcome_code)
);

-- 4. CBC ASSESSMENT TYPES TABLE
CREATE TABLE IF NOT EXISTS public.cbc_assessment_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  assessment_type_name TEXT NOT NULL,
  assessment_type_code TEXT NOT NULL,
  description TEXT,
  is_formative BOOLEAN DEFAULT true,
  is_summative BOOLEAN DEFAULT false,
  weighting_percentage NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(school_id, assessment_type_code)
);

-- 5. CBC ASSESSMENTS TABLE
CREATE TABLE IF NOT EXISTS public.cbc_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  strand_id UUID NOT NULL REFERENCES public.cbc_strands(id) ON DELETE CASCADE,
  sub_strand_id UUID REFERENCES public.cbc_sub_strands(id),
  assessment_type_id UUID NOT NULL REFERENCES public.cbc_assessment_types(id),
  assessment_title TEXT NOT NULL,
  assessment_description TEXT,
  assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  term TEXT NOT NULL,
  academic_year TEXT NOT NULL DEFAULT EXTRACT(year FROM now())::TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  is_template BOOLEAN DEFAULT false,
  template_name TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 6. CBC STUDENT ASSESSMENTS TABLE (Main grading table)
CREATE TABLE IF NOT EXISTS public.cbc_student_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  assessment_id UUID NOT NULL REFERENCES public.cbc_assessments(id) ON DELETE CASCADE,
  strand_id UUID NOT NULL REFERENCES public.cbc_strands(id) ON DELETE CASCADE,
  sub_strand_id UUID REFERENCES public.cbc_sub_strands(id),
  learning_outcome_id UUID REFERENCES public.cbc_learning_outcomes(id),
  assessment_type_id UUID NOT NULL REFERENCES public.cbc_assessment_types(id),
  performance_level TEXT NOT NULL CHECK (performance_level IN ('EM', 'AP', 'PR', 'AD')),
  teacher_remarks TEXT,
  evidence_description TEXT,
  areas_of_strength TEXT[],
  areas_for_improvement TEXT[],
  next_steps TEXT,
  assessed_by UUID NOT NULL REFERENCES auth.users(id),
  assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  term TEXT NOT NULL,
  academic_year TEXT NOT NULL DEFAULT EXTRACT(year FROM now())::TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected', 'released')),
  submitted_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(school_id, student_id, assessment_id, strand_id, sub_strand_id, learning_outcome_id, term, academic_year)
);

-- 7. CBC PERFORMANCE LEVELS TABLE
CREATE TABLE IF NOT EXISTS public.cbc_performance_levels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  level_code TEXT NOT NULL CHECK (level_code IN ('EM', 'AP', 'PR', 'AD')),
  level_name TEXT NOT NULL,
  level_description TEXT NOT NULL,
  color_code TEXT DEFAULT '#000000',
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(school_id, level_code)
);

-- 8. CBC TERM SUMMARIES TABLE
CREATE TABLE IF NOT EXISTS public.cbc_term_summaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  term TEXT NOT NULL,
  academic_year TEXT NOT NULL DEFAULT EXTRACT(year FROM now())::TEXT,
  overall_performance_level TEXT CHECK (overall_performance_level IN ('EM', 'AP', 'PR', 'AD')),
  strand_performances JSONB DEFAULT '{}'::jsonb,
  teacher_general_remarks TEXT,
  areas_of_strength TEXT[],
  areas_for_improvement TEXT[],
  next_steps TEXT,
  attendance_percentage NUMERIC DEFAULT 0,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected', 'released')),
  submitted_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(school_id, student_id, subject_id, term, academic_year)
);

-- 9. CBC ASSESSMENT TEMPLATES TABLE
CREATE TABLE IF NOT EXISTS public.cbc_assessment_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  template_name TEXT NOT NULL,
  template_description TEXT,
  subject_id UUID REFERENCES public.subjects(id),
  class_id UUID REFERENCES public.classes(id),
  strand_id UUID REFERENCES public.cbc_strands(id),
  assessment_type_id UUID NOT NULL REFERENCES public.cbc_assessment_types(id),
  template_data JSONB DEFAULT '{}'::jsonb,
  is_public BOOLEAN DEFAULT false,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for all CBC tables
ALTER TABLE public.cbc_strands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cbc_sub_strands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cbc_learning_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cbc_assessment_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cbc_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cbc_student_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cbc_performance_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cbc_term_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cbc_assessment_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for CBC Strands
CREATE POLICY "Users can view CBC strands for their school" ON public.cbc_strands
  FOR SELECT USING (school_id = public.get_current_user_school_id());

CREATE POLICY "Teachers and admins can manage CBC strands" ON public.cbc_strands
  FOR ALL USING (
    school_id = public.get_current_user_school_id() AND
    public.get_current_user_role() IN ('teacher', 'principal', 'school_owner', 'edufam_admin', 'elimisha_admin')
  );

-- RLS Policies for CBC Sub-strands
CREATE POLICY "Users can view CBC sub-strands for their school" ON public.cbc_sub_strands
  FOR SELECT USING (school_id = public.get_current_user_school_id());

CREATE POLICY "Teachers and admins can manage CBC sub-strands" ON public.cbc_sub_strands
  FOR ALL USING (
    school_id = public.get_current_user_school_id() AND
    public.get_current_user_role() IN ('teacher', 'principal', 'school_owner', 'edufam_admin', 'elimisha_admin')
  );

-- RLS Policies for CBC Learning Outcomes
CREATE POLICY "Users can view CBC learning outcomes for their school" ON public.cbc_learning_outcomes
  FOR SELECT USING (school_id = public.get_current_user_school_id());

CREATE POLICY "Teachers and admins can manage CBC learning outcomes" ON public.cbc_learning_outcomes
  FOR ALL USING (
    school_id = public.get_current_user_school_id() AND
    public.get_current_user_role() IN ('teacher', 'principal', 'school_owner', 'edufam_admin', 'elimisha_admin')
  );

-- RLS Policies for CBC Assessment Types
CREATE POLICY "Users can view CBC assessment types for their school" ON public.cbc_assessment_types
  FOR SELECT USING (school_id = public.get_current_user_school_id());

CREATE POLICY "Teachers and admins can manage CBC assessment types" ON public.cbc_assessment_types
  FOR ALL USING (
    school_id = public.get_current_user_school_id() AND
    public.get_current_user_role() IN ('teacher', 'principal', 'school_owner', 'edufam_admin', 'elimisha_admin')
  );

-- RLS Policies for CBC Assessments
CREATE POLICY "Users can view CBC assessments for their school" ON public.cbc_assessments
  FOR SELECT USING (school_id = public.get_current_user_school_id());

CREATE POLICY "Teachers can manage their own CBC assessments" ON public.cbc_assessments
  FOR ALL USING (
    school_id = public.get_current_user_school_id() AND
    (created_by = auth.uid() OR public.get_current_user_role() IN ('principal', 'school_owner', 'edufam_admin', 'elimisha_admin'))
  );

-- RLS Policies for CBC Student Assessments
CREATE POLICY "Users can view CBC student assessments for their school" ON public.cbc_student_assessments
  FOR SELECT USING (school_id = public.get_current_user_school_id());

CREATE POLICY "Teachers can manage their own CBC student assessments" ON public.cbc_student_assessments
  FOR ALL USING (
    school_id = public.get_current_user_school_id() AND
    (assessed_by = auth.uid() OR public.get_current_user_role() IN ('principal', 'school_owner', 'edufam_admin', 'elimisha_admin'))
  );

-- RLS Policies for CBC Performance Levels
CREATE POLICY "Users can view CBC performance levels for their school" ON public.cbc_performance_levels
  FOR SELECT USING (school_id = public.get_current_user_school_id());

CREATE POLICY "Admins can manage CBC performance levels" ON public.cbc_performance_levels
  FOR ALL USING (
    school_id = public.get_current_user_school_id() AND
    public.get_current_user_role() IN ('principal', 'school_owner', 'edufam_admin', 'elimisha_admin')
  );

-- RLS Policies for CBC Term Summaries
CREATE POLICY "Users can view CBC term summaries for their school" ON public.cbc_term_summaries
  FOR SELECT USING (school_id = public.get_current_user_school_id());

CREATE POLICY "Teachers can manage their own CBC term summaries" ON public.cbc_term_summaries
  FOR ALL USING (
    school_id = public.get_current_user_school_id() AND
    (created_by = auth.uid() OR public.get_current_user_role() IN ('principal', 'school_owner', 'edufam_admin', 'elimisha_admin'))
  );

-- RLS Policies for CBC Assessment Templates
CREATE POLICY "Users can view CBC assessment templates for their school" ON public.cbc_assessment_templates
  FOR SELECT USING (school_id = public.get_current_user_school_id());

CREATE POLICY "Teachers can manage their own CBC assessment templates" ON public.cbc_assessment_templates
  FOR ALL USING (
    school_id = public.get_current_user_school_id() AND
    (created_by = auth.uid() OR public.get_current_user_role() IN ('principal', 'school_owner', 'edufam_admin', 'elimisha_admin'))
  );

-- Insert default CBC performance levels
INSERT INTO public.cbc_performance_levels (school_id, level_code, level_name, level_description, color_code, is_default) VALUES
  (gen_random_uuid(), 'EM', 'Emerging', 'Beginning to show understanding and skills', '#EF4444', true),
  (gen_random_uuid(), 'AP', 'Approaching Proficiency', 'Shows developing understanding with support needed', '#F59E0B', true),
  (gen_random_uuid(), 'PR', 'Proficient', 'Demonstrates good understanding and application', '#3B82F6', true),
  (gen_random_uuid(), 'AD', 'Advanced', 'Consistently demonstrates exceptional understanding and skills', '#10B981', true);

-- Insert default CBC assessment types
INSERT INTO public.cbc_assessment_types (school_id, assessment_type_name, assessment_type_code, description, is_formative, is_summative, weighting_percentage) VALUES
  (gen_random_uuid(), 'Observations', 'OBS', 'Teacher observations of student performance', true, false, 20),
  (gen_random_uuid(), 'Projects', 'PROJ', 'Project-based assessments', true, false, 25),
  (gen_random_uuid(), 'Oral Questions', 'ORAL', 'Oral questioning and discussions', true, false, 15),
  (gen_random_uuid(), 'Assignments', 'ASSIGN', 'Written assignments and tasks', true, false, 20),
  (gen_random_uuid(), 'Quizzes', 'QUIZ', 'Short quizzes and tests', true, false, 10),
  (gen_random_uuid(), 'Practical Work', 'PRAC', 'Hands-on practical activities', true, false, 10),
  (gen_random_uuid(), 'Summative Assessment', 'SUMM', 'End of term comprehensive assessment', false, true, 100);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_cbc_strands_school_subject_class ON public.cbc_strands(school_id, subject_id, class_id);
CREATE INDEX IF NOT EXISTS idx_cbc_sub_strands_strand_id ON public.cbc_sub_strands(strand_id);
CREATE INDEX IF NOT EXISTS idx_cbc_learning_outcomes_sub_strand_id ON public.cbc_learning_outcomes(sub_strand_id);
CREATE INDEX IF NOT EXISTS idx_cbc_assessments_class_subject ON public.cbc_assessments(class_id, subject_id);
CREATE INDEX IF NOT EXISTS idx_cbc_student_assessments_student_class ON public.cbc_student_assessments(student_id, class_id);
CREATE INDEX IF NOT EXISTS idx_cbc_student_assessments_assessment ON public.cbc_student_assessments(assessment_id);
CREATE INDEX IF NOT EXISTS idx_cbc_term_summaries_student_subject ON public.cbc_term_summaries(student_id, subject_id);

-- Create triggers for auto-updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_cbc_strands_updated_at BEFORE UPDATE ON public.cbc_strands FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cbc_sub_strands_updated_at BEFORE UPDATE ON public.cbc_sub_strands FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cbc_learning_outcomes_updated_at BEFORE UPDATE ON public.cbc_learning_outcomes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cbc_assessment_types_updated_at BEFORE UPDATE ON public.cbc_assessment_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cbc_assessments_updated_at BEFORE UPDATE ON public.cbc_assessments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cbc_student_assessments_updated_at BEFORE UPDATE ON public.cbc_student_assessments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cbc_performance_levels_updated_at BEFORE UPDATE ON public.cbc_performance_levels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cbc_term_summaries_updated_at BEFORE UPDATE ON public.cbc_term_summaries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cbc_assessment_templates_updated_at BEFORE UPDATE ON public.cbc_assessment_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 