
-- Enhanced grading tables for CBC and IGCSE support

-- Create curriculum-specific grading configurations
CREATE TABLE IF NOT EXISTS public.grading_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id),
  curriculum_type TEXT NOT NULL CHECK (curriculum_type IN ('cbc', 'igcse', 'standard')),
  subject_id UUID REFERENCES public.subjects(id),
  class_id UUID REFERENCES public.classes(id),
  
  -- CBC specific fields
  competency_areas JSONB DEFAULT '[]'::jsonb,
  strand_weightings JSONB DEFAULT '{}'::jsonb,
  
  -- IGCSE specific fields
  coursework_percentage NUMERIC DEFAULT 0,
  exam_percentage NUMERIC DEFAULT 100,
  grade_boundaries JSONB DEFAULT '{}'::jsonb,
  
  -- Common fields
  max_score NUMERIC DEFAULT 100,
  pass_mark NUMERIC DEFAULT 40,
  grading_scale JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- CBC Competency areas and strands
CREATE TABLE IF NOT EXISTS public.cbc_competencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id),
  subject_id UUID REFERENCES public.subjects(id),
  class_id UUID REFERENCES public.classes(id),
  
  competency_name TEXT NOT NULL,
  competency_code TEXT NOT NULL,
  description TEXT,
  strands JSONB DEFAULT '[]'::jsonb,
  weighting NUMERIC DEFAULT 1.0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enhanced grades table with curriculum support
ALTER TABLE public.grades 
ADD COLUMN IF NOT EXISTS curriculum_type TEXT DEFAULT 'standard',
ADD COLUMN IF NOT EXISTS competency_id UUID REFERENCES public.cbc_competencies(id),
ADD COLUMN IF NOT EXISTS strand_scores JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS coursework_score NUMERIC,
ADD COLUMN IF NOT EXISTS exam_score NUMERIC,
ADD COLUMN IF NOT EXISTS raw_score NUMERIC,
ADD COLUMN IF NOT EXISTS grade_boundary_applied BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS competency_level TEXT,
ADD COLUMN IF NOT EXISTS submission_batch_id UUID,
ADD COLUMN IF NOT EXISTS approval_workflow_stage TEXT DEFAULT 'draft' CHECK (approval_workflow_stage IN ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'released', 'published'));

-- Grade submission batches for bulk operations
CREATE TABLE IF NOT EXISTS public.grade_submission_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id),
  class_id UUID NOT NULL REFERENCES public.classes(id),
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

-- Grade approval workflow
CREATE TABLE IF NOT EXISTS public.grade_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id),
  batch_id UUID REFERENCES public.grade_submission_batches(id),
  grade_id UUID REFERENCES public.grades(id),
  
  approver_id UUID NOT NULL REFERENCES auth.users(id),
  approver_role TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('approve', 'reject', 'override', 'release', 'publish')),
  
  previous_value JSONB,
  new_value JSONB,
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Grade audit logs
CREATE TABLE IF NOT EXISTS public.grade_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id),
  grade_id UUID REFERENCES public.grades(id),
  batch_id UUID REFERENCES public.grade_submission_batches(id),
  
  user_id UUID NOT NULL REFERENCES auth.users(id),
  user_role TEXT NOT NULL,
  action TEXT NOT NULL,
  
  old_values JSONB,
  new_values JSONB,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  ip_address INET,
  user_agent TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS Policies for new tables
