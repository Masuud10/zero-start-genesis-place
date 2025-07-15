-- Phase 1: Add approval workflow columns to expenses table

-- Add status column to track the workflow state
ALTER TABLE public.expenses
ADD COLUMN status TEXT NOT NULL DEFAULT 'draft';

-- Add columns to track who approved it and when
ALTER TABLE public.expenses
ADD COLUMN approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN approval_date TIMESTAMPTZ,
ADD COLUMN rejection_reason TEXT;

-- Create a CHECK constraint to enforce valid status values
ALTER TABLE public.expenses
ADD CONSTRAINT valid_expense_status CHECK (status IN ('draft', 'pending_approval', 'approved', 'rejected'));

-- Update existing expenses to have 'approved' status (backwards compatibility)
UPDATE public.expenses SET status = 'approved' WHERE status = 'draft';

-- Create an index for faster queries on status
CREATE INDEX idx_expenses_status ON public.expenses(status);

-- Create an index for pending approvals by school
CREATE INDEX idx_expenses_pending_approval ON public.expenses(school_id, status) WHERE status = 'pending_approval';