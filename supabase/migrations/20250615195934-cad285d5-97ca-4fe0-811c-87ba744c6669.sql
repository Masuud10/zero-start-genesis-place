
CREATE TABLE public.expenses (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    amount NUMERIC NOT NULL CHECK (amount > 0),
    description TEXT,
    date DATE NOT NULL,
    approved_by UUID REFERENCES auth.users(id),
    receipt_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.expenses IS 'Stores all financial expenses for schools.';
COMMENT ON COLUMN public.expenses.category IS 'The category of the expense (e.g., Salaries, Utilities, Supplies).';
COMMENT ON COLUMN public.expenses.amount IS 'The monetary value of the expense.';
COMMENT ON COLUMN public.expenses.date IS 'The date the expense was incurred.';
COMMENT ON COLUMN public.expenses.approved_by IS 'The user who approved the expense.';

-- Enable Row Level Security
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Allow system admins full access
CREATE POLICY "Allow full access to edufam and elimisha admins"
ON public.expenses
FOR ALL
USING (get_current_user_role() IN ('edufam_admin', 'elimisha_admin'))
WITH CHECK (get_current_user_role() IN ('edufam_admin', 'elimisha_admin'));

-- Allow school-specific roles to manage their school's expenses
CREATE POLICY "Allow school-scoped roles to manage their school's expenses"
ON public.expenses
FOR ALL
USING (school_id = get_current_user_school_id() AND get_current_user_role() IN ('finance_officer', 'principal', 'school_owner'))
WITH CHECK (school_id = get_current_user_school_id() AND get_current_user_role() IN ('finance_officer', 'principal', 'school_owner'));
