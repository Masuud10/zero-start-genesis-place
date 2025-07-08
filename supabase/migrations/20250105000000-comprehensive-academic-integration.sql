-- Comprehensive Academic Module Integration Migration
-- This migration ensures all academic modules work together seamlessly

-- 1. Update examinations table to use proper academic context
ALTER TABLE public.examinations 
ADD COLUMN IF NOT EXISTS academic_year_id UUID REFERENCES public.academic_years(id),
ADD COLUMN IF NOT EXISTS term_id UUID REFERENCES public.academic_terms(id),
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Update existing examinations to use current academic period
UPDATE public.examinations 
SET 
  academic_year_id = (
    SELECT id FROM public.academic_years 
    WHERE school_id = examinations.school_id AND is_current = true 
    LIMIT 1
  ),
  term_id = (
    SELECT id FROM public.academic_terms 
    WHERE school_id = examinations.school_id AND is_current = true 
    LIMIT 1
  )
WHERE academic_year_id IS NULL OR term_id IS NULL;

-- 2. Update attendance table to use proper academic context
ALTER TABLE public.attendance 
ADD COLUMN IF NOT EXISTS academic_year_id UUID REFERENCES public.academic_years(id),
ADD COLUMN IF NOT EXISTS term_id UUID REFERENCES public.academic_terms(id),
ADD COLUMN IF NOT EXISTS subject_id UUID REFERENCES public.subjects(id);

-- Update existing attendance records
UPDATE public.attendance 
SET 
  academic_year_id = (
    SELECT id FROM public.academic_years 
    WHERE school_id = attendance.school_id AND is_current = true 
    LIMIT 1
  ),
  term_id = (
    SELECT id FROM public.academic_terms 
    WHERE school_id = attendance.school_id AND is_current = true 
    LIMIT 1
  )
WHERE academic_year_id IS NULL OR term_id IS NULL;

-- 3. Update grades table to use proper academic context
ALTER TABLE public.grades 
ADD COLUMN IF NOT EXISTS academic_year_id UUID REFERENCES public.academic_years(id),
ADD COLUMN IF NOT EXISTS term_id UUID REFERENCES public.academic_terms(id),
ADD COLUMN IF NOT EXISTS examination_id UUID REFERENCES public.examinations(id);

-- Update existing grades records
UPDATE public.grades 
SET 
  academic_year_id = (
    SELECT id FROM public.academic_years 
    WHERE school_id = grades.school_id AND is_current = true 
    LIMIT 1
  ),
  term_id = (
    SELECT id FROM public.academic_terms 
    WHERE school_id = grades.school_id AND is_current = true 
    LIMIT 1
  )
WHERE academic_year_id IS NULL OR term_id IS NULL;

-- 4. Create reports table for generated reports
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  academic_year_id UUID NOT NULL REFERENCES public.academic_years(id),
  term_id UUID NOT NULL REFERENCES public.academic_terms(id),
  report_type TEXT NOT NULL,
  generated_by UUID NOT NULL REFERENCES auth.users(id),
  report_data JSONB NOT NULL DEFAULT '{}',
  filters JSONB DEFAULT '{}',
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. Create academic_analytics table for cached analytics
CREATE TABLE IF NOT EXISTS public.academic_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  academic_year_id UUID NOT NULL REFERENCES public.academic_years(id),
  term_id UUID NOT NULL REFERENCES public.academic_terms(id),
  class_id UUID REFERENCES public.classes(id),
  analytics_type TEXT NOT NULL,
  analytics_data JSONB NOT NULL DEFAULT '{}',
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(school_id, academic_year_id, term_id, class_id, analytics_type)
);

-- 6. Create academic_context_validation table for tracking validation issues
CREATE TABLE IF NOT EXISTS public.academic_context_validation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  academic_year_id UUID REFERENCES public.academic_years(id),
  term_id UUID REFERENCES public.academic_terms(id),
  class_id UUID REFERENCES public.classes(id),
  subject_id UUID REFERENCES public.subjects(id),
  validation_type TEXT NOT NULL,
  is_valid BOOLEAN NOT NULL,
  errors JSONB DEFAULT '[]',
  validated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 7. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_examinations_academic_context 
ON public.examinations(school_id, academic_year_id, term_id);

CREATE INDEX IF NOT EXISTS idx_attendance_academic_context 
ON public.attendance(school_id, academic_year_id, term_id, class_id);

