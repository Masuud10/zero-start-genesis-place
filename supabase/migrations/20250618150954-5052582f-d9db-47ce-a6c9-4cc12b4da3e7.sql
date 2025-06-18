
-- Enhance academic_years table structure
ALTER TABLE public.academic_years 
ADD COLUMN IF NOT EXISTS term_structure TEXT DEFAULT '3-term' CHECK (term_structure IN ('2-term', '3-term', 'semester')),
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'upcoming')),
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Enhance academic_terms table structure  
ALTER TABLE public.academic_terms
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed')),
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS assessment_period_start DATE,
ADD COLUMN IF NOT EXISTS assessment_period_end DATE,
ADD COLUMN IF NOT EXISTS holiday_start DATE,
ADD COLUMN IF NOT EXISTS holiday_end DATE,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Enhance classes table with better structure
ALTER TABLE public.classes
ADD COLUMN IF NOT EXISTS academic_level TEXT CHECK (academic_level IN ('pre-school', 'primary', 'secondary')),
ADD COLUMN IF NOT EXISTS capacity INTEGER DEFAULT 40,
ADD COLUMN IF NOT EXISTS room_number TEXT,
ADD COLUMN IF NOT EXISTS class_type TEXT DEFAULT 'regular' CHECK (class_type IN ('regular', 'special', 'remedial', 'accelerated')),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Enhance subjects table with categories and metadata
ALTER TABLE public.subjects
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'core' CHECK (category IN ('core', 'optional', 'specialized', 'extra-curricular')),
ADD COLUMN IF NOT EXISTS credit_hours INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS assessment_weight NUMERIC DEFAULT 100,
ADD COLUMN IF NOT EXISTS prerequisites TEXT[],
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Enhance students table with comprehensive information
ALTER TABLE public.students
ADD COLUMN IF NOT EXISTS guardian_name TEXT,
ADD COLUMN IF NOT EXISTS guardian_contact TEXT,
ADD COLUMN IF NOT EXISTS guardian_relationship TEXT DEFAULT 'parent',
ADD COLUMN IF NOT EXISTS nationality TEXT,
ADD COLUMN IF NOT EXISTS religion TEXT,
ADD COLUMN IF NOT EXISTS special_needs TEXT,
ADD COLUMN IF NOT EXISTS previous_school TEXT,
ADD COLUMN IF NOT EXISTS enrollment_date DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'transferred', 'graduated'));

-- Create table for subject teacher assignments with better tracking
CREATE TABLE IF NOT EXISTS public.subject_teacher_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES public.schools(id) NOT NULL,
  teacher_id UUID REFERENCES public.profiles(id) NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) NOT NULL,
  class_id UUID REFERENCES public.classes(id) NOT NULL,
  assigned_by UUID REFERENCES public.profiles(id),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  workload_percentage NUMERIC DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(teacher_id, subject_id, class_id, school_id)
);

-- Create table for parent-student relationships
CREATE TABLE IF NOT EXISTS public.parent_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES public.profiles(id) NOT NULL,
  student_id UUID REFERENCES public.students(id) NOT NULL,
  relationship_type TEXT DEFAULT 'parent' CHECK (relationship_type IN ('parent', 'guardian', 'relative', 'sponsor')),
  is_primary_contact BOOLEAN DEFAULT false,
  school_id UUID REFERENCES public.schools(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(parent_id, student_id)
);

-- Create table for student class enrollments (many-to-many)
CREATE TABLE IF NOT EXISTS public.student_classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.students(id) NOT NULL,
  class_id UUID REFERENCES public.classes(id) NOT NULL,
  academic_year TEXT NOT NULL,
  enrollment_date DATE DEFAULT CURRENT_DATE,
  is_active BOOLEAN DEFAULT true,
  school_id UUID REFERENCES public.schools(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(student_id, class_id, academic_year)
);

-- Enable RLS on new tables
ALTER TABLE public.subject_teacher_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_classes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for new tables
CREATE POLICY "School isolation for subject_teacher_assignments" ON public.subject_teacher_assignments
  FOR ALL USING (
    school_id = public.get_current_user_school_id() OR 
    public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin')
  );

