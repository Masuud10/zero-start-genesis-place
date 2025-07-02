-- Optimize Finance Dashboard Performance with Strategic Indexes

-- Add performance indexes for fees table (most critical)
CREATE INDEX IF NOT EXISTS idx_fees_school_performance ON public.fees(school_id, created_at DESC) WHERE amount IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_fees_payment_status ON public.fees(school_id, paid_amount, due_date) WHERE amount IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_fees_student_lookup ON public.fees(student_id, class_id) WHERE school_id IS NOT NULL;

-- Add indexes for students table performance
CREATE INDEX IF NOT EXISTS idx_students_school_active ON public.students(school_id, is_active) WHERE is_active = true;

-- Add indexes for classes table
CREATE INDEX IF NOT EXISTS idx_classes_school_lookup ON public.classes(school_id, id);

-- Add indexes for expenses table
CREATE INDEX IF NOT EXISTS idx_expenses_school_date ON public.expenses(school_id, date DESC) WHERE amount IS NOT NULL;

-- Add indexes for MPESA transactions if table exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'mpesa_transactions') THEN
        CREATE INDEX IF NOT EXISTS idx_mpesa_school_status ON public.mpesa_transactions(school_id, transaction_status, transaction_date DESC);
    END IF;
END $$;

-- Add indexes for financial_transactions if table exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'financial_transactions') THEN
        CREATE INDEX IF NOT EXISTS idx_financial_trans_school ON public.financial_transactions(school_id, payment_method, status) WHERE amount IS NOT NULL;
    END IF;
END $$;

-- Update table statistics for query planner
ANALYZE public.fees;
ANALYZE public.students; 
ANALYZE public.classes;
ANALYZE public.expenses;