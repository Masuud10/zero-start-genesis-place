
-- Add missing columns and improve existing tables for comprehensive data storage

-- Enhance students table
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS avatar_url text,
ADD COLUMN IF NOT EXISTS emergency_contact text,
ADD COLUMN IF NOT EXISTS medical_notes text,
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Enhance grades table for better tracking
ALTER TABLE public.grades 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'released')),
ADD COLUMN IF NOT EXISTS reviewed_by uuid REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS reviewed_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS comments text,
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Enhance fees table for comprehensive financial tracking
ALTER TABLE public.fees 
ADD COLUMN IF NOT EXISTS school_id uuid REFERENCES public.schools(id),
ADD COLUMN IF NOT EXISTS academic_year text DEFAULT extract(year from now())::text,
ADD COLUMN IF NOT EXISTS installment_number integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS late_fee_amount numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount_amount numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Create financial_transactions table for detailed payment tracking
CREATE TABLE IF NOT EXISTS public.financial_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES public.schools(id) NOT NULL,
  student_id uuid REFERENCES public.students(id),
  fee_id uuid REFERENCES public.fees(id),
  transaction_type text NOT NULL CHECK (transaction_type IN ('payment', 'refund', 'adjustment', 'late_fee')),
  amount numeric NOT NULL,
  payment_method text CHECK (payment_method IN ('cash', 'mpesa', 'bank_transfer', 'card', 'cheque')),
  reference_number text,
  mpesa_code text,
  bank_reference text,
  description text,
  processed_by uuid REFERENCES public.profiles(id),
  processed_at timestamp with time zone DEFAULT now(),
  academic_year text DEFAULT extract(year from now())::text,
  term text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create academic_years table
CREATE TABLE IF NOT EXISTS public.academic_years (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES public.schools(id) NOT NULL,
  year_name text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  is_current boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(school_id, year_name)
);

-- Create terms table
CREATE TABLE IF NOT EXISTS public.academic_terms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES public.schools(id) NOT NULL,
  academic_year_id uuid REFERENCES public.academic_years(id) NOT NULL,
  term_name text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  is_current boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(school_id, academic_year_id, term_name)
);

-- Enhance attendance table
ALTER TABLE public.attendance 
ADD COLUMN IF NOT EXISTS school_id uuid REFERENCES public.schools(id),
ADD COLUMN IF NOT EXISTS academic_year text DEFAULT extract(year from now())::text,
ADD COLUMN IF NOT EXISTS term text,
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Create attendance_summary table for reporting
CREATE TABLE IF NOT EXISTS public.attendance_summary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES public.students(id) NOT NULL,
  class_id uuid REFERENCES public.classes(id) NOT NULL,
  school_id uuid REFERENCES public.schools(id) NOT NULL,
  academic_year text NOT NULL,
  term text NOT NULL,
  total_days integer DEFAULT 0,
  present_days integer DEFAULT 0,
  absent_days integer DEFAULT 0,
  late_days integer DEFAULT 0,
  attendance_percentage numeric DEFAULT 0,
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(student_id, academic_year, term)
);

-- Create grade_summary table for performance tracking
CREATE TABLE IF NOT EXISTS public.grade_summary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES public.students(id) NOT NULL,
  class_id uuid REFERENCES public.classes(id) NOT NULL,
  school_id uuid REFERENCES public.schools(id) NOT NULL,
  academic_year text NOT NULL,
  term text NOT NULL,
  total_subjects integer DEFAULT 0,
  average_score numeric DEFAULT 0,
  total_marks numeric DEFAULT 0,
  possible_marks numeric DEFAULT 0,
  class_position integer,
  grade_letter text,
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(student_id, academic_year, term)
);

-- Add school_id to existing tables that might be missing it
UPDATE public.students SET school_id = (
  SELECT school_id FROM public.classes WHERE classes.id = students.class_id
) WHERE school_id IS NULL AND class_id IS NOT NULL;

UPDATE public.attendance SET school_id = (
  SELECT school_id FROM public.students WHERE students.id = attendance.student_id
) WHERE school_id IS NULL;

UPDATE public.fees SET school_id = (
  SELECT school_id FROM public.students WHERE students.id = fees.student_id
) WHERE school_id IS NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_students_school_id ON public.students(school_id);
CREATE INDEX IF NOT EXISTS idx_grades_student_subject ON public.grades(student_id, subject_id, term);
CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON public.attendance(student_id, date);
CREATE INDEX IF NOT EXISTS idx_fees_student_term ON public.fees(student_id, term, status);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_school ON public.financial_transactions(school_id, processed_at);

-- Enable RLS on new tables
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grade_summary ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for new tables
CREATE POLICY "School isolation for financial_transactions" ON public.financial_transactions
  FOR ALL USING (
    school_id = public.get_current_user_school_id() OR 
    public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin')
  );

CREATE POLICY "School isolation for academic_years" ON public.academic_years
  FOR ALL USING (
    school_id = public.get_current_user_school_id() OR 
    public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin')
  );

CREATE POLICY "School isolation for academic_terms" ON public.academic_terms
  FOR ALL USING (
    school_id = public.get_current_user_school_id() OR 
    public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin')
  );

CREATE POLICY "School isolation for attendance_summary" ON public.attendance_summary
  FOR ALL USING (
    school_id = public.get_current_user_school_id() OR 
    public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin')
  );

CREATE POLICY "School isolation for grade_summary" ON public.grade_summary
  FOR ALL USING (
    school_id = public.get_current_user_school_id() OR 
    public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin')
  );

-- Apply auto_set_school_id trigger to new tables
CREATE TRIGGER auto_set_school_id_financial_transactions_trigger
  BEFORE INSERT ON public.financial_transactions
  FOR EACH ROW EXECUTE FUNCTION public.auto_set_school_id();

CREATE TRIGGER auto_set_school_id_academic_years_trigger
  BEFORE INSERT ON public.academic_years
  FOR EACH ROW EXECUTE FUNCTION public.auto_set_school_id();

CREATE TRIGGER auto_set_school_id_academic_terms_trigger
  BEFORE INSERT ON public.academic_terms
  FOR EACH ROW EXECUTE FUNCTION public.auto_set_school_id();

CREATE TRIGGER auto_set_school_id_attendance_summary_trigger
  BEFORE INSERT ON public.attendance_summary
  FOR EACH ROW EXECUTE FUNCTION public.auto_set_school_id();

CREATE TRIGGER auto_set_school_id_grade_summary_trigger
  BEFORE INSERT ON public.grade_summary
  FOR EACH ROW EXECUTE FUNCTION public.auto_set_school_id();
