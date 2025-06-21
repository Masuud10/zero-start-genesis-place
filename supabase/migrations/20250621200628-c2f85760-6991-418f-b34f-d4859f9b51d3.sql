
-- Create MPESA transactions table
CREATE TABLE IF NOT EXISTS public.mpesa_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id TEXT UNIQUE,
  mpesa_receipt_number TEXT,
  phone_number TEXT NOT NULL,
  amount_paid NUMERIC NOT NULL,
  fee_id UUID,
  student_id UUID,
  class_id UUID,
  transaction_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  transaction_status TEXT CHECK (transaction_status IN ('Success', 'Failed', 'Pending')),
  payment_type TEXT CHECK (payment_type IN ('Full', 'Installment')),
  paybill_number TEXT,
  school_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create MPESA API credentials table
CREATE TABLE IF NOT EXISTS public.mpesa_api_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL UNIQUE,
  consumer_key TEXT NOT NULL,
  consumer_secret TEXT NOT NULL,
  passkey TEXT NOT NULL,
  paybill_number TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.mpesa_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mpesa_api_credentials ENABLE ROW LEVEL SECURITY;

-- RLS policies for mpesa_transactions
CREATE POLICY "Users can view their school's MPESA transactions" ON public.mpesa_transactions
  FOR SELECT USING (
    school_id = public.get_current_user_school_id() OR 
    public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin') OR
    student_id IN (
      SELECT ps.student_id FROM public.parent_students ps 
      WHERE ps.parent_id = auth.uid()
    )
  );

CREATE POLICY "Finance officers can manage MPESA transactions" ON public.mpesa_transactions
  FOR ALL USING (
    (school_id = public.get_current_user_school_id() AND 
     public.get_current_user_role() IN ('finance_officer', 'principal', 'school_owner')) OR 
    public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin')
  );

-- RLS policies for mpesa_api_credentials
CREATE POLICY "Finance officers can view their school's MPESA credentials" ON public.mpesa_api_credentials
  FOR SELECT USING (
    (school_id = public.get_current_user_school_id() AND 
     public.get_current_user_role() IN ('finance_officer', 'principal', 'school_owner')) OR 
    public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin')
  );

CREATE POLICY "Finance officers can manage their school's MPESA credentials" ON public.mpesa_api_credentials
  FOR ALL USING (
    (school_id = public.get_current_user_school_id() AND 
     public.get_current_user_role() IN ('finance_officer', 'principal', 'school_owner')) OR 
    public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin')
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_mpesa_transactions_school_id ON public.mpesa_transactions(school_id);
CREATE INDEX IF NOT EXISTS idx_mpesa_transactions_student_id ON public.mpesa_transactions(student_id);
CREATE INDEX IF NOT EXISTS idx_mpesa_transactions_status ON public.mpesa_transactions(transaction_status);
CREATE INDEX IF NOT EXISTS idx_mpesa_transactions_date ON public.mpesa_transactions(transaction_date);

-- Function to initiate MPESA STK Push
CREATE OR REPLACE FUNCTION public.initiate_mpesa_payment(
  p_phone_number TEXT,
  p_amount NUMERIC,
  p_student_fee_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_student_fee RECORD;
  v_transaction_id TEXT;
  v_result JSONB;
BEGIN
  -- Get student fee details
  SELECT sf.*, s.school_id, s.class_id, s.id as student_id
  INTO v_student_fee 
  FROM public.student_fees sf
  JOIN public.students s ON sf.student_id = s.id
  WHERE sf.id = p_student_fee_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Student fee record not found');
  END IF;
  
  -- Generate transaction ID
  v_transaction_id := 'TXN-' || EXTRACT(EPOCH FROM now())::TEXT || '-' || 
                     LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  
  -- Insert pending transaction record
  INSERT INTO public.mpesa_transactions (
    transaction_id, phone_number, amount_paid, fee_id, student_id, 
    class_id, school_id, transaction_status, payment_type
  ) VALUES (
    v_transaction_id, p_phone_number, p_amount, p_student_fee_id, 
    v_student_fee.student_id, v_student_fee.class_id, v_student_fee.school_id, 
    'Pending', CASE WHEN p_amount >= v_student_fee.amount THEN 'Full' ELSE 'Installment' END
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'transaction_id', v_transaction_id,
    'message', 'Payment initiated successfully'
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('error', 'Failed to initiate payment: ' || SQLERRM);
END;
$$;

-- Function to update MPESA transaction status
CREATE OR REPLACE FUNCTION public.update_mpesa_transaction(
  p_transaction_id TEXT,
  p_mpesa_receipt_number TEXT,
  p_status TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_transaction RECORD;
BEGIN
  -- Update transaction status
  UPDATE public.mpesa_transactions 
  SET 
    mpesa_receipt_number = p_mpesa_receipt_number,
    transaction_status = p_status,
    updated_at = now()
  WHERE transaction_id = p_transaction_id
  RETURNING * INTO v_transaction;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Transaction not found');
  END IF;
  
  -- If successful, update student fee payment
  IF p_status = 'Success' AND v_transaction.fee_id IS NOT NULL THEN
    PERFORM public.record_fee_payment(
      v_transaction.fee_id,
      v_transaction.amount_paid,
      'mpesa',
      NULL,
      p_mpesa_receipt_number,
      NULL
    );
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Transaction updated successfully'
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('error', 'Failed to update transaction: ' || SQLERRM);
END;
$$;
