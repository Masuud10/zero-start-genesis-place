
-- Create fees table for fee structures
CREATE TABLE IF NOT EXISTS public.fees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  fee_name TEXT NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount >= 0),
  term_id UUID REFERENCES public.academic_terms(id),
  class_id UUID REFERENCES public.classes(id),
  due_date DATE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create student_fees table for individual student fee assignments
CREATE TABLE IF NOT EXISTS public.student_fees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  fee_id UUID NOT NULL REFERENCES public.fees(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'unpaid' CHECK (status IN ('paid', 'unpaid', 'partial')),
  amount_paid NUMERIC DEFAULT 0 CHECK (amount_paid >= 0),
  due_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id, fee_id)
);

-- Ensure expenses table exists with proper structure
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'expenses') THEN
    CREATE TABLE public.expenses (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      amount NUMERIC NOT NULL CHECK (amount > 0),
      category TEXT NOT NULL,
      expense_date DATE NOT NULL,
      description TEXT,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
    );
  ELSE
    -- Add missing columns if they don't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'expenses' AND column_name = 'title') THEN
      ALTER TABLE public.expenses ADD COLUMN title TEXT;
    END IF;
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'expenses' AND column_name = 'expense_date') THEN
      ALTER TABLE public.expenses ADD COLUMN expense_date DATE;
    END IF;
  END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE public.fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_fees ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "School-scoped access for fees" ON public.fees;
DROP POLICY IF EXISTS "School-scoped access for student_fees" ON public.student_fees;

-- RLS Policies for fees table
CREATE POLICY "School-scoped access for fees"
ON public.fees
FOR ALL
USING (school_id = public.get_current_user_school_id() OR public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin'))
WITH CHECK (school_id = public.get_current_user_school_id() OR public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin'));

-- RLS Policies for student_fees table
CREATE POLICY "School-scoped access for student_fees"
ON public.student_fees
FOR ALL
USING (school_id = public.get_current_user_school_id() OR public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin'))
WITH CHECK (school_id = public.get_current_user_school_id() OR public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin'));

-- Function to auto-assign fees to all students in a class
CREATE OR REPLACE FUNCTION public.assign_fee_to_class_students(p_fee_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  fee_record RECORD;
  student_record RECORD;
  inserted_count INTEGER := 0;
  rows_affected INTEGER;
BEGIN
  -- Get fee details
  SELECT * INTO fee_record FROM public.fees WHERE id = p_fee_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Fee with ID % not found', p_fee_id;
  END IF;
  
  -- Insert student_fees for all active students in the class
  FOR student_record IN
    SELECT id FROM public.students 
    WHERE class_id = fee_record.class_id 
    AND is_active = true 
    AND school_id = fee_record.school_id
  LOOP
    INSERT INTO public.student_fees (
      school_id,
      student_id, 
      fee_id, 
      status, 
      amount_paid, 
      due_date
    ) VALUES (
      fee_record.school_id,
      student_record.id, 
      p_fee_id, 
      'unpaid', 
      0, 
      fee_record.due_date
    )
    ON CONFLICT (student_id, fee_id) DO NOTHING;
    
    GET DIAGNOSTICS rows_affected = ROW_COUNT;
    inserted_count := inserted_count + rows_affected;
  END LOOP;
  
  RETURN inserted_count;
END;
$$;

-- Trigger to auto-assign fees when a fee is created
CREATE OR REPLACE FUNCTION public.auto_assign_fee_to_students()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only auto-assign if class_id is specified
  IF NEW.class_id IS NOT NULL THEN
    PERFORM public.assign_fee_to_class_students(NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_auto_assign_fee_to_students ON public.fees;
CREATE TRIGGER trigger_auto_assign_fee_to_students
  AFTER INSERT ON public.fees
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_assign_fee_to_students();
