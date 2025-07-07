-- System Integration Relationships Migration
-- This migration establishes comprehensive relationships between all core modules

-- 1. Ensure academic_years table has proper structure
ALTER TABLE public.academic_years 
ADD COLUMN IF NOT EXISTS term_structure TEXT DEFAULT '3-term',
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed'));

-- 2. Ensure academic_terms table has proper structure
ALTER TABLE public.academic_terms 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed')),
ADD COLUMN IF NOT EXISTS term_order INTEGER;

-- 3. Ensure classes table has proper structure
ALTER TABLE public.classes 
ADD COLUMN IF NOT EXISTS academic_year_id UUID REFERENCES public.academic_years(id),
ADD COLUMN IF NOT EXISTS curriculum_type TEXT DEFAULT 'Standard' CHECK (curriculum_type IN ('CBC', 'IGCSE', 'Standard')),
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS max_students INTEGER DEFAULT 40;

-- 4. Create enhanced student_classes junction table
CREATE TABLE IF NOT EXISTS public.student_classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  academic_year_id UUID NOT NULL REFERENCES public.academic_years(id),
  term_id UUID NOT NULL REFERENCES public.academic_terms(id),
  enrollment_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Ensure unique enrollment per student per class per term
  UNIQUE(student_id, class_id, academic_year_id, term_id)
);

-- 5. Create enhanced subject_assignments table
CREATE TABLE IF NOT EXISTS public.subject_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  academic_year_id UUID NOT NULL REFERENCES public.academic_years(id),
  term_id UUID NOT NULL REFERENCES public.academic_terms(id),
  is_active BOOLEAN DEFAULT true,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Ensure unique assignment per subject per class per term
  UNIQUE(subject_id, class_id, academic_year_id, term_id)
);

-- 6. Create enhanced fee_structures table
CREATE TABLE IF NOT EXISTS public.fee_structures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  academic_year_id UUID NOT NULL REFERENCES public.academic_years(id),
  term_id UUID NOT NULL REFERENCES public.academic_terms(id),
  amount NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
  category TEXT NOT NULL CHECK (category IN ('tuition', 'transport', 'meals', 'activities', 'other')),
  due_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Ensure unique fee structure per class per term per category
  UNIQUE(class_id, academic_year_id, term_id, category)
);

-- 7. Create enhanced student_fees table
CREATE TABLE IF NOT EXISTS public.student_fees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  fee_structure_id UUID NOT NULL REFERENCES public.fee_structures(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
  paid_amount NUMERIC(10,2) DEFAULT 0 CHECK (paid_amount >= 0),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'paid', 'overdue')),
  due_date DATE NOT NULL,
  paid_date TIMESTAMP WITH TIME ZONE,
  payment_method TEXT,
  mpesa_code TEXT,
  academic_year_id UUID NOT NULL REFERENCES public.academic_years(id),
  term_id UUID NOT NULL REFERENCES public.academic_terms(id),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Ensure paid_amount doesn't exceed amount
  CONSTRAINT check_paid_amount CHECK (paid_amount <= amount)
);

-- 8. Enhance examinations table
ALTER TABLE public.examinations 
ADD COLUMN IF NOT EXISTS term_id UUID REFERENCES public.academic_terms(id),
ADD COLUMN IF NOT EXISTS academic_year_id UUID REFERENCES public.academic_years(id),
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'ongoing', 'completed', 'cancelled'));

-- 9. Enhance grades table
ALTER TABLE public.grades 
ADD COLUMN IF NOT EXISTS term_id UUID REFERENCES public.academic_terms(id),
ADD COLUMN IF NOT EXISTS academic_year_id UUID REFERENCES public.academic_years(id),
ADD COLUMN IF NOT EXISTS examination_id UUID REFERENCES public.examinations(id),
ADD COLUMN IF NOT EXISTS class_id UUID REFERENCES public.classes(id);

