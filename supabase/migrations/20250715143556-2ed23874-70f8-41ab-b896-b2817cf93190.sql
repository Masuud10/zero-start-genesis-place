-- Finance Officer Dashboard Critical Database Security Fixes

-- CRITICAL FIX 1: Create secure finance officer authorization function
CREATE OR REPLACE FUNCTION public.is_finance_officer_authorized_for_school(p_school_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT CASE 
    WHEN (get_current_user_role() = ANY(ARRAY['elimisha_admin', 'edufam_admin'])) THEN true
    WHEN (get_current_user_role() = ANY(ARRAY['finance_officer', 'principal', 'school_owner'])) 
         AND (get_current_user_school_id() = p_school_id) THEN true
    ELSE false
  END;
$$;

-- CRITICAL FIX 2: Create finance data validation function
CREATE OR REPLACE FUNCTION public.validate_finance_officer_transaction(
    p_transaction_data jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    v_user_role text;
    v_user_school_id uuid;
    v_school_id uuid;
    v_amount numeric;
    v_student_id uuid;
BEGIN
    -- Get user context
    SELECT role, school_id INTO v_user_role, v_user_school_id
    FROM public.profiles WHERE id = auth.uid();
    
    -- Extract transaction data
    v_school_id := (p_transaction_data->>'school_id')::uuid;
    v_amount := (p_transaction_data->>'amount')::numeric;
    v_student_id := (p_transaction_data->>'student_id')::uuid;
    
    -- Validation 1: Required fields
    IF v_school_id IS NULL OR v_amount IS NULL THEN
        RETURN jsonb_build_object('valid', false, 'error', 'Missing required fields: school_id or amount');
    END IF;
    
    -- Validation 2: Amount validation (must be positive)
    IF v_amount <= 0 THEN
        RETURN jsonb_build_object('valid', false, 'error', 'Amount must be greater than zero');
    END IF;
    
    -- Validation 3: Finance officer school authorization (most critical)
    IF v_user_role = 'finance_officer' THEN
        IF NOT public.is_finance_officer_authorized_for_school(v_school_id) THEN
            RETURN jsonb_build_object('valid', false, 'error', 'Finance officer not authorized for this school');
        END IF;
    END IF;
    
    -- Validation 4: Student belongs to the school (if student_id provided)
    IF v_student_id IS NOT NULL THEN
        IF NOT EXISTS (
            SELECT 1 FROM public.students 
            WHERE id = v_student_id 
            AND school_id = v_school_id 
            AND is_active = true
        ) THEN
            RETURN jsonb_build_object('valid', false, 'error', 'Student not found in the specified school');
        END IF;
    END IF;
    
    RETURN jsonb_build_object('valid', true, 'message', 'Transaction data is valid');
END;
$$;

-- CRITICAL FIX 3: Add missing performance indexes for finance officer operations
CREATE INDEX IF NOT EXISTS idx_fees_finance_officer_lookup 
ON public.fees (school_id, category, status, due_date DESC) 
WHERE amount IS NOT NULL AND student_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_financial_transactions_finance_officer 
ON public.financial_transactions (school_id, payment_method, processed_at DESC) 
WHERE amount IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_student_fees_finance_officer 
ON public.student_fees (school_id, status, due_date DESC) 
WHERE amount IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_expenses_finance_officer_reports 
ON public.expenses (school_id, category, date DESC, approved_by) 
WHERE amount IS NOT NULL;

-- CRITICAL FIX 4: Clean up and consolidate RLS policies on fees table
-- Drop redundant policies first
DROP POLICY IF EXISTS "Fees school access" ON public.fees;
DROP POLICY IF EXISTS "Multi-tenant fees access" ON public.fees;
DROP POLICY IF EXISTS "School isolation policy" ON public.fees;

-- Create single, comprehensive policy for fees table
CREATE POLICY "Finance officers can manage fees for their school" 
ON public.fees 
FOR ALL 
USING (
  -- System admins can access all
  (get_current_user_role() = ANY (ARRAY['elimisha_admin', 'edufam_admin'])) OR
  -- School admins can access their school's data
  ((get_current_user_role() = ANY (ARRAY['principal', 'school_owner', 'finance_officer'])) 
   AND (school_id = get_current_user_school_id())) OR
  -- Parents can view their children's fees
  ((get_current_user_role() = 'parent') AND 
   (student_id IN (SELECT student_id FROM public.parent_students WHERE parent_id = auth.uid())))
)
WITH CHECK (
  -- System admins can modify all
  (get_current_user_role() = ANY (ARRAY['elimisha_admin', 'edufam_admin'])) OR
  -- Finance officers, principals, and school owners can modify their school's fees
  ((get_current_user_role() = ANY (ARRAY['finance_officer', 'principal', 'school_owner'])) 
   AND (school_id = get_current_user_school_id()))
);

-- CRITICAL FIX 5: Clean up and consolidate RLS policies on financial_transactions table
-- Drop redundant policies first
DROP POLICY IF EXISTS "Multi-tenant financial_transactions access" ON public.financial_transactions;
DROP POLICY IF EXISTS "School isolation for financial_transactions" ON public.financial_transactions;

-- Create single, comprehensive policy for financial_transactions table
CREATE POLICY "Finance officers can manage transactions for their school" 
ON public.financial_transactions 
FOR ALL 
USING (
  -- System admins can access all
  (get_current_user_role() = ANY (ARRAY['elimisha_admin', 'edufam_admin'])) OR
  -- School admins can access their school's data
  ((get_current_user_role() = ANY (ARRAY['principal', 'school_owner', 'finance_officer'])) 
   AND (school_id = get_current_user_school_id())) OR
  -- Parents can view their children's transactions
  ((get_current_user_role() = 'parent') AND 
   ((student_id IN (SELECT student_id FROM public.parent_students WHERE parent_id = auth.uid())) OR
    (fee_id IN (SELECT id FROM public.fees WHERE student_id IN 
     (SELECT student_id FROM public.parent_students WHERE parent_id = auth.uid())))))
)
WITH CHECK (
  -- System admins can modify all
  (get_current_user_role() = ANY (ARRAY['elimisha_admin', 'edufam_admin'])) OR
  -- Finance officers, principals, and school owners can modify their school's transactions
  ((get_current_user_role() = ANY (ARRAY['finance_officer', 'principal', 'school_owner'])) 
   AND (school_id = get_current_user_school_id()))
);

-- CRITICAL FIX 6: Enhanced fee payment recording function with proper validation
CREATE OR REPLACE FUNCTION public.record_fee_payment(
    p_student_fee_id uuid,
    p_amount numeric,
    p_payment_method text,
    p_reference_number text DEFAULT NULL,
    p_mpesa_code text DEFAULT NULL,
    p_bank_reference text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    v_user_role text;
    v_user_school_id uuid;
    v_fee_record record;
    v_new_paid_amount numeric;
    v_new_status text;
    v_transaction_id uuid;
BEGIN
    -- Get user context
    SELECT role, school_id INTO v_user_role, v_user_school_id
    FROM public.profiles WHERE id = auth.uid();
    
    -- Validate user has finance permissions
    IF v_user_role NOT IN ('finance_officer', 'principal', 'school_owner', 'elimisha_admin', 'edufam_admin') THEN
        RETURN jsonb_build_object('error', 'Insufficient permissions to record payments');
    END IF;
    
    -- Get the fee record with school validation
    SELECT sf.*, f.amount as fee_amount, f.school_id
    INTO v_fee_record
    FROM public.student_fees sf
    JOIN public.fees f ON sf.fee_id = f.id
    WHERE sf.id = p_student_fee_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('error', 'Student fee record not found');
    END IF;
    
    -- Validate school access for non-admin users
    IF v_user_role NOT IN ('elimisha_admin', 'edufam_admin') THEN
        IF v_fee_record.school_id != v_user_school_id THEN
            RETURN jsonb_build_object('error', 'Cannot record payment for other schools');
        END IF;
    END IF;
    
    -- Validate payment amount
    IF p_amount <= 0 THEN
        RETURN jsonb_build_object('error', 'Payment amount must be greater than zero');
    END IF;
    
    -- Calculate new paid amount
    v_new_paid_amount := COALESCE(v_fee_record.paid_amount, 0) + p_amount;
    
    -- Determine new status
    IF v_new_paid_amount >= v_fee_record.fee_amount THEN
        v_new_status := 'paid';
    ELSIF v_new_paid_amount > 0 THEN
        v_new_status := 'partial';
    ELSE
        v_new_status := 'pending';
    END IF;
    
    -- Update the student fee record
    UPDATE public.student_fees 
    SET 
        paid_amount = v_new_paid_amount,
        status = v_new_status,
        updated_at = now()
    WHERE id = p_student_fee_id;
    
    -- Create transaction record
    INSERT INTO public.financial_transactions (
        school_id,
        student_id,
        fee_id,
        transaction_type,
        amount,
        payment_method,
        reference_number,
        mpesa_code,
        bank_reference,
        processed_by,
        processed_at,
        academic_year,
        term
    ) VALUES (
        v_fee_record.school_id,
        v_fee_record.student_id,
        v_fee_record.fee_id,
        'payment',
        p_amount,
        p_payment_method,
        p_reference_number,
        p_mpesa_code,
        p_bank_reference,
        auth.uid(),
        now(),
        EXTRACT(year FROM now())::text,
        'term_1' -- Default term, should be parameterized
    ) RETURNING id INTO v_transaction_id;
    
    -- Log the action for audit trail
    INSERT INTO public.audit_logs (
        action, 
        target_entity, 
        performed_by_user_id, 
        performed_by_role,
        school_id,
        metadata
    ) VALUES (
        'FEE_PAYMENT_RECORDED',
        'student_fees',
        auth.uid(),
        v_user_role,
        v_user_school_id,
        jsonb_build_object(
            'student_fee_id', p_student_fee_id,
            'amount', p_amount,
            'payment_method', p_payment_method,
            'new_status', v_new_status,
            'transaction_id', v_transaction_id
        )
    );
    
    RETURN jsonb_build_object(
        'success', true,
        'transaction_id', v_transaction_id,
        'new_status', v_new_status,
        'total_paid', v_new_paid_amount,
        'remaining_amount', GREATEST(0, v_fee_record.fee_amount - v_new_paid_amount)
    );
END;
$$;