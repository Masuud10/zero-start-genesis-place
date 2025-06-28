
-- Create school_billing_records table for managing setup fees and subscription fees
CREATE TABLE IF NOT EXISTS public.school_billing_records (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  billing_type text NOT NULL CHECK (billing_type IN ('setup_fee', 'subscription_fee')),
  amount numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'KES',
  billing_period_start date NULL,
  billing_period_end date NULL,
  student_count integer NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
  invoice_number text NOT NULL,
  description text NOT NULL,
  due_date date NOT NULL,
  paid_date date NULL,
  payment_method text NULL,
  created_by text DEFAULT 'system',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.school_billing_records ENABLE ROW LEVEL SECURITY;

-- Create policy for edufam_admin to manage all billing records
CREATE POLICY "EduFam admins can manage all billing records" 
  ON public.school_billing_records 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'edufam_admin'
    )
  );

-- Create updated_at trigger
CREATE TRIGGER update_school_billing_records_updated_at
  BEFORE UPDATE ON public.school_billing_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create unique constraint for invoice numbers
ALTER TABLE public.school_billing_records 
ADD CONSTRAINT unique_invoice_number UNIQUE (invoice_number);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_school_billing_records_school_id ON public.school_billing_records(school_id);
CREATE INDEX IF NOT EXISTS idx_school_billing_records_status ON public.school_billing_records(status);
CREATE INDEX IF NOT EXISTS idx_school_billing_records_billing_type ON public.school_billing_records(billing_type);

-- Create database function to create setup fee records
CREATE OR REPLACE FUNCTION public.create_setup_fee_record(p_school_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_record_id uuid;
  school_name text;
  invoice_num text;
BEGIN
  -- Get school name
  SELECT name INTO school_name FROM public.schools WHERE id = p_school_id;
  
  IF school_name IS NULL THEN
    RAISE EXCEPTION 'School not found';
  END IF;
  
  -- Generate invoice number
  invoice_num := public.generate_invoice_number();
  
  -- Insert setup fee record
  INSERT INTO public.school_billing_records (
    school_id,
    billing_type,
    amount,
    currency,
    status,
    invoice_number,
    description,
    due_date,
    created_by
  ) VALUES (
    p_school_id,
    'setup_fee',
    5000, -- Default setup fee amount (KES 5,000)
    'KES',
    'pending',
    invoice_num,
    'One-time setup fee for ' || school_name,
    CURRENT_DATE + INTERVAL '30 days',
    'system'
  ) RETURNING id INTO new_record_id;
  
  RETURN new_record_id;
END;
$$;

-- Create database function to create monthly subscription fees
CREATE OR REPLACE FUNCTION public.create_monthly_subscription_fees()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  school_record record;
  student_count integer;
  subscription_amount numeric;
  invoice_num text;
  records_created integer := 0;
BEGIN
  -- Loop through all active schools
  FOR school_record IN 
    SELECT id, name FROM public.schools WHERE status = 'active' OR status IS NULL
  LOOP
    -- Check if subscription fee already exists for current month
    IF NOT EXISTS (
      SELECT 1 FROM public.school_billing_records 
      WHERE school_id = school_record.id 
      AND billing_type = 'subscription_fee'
      AND billing_period_start = date_trunc('month', CURRENT_DATE)::date
    ) THEN
      -- Get student count
      SELECT COUNT(*) INTO student_count 
      FROM public.students 
      WHERE school_id = school_record.id;
      
      -- Calculate subscription amount (KES 50 per student)
      subscription_amount := student_count * 50;
      
      -- Generate invoice number
      invoice_num := public.generate_invoice_number();
      
      -- Insert subscription fee record
      INSERT INTO public.school_billing_records (
        school_id,
        billing_type,
        amount,
        currency,
        billing_period_start,
        billing_period_end,
        student_count,
        status,
        invoice_number,
        description,
        due_date,
        created_by
      ) VALUES (
        school_record.id,
        'subscription_fee',
        subscription_amount,
        'KES',
        date_trunc('month', CURRENT_DATE)::date,
        (date_trunc('month', CURRENT_DATE) + INTERVAL '1 month - 1 day')::date,
        student_count,
        'pending',
        invoice_num,
        'Monthly subscription fee for ' || school_record.name || ' (' || student_count || ' students)',
        CURRENT_DATE + INTERVAL '15 days',
        'system'
      );
      
      records_created := records_created + 1;
    END IF;
  END LOOP;
  
  RETURN records_created;
END;
$$;

-- Create function to calculate school subscription fee
CREATE OR REPLACE FUNCTION public.calculate_school_subscription_fee(p_school_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  student_count integer;
  per_student_rate numeric := 50; -- KES 50 per student
  calculated_amount numeric;
  result jsonb;
BEGIN
  -- Get current student count
  SELECT COUNT(*) INTO student_count 
  FROM public.students 
  WHERE school_id = p_school_id;
  
  -- Calculate amount
  calculated_amount := student_count * per_student_rate;
  
  -- Build result
  result := jsonb_build_object(
    'school_id', p_school_id,
    'student_count', student_count,
    'per_student_rate', per_student_rate,
    'calculated_amount', calculated_amount,
    'currency', 'KES'
  );
  
  RETURN result;
END;
$$;
