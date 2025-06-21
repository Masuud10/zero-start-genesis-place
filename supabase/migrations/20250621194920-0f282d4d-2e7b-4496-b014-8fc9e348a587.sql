
-- Create student_fees table to link students with their fees
CREATE TABLE IF NOT EXISTS public.student_fees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  school_id UUID NOT NULL,
  fee_structure_id UUID,
  class_id UUID,
  amount NUMERIC NOT NULL DEFAULT 0,
  amount_paid NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'unpaid' CHECK (status IN ('paid', 'unpaid', 'partial', 'overdue')),
  due_date DATE NOT NULL,
  academic_year TEXT NOT NULL,
  term TEXT NOT NULL,
  installment_plan JSONB DEFAULT '{}',
  discount_amount NUMERIC DEFAULT 0,
  discount_type TEXT DEFAULT 'none' CHECK (discount_type IN ('none', 'percentage', 'fixed')),
  late_fee_applied NUMERIC DEFAULT 0,
  payment_method TEXT,
  payment_date DATE,
  receipt_number TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create payment_receipts table
CREATE TABLE IF NOT EXISTS public.payment_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_fee_id UUID NOT NULL,
  school_id UUID NOT NULL,
  student_id UUID NOT NULL,
  receipt_number TEXT NOT NULL UNIQUE,
  payment_amount NUMERIC NOT NULL,
  payment_method TEXT NOT NULL,
  payment_date DATE NOT NULL,
  processed_by UUID,
  receipt_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create audit_logs table for financial activities
CREATE TABLE IF NOT EXISTS public.financial_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL,
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.student_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for student_fees
CREATE POLICY "Users can view their school's student fees" ON public.student_fees
  FOR SELECT USING (
    school_id = public.get_current_user_school_id() OR 
    public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin')
  );

CREATE POLICY "Finance officers can manage student fees" ON public.student_fees
  FOR ALL USING (
    (school_id = public.get_current_user_school_id() AND 
     public.get_current_user_role() IN ('finance_officer', 'principal', 'school_owner')) OR 
    public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin')
  );

-- RLS policies for payment_receipts
CREATE POLICY "Users can view their school's payment receipts" ON public.payment_receipts
  FOR SELECT USING (
    school_id = public.get_current_user_school_id() OR 
    public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin')
  );

CREATE POLICY "Finance officers can manage payment receipts" ON public.payment_receipts
  FOR ALL USING (
    (school_id = public.get_current_user_school_id() AND 
     public.get_current_user_role() IN ('finance_officer', 'principal', 'school_owner')) OR 
    public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin')
  );

-- RLS policies for financial_audit_logs
CREATE POLICY "Users can view their school's financial audit logs" ON public.financial_audit_logs
  FOR SELECT USING (
    school_id = public.get_current_user_school_id() OR 
    public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin')
  );

CREATE POLICY "System can insert audit logs" ON public.financial_audit_logs
  FOR INSERT WITH CHECK (true);

-- Function to record fee payment
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
  v_student_fee RECORD;
  v_receipt_number TEXT;
  v_new_paid_amount NUMERIC;
  v_new_status TEXT;
  v_remaining_amount NUMERIC;
