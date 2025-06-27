
-- Add billing_settings table for configurable billing parameters
CREATE TABLE IF NOT EXISTS public.billing_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL DEFAULT '{}',
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default billing settings
INSERT INTO public.billing_settings (setting_key, setting_value, description) VALUES
  ('setup_fee', '{"amount": 5000, "currency": "KES", "enabled": true}', 'One-time setup fee for new schools'),
  ('subscription_fee_per_student', '{"amount": 50, "currency": "KES", "enabled": true}', 'Monthly subscription fee per student'),
  ('default_currency', '{"code": "KES", "symbol": "KSh", "name": "Kenyan Shilling"}', 'Default currency for billing')
ON CONFLICT (setting_key) DO NOTHING;

-- Add school_billing_records table for detailed billing tracking
CREATE TABLE IF NOT EXISTS public.school_billing_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  billing_type TEXT NOT NULL CHECK (billing_type IN ('setup_fee', 'subscription_fee')),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'KES',
  billing_period_start DATE,
  billing_period_end DATE,
  student_count INTEGER,
  status TEXT NOT NULL CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')) DEFAULT 'pending',
  invoice_number TEXT UNIQUE,
  description TEXT,
  due_date DATE,
  paid_date DATE,
  payment_method TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_school_billing_records_school_id ON public.school_billing_records(school_id);
CREATE INDEX IF NOT EXISTS idx_school_billing_records_status ON public.school_billing_records(status);
CREATE INDEX IF NOT EXISTS idx_school_billing_records_billing_type ON public.school_billing_records(billing_type);
CREATE INDEX IF NOT EXISTS idx_school_billing_records_created_at ON public.school_billing_records(created_at);

-- Enable RLS
ALTER TABLE public.billing_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_billing_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies for billing_settings
CREATE POLICY "Only edufam admins can manage billing settings" ON public.billing_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'edufam_admin'
    )
  );

-- RLS Policies for school_billing_records
CREATE POLICY "Edufam admins can manage all billing records" ON public.school_billing_records
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'edufam_admin'
    )
  );

CREATE POLICY "School owners can view their billing records" ON public.school_billing_records
  FOR SELECT USING (
    school_id IN (
      SELECT id FROM public.schools 
      WHERE owner_id = auth.uid() OR principal_id = auth.uid()
    )
  );

-- Function to generate invoice numbers
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  invoice_num TEXT;
  counter INTEGER;
BEGIN
  -- Get current year and month
  SELECT 'EF-' || EXTRACT(YEAR FROM now()) || LPAD(EXTRACT(MONTH FROM now())::TEXT, 2, '0') || '-' || 
         LPAD((COUNT(*) + 1)::TEXT, 4, '0')
  INTO invoice_num
  FROM public.school_billing_records
  WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM now())
    AND EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM now());
    
  RETURN invoice_num;
END;
$$;

-- Function to calculate subscription fee for a school
CREATE OR REPLACE FUNCTION public.calculate_school_subscription_fee(p_school_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  student_count INTEGER;
  fee_per_student DECIMAL(10,2);
  total_fee DECIMAL(10,2);
  currency TEXT;
  settings JSONB;
BEGIN
  -- Get billing settings
  SELECT setting_value INTO settings
  FROM public.billing_settings
  WHERE setting_key = 'subscription_fee_per_student';
  
  fee_per_student := (settings->>'amount')::DECIMAL(10,2);
  currency := settings->>'currency';
  
  -- Get active student count for the school
  SELECT COUNT(*) INTO student_count
  FROM public.students
  WHERE school_id = p_school_id AND is_active = true;
  
  total_fee := fee_per_student * student_count;
  
  RETURN jsonb_build_object(
    'student_count', student_count,
    'fee_per_student', fee_per_student,
    'total_fee', total_fee,
    'currency', currency
  );
END;
$$;

-- Function to create setup fee record for new school
CREATE OR REPLACE FUNCTION public.create_setup_fee_record(p_school_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  setup_fee_amount DECIMAL(10,2);
  currency TEXT;
  settings JSONB;
  record_id UUID;
BEGIN
  -- Get setup fee settings
  SELECT setting_value INTO settings
  FROM public.billing_settings
  WHERE setting_key = 'setup_fee';
  
  -- Check if setup fee is enabled
  IF NOT (settings->>'enabled')::BOOLEAN THEN
    RETURN NULL;
  END IF;
  
  setup_fee_amount := (settings->>'amount')::DECIMAL(10,2);
  currency := settings->>'currency';
  
  -- Create setup fee record
  INSERT INTO public.school_billing_records (
    school_id,
    billing_type,
    amount,
    currency,
    invoice_number,
    description,
    due_date,
    created_by
  ) VALUES (
    p_school_id,
    'setup_fee',
    setup_fee_amount,
    currency,
    public.generate_invoice_number(),
    'One-time setup fee for school onboarding',
    CURRENT_DATE + INTERVAL '30 days',
    auth.uid()
  ) RETURNING id INTO record_id;
  
  RETURN record_id;
END;
$$;

-- Function to create monthly subscription fee records
CREATE OR REPLACE FUNCTION public.create_monthly_subscription_fees()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  school_record RECORD;
  subscription_calc JSONB;
  record_count INTEGER := 0;
BEGIN
  -- Loop through all active schools
  FOR school_record IN 
    SELECT id, name FROM public.schools WHERE status = 'active'
  LOOP
    -- Calculate subscription fee
    SELECT public.calculate_school_subscription_fee(school_record.id) INTO subscription_calc;
    
    -- Only create record if there are students
    IF (subscription_calc->>'student_count')::INTEGER > 0 THEN
      -- Check if subscription record already exists for current month
      IF NOT EXISTS (
        SELECT 1 FROM public.school_billing_records
        WHERE school_id = school_record.id
          AND billing_type = 'subscription_fee'
          AND EXTRACT(YEAR FROM billing_period_start) = EXTRACT(YEAR FROM CURRENT_DATE)
          AND EXTRACT(MONTH FROM billing_period_start) = EXTRACT(MONTH FROM CURRENT_DATE)
      ) THEN
        -- Create subscription fee record
        INSERT INTO public.school_billing_records (
          school_id,
          billing_type,
          amount,
          currency,
          billing_period_start,
          billing_period_end,
          student_count,
          invoice_number,
          description,
          due_date,
          created_by
        ) VALUES (
          school_record.id,
          'subscription_fee',
          (subscription_calc->>'total_fee')::DECIMAL(10,2),
          subscription_calc->>'currency',
          DATE_TRUNC('month', CURRENT_DATE),
          DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day',
          (subscription_calc->>'student_count')::INTEGER,
          public.generate_invoice_number(),
          'Monthly subscription fee for ' || (subscription_calc->>'student_count') || ' students',
          CURRENT_DATE + INTERVAL '30 days'
        );
        
        record_count := record_count + 1;
      END IF;
    END IF;
  END LOOP;
  
  RETURN record_count;
END;
$$;

-- Trigger to automatically create setup fee when a new school is created
CREATE OR REPLACE FUNCTION public.auto_create_setup_fee()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create setup fee record for new school
  PERFORM public.create_setup_fee_record(NEW.id);
  RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_auto_create_setup_fee ON public.schools;
CREATE TRIGGER trigger_auto_create_setup_fee
  AFTER INSERT ON public.schools
  FOR EACH ROW EXECUTE FUNCTION public.auto_create_setup_fee();

-- Update existing billing_transactions to use KES currency
UPDATE public.billing_transactions 
SET currency = 'KES' 
WHERE currency = 'USD';
