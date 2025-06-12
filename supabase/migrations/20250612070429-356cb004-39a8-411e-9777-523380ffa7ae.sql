
-- Add new tables for CBC competency-based grading

-- Core competencies table
CREATE TABLE public.competencies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'core' or 'subject_specific'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert core CBC competencies
INSERT INTO public.competencies (name, description, category) VALUES
('Communication', 'Ability to express ideas clearly and listen effectively', 'core'),
('Critical Thinking', 'Ability to analyze, evaluate and solve problems', 'core'),
('Collaboration', 'Ability to work effectively with others', 'core'),
('Creativity', 'Ability to generate innovative ideas and solutions', 'core'),
('Citizenship', 'Understanding of civic responsibilities and rights', 'core'),
('Self-Efficacy', 'Confidence in one''s ability to succeed', 'core');

-- Subject competencies table (links subjects to specific competencies)
CREATE TABLE public.subject_competencies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_id UUID REFERENCES public.subjects(id),
  competency_id UUID REFERENCES public.competencies(id),
  weight DECIMAL DEFAULT 1.0, -- weighting for this competency in the subject
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- CBC assessments table (replaces traditional grades)
CREATE TABLE public.cbc_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  subject_id UUID REFERENCES public.subjects(id),
  competency_id UUID REFERENCES public.competencies(id),
  class_id UUID NOT NULL,
  term TEXT NOT NULL,
  assessment_type TEXT NOT NULL, -- 'formative', 'summative', 'project', 'observation'
  performance_level TEXT NOT NULL CHECK (performance_level IN ('EMERGING', 'APPROACHING', 'PROFICIENT', 'EXCEEDING')),
  evidence_description TEXT, -- What the learner demonstrated
  teacher_observation TEXT, -- Teacher's notes
  assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  submitted_by UUID NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_final BOOLEAN DEFAULT false, -- Mark if this is the final assessment for the term
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Learner portfolios for storing work samples and projects
CREATE TABLE public.learner_portfolios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  competency_id UUID REFERENCES public.competencies(id),
  subject_id UUID REFERENCES public.subjects(id),
  file_urls TEXT[], -- Array of file URLs
  reflection_notes TEXT, -- Learner's self-reflection
  teacher_feedback TEXT,
  created_by UUID NOT NULL, -- Could be student, teacher, or parent
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Competency progress tracking
CREATE TABLE public.competency_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  competency_id UUID REFERENCES public.competencies(id),
  current_level TEXT NOT NULL CHECK (current_level IN ('EMERGING', 'APPROACHING', 'PROFICIENT', 'EXCEEDING')),
  progress_percentage DECIMAL DEFAULT 0,
  last_assessed_date DATE,
  milestones_achieved JSONB DEFAULT '[]', -- Array of achieved milestones
  recommended_activities TEXT[],
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Parent engagement records
CREATE TABLE public.parent_engagements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  parent_id UUID NOT NULL,
  engagement_type TEXT NOT NULL, -- 'home_project', 'observation', 'feedback'
  description TEXT NOT NULL,
  competencies_addressed UUID[], -- Array of competency IDs
  date_recorded DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.competencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subject_competencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cbc_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learner_portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competency_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_engagements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for competencies (readable by all authenticated users)
CREATE POLICY "Competencies are viewable by authenticated users" 
  ON public.competencies FOR SELECT 
  USING (auth.role() = 'authenticated');

-- RLS Policies for subject_competencies
CREATE POLICY "Subject competencies viewable by school members" 
  ON public.subject_competencies FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.subjects s 
      JOIN public.profiles p ON p.school_id = s.school_id 
      WHERE s.id = subject_id AND p.id = auth.uid()
    )
  );

-- RLS Policies for CBC assessments
CREATE POLICY "Teachers can manage assessments for their subjects" 
  ON public.cbc_assessments FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.subjects s 
      JOIN public.profiles p ON p.id = auth.uid()
      WHERE s.id = subject_id 
      AND (s.teacher_id = auth.uid() OR p.role IN ('principal', 'school_owner'))
      AND p.school_id = s.school_id
    )
  );

CREATE POLICY "Students and parents can view their assessments" 
  ON public.cbc_assessments FOR SELECT 
  USING (
    student_id IN (
      SELECT st.id FROM public.students st 
      JOIN public.profiles p ON p.id = auth.uid()
      WHERE st.id = student_id 
      AND (st.parent_id = auth.uid() OR p.id = student_id)
    )
  );

-- RLS Policies for learner portfolios
CREATE POLICY "Portfolio access for student, parents, and teachers" 
  ON public.learner_portfolios FOR ALL 
  USING (
    student_id IN (
      SELECT st.id FROM public.students st 
      JOIN public.profiles p ON p.id = auth.uid()
      WHERE st.id = student_id 
      AND (st.parent_id = auth.uid() OR p.role IN ('teacher', 'principal', 'school_owner'))
    ) OR created_by = auth.uid()
  );

-- RLS Policies for competency progress
CREATE POLICY "Competency progress viewable by student, parents, and teachers" 
  ON public.competency_progress FOR ALL 
  USING (
    student_id IN (
      SELECT st.id FROM public.students st 
      JOIN public.profiles p ON p.id = auth.uid()
      WHERE st.id = student_id 
      AND (st.parent_id = auth.uid() OR p.role IN ('teacher', 'principal', 'school_owner'))
    )
  );

-- RLS Policies for parent engagements
CREATE POLICY "Parent engagements manageable by parents and viewable by teachers" 
  ON public.parent_engagements FOR ALL 
  USING (
    parent_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.students st 
      JOIN public.profiles p ON p.id = auth.uid()
      WHERE st.id = student_id 
      AND p.role IN ('teacher', 'principal', 'school_owner')
      AND p.school_id = st.school_id
    )
  );

-- Add indexes for better performance
CREATE INDEX idx_cbc_assessments_student_subject ON public.cbc_assessments(student_id, subject_id);
CREATE INDEX idx_cbc_assessments_competency ON public.cbc_assessments(competency_id);
CREATE INDEX idx_competency_progress_student ON public.competency_progress(student_id);
CREATE INDEX idx_learner_portfolios_student ON public.learner_portfolios(student_id);