-- 10. Enhance attendance table
ALTER TABLE public.attendance 
ADD COLUMN IF NOT EXISTS term_id UUID REFERENCES public.academic_terms(id),
ADD COLUMN IF NOT EXISTS academic_year_id UUID REFERENCES public.academic_years(id),
ADD COLUMN IF NOT EXISTS class_id UUID REFERENCES public.classes(id);

-- 11. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_student_classes_student_id ON public.student_classes(student_id);
CREATE INDEX IF NOT EXISTS idx_student_classes_class_id ON public.student_classes(class_id);
CREATE INDEX IF NOT EXISTS idx_student_classes_academic_year ON public.student_classes(academic_year_id);
CREATE INDEX IF NOT EXISTS idx_student_classes_term ON public.student_classes(term_id);
CREATE INDEX IF NOT EXISTS idx_student_classes_school ON public.student_classes(school_id);

CREATE INDEX IF NOT EXISTS idx_subject_assignments_subject_id ON public.subject_assignments(subject_id);
CREATE INDEX IF NOT EXISTS idx_subject_assignments_class_id ON public.subject_assignments(class_id);
CREATE INDEX IF NOT EXISTS idx_subject_assignments_teacher_id ON public.subject_assignments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_subject_assignments_academic_year ON public.subject_assignments(academic_year_id);
CREATE INDEX IF NOT EXISTS idx_subject_assignments_term ON public.subject_assignments(term_id);

CREATE INDEX IF NOT EXISTS idx_fee_structures_class_id ON public.fee_structures(class_id);
CREATE INDEX IF NOT EXISTS idx_fee_structures_academic_year ON public.fee_structures(academic_year_id);
CREATE INDEX IF NOT EXISTS idx_fee_structures_term ON public.fee_structures(term_id);
CREATE INDEX IF NOT EXISTS idx_fee_structures_category ON public.fee_structures(category);

CREATE INDEX IF NOT EXISTS idx_student_fees_student_id ON public.student_fees(student_id);
CREATE INDEX IF NOT EXISTS idx_student_fees_class_id ON public.student_fees(class_id);
CREATE INDEX IF NOT EXISTS idx_student_fees_fee_structure ON public.student_fees(fee_structure_id);
CREATE INDEX IF NOT EXISTS idx_student_fees_status ON public.student_fees(status);
CREATE INDEX IF NOT EXISTS idx_student_fees_due_date ON public.student_fees(due_date);

CREATE INDEX IF NOT EXISTS idx_examinations_term_id ON public.examinations(term_id);
CREATE INDEX IF NOT EXISTS idx_examinations_academic_year ON public.examinations(academic_year_id);
CREATE INDEX IF NOT EXISTS idx_examinations_status ON public.examinations(status);

CREATE INDEX IF NOT EXISTS idx_grades_term_id ON public.grades(term_id);
CREATE INDEX IF NOT EXISTS idx_grades_academic_year ON public.grades(academic_year_id);
CREATE INDEX IF NOT EXISTS idx_grades_examination ON public.grades(examination_id);
CREATE INDEX IF NOT EXISTS idx_grades_class_id ON public.grades(class_id);

CREATE INDEX IF NOT EXISTS idx_attendance_term_id ON public.attendance(term_id);
CREATE INDEX IF NOT EXISTS idx_attendance_academic_year ON public.attendance(academic_year_id);
CREATE INDEX IF NOT EXISTS idx_attendance_class_id ON public.attendance(class_id);

-- 12. Enable Row Level Security on new tables
ALTER TABLE public.student_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subject_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_fees ENABLE ROW LEVEL SECURITY;

-- 13. Create RLS policies for student_classes
CREATE POLICY "Users can view their school's student class enrollments" ON public.student_classes
  FOR SELECT USING (
    school_id = public.get_current_user_school_id() OR 
    public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin') OR
    student_id IN (
      SELECT ps.student_id FROM public.parent_students ps 
      WHERE ps.parent_id = auth.uid()
    )
  );

CREATE POLICY "Principals and admins can manage student class enrollments" ON public.student_classes
  FOR ALL USING (
    (school_id = public.get_current_user_school_id() AND 
     public.get_current_user_role() IN ('principal', 'school_owner')) OR 
    public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin')
  );

-- 14. Create RLS policies for subject_assignments
CREATE POLICY "Users can view their school's subject assignments" ON public.subject_assignments
  FOR SELECT USING (
    school_id = public.get_current_user_school_id() OR 
    public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin')
  );

CREATE POLICY "Principals and admins can manage subject assignments" ON public.subject_assignments
  FOR ALL USING (
    (school_id = public.get_current_user_school_id() AND 
     public.get_current_user_role() IN ('principal', 'school_owner')) OR 
    public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin')
  );

-- 15. Create RLS policies for fee_structures
CREATE POLICY "Users can view their school's fee structures" ON public.fee_structures
  FOR SELECT USING (
    school_id = public.get_current_user_school_id() OR 
    public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin')
  );

CREATE POLICY "Finance officers and admins can manage fee structures" ON public.fee_structures
  FOR ALL USING (
    (school_id = public.get_current_user_school_id() AND 
     public.get_current_user_role() IN ('finance_officer', 'principal', 'school_owner')) OR 
    public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin')
  );

-- 16. Create RLS policies for student_fees
CREATE POLICY "Users can view their school's student fees" ON public.student_fees
  FOR SELECT USING (
    school_id = public.get_current_user_school_id() OR 
    public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin') OR
    student_id IN (
      SELECT ps.student_id FROM public.parent_students ps 
      WHERE ps.parent_id = auth.uid()
    )
  );

CREATE POLICY "Finance officers and admins can manage student fees" ON public.student_fees
  FOR ALL USING (
    (school_id = public.get_current_user_school_id() AND 
     public.get_current_user_role() IN ('finance_officer', 'principal', 'school_owner')) OR 
    public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin')
  );

-- 17. Create functions for data validation
CREATE OR REPLACE FUNCTION public.validate_academic_period_relationships()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure term belongs to the specified academic year
  IF NEW.term_id IS NOT NULL AND NEW.academic_year_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.academic_terms 
      WHERE id = NEW.term_id AND academic_year_id = NEW.academic_year_id
    ) THEN
      RAISE EXCEPTION 'Term does not belong to the specified academic year';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 18. Create triggers for data validation
CREATE TRIGGER validate_student_classes_periods
  BEFORE INSERT OR UPDATE ON public.student_classes
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_academic_period_relationships();

CREATE TRIGGER validate_subject_assignments_periods
  BEFORE INSERT OR UPDATE ON public.subject_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_academic_period_relationships();

CREATE TRIGGER validate_fee_structures_periods
  BEFORE INSERT OR UPDATE ON public.fee_structures
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_academic_period_relationships();

CREATE TRIGGER validate_student_fees_periods
  BEFORE INSERT OR UPDATE ON public.student_fees
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_academic_period_relationships();

