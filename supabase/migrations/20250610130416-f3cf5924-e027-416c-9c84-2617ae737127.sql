
-- Create schools table for managing school subscriptions
CREATE TABLE IF NOT EXISTS public.schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  address TEXT,
  logo_url TEXT,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  principal_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create subscriptions table for billing management
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('basic', 'premium', 'enterprise')),
  status TEXT NOT NULL CHECK (status IN ('active', 'inactive', 'suspended', 'cancelled')) DEFAULT 'active',
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'quarterly', 'yearly')) DEFAULT 'monthly',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  stripe_subscription_id TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create system_metrics table for monitoring
CREATE TABLE IF NOT EXISTS public.system_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  metric_value DECIMAL(10,2) NOT NULL,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('uptime', 'response_time', 'error_rate', 'user_count', 'revenue')),
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB
);

-- Create billing_transactions table
CREATE TABLE IF NOT EXISTS public.billing_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('payment', 'refund', 'chargeback')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')) DEFAULT 'pending',
  payment_method TEXT,
  stripe_payment_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for schools
CREATE POLICY "Elimisha admins can manage all schools" ON public.schools
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('elimisha_admin', 'edufam_admin')
    )
  );

CREATE POLICY "School owners can view their school" ON public.schools
  FOR SELECT USING (
    owner_id = auth.uid() OR principal_id = auth.uid()
  );

-- RLS Policies for subscriptions
CREATE POLICY "Elimisha admins can manage all subscriptions" ON public.subscriptions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('elimisha_admin', 'edufam_admin')
    )
  );

CREATE POLICY "School owners can view their subscription" ON public.subscriptions
  FOR SELECT USING (
    school_id IN (
      SELECT id FROM public.schools 
      WHERE owner_id = auth.uid() OR principal_id = auth.uid()
    )
  );

-- RLS Policies for system_metrics
CREATE POLICY "Only elimisha admins can access system metrics" ON public.system_metrics
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('elimisha_admin', 'edufam_admin')
    )
  );

-- RLS Policies for billing_transactions
CREATE POLICY "Elimisha admins can manage all transactions" ON public.billing_transactions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('elimisha_admin', 'edufam_admin')
    )
  );

CREATE POLICY "School owners can view their transactions" ON public.billing_transactions
  FOR SELECT USING (
    school_id IN (
      SELECT id FROM public.schools 
      WHERE owner_id = auth.uid() OR principal_id = auth.uid()
    )
  );

-- Insert sample data for testing (removed ON CONFLICT clauses)
INSERT INTO public.schools (name, email, phone, address) VALUES
  ('Sunshine Primary School', 'admin@sunshine.edu', '+254123456789', '123 Education Street, Nairobi'),
  ('Green Valley Academy', 'info@greenvalley.edu', '+254987654321', '456 Learning Avenue, Mombasa'),
  ('Bright Future School', 'contact@brightfuture.edu', '+254555123456', '789 Knowledge Road, Kisumu'),
  ('Excellence High School', 'admin@excellence.edu', '+254777888999', '321 Academic Plaza, Nakuru');

-- Insert sample subscriptions
INSERT INTO public.subscriptions (school_id, plan_type, amount, start_date, end_date) 
SELECT 
  s.id,
  CASE 
    WHEN s.name LIKE '%Primary%' THEN 'basic'
    WHEN s.name LIKE '%Academy%' THEN 'premium' 
    ELSE 'enterprise'
  END,
  CASE 
    WHEN s.name LIKE '%Primary%' THEN 50.00
    WHEN s.name LIKE '%Academy%' THEN 100.00
    ELSE 200.00
  END,
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '1 year'
FROM public.schools s;

-- Insert sample system metrics
INSERT INTO public.system_metrics (metric_name, metric_value, metric_type, metadata) VALUES
  ('System Uptime', 99.8, 'uptime', '{"unit": "percentage"}'),
  ('Average Response Time', 245, 'response_time', '{"unit": "milliseconds"}'),
  ('Error Rate', 0.12, 'error_rate', '{"unit": "percentage"}'),
  ('Total Active Users', 1623, 'user_count', '{"period": "current"}'),
  ('Monthly Revenue', 2800, 'revenue', '{"currency": "USD", "period": "current_month"}');
