
-- First, let's check if the foreign key constraint exists and add it if missing
-- Also ensure the mpesa_transactions table has the correct structure

-- Add foreign key constraint for student_id if it doesn't exist
DO $$ 
BEGIN
    -- Check if foreign key constraint exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'mpesa_transactions_student_id_fkey' 
        AND table_name = 'mpesa_transactions'
    ) THEN
        -- Add the foreign key constraint
        ALTER TABLE public.mpesa_transactions 
        ADD CONSTRAINT mpesa_transactions_student_id_fkey 
        FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Add foreign key constraint for class_id if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'mpesa_transactions_class_id_fkey' 
        AND table_name = 'mpesa_transactions'
    ) THEN
        ALTER TABLE public.mpesa_transactions 
        ADD CONSTRAINT mpesa_transactions_class_id_fkey 
        FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Add foreign key constraint for school_id if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'mpesa_transactions_school_id_fkey' 
        AND table_name = 'mpesa_transactions'
    ) THEN
        ALTER TABLE public.mpesa_transactions 
        ADD CONSTRAINT mpesa_transactions_school_id_fkey 
        FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add foreign key constraint for fee_id if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'mpesa_transactions_fee_id_fkey' 
        AND table_name = 'mpesa_transactions'
    ) THEN
        ALTER TABLE public.mpesa_transactions 
        ADD CONSTRAINT mpesa_transactions_fee_id_fkey 
        FOREIGN KEY (fee_id) REFERENCES public.fees(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Ensure RLS policies exist for mpesa_transactions
CREATE POLICY "Finance officers can view mpesa transactions" 
ON public.mpesa_transactions FOR SELECT 
USING (
    public.get_current_user_role() IN ('finance_officer', 'principal', 'school_owner') 
    AND school_id = public.get_current_user_school_id()
);

CREATE POLICY "Finance officers can manage mpesa transactions" 
ON public.mpesa_transactions FOR ALL 
USING (
    public.get_current_user_role() IN ('finance_officer', 'principal', 'school_owner') 
    AND school_id = public.get_current_user_school_id()
);

-- Create function to record fee payment from MPESA
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
    v_fee_record RECORD;
    v_transaction_id UUID;
BEGIN
    -- Get the fee record
    SELECT * INTO v_fee_record 
    FROM public.fees 
    WHERE id = p_student_fee_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('error', 'Fee record not found');
    END IF;
    
    -- Update the fee record
    UPDATE public.fees 
    SET 
        paid_amount = COALESCE(paid_amount, 0) + p_amount,
        payment_method = p_payment_method,
        mpesa_code = COALESCE(p_mpesa_code, mpesa_code),
        paid_date = CASE WHEN paid_date IS NULL THEN CURRENT_DATE ELSE paid_date END,
        status = CASE 
            WHEN (COALESCE(paid_amount, 0) + p_amount) >= amount THEN 'paid'
            WHEN (COALESCE(paid_amount, 0) + p_amount) > 0 THEN 'partial'
            ELSE 'pending'
        END,
        updated_at = now()
    WHERE id = p_student_fee_id;
    
    -- Create financial transaction record
    INSERT INTO public.financial_transactions (
        school_id, student_id, fee_id, amount, transaction_type,
        payment_method, mpesa_code, reference_number, bank_reference,
        academic_year, term, description
    ) VALUES (
        v_fee_record.school_id, v_fee_record.student_id, p_student_fee_id,
        p_amount, 'payment', p_payment_method, p_mpesa_code,
        p_reference_number, p_bank_reference, v_fee_record.academic_year,
        v_fee_record.term, 'Fee payment via ' || p_payment_method
    ) RETURNING id INTO v_transaction_id;
    
    RETURN jsonb_build_object(
        'success', true,
        'transaction_id', v_transaction_id,
        'message', 'Payment recorded successfully'
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('error', 'Failed to record payment: ' || SQLERRM);
END;
$$;
