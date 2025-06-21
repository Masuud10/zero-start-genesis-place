
-- Create function to record fee payments
CREATE OR REPLACE FUNCTION public.record_fee_payment(
  p_student_fee_id UUID,
  p_amount NUMERIC,
  p_payment_method TEXT,
  p_reference_number TEXT DEFAULT NULL,
  p_mpesa_code TEXT DEFAULT NULL,
  p_bank_reference TEXT DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  student_fee_record RECORD;
  remaining_amount NUMERIC;
  new_status TEXT;
  transaction_id UUID;
BEGIN
  -- Get the student fee record
  SELECT * INTO student_fee_record
  FROM public.fees
  WHERE id = p_student_fee_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Student fee record not found');
  END IF;
  
  -- Calculate remaining amount
  remaining_amount := student_fee_record.amount - COALESCE(student_fee_record.paid_amount, 0) - p_amount;
  
  -- Determine new status
  IF remaining_amount <= 0 THEN
    new_status := 'paid';
  ELSIF COALESCE(student_fee_record.paid_amount, 0) + p_amount > 0 THEN
    new_status := 'partial';
  ELSE
    new_status := student_fee_record.status;
  END IF;
  
  -- Update the fee record
  UPDATE public.fees
  SET 
    paid_amount = COALESCE(paid_amount, 0) + p_amount,
    status = new_status,
    paid_date = CASE WHEN new_status = 'paid' THEN CURRENT_DATE ELSE paid_date END,
    payment_method = CASE WHEN new_status = 'paid' THEN p_payment_method ELSE payment_method END,
    mpesa_code = CASE WHEN p_mpesa_code IS NOT NULL THEN p_mpesa_code ELSE mpesa_code END,
    updated_at = NOW()
  WHERE id = p_student_fee_id;
  
  -- Create financial transaction record
  INSERT INTO public.financial_transactions (
    school_id, student_id, fee_id, transaction_type, amount, 
    payment_method, reference_number, mpesa_code, bank_reference,
    processed_by, academic_year, term
  ) VALUES (
    student_fee_record.school_id, student_fee_record.student_id, p_student_fee_id,
    'payment', p_amount, p_payment_method, p_reference_number, p_mpesa_code, 
    p_bank_reference, auth.uid(), student_fee_record.academic_year, student_fee_record.term
  ) RETURNING id INTO transaction_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'transaction_id', transaction_id,
    'new_status', new_status,
    'total_paid', COALESCE(student_fee_record.paid_amount, 0) + p_amount,
    'remaining_amount', GREATEST(remaining_amount, 0)
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('error', SQLERRM);
END;
$$;

-- Create function to get outstanding fees summary
CREATE OR REPLACE FUNCTION public.get_outstanding_fees(p_school_id UUID)
RETURNS NUMERIC
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(SUM(amount - COALESCE(paid_amount, 0)), 0)
  FROM public.fees
  WHERE school_id = p_school_id AND status != 'paid';
$$;

-- Create function to assign fees to class
CREATE OR REPLACE FUNCTION public.assign_fee_to_class(
  p_class_id UUID,
  p_fee_data JSONB
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  student_record RECORD;
  fee_id UUID;
  assigned_count INTEGER := 0;
  school_id_val UUID;
BEGIN
  -- Get school_id from class
  SELECT school_id INTO school_id_val FROM public.classes WHERE id = p_class_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Class not found');
  END IF;
  
  -- Create fee entries for all students in the class
  FOR student_record IN 
    SELECT id FROM public.students 
    WHERE class_id = p_class_id AND is_active = true
  LOOP
    INSERT INTO public.fees (
      school_id, student_id, class_id, amount, due_date, 
      academic_year, term, category, status
    ) VALUES (
      school_id_val, student_record.id, p_class_id,
      (p_fee_data->>'amount')::NUMERIC,
      (p_fee_data->>'due_date')::DATE,
      p_fee_data->>'academic_year',
      p_fee_data->>'term',
      COALESCE(p_fee_data->>'category', 'tuition'),
      'pending'
    );
    
    assigned_count := assigned_count + 1;
  END LOOP;
  
  RETURN jsonb_build_object(
    'success', true, 
    'assigned_count', assigned_count,
    'message', format('Fee assigned to %s students', assigned_count)
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('error', SQLERRM);
END;
$$;
