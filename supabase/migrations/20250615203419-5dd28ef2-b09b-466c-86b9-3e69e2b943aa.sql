
-- Create fee_structures table to hold different fee plans
CREATE TABLE public.fee_structures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  academic_year TEXT NOT NULL,
  term TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create fee_structure_items table for individual items within a fee structure
CREATE TABLE public.fee_structure_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fee_structure_id UUID NOT NULL REFERENCES public.fee_structures(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  amount NUMERIC NOT NULL CHECK (amount >= 0),
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security for fee_structures
ALTER TABLE public.fee_structures ENABLE ROW LEVEL SECURITY;

-- Policy for admin full access on fee_structures
CREATE POLICY "Allow admin full access on fee_structures"
ON public.fee_structures
FOR ALL
USING (get_current_user_role() IN ('edufam_admin', 'elimisha_admin'))
WITH CHECK (get_current_user_role() IN ('edufam_admin', 'elimisha_admin'));

-- Policy for school-level users (owner, principal, finance officer) to manage their school's fee structures
CREATE POLICY "Allow school-level users to manage fee_structures"
ON public.fee_structures
FOR ALL
USING (school_id = get_current_user_school_id() AND get_current_user_role() IN ('school_owner', 'principal', 'finance_officer'))
WITH CHECK (school_id = get_current_user_school_id() AND get_current_user_role() IN ('school_owner', 'principal', 'finance_officer'));


-- Enable Row Level Security for fee_structure_items
ALTER TABLE public.fee_structure_items ENABLE ROW LEVEL SECURITY;

-- Policy for admin full access on fee_structure_items
CREATE POLICY "Allow admin full access on fee_structure_items"
ON public.fee_structure_items
FOR ALL
USING (get_current_user_role() IN ('edufam_admin', 'elimisha_admin'))
WITH CHECK (get_current_user_role() IN ('edufam_admin', 'elimisha_admin'));

-- Policy for school-level users to manage items for their school's fee structures
CREATE POLICY "Allow school-level users to manage fee_structure_items"
ON public.fee_structure_items
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM public.fee_structures fs
    WHERE fs.id = fee_structure_id AND fs.school_id = get_current_user_school_id()
  )
  AND get_current_user_role() IN ('school_owner', 'principal', 'finance_officer')
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.fee_structures fs
    WHERE fs.id = fee_structure_id AND fs.school_id = get_current_user_school_id()
  )
  AND get_current_user_role() IN ('school_owner', 'principal', 'finance_officer')
);
