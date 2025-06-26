
-- Enhance CBC competencies table to support strand-based grading
ALTER TABLE public.cbc_competencies 
ADD COLUMN IF NOT EXISTS sub_strands jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS assessment_types text[] DEFAULT ARRAY['observation', 'written_work', 'project_work', 'group_activity'];

-- Create CBC strand assessments table
CREATE TABLE IF NOT EXISTS public.cbc_strand_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID NOT NULL,
  student_id UUID NOT NULL,
  subject_id UUID NOT NULL,
  class_id UUID NOT NULL,
  competency_id UUID REFERENCES public.cbc_competencies(id),
  strand_name TEXT NOT NULL,
  sub_strand_name TEXT,
  assessment_type TEXT NOT NULL CHECK (assessment_type IN ('observation', 'written_work', 'project_work', 'group_activity', 'oral_assessment', 'practical_work')),
  performance_level TEXT NOT NULL CHECK (performance_level IN ('EM', 'AP', 'PR', 'EX')),
  teacher_remarks TEXT,
  term TEXT NOT NULL,
  academic_year TEXT NOT NULL DEFAULT EXTRACT(year FROM now())::TEXT,
  assessment_date DATE DEFAULT CURRENT_DATE,
  teacher_id UUID NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(school_id, student_id, subject_id, competency_id, strand_name, sub_strand_name, assessment_type, term, academic_year)
);

-- Enable RLS for CBC strand assessments
ALTER TABLE public.cbc_strand_assessments ENABLE ROW LEVEL SECURITY;

-- RLS policies for cbc_strand_assessments
CREATE POLICY "Users can view CBC strand assessments for their school" ON public.cbc_strand_assessments
  FOR SELECT USING (school_id = public.get_current_user_school_id());

CREATE POLICY "Teachers can manage their own CBC strand assessments" ON public.cbc_strand_assessments
  FOR ALL USING (
    school_id = public.get_current_user_school_id() AND
    (teacher_id = auth.uid() OR public.get_current_user_role() IN ('principal', 'school_owner', 'edufam_admin'))
  );

-- Create CBC performance summary table
CREATE TABLE IF NOT EXISTS public.cbc_performance_summary (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID NOT NULL,
  student_id UUID NOT NULL,
  subject_id UUID NOT NULL,
  class_id UUID NOT NULL,
  term TEXT NOT NULL,
  academic_year TEXT NOT NULL,
  overall_performance_level TEXT CHECK (overall_performance_level IN ('EM', 'AP', 'PR', 'EX')),
  competency_levels jsonb DEFAULT '{}'::jsonb, -- Store performance per competency
  teacher_general_remarks TEXT,
  areas_of_strength text[],
  areas_for_improvement text[],
  teacher_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(school_id, student_id, subject_id, term, academic_year)
);

-- Enable RLS for CBC performance summary
ALTER TABLE public.cbc_performance_summary ENABLE ROW LEVEL SECURITY;

-- RLS policies for cbc_performance_summary
CREATE POLICY "Users can view CBC performance summary for their school" ON public.cbc_performance_summary
  FOR SELECT USING (school_id = public.get_current_user_school_id());

CREATE POLICY "Teachers can manage their own CBC performance summary" ON public.cbc_performance_summary
  FOR ALL USING (
    school_id = public.get_current_user_school_id() AND
    (teacher_id = auth.uid() OR public.get_current_user_role() IN ('principal', 'school_owner', 'edufam_admin'))
  );

-- Add auto school_id trigger for new CBC tables
CREATE TRIGGER set_school_id_cbc_strand_assessments
  BEFORE INSERT ON public.cbc_strand_assessments
  FOR EACH ROW EXECUTE FUNCTION public.auto_set_school_id_for_cbc();

CREATE TRIGGER set_school_id_cbc_performance_summary
  BEFORE INSERT ON public.cbc_performance_summary
  FOR EACH ROW EXECUTE FUNCTION public.auto_set_school_id_for_cbc();

-- Insert default CBC competencies with strands for schools with CBC curriculum
INSERT INTO public.cbc_competencies (school_id, subject_id, competency_name, competency_code, description, strands, sub_strands, class_id, weighting)
SELECT 
  s.id as school_id,
  sub.id as subject_id,
  comp_data.competency_name,
  comp_data.competency_code,
  comp_data.description,
  comp_data.strands,
  comp_data.sub_strands,
  c.id as class_id,
  1.0 as weighting
FROM public.schools s
CROSS JOIN (
  VALUES 
    ('Listening and Speaking', 'LS', 'Communication through listening and speaking', '["Active Listening", "Oral Expression", "Pronunciation"]'::jsonb, '["Listening for main ideas", "Following instructions", "Asking questions", "Giving presentations", "Using appropriate tone", "Clear articulation"]'::jsonb),
    ('Reading', 'RD', 'Reading comprehension and fluency', '["Reading Fluency", "Comprehension", "Vocabulary"]'::jsonb, '["Reading aloud", "Silent reading", "Understanding texts", "Context clues", "Word recognition", "Building vocabulary"]'::jsonb),
    ('Writing', 'WR', 'Written communication skills', '["Handwriting", "Composition", "Grammar"]'::jsonb, '["Letter formation", "Creative writing", "Descriptive writing", "Sentence structure", "Punctuation", "Spelling"]'::jsonb),
    ('Language Use', 'LU', 'Proper use of language structures', '["Grammar", "Vocabulary", "Language Patterns"]'::jsonb, '["Sentence construction", "Word usage", "Language rules", "Expression patterns", "Communication context", "Language variety"]'::jsonb)
) as comp_data(competency_name, competency_code, description, strands, sub_strands)
CROSS JOIN public.subjects sub
CROSS JOIN public.classes c
WHERE s.curriculum_type = 'cbc' 
  AND sub.school_id = s.id 
  AND c.school_id = s.id
  AND sub.name ILIKE '%english%'
  AND NOT EXISTS (
    SELECT 1 FROM public.cbc_competencies cc 
    WHERE cc.school_id = s.id 
      AND cc.subject_id = sub.id 
      AND cc.class_id = c.id 
      AND cc.competency_code = comp_data.competency_code
  )
ON CONFLICT DO NOTHING;
