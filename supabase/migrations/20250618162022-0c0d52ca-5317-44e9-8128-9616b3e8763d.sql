
-- First, let's check if there are any triggers that might be causing this issue
-- and fix the fees table structure if needed

-- Check if class_id column exists in fees table, if not add it
ALTER TABLE public.fees 
ADD COLUMN IF NOT EXISTS class_id uuid REFERENCES public.classes(id);

-- Update the auto_assign_fee_to_students function to handle the missing trigger body
CREATE OR REPLACE FUNCTION public.auto_assign_fee_to_students()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Only auto-assign if class_id is specified
  IF NEW.class_id IS NOT NULL THEN
    PERFORM public.assign_fee_to_class_students(NEW.id);
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create the trigger if it doesn't exist
DROP TRIGGER IF EXISTS auto_assign_fee_trigger ON public.fees;
CREATE TRIGGER auto_assign_fee_trigger
  AFTER INSERT ON public.fees
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_assign_fee_to_students();

-- Fix the assign_fee_to_class_students function to handle the updated schema
CREATE OR REPLACE FUNCTION public.assign_fee_to_class_students(p_fee_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
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
  
  -- Only proceed if class_id is specified
  IF fee_record.class_id IS NULL THEN
    RETURN 0;
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
$function$;

-- Create a function to get outstanding fees for finance dashboard
CREATE OR REPLACE FUNCTION public.get_outstanding_fees(p_school_id UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  outstanding_amount NUMERIC := 0;
BEGIN
  SELECT COALESCE(SUM(f.amount - f.paid_amount), 0)
  INTO outstanding_amount
  FROM public.fees f
  WHERE f.school_id = p_school_id
  AND f.status != 'paid';
  
  RETURN outstanding_amount;
END;
$function$;