CREATE INDEX IF NOT EXISTS idx_grades_academic_context 
ON public.grades(school_id, academic_year_id, term_id, class_id, subject_id);

CREATE INDEX IF NOT EXISTS idx_reports_academic_context 
ON public.reports(school_id, academic_year_id, term_id);

CREATE INDEX IF NOT EXISTS idx_analytics_academic_context 
ON public.academic_analytics(school_id, academic_year_id, term_id, class_id);

-- 8. Create triggers for automatic context updates
CREATE OR REPLACE FUNCTION update_academic_context_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON public.reports
  FOR EACH ROW
  EXECUTE FUNCTION update_academic_context_timestamp();

CREATE TRIGGER update_analytics_updated_at
  BEFORE UPDATE ON public.academic_analytics
  FOR EACH ROW
  EXECUTE FUNCTION update_academic_context_timestamp();

-- 9. Create function to validate academic context
CREATE OR REPLACE FUNCTION validate_academic_context(
  p_school_id UUID,
  p_academic_year_id UUID DEFAULT NULL,
  p_term_id UUID DEFAULT NULL,
  p_class_id UUID DEFAULT NULL,
  p_subject_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
  errors TEXT[] := '{}';
  current_year_id UUID;
  current_term_id UUID;
BEGIN
  -- Get current academic period if not provided
  IF p_academic_year_id IS NULL OR p_term_id IS NULL THEN
    SELECT id INTO current_year_id
    FROM public.academic_years
    WHERE school_id = p_school_id AND is_current = true;
    
    IF current_year_id IS NULL THEN
      errors := array_append(errors, 'No current academic year set for this school');
    END IF;
    
    SELECT id INTO current_term_id
    FROM public.academic_terms
    WHERE school_id = p_school_id AND is_current = true;
    
    IF current_term_id IS NULL THEN
      errors := array_append(errors, 'No current academic term set for this school');
    END IF;
  ELSE
    current_year_id := p_academic_year_id;
    current_term_id := p_term_id;
  END IF;
  
  -- Validate class exists and belongs to school
  IF p_class_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.classes 
      WHERE id = p_class_id AND school_id = p_school_id
    ) THEN
      errors := array_append(errors, 'Invalid class selected or class does not belong to this school');
    END IF;
  END IF;
  
  -- Validate subject exists and is assigned to class
  IF p_subject_id IS NOT NULL AND p_class_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.subject_assignments
      WHERE subject_id = p_subject_id 
      AND class_id = p_class_id
      AND academic_year_id = current_year_id
      AND term_id = current_term_id
    ) THEN
      errors := array_append(errors, 'Subject is not assigned to this class for the current academic period');
    END IF;
  END IF;
  
  -- Return validation result
  result := jsonb_build_object(
    'isValid', array_length(errors, 1) = 0,
    'errors', to_jsonb(errors),
    'context', jsonb_build_object(
      'academic_year_id', current_year_id,
      'term_id', current_term_id,
      'class_id', p_class_id,
      'subject_id', p_subject_id,
      'school_id', p_school_id
    )
  );
  
  RETURN result;
END;
$$;

