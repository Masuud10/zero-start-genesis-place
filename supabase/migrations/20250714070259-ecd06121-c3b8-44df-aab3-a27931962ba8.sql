-- Fix the fees table status check constraint to include 'partial' status
-- The current constraint only allows 'pending', 'paid', 'overdue' but the record_fee_payment function
-- tries to set status to 'partial' which causes a constraint violation

-- Drop the existing constraint
ALTER TABLE public.fees DROP CONSTRAINT IF EXISTS fees_status_check;

-- Add the updated constraint that includes 'partial'
ALTER TABLE public.fees ADD CONSTRAINT fees_status_check 
CHECK (status IN ('pending', 'paid', 'overdue', 'partial'));