ALTER TABLE public.grading_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cbc_competencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grade_submission_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grade_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grade_audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for grading_configurations
CREATE POLICY "Users can view their school's grading configurations"
  ON public.grading_configurations FOR SELECT
  USING (school_id = public.get_current_user_school_id() OR public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin'));

CREATE POLICY "Principals and admins can manage grading configurations"
  ON public.grading_configurations FOR ALL
  USING (school_id = public.get_current_user_school_id() AND public.get_current_user_role() IN ('principal', 'elimisha_admin', 'edufam_admin'));

-- RLS policies for cbc_competencies
CREATE POLICY "Users can view their school's CBC competencies"
  ON public.cbc_competencies FOR SELECT
  USING (school_id = public.get_current_user_school_id() OR public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin'));

CREATE POLICY "Principals and admins can manage CBC competencies"
  ON public.cbc_competencies FOR ALL
  USING (school_id = public.get_current_user_school_id() AND public.get_current_user_role() IN ('principal', 'elimisha_admin', 'edufam_admin'));

-- RLS policies for grade_submission_batches
CREATE POLICY "Users can view their school's grade batches"
  ON public.grade_submission_batches FOR SELECT
  USING (school_id = public.get_current_user_school_id() OR public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin'));

CREATE POLICY "Teachers can create grade batches"
  ON public.grade_submission_batches FOR INSERT
  WITH CHECK (school_id = public.get_current_user_school_id() AND public.get_current_user_role() IN ('teacher', 'principal', 'elimisha_admin', 'edufam_admin'));

CREATE POLICY "Teachers can update their own batches, principals can update all"
  ON public.grade_submission_batches FOR UPDATE
  USING (
    school_id = public.get_current_user_school_id() AND 
    (submitted_by = auth.uid() OR public.get_current_user_role() IN ('principal', 'elimisha_admin', 'edufam_admin'))
  );

-- RLS policies for grade_approvals
CREATE POLICY "Users can view their school's grade approvals"
  ON public.grade_approvals FOR SELECT
  USING (school_id = public.get_current_user_school_id() OR public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin'));

CREATE POLICY "Principals and admins can create approvals"
  ON public.grade_approvals FOR INSERT
  WITH CHECK (school_id = public.get_current_user_school_id() AND public.get_current_user_role() IN ('principal', 'elimisha_admin', 'edufam_admin'));

-- RLS policies for grade_audit_logs
CREATE POLICY "Users can view their school's audit logs"
  ON public.grade_audit_logs FOR SELECT
  USING (school_id = public.get_current_user_school_id() OR public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin'));

CREATE POLICY "System can insert audit logs"
  ON public.grade_audit_logs FOR INSERT
  WITH CHECK (school_id = public.get_current_user_school_id());

-- Enhanced grade calculation function for CBC
CREATE OR REPLACE FUNCTION public.calculate_cbc_competency_level(
  strand_scores JSONB,
  competency_weightings JSONB
) RETURNS TEXT AS $$
DECLARE
  weighted_total NUMERIC := 0;
  total_weight NUMERIC := 0;
  strand_key TEXT;
  strand_score NUMERIC;
  strand_weight NUMERIC;
  competency_level TEXT;
BEGIN
  -- Calculate weighted average of strands
  FOR strand_key IN SELECT jsonb_object_keys(strand_scores)
  LOOP
    strand_score := (strand_scores->strand_key)::NUMERIC;
    strand_weight := COALESCE((competency_weightings->strand_key)::NUMERIC, 1.0);
    
    weighted_total := weighted_total + (strand_score * strand_weight);
    total_weight := total_weight + strand_weight;
  END LOOP;
  
  -- Determine competency level based on weighted average
  IF total_weight > 0 THEN
    weighted_total := weighted_total / total_weight;
    
    IF weighted_total >= 80 THEN
      competency_level := 'Exceeding Expectations';
    ELSIF weighted_total >= 60 THEN
      competency_level := 'Meeting Expectations';
    ELSIF weighted_total >= 40 THEN
      competency_level := 'Approaching Expectations';
    ELSE
      competency_level := 'Below Expectations';
    END IF;
  ELSE
    competency_level := 'Not Assessed';
  END IF;
  
  RETURN competency_level;
END;
$$ LANGUAGE plpgsql;

-- Enhanced grade calculation function for IGCSE
CREATE OR REPLACE FUNCTION public.calculate_igcse_grade(
  coursework_score NUMERIC,
  exam_score NUMERIC,
  coursework_weight NUMERIC,
  exam_weight NUMERIC,
  grade_boundaries JSONB
) RETURNS TEXT AS $$
DECLARE
  total_score NUMERIC;
  grade_letter TEXT := 'U';
  boundary_key TEXT;
  boundary_value NUMERIC;
BEGIN
  -- Calculate weighted total
  total_score := (coursework_score * coursework_weight / 100) + (exam_score * exam_weight / 100);
  
  -- Apply grade boundaries
  FOR boundary_key IN SELECT jsonb_object_keys(grade_boundaries) ORDER BY (grade_boundaries->boundary_key)::NUMERIC DESC
  LOOP
    boundary_value := (grade_boundaries->boundary_key)::NUMERIC;
    IF total_score >= boundary_value THEN
      grade_letter := boundary_key;
      EXIT;
    END IF;
  END LOOP;
  
  RETURN grade_letter;
END;
$$ LANGUAGE plpgsql;

-- Function to update grade batch statistics
CREATE OR REPLACE FUNCTION public.update_batch_statistics()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE public.grade_submission_batches
    SET 
      grades_entered = (
        SELECT COUNT(*) 
        FROM public.grades 
        WHERE submission_batch_id = NEW.submission_batch_id 
        AND (score IS NOT NULL OR coursework_score IS NOT NULL OR exam_score IS NOT NULL)
      ),
      updated_at = now()
    WHERE id = NEW.submission_batch_id;
    
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update batch statistics
DROP TRIGGER IF EXISTS update_batch_stats_trigger ON public.grades;
CREATE TRIGGER update_batch_stats_trigger
  AFTER INSERT OR UPDATE ON public.grades
  FOR EACH ROW
  WHEN (NEW.submission_batch_id IS NOT NULL)
  EXECUTE FUNCTION public.update_batch_statistics();

-- Function to create audit log entries
CREATE OR REPLACE FUNCTION public.create_grade_audit_log()
RETURNS TRIGGER AS $$
DECLARE
  current_user_school_id UUID;
  current_user_role TEXT;
BEGIN
  -- Get current user info
  SELECT school_id, role INTO current_user_school_id, current_user_role
  FROM public.profiles WHERE id = auth.uid();
  
  -- Insert audit log
  INSERT INTO public.grade_audit_logs (
    school_id,
    grade_id,
    batch_id,
    user_id,
    user_role,
    action,
    old_values,
    new_values,
    metadata
  ) VALUES (
    current_user_school_id,
    COALESCE(NEW.id, OLD.id),
    COALESCE(NEW.submission_batch_id, OLD.submission_batch_id),
    auth.uid(),
    current_user_role,
    TG_OP,
    CASE WHEN TG_OP != 'INSERT' THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP != 'DELETE' THEN row_to_json(NEW) ELSE NULL END,
    jsonb_build_object('table', TG_TABLE_NAME, 'timestamp', now())
  );
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger for grade audit logging
DROP TRIGGER IF EXISTS grade_audit_trigger ON public.grades;
CREATE TRIGGER grade_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.grades
  FOR EACH ROW
  EXECUTE FUNCTION public.create_grade_audit_log();
