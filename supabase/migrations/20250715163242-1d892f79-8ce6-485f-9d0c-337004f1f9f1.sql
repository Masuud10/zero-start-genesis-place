-- Phase 1: Add approval workflow columns to expenses table

-- Add a status column to track the workflow state
ALTER TABLE public.expenses
ADD COLUMN status TEXT NOT NULL DEFAULT 'draft'; -- Possible values: 'draft', 'pending_approval', 'approved', 'rejected'

-- Add columns to track who approved it and when
ALTER TABLE public.expenses
ADD COLUMN approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN approval_date TIMESTAMPTZ,
ADD COLUMN rejection_reason TEXT; -- To store why an expense was rejected

-- Create a CHECK constraint to enforce valid status values
ALTER TABLE public.expenses
ADD CONSTRAINT valid_expense_status CHECK (status IN ('draft', 'pending_approval', 'approved', 'rejected'));

-- Add index for efficient querying by status
CREATE INDEX idx_expenses_status ON public.expenses(status);
CREATE INDEX idx_expenses_school_status ON public.expenses(school_id, status);

-- Add comments for documentation
COMMENT ON COLUMN public.expenses.status IS 'Expense approval workflow status: draft, pending_approval, approved, rejected';
COMMENT ON COLUMN public.expenses.approved_by IS 'User ID of the school owner who approved/rejected the expense';
COMMENT ON COLUMN public.expenses.approval_date IS 'Timestamp when the expense was approved or rejected';
COMMENT ON COLUMN public.expenses.rejection_reason IS 'Reason provided when expense is rejected';