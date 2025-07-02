-- Add critical indexes for Finance Dashboard performance optimization
-- These indexes will dramatically improve query performance for financial analytics

-- Index for fees table - most critical for finance queries
CREATE INDEX IF NOT EXISTS idx_fees_school_id_performance ON public.fees (school_id, created_at DESC, amount, paid_amount) WHERE amount IS NOT NULL;

-- Index for financial transactions - MPESA queries
CREATE INDEX IF NOT EXISTS idx_financial_transactions_school_payment ON public.financial_transactions (school_id, payment_method, created_at DESC) WHERE amount IS NOT NULL;

-- Index for students count queries
CREATE INDEX IF NOT EXISTS idx_students_school_active ON public.students (school_id, is_active) WHERE is_active = true;

-- Index for classes queries
CREATE INDEX IF NOT EXISTS idx_classes_school_basic ON public.classes (school_id, id, name);

-- Index for fee structures
CREATE INDEX IF NOT EXISTS idx_fee_structures_school_active ON public.fee_structures (school_id, is_active) WHERE is_active = true;

-- Index for mpesa transactions if table exists
CREATE INDEX IF NOT EXISTS idx_mpesa_transactions_school_date ON public.mpesa_transactions (school_id, transaction_date DESC) WHERE amount_paid IS NOT NULL;

-- Composite index for fee analysis by class
CREATE INDEX IF NOT EXISTS idx_fees_class_analysis ON public.fees (school_id, class_id, amount, paid_amount, due_date) WHERE class_id IS NOT NULL AND amount IS NOT NULL;