-- 10. Create function to get comprehensive academic data
CREATE OR REPLACE FUNCTION get_academic_module_data(
  p_school_id UUID,
  p_academic_year_id UUID,
  p_term_id UUID,
  p_class_id UUID DEFAULT NULL,
  p_subject_id UUID DEFAULT NULL,
  p_modules TEXT[] DEFAULT '{}'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB := '{}';
  examinations_data JSONB := '[]';
  attendance_data JSONB := '[]';
  grades_data JSONB := '[]';
  reports_data JSONB := '[]';
  analytics_data JSONB := '{}';
BEGIN
  -- Get examinations
  IF 'examinations' = ANY(p_modules) THEN
    SELECT jsonb_agg(
      jsonb_build_object(
        'id', e.id,
        'name', e.name,
        'type', e.type,
        'start_date', e.start_date,
        'end_date', e.end_date,
        'coordinator', p.name,
        'term_name', at.term_name,
        'year_name', ay.year_name
      )
    ) INTO examinations_data
    FROM public.examinations e
    LEFT JOIN public.profiles p ON e.coordinator_id = p.id
    LEFT JOIN public.academic_terms at ON e.term_id = at.id
    LEFT JOIN public.academic_years ay ON e.academic_year_id = ay.id
    WHERE e.school_id = p_school_id
    AND e.academic_year_id = p_academic_year_id
    AND e.term_id = p_term_id;
  END IF;
  
  -- Get attendance
  IF 'attendance' = ANY(p_modules) THEN
    SELECT jsonb_agg(
      jsonb_build_object(
        'id', a.id,
        'student_name', s.name,
        'admission_number', s.admission_number,
        'class_name', c.name,
        'date', a.date,
        'status', a.status,
        'session', a.session
      )
    ) INTO attendance_data
    FROM public.attendance a
    LEFT JOIN public.students s ON a.student_id = s.id
    LEFT JOIN public.classes c ON a.class_id = c.id
    WHERE a.school_id = p_school_id
    AND a.academic_year_id = p_academic_year_id
    AND a.term_id = p_term_id
    AND (p_class_id IS NULL OR a.class_id = p_class_id);
  END IF;
  
  -- Get grades
  IF 'grades' = ANY(p_modules) THEN
    SELECT jsonb_agg(
      jsonb_build_object(
        'id', g.id,
        'student_name', s.name,
        'admission_number', s.admission_number,
        'subject_name', sub.name,
        'class_name', c.name,
        'score', g.score,
        'max_score', g.max_score,
        'percentage', g.percentage,
        'letter_grade', g.letter_grade,
        'status', g.status,
        'submitted_by', p.name
      )
    ) INTO grades_data
    FROM public.grades g
    LEFT JOIN public.students s ON g.student_id = s.id
    LEFT JOIN public.subjects sub ON g.subject_id = sub.id
    LEFT JOIN public.classes c ON g.class_id = c.id
    LEFT JOIN public.profiles p ON g.submitted_by = p.id
    WHERE g.school_id = p_school_id
    AND g.academic_year_id = p_academic_year_id
    AND g.term_id = p_term_id
    AND (p_class_id IS NULL OR g.class_id = p_class_id)
    AND (p_subject_id IS NULL OR g.subject_id = p_subject_id);
  END IF;
  
  -- Get reports
  IF 'reports' = ANY(p_modules) THEN
    SELECT jsonb_agg(
      jsonb_build_object(
        'id', r.id,
        'report_type', r.report_type,
        'generated_at', r.generated_at,
        'generated_by', p.name
      )
    ) INTO reports_data
    FROM public.reports r
    LEFT JOIN public.profiles p ON r.generated_by = p.id
    WHERE r.school_id = p_school_id
    AND r.academic_year_id = p_academic_year_id
    AND r.term_id = p_term_id;
  END IF;
  
  -- Get analytics
  IF 'analytics' = ANY(p_modules) THEN
    SELECT analytics_data INTO analytics_data
    FROM public.academic_analytics
    WHERE school_id = p_school_id
    AND academic_year_id = p_academic_year_id
    AND term_id = p_term_id
    AND (p_class_id IS NULL OR class_id = p_class_id)
    AND analytics_type = 'comprehensive';
  END IF;
  
  -- Build result
  result := jsonb_build_object(
    'examinations', examinations_data,
    'attendance', attendance_data,
    'grades', grades_data,
    'reports', reports_data,
    'analytics', analytics_data
  );
  
  RETURN result;
END;
$$;

-- 11. Create RLS policies for new tables
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_context_validation ENABLE ROW LEVEL SECURITY;

-- Reports policies
CREATE POLICY "Users can view their school reports" ON public.reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND school_id = reports.school_id
    )
  );

CREATE POLICY "Principals can manage their school reports" ON public.reports
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'principal' 
      AND school_id = reports.school_id
    )
  );

-- Analytics policies
CREATE POLICY "Users can view their school analytics" ON public.academic_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND school_id = academic_analytics.school_id
    )
  );

CREATE POLICY "Principals can manage their school analytics" ON public.academic_analytics
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'principal' 
      AND school_id = academic_analytics.school_id
    )
  );

-- Validation policies
CREATE POLICY "Users can view their school validation records" ON public.academic_context_validation
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND school_id = academic_context_validation.school_id
    )
  );

