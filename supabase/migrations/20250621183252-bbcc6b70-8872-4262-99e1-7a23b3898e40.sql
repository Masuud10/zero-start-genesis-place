
-- Create company_details table for storing EduFam company information
CREATE TABLE IF NOT EXISTS public.company_details (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name text NOT NULL DEFAULT 'EduFam',
  company_logo_url text,
  company_slogan text,
  company_motto text,
  company_type text DEFAULT 'EdTech SaaS',
  website_url text DEFAULT 'https://edufam.com',
  support_email text DEFAULT 'support@edufam.com',
  contact_phone text,
  headquarters_address text,
  registration_number text,
  incorporation_details text,
  year_established integer DEFAULT 2024,
  management_team jsonb DEFAULT '[]'::jsonb,
  subscription_plans jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create company_metrics table for tracking system-wide metrics
CREATE TABLE IF NOT EXISTS public.company_metrics (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_date date NOT NULL DEFAULT CURRENT_DATE,
  total_schools integer DEFAULT 0,
  active_schools integer DEFAULT 0,
  total_users integer DEFAULT 0,
  active_users integer DEFAULT 0,
  total_revenue numeric DEFAULT 0,
  monthly_revenue numeric DEFAULT 0,
  api_calls_count integer DEFAULT 0,
  system_uptime_percentage numeric DEFAULT 100,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create company_announcements table for company-wide notices
CREATE TABLE IF NOT EXISTS public.company_announcements (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  content text NOT NULL,
  announcement_type text DEFAULT 'general',
  priority text DEFAULT 'medium',
  is_active boolean DEFAULT true,
  target_roles text[] DEFAULT ARRAY['edufam_admin'],
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone
);

-- Insert initial company data if not exists
INSERT INTO public.company_details (
  company_name, 
  company_slogan, 
  company_type, 
  year_established
) 
SELECT 
  'EduFam',
  'Empowering Education Through Technology',
  'EdTech SaaS Platform',
  2024
WHERE NOT EXISTS (SELECT 1 FROM public.company_details);

-- Create RLS policies for company_details
ALTER TABLE public.company_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only EduFam admins can view company details" 
  ON public.company_details 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('edufam_admin', 'elimisha_admin')
    )
  );

CREATE POLICY "Only EduFam admins can update company details" 
  ON public.company_details 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('edufam_admin', 'elimisha_admin')
    )
  );

-- Create RLS policies for company_metrics
ALTER TABLE public.company_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only EduFam admins can view company metrics" 
  ON public.company_metrics 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('edufam_admin', 'elimisha_admin')
    )
  );

-- Create RLS policies for company_announcements
ALTER TABLE public.company_announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only EduFam admins can manage company announcements" 
  ON public.company_announcements 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('edufam_admin', 'elimisha_admin')
    )
  );

-- Create function to update company metrics automatically
CREATE OR REPLACE FUNCTION public.update_company_metrics()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.company_metrics (
    metric_date,
    total_schools,
    active_schools,
    total_users,
    active_users,
    total_revenue,
    api_calls_count
  )
  SELECT 
    CURRENT_DATE,
    (SELECT COUNT(*) FROM public.schools),
    (SELECT COUNT(*) FROM public.schools WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'),
    (SELECT COUNT(*) FROM public.profiles),
    (SELECT COUNT(*) FROM public.profiles WHERE last_login_at >= CURRENT_DATE - INTERVAL '7 days'),
    (SELECT COALESCE(SUM(amount), 0) FROM public.financial_transactions WHERE transaction_type = 'payment'),
    0 -- API calls would need separate tracking
  ON CONFLICT (metric_date) DO UPDATE SET
    total_schools = EXCLUDED.total_schools,
    active_schools = EXCLUDED.active_schools,
    total_users = EXCLUDED.total_users,
    active_users = EXCLUDED.active_users,
    total_revenue = EXCLUDED.total_revenue,
    updated_at = now();
END;
$$;

-- Create a view for comprehensive report data
CREATE OR REPLACE VIEW public.comprehensive_report_data AS
SELECT 
  s.id as school_id,
  s.name as school_name,
  s.location,
  s.created_at as school_created_at,
  COUNT(DISTINCT st.id) as total_students,
  COUNT(DISTINCT p.id) FILTER (WHERE p.role = 'teacher') as total_teachers,
  COUNT(DISTINCT g.id) as total_grades,
  AVG(g.percentage) as average_grade,
  COUNT(DISTINCT a.id) as total_attendance_records,
  COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'present') * 100.0 / NULLIF(COUNT(DISTINCT a.id), 0) as attendance_rate,
  COALESCE(SUM(f.amount), 0) as total_fees,
  COALESCE(SUM(f.paid_amount), 0) as total_collected,
  COALESCE(SUM(f.amount - f.paid_amount), 0) as outstanding_amount
FROM public.schools s
LEFT JOIN public.students st ON s.id = st.school_id AND st.is_active = true
LEFT JOIN public.profiles p ON s.id = p.school_id
LEFT JOIN public.grades g ON s.id = g.school_id AND g.status = 'released'
LEFT JOIN public.attendance a ON s.id = a.school_id
LEFT JOIN public.fees f ON s.id = f.school_id
GROUP BY s.id, s.name, s.location, s.created_at;
