-- Remove policies that depend on principal_id column
DROP POLICY IF EXISTS "School owners can view their school" ON public.schools;
DROP POLICY IF EXISTS "School owners can view their subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "School owners can view their transactions" ON public.billing_transactions;
DROP POLICY IF EXISTS "School owners can view their billing records" ON public.school_billing_records;

-- Remove unnecessary columns from schools table
ALTER TABLE public.schools 
DROP COLUMN IF EXISTS principal_id,
DROP COLUMN IF EXISTS principal_name,
DROP COLUMN IF EXISTS principal_email, 
DROP COLUMN IF EXISTS principal_contact,
DROP COLUMN IF EXISTS subscription_plan,
DROP COLUMN IF EXISTS max_students,
DROP COLUMN IF EXISTS timezone;

-- Recreate necessary policies without principal_id references
-- School owners policy using owner_id instead
CREATE POLICY "School owners can view their school" ON public.schools
FOR SELECT USING (auth.uid() = owner_id);

-- Update other policies to use owner_id where appropriate
CREATE POLICY "School owners can view their transactions" ON public.billing_transactions
FOR SELECT USING (
  school_id IN (
    SELECT id FROM public.schools 
    WHERE owner_id = auth.uid()
  )
);