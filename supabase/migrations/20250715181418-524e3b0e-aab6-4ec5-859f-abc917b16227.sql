-- Phase 1: Add missing approval workflow columns to expenses table
-- Only add columns that don't already exist

-- Add columns to track who approved it and when (if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'expenses' AND column_name = 'approved_by') THEN
        ALTER TABLE public.expenses ADD COLUMN approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'expenses' AND column_name = 'approval_date') THEN
        ALTER TABLE public.expenses ADD COLUMN approval_date TIMESTAMPTZ;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'expenses' AND column_name = 'rejection_reason') THEN
        ALTER TABLE public.expenses ADD COLUMN rejection_reason TEXT;
    END IF;
END $$;

-- Update the check constraint to include the new status values if not already present
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints WHERE constraint_name = 'valid_expense_status') THEN
        ALTER TABLE public.expenses ADD CONSTRAINT valid_expense_status CHECK (status IN ('draft', 'pending_approval', 'approved', 'rejected'));
    END IF;
END $$;

-- Update existing expenses to have 'approved' status if they currently have invalid status
UPDATE public.expenses SET status = 'approved' WHERE status NOT IN ('draft', 'pending_approval', 'approved', 'rejected');

-- Create indexes for faster queries if they don't exist
CREATE INDEX IF NOT EXISTS idx_expenses_status ON public.expenses(status);
CREATE INDEX IF NOT EXISTS idx_expenses_pending_approval ON public.expenses(school_id, status) WHERE status = 'pending_approval';