-- 19. Create function to get current academic period
CREATE OR REPLACE FUNCTION public.get_current_academic_period(school_id_param UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_year RECORD;
  current_term RECORD;
  result JSONB;
BEGIN
  -- Get current academic year
  SELECT * INTO current_year
  FROM public.academic_years
  WHERE school_id = school_id_param AND is_current = true
  LIMIT 1;
  
  -- Get current academic term
  SELECT * INTO current_term
  FROM public.academic_terms
  WHERE school_id = school_id_param AND is_current = true
  LIMIT 1;
  
  result := jsonb_build_object(
    'year', to_jsonb(current_year),
    'term', to_jsonb(current_term)
  );
  
  RETURN result;
END;
$$;

-- 20. Create function to promote students
CREATE OR REPLACE FUNCTION public.promote_students(
  current_class_id UUID,
  next_class_id UUID,
  academic_year_id UUID,
  term_id UUID,
  student_ids UUID[] DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  student_count INTEGER;
  promoted_count INTEGER := 0;
  student_id UUID;
BEGIN
  -- Validate inputs
  IF current_class_id IS NULL OR next_class_id IS NULL OR academic_year_id IS NULL OR term_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'All parameters are required');
  END IF;
  
  -- Get students to promote
  IF student_ids IS NULL OR array_length(student_ids, 1) IS NULL THEN
    -- Promote all students in the class
    SELECT COUNT(*) INTO student_count
    FROM public.student_classes
    WHERE class_id = current_class_id AND is_active = true;
  ELSE
    -- Promote specific students
    student_count := array_length(student_ids, 1);
  END IF;
  
  -- Deactivate current enrollments
  IF student_ids IS NULL OR array_length(student_ids, 1) IS NULL THEN
    UPDATE public.student_classes
    SET is_active = false
    WHERE class_id = current_class_id AND is_active = true;
  ELSE
    UPDATE public.student_classes
    SET is_active = false
    WHERE class_id = current_class_id AND student_id = ANY(student_ids) AND is_active = true;
  END IF;
  
  -- Create new enrollments
  IF student_ids IS NULL OR array_length(student_ids, 1) IS NULL THEN
    INSERT INTO public.student_classes (student_id, class_id, academic_year_id, term_id, school_id)
    SELECT sc.student_id, next_class_id, academic_year_id, term_id, sc.school_id
    FROM public.student_classes sc
    WHERE sc.class_id = current_class_id AND sc.is_active = false;
    
    GET DIAGNOSTICS promoted_count = ROW_COUNT;
  ELSE
    INSERT INTO public.student_classes (student_id, class_id, academic_year_id, term_id, school_id)
    SELECT s.id, next_class_id, academic_year_id, term_id, s.school_id
    FROM public.students s
    WHERE s.id = ANY(student_ids);
    
    GET DIAGNOSTICS promoted_count = ROW_COUNT;
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'promoted_count', promoted_count,
    'message', 'Students promoted successfully'
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- 21. Create function to assign fee structure to students
CREATE OR REPLACE FUNCTION public.assign_fee_structure_to_students(
  fee_structure_id UUID,
  student_ids UUID[]
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  fee_structure RECORD;
  assigned_count INTEGER := 0;
  student_id UUID;
BEGIN
  -- Get fee structure details
  SELECT * INTO fee_structure
  FROM public.fee_structures
  WHERE id = fee_structure_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Fee structure not found');
  END IF;
  
  -- Assign fee to each student
  FOREACH student_id IN ARRAY student_ids
  LOOP
    INSERT INTO public.student_fees (
      student_id, class_id, fee_structure_id, amount, due_date,
      academic_year_id, term_id, school_id
    ) VALUES (
      student_id, fee_structure.class_id, fee_structure_id, fee_structure.amount,
      fee_structure.due_date, fee_structure.academic_year_id, fee_structure.term_id,
      fee_structure.school_id
    );
    
    assigned_count := assigned_count + 1;
  END LOOP;
  
  RETURN jsonb_build_object(
    'success', true,
    'assigned_count', assigned_count,
    'message', 'Fee structure assigned to students successfully'
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- 22. Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_student_classes_updated_at
  BEFORE UPDATE ON public.student_classes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subject_assignments_updated_at
  BEFORE UPDATE ON public.subject_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fee_structures_updated_at
  BEFORE UPDATE ON public.fee_structures
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_student_fees_updated_at
  BEFORE UPDATE ON public.student_fees
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 23. Add comments for documentation
COMMENT ON TABLE public.student_classes IS 'Tracks student enrollment in classes for specific academic periods';
COMMENT ON TABLE public.subject_assignments IS 'Tracks subject assignments to teachers for specific classes and academic periods';
COMMENT ON TABLE public.fee_structures IS 'Defines fee structures for classes in specific academic periods';
COMMENT ON TABLE public.student_fees IS 'Tracks individual student fee obligations and payments';

COMMENT ON FUNCTION public.get_current_academic_period(UUID) IS 'Returns the current academic year and term for a school';
COMMENT ON FUNCTION public.promote_students(UUID, UUID, UUID, UUID, UUID[]) IS 'Promotes students from one class to another for a new academic period';
COMMENT ON FUNCTION public.assign_fee_structure_to_students(UUID, UUID[]) IS 'Assigns a fee structure to multiple students'; 