-- 12. Create function to generate analytics data
CREATE OR REPLACE FUNCTION generate_academic_analytics(
  p_school_id UUID,
  p_academic_year_id UUID,
  p_term_id UUID,
  p_class_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
  grade_distribution JSONB;
  attendance_rate NUMERIC;
  subject_performance JSONB;
  exam_pass_rate NUMERIC;
BEGIN
  -- Calculate grade distribution
  SELECT jsonb_agg(
    jsonb_build_object(
      'grade', letter_grade,
      'count', count,
      'percentage', (count * 100.0 / total_count)
    )
  ) INTO grade_distribution
  FROM (
    SELECT 
      letter_grade,
      COUNT(*) as count,
      SUM(COUNT(*)) OVER () as total_count
    FROM public.grades
    WHERE school_id = p_school_id
    AND academic_year_id = p_academic_year_id
    AND term_id = p_term_id
    AND (p_class_id IS NULL OR class_id = p_class_id)
    GROUP BY letter_grade
  ) grade_counts;
  
  -- Calculate attendance rate
  SELECT 
    CASE 
      WHEN COUNT(*) > 0 THEN 
        (COUNT(CASE WHEN status = 'present' THEN 1 END) * 100.0 / COUNT(*))
      ELSE 0 
    END INTO attendance_rate
  FROM public.attendance
  WHERE school_id = p_school_id
  AND academic_year_id = p_academic_year_id
  AND term_id = p_term_id
  AND (p_class_id IS NULL OR class_id = p_class_id);
  
  -- Calculate subject performance
  SELECT jsonb_agg(
    jsonb_build_object(
      'subject', subject_name,
      'average', avg_percentage,
      'count', grade_count
    )
  ) INTO subject_performance
  FROM (
    SELECT 
      s.name as subject_name,
      AVG(g.percentage) as avg_percentage,
      COUNT(*) as grade_count
    FROM public.grades g
    JOIN public.subjects s ON g.subject_id = s.id
    WHERE g.school_id = p_school_id
    AND g.academic_year_id = p_academic_year_id
    AND g.term_id = p_term_id
    AND (p_class_id IS NULL OR g.class_id = p_class_id)
    GROUP BY s.id, s.name
  ) subject_stats;
  
  -- Calculate exam pass rate (assuming 50% is passing)
  SELECT 
    CASE 
      WHEN COUNT(*) > 0 THEN 
        (COUNT(CASE WHEN percentage >= 50 THEN 1 END) * 100.0 / COUNT(*))
      ELSE 0 
    END INTO exam_pass_rate
  FROM public.grades
  WHERE school_id = p_school_id
  AND academic_year_id = p_academic_year_id
  AND term_id = p_term_id
  AND (p_class_id IS NULL OR class_id = p_class_id);
  
  -- Build result
  result := jsonb_build_object(
    'gradeDistribution', COALESCE(grade_distribution, '[]'),
    'attendanceRate', COALESCE(attendance_rate, 0),
    'subjectPerformance', COALESCE(subject_performance, '[]'),
    'examPassRate', COALESCE(exam_pass_rate, 0),
    'generatedAt', now(),
    'context', jsonb_build_object(
      'school_id', p_school_id,
      'academic_year_id', p_academic_year_id,
      'term_id', p_term_id,
      'class_id', p_class_id
    )
  );
  
  RETURN result;
END;
$$;

-- 13. Create trigger to automatically update analytics when data changes
CREATE OR REPLACE FUNCTION update_academic_analytics_trigger()
RETURNS TRIGGER AS $$
BEGIN
  -- Invalidate analytics cache when grades or attendance change
  DELETE FROM public.academic_analytics
  WHERE school_id = COALESCE(NEW.school_id, OLD.school_id)
  AND academic_year_id = COALESCE(NEW.academic_year_id, OLD.academic_year_id)
  AND term_id = COALESCE(NEW.term_id, OLD.term_id)
  AND class_id = COALESCE(NEW.class_id, OLD.class_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_analytics_on_grades
  AFTER INSERT OR UPDATE OR DELETE ON public.grades
  FOR EACH ROW
  EXECUTE FUNCTION update_academic_analytics_trigger();

CREATE TRIGGER trigger_update_analytics_on_attendance
  AFTER INSERT OR UPDATE OR DELETE ON public.attendance
  FOR EACH ROW
  EXECUTE FUNCTION update_academic_analytics_trigger();

-- 14. Add comments for documentation
COMMENT ON TABLE public.reports IS 'Stores generated academic reports with proper context';
COMMENT ON TABLE public.academic_analytics IS 'Cached analytics data for performance optimization';
COMMENT ON TABLE public.academic_context_validation IS 'Tracks validation issues for academic context';
COMMENT ON FUNCTION validate_academic_context IS 'Validates academic context and relationships';
COMMENT ON FUNCTION get_academic_module_data IS 'Retrieves comprehensive data for academic modules';
COMMENT ON FUNCTION generate_academic_analytics IS 'Generates real-time analytics for academic context'; 