CREATE POLICY "School isolation for parent_students" ON public.parent_students
  FOR ALL USING (
    school_id = public.get_current_user_school_id() OR 
    public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin')
  );

CREATE POLICY "School isolation for student_classes" ON public.student_classes
  FOR ALL USING (
    school_id = public.get_current_user_school_id() OR 
    public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin')
  );

-- Apply auto_set_school_id trigger to new tables
CREATE TRIGGER auto_set_school_id_subject_teacher_assignments_trigger
  BEFORE INSERT ON public.subject_teacher_assignments
  FOR EACH ROW EXECUTE FUNCTION public.auto_set_school_id();

CREATE TRIGGER auto_set_school_id_parent_students_trigger
  BEFORE INSERT ON public.parent_students
  FOR EACH ROW EXECUTE FUNCTION public.auto_set_school_id();

CREATE TRIGGER auto_set_school_id_student_classes_trigger
  BEFORE INSERT ON public.student_classes
  FOR EACH ROW EXECUTE FUNCTION public.auto_set_school_id();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subject_teacher_assignments_school_teacher ON public.subject_teacher_assignments(school_id, teacher_id);
CREATE INDEX IF NOT EXISTS idx_parent_students_school_parent ON public.parent_students(school_id, parent_id);
CREATE INDEX IF NOT EXISTS idx_student_classes_school_student ON public.student_classes(school_id, student_id);
CREATE INDEX IF NOT EXISTS idx_academic_years_school_current ON public.academic_years(school_id, is_current);
CREATE INDEX IF NOT EXISTS idx_academic_terms_school_current ON public.academic_terms(school_id, is_current);

-- Function to validate academic year dates
CREATE OR REPLACE FUNCTION public.validate_academic_year_dates()
RETURNS TRIGGER AS $$
BEGIN
  -- Check for overlapping academic years in the same school
  IF EXISTS (
    SELECT 1 FROM public.academic_years 
    WHERE school_id = NEW.school_id 
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
    AND (
      (NEW.start_date BETWEEN start_date AND end_date) OR
      (NEW.end_date BETWEEN start_date AND end_date) OR
      (start_date BETWEEN NEW.start_date AND NEW.end_date)
    )
  ) THEN
    RAISE EXCEPTION 'Academic year dates overlap with existing academic year';
  END IF;
  
  -- Validate start date is before end date
  IF NEW.start_date >= NEW.end_date THEN
    RAISE EXCEPTION 'Academic year start date must be before end date';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to validate academic term dates
CREATE OR REPLACE FUNCTION public.validate_academic_term_dates()
RETURNS TRIGGER AS $$
DECLARE
  academic_year_record RECORD;
BEGIN
  -- Get academic year details
  SELECT start_date, end_date INTO academic_year_record
  FROM public.academic_years
  WHERE id = NEW.academic_year_id;
  
  -- Check if term dates are within academic year
  IF NEW.start_date < academic_year_record.start_date OR NEW.end_date > academic_year_record.end_date THEN
    RAISE EXCEPTION 'Term dates must be within the academic year period';
  END IF;
  
  -- Check for overlapping terms in the same academic year
  IF EXISTS (
    SELECT 1 FROM public.academic_terms 
    WHERE academic_year_id = NEW.academic_year_id 
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
    AND (
      (NEW.start_date BETWEEN start_date AND end_date) OR
      (NEW.end_date BETWEEN start_date AND end_date) OR
      (start_date BETWEEN NEW.start_date AND NEW.end_date)
    )
  ) THEN
    RAISE EXCEPTION 'Term dates overlap with existing term in the same academic year';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply validation triggers
CREATE TRIGGER validate_academic_year_dates_trigger
  BEFORE INSERT OR UPDATE ON public.academic_years
  FOR EACH ROW EXECUTE FUNCTION public.validate_academic_year_dates();

CREATE TRIGGER validate_academic_term_dates_trigger
  BEFORE INSERT OR UPDATE ON public.academic_terms
  FOR EACH ROW EXECUTE FUNCTION public.validate_academic_term_dates();
