
-- First, let's ensure the grades table has all necessary columns for the grading workflow
ALTER TABLE public.grades 
ADD COLUMN IF NOT EXISTS approved_by uuid,
ADD COLUMN IF NOT EXISTS approved_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS released_by uuid,
ADD COLUMN IF NOT EXISTS released_at timestamp with time zone;

-- Add indexes for better performance on grade queries
CREATE INDEX IF NOT EXISTS idx_grades_class_term_exam ON public.grades(class_id, term, exam_type);
CREATE INDEX IF NOT EXISTS idx_grades_student_term ON public.grades(student_id, term);
CREATE INDEX IF NOT EXISTS idx_grades_status ON public.grades(status);
CREATE INDEX IF NOT EXISTS idx_grades_submitted_by ON public.grades(submitted_by);

-- Create a function to calculate class positions
CREATE OR REPLACE FUNCTION calculate_class_positions(
  p_class_id uuid,
  p_term text,
  p_exam_type text
) RETURNS void AS $$
DECLARE
  student_record record;
  position_counter integer := 1;
BEGIN
  -- Calculate total scores for each student and rank them
  FOR student_record IN
    SELECT 
      student_id,
      SUM(COALESCE(score, 0)) as total_score,
      COUNT(CASE WHEN score IS NOT NULL THEN 1 END) as subjects_count
    FROM public.grades
    WHERE class_id = p_class_id 
      AND term = p_term 
      AND exam_type = p_exam_type
      AND score IS NOT NULL
    GROUP BY student_id
    ORDER BY total_score DESC, subjects_count DESC
  LOOP
    -- Update position for each student
    UPDATE public.grades
    SET position = position_counter
    WHERE student_id = student_record.student_id
      AND class_id = p_class_id
      AND term = p_term
      AND exam_type = p_exam_type;
    
    position_counter := position_counter + 1;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create a function to update grade percentages automatically
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
  IF NEW.percentage IS NOT NULL THEN
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

-- Create trigger to automatically update percentages and letter grades
DROP TRIGGER IF EXISTS trigger_update_grade_percentage ON public.grades;
CREATE TRIGGER trigger_update_grade_percentage
  BEFORE INSERT OR UPDATE ON public.grades
  FOR EACH ROW
  EXECUTE FUNCTION update_grade_percentage();

-- Create RLS policies for grades table if they don't exist
DROP POLICY IF EXISTS "Users can view grades in their school" ON public.grades;
CREATE POLICY "Users can view grades in their school" ON public.grades
  FOR SELECT USING (
    school_id = public.get_current_user_school_id() OR
    public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin')
  );

DROP POLICY IF EXISTS "Teachers can create grades for their subjects" ON public.grades;
CREATE POLICY "Teachers can create grades for their subjects" ON public.grades
  FOR INSERT WITH CHECK (
    school_id = public.get_current_user_school_id() AND
    (
      public.get_current_user_role() IN ('principal', 'elimisha_admin', 'edufam_admin') OR
      (
        public.get_current_user_role() = 'teacher' AND
        submitted_by = auth.uid() AND
        EXISTS (
          SELECT 1 FROM public.subjects s
          WHERE s.id = subject_id AND s.teacher_id = auth.uid()
        )
      )
    )
  );

DROP POLICY IF EXISTS "Users can update grades with restrictions" ON public.grades;
CREATE POLICY "Users can update grades with restrictions" ON public.grades
  FOR UPDATE USING (
    school_id = public.get_current_user_school_id() AND
    (
      public.get_current_user_role() IN ('principal', 'elimisha_admin', 'edufam_admin') OR
      (
        public.get_current_user_role() = 'teacher' AND
        submitted_by = auth.uid() AND
        status IN ('draft', 'rejected') AND
        EXISTS (
          SELECT 1 FROM public.subjects s
          WHERE s.id = subject_id AND s.teacher_id = auth.uid()
        )
      )
    )
  );

-- Enable RLS on grades table
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