BEGIN
  -- Get student fee details
  SELECT * INTO v_student_fee 
  FROM public.student_fees 
  WHERE id = p_student_fee_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Student fee record not found');
  END IF;
  
  -- Calculate new amounts
  v_new_paid_amount := COALESCE(v_student_fee.amount_paid, 0) + p_amount;
  v_remaining_amount := v_student_fee.amount - v_new_paid_amount;
  
  -- Determine new status
  IF v_remaining_amount <= 0 THEN
    v_new_status := 'paid';
  ELSIF v_new_paid_amount > 0 THEN
    v_new_status := 'partial';
  ELSE
    v_new_status := 'unpaid';
  END IF;
  
  -- Generate receipt number
  v_receipt_number := 'RCP-' || EXTRACT(YEAR FROM now()) || '-' || 
                     LPAD(EXTRACT(DOY FROM now())::TEXT, 3, '0') || '-' || 
                     LPAD(EXTRACT(EPOCH FROM now())::TEXT, 10, '0');
  
  -- Update student fee record
  UPDATE public.student_fees 
  SET 
    amount_paid = v_new_paid_amount,
    status = v_new_status,
    payment_method = p_payment_method,
    payment_date = CURRENT_DATE,
    receipt_number = v_receipt_number,
    updated_at = now()
  WHERE id = p_student_fee_id;
  
  -- Create payment receipt
  INSERT INTO public.payment_receipts (
    student_fee_id, school_id, student_id, receipt_number,
    payment_amount, payment_method, payment_date, processed_by,
    receipt_data
  ) VALUES (
    p_student_fee_id, v_student_fee.school_id, v_student_fee.student_id, v_receipt_number,
    p_amount, p_payment_method, CURRENT_DATE, auth.uid(),
    jsonb_build_object(
      'reference_number', p_reference_number,
      'mpesa_code', p_mpesa_code,
      'bank_reference', p_bank_reference
    )
  );
  
  -- Record financial transaction
  INSERT INTO public.financial_transactions (
    school_id, student_id, fee_id, transaction_type, amount,
    payment_method, reference_number, mpesa_code, bank_reference,
    academic_year, term, processed_by
  ) VALUES (
    v_student_fee.school_id, v_student_fee.student_id, p_student_fee_id, 
    'payment', p_amount, p_payment_method, p_reference_number, 
    p_mpesa_code, p_bank_reference, v_student_fee.academic_year, 
    v_student_fee.term, auth.uid()
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'transaction_id', v_receipt_number,
    'new_status', v_new_status,
    'total_paid', v_new_paid_amount,
    'remaining_amount', GREATEST(v_remaining_amount, 0)
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('error', 'Failed to record payment: ' || SQLERRM);
END;
$$;

-- Function to generate finance report
CREATE OR REPLACE FUNCTION public.generate_finance_report(
  p_report_type TEXT,
  p_school_id UUID DEFAULT NULL,
  p_class_id UUID DEFAULT NULL,
  p_student_id UUID DEFAULT NULL,
  p_academic_year TEXT DEFAULT NULL,
  p_term TEXT DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
  v_user_school_id UUID;
  v_user_role TEXT;
BEGIN
  -- Get user context
  SELECT school_id, role INTO v_user_school_id, v_user_role
  FROM public.profiles WHERE id = auth.uid();
  
  -- Set school_id if not provided (for non-admin users)
  IF p_school_id IS NULL AND v_user_role NOT IN ('elimisha_admin', 'edufam_admin') THEN
    p_school_id := v_user_school_id;
  END IF;
  
  -- Generate report based on type
  CASE p_report_type
    WHEN 'school_financial' THEN
      SELECT jsonb_build_object(
        'report_type', 'school_financial',
        'generated_at', now(),
        'school', jsonb_build_object(
          'id', s.id,
          'name', s.name
        ),
        'academic_year', COALESCE(p_academic_year, EXTRACT(YEAR FROM now())::TEXT),
        'term', p_term,
        'summary', jsonb_build_object(
          'total_fees', COALESCE(SUM(sf.amount), 0),
          'total_collected', COALESCE(SUM(sf.amount_paid), 0),
          'outstanding', COALESCE(SUM(sf.amount - sf.amount_paid), 0),
          'total_students', COUNT(DISTINCT sf.student_id),
          'collection_rate', 
            CASE 
              WHEN SUM(sf.amount) > 0 THEN ROUND((SUM(sf.amount_paid) / SUM(sf.amount)) * 100, 2)
              ELSE 0 
            END
        ),
        'expenses', jsonb_build_object(
          'total_expenses', COALESCE((SELECT SUM(amount) FROM public.expenses WHERE school_id = p_school_id), 0)
        )
      ) INTO v_result
      FROM public.schools s
      LEFT JOIN public.student_fees sf ON sf.school_id = s.id
        AND (p_academic_year IS NULL OR sf.academic_year = p_academic_year)
        AND (p_term IS NULL OR sf.term = p_term)
      WHERE s.id = p_school_id
      GROUP BY s.id, s.name;
      
    WHEN 'class_financial' THEN
      SELECT jsonb_build_object(
        'report_type', 'class_financial',
        'generated_at', now(),
        'class_breakdown', jsonb_agg(
          jsonb_build_object(
            'class_name', c.name,
            'total_fees', COALESCE(SUM(sf.amount), 0),
            'collected', COALESCE(SUM(sf.amount_paid), 0),
            'outstanding', COALESCE(SUM(sf.amount - sf.amount_paid), 0),
            'student_count', COUNT(DISTINCT sf.student_id)
          )
        )
      ) INTO v_result
      FROM public.classes c
      LEFT JOIN public.student_fees sf ON sf.class_id = c.id
        AND (p_academic_year IS NULL OR sf.academic_year = p_academic_year)
        AND (p_term IS NULL OR sf.term = p_term)
      WHERE c.school_id = p_school_id
        AND (p_class_id IS NULL OR c.id = p_class_id)
      GROUP BY c.id, c.name;
      
    ELSE
      v_result := jsonb_build_object('error', 'Unsupported report type');
  END CASE;
  
  RETURN COALESCE(v_result, jsonb_build_object('error', 'No data found'));
  
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('error', 'Report generation failed: ' || SQLERRM);
END;
$$;

-- Function to get outstanding fees by school
CREATE OR REPLACE FUNCTION public.get_outstanding_fees(p_school_id UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_outstanding NUMERIC;
BEGIN
  SELECT COALESCE(SUM(amount - amount_paid), 0)
  INTO v_outstanding
  FROM public.student_fees
  WHERE school_id = p_school_id AND status != 'paid';
  
  RETURN v_outstanding;
END;
$$;

-- Trigger to automatically set school_id for student_fees
CREATE OR REPLACE FUNCTION public.auto_set_school_id_for_student_fees()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_school_id UUID;
  user_role TEXT;
BEGIN
  -- Get current user's school_id and role
  SELECT school_id, role INTO user_school_id, user_role
  FROM public.profiles 
  WHERE id = auth.uid();

  -- For non-admin users, automatically set school_id
  IF user_role NOT IN ('elimisha_admin', 'edufam_admin') THEN
    -- Set school_id if not already set
    IF NEW.school_id IS NULL THEN
      NEW.school_id := user_school_id;
    -- Prevent users from setting school_id to other schools
    ELSIF NEW.school_id != user_school_id THEN
      RAISE EXCEPTION 'Cannot create records for other schools';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_auto_set_school_id_student_fees ON public.student_fees;
CREATE TRIGGER trigger_auto_set_school_id_student_fees
  BEFORE INSERT OR UPDATE ON public.student_fees
  FOR EACH ROW EXECUTE FUNCTION public.auto_set_school_id_for_student_fees();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_student_fees_school_id ON public.student_fees(school_id);
CREATE INDEX IF NOT EXISTS idx_student_fees_student_id ON public.student_fees(student_id);
CREATE INDEX IF NOT EXISTS idx_student_fees_status ON public.student_fees(status);
CREATE INDEX IF NOT EXISTS idx_payment_receipts_school_id ON public.payment_receipts(school_id);
CREATE INDEX IF NOT EXISTS idx_financial_audit_logs_school_id ON public.financial_audit_logs(school_id);
