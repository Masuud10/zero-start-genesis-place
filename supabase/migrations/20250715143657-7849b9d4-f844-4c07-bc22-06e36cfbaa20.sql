-- Finance Officer Dashboard Critical Database Security Fixes (Corrected)

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
WHERE amount_paid IS NOT NULL;

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