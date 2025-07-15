-- Create staff_management table for HR module
CREATE TABLE IF NOT EXISTS public.staff_management (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id UUID NOT NULL,
  staff_id TEXT UNIQUE,
  department TEXT,
  position TEXT,
  hire_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'terminated', 'on_leave')),
  emergency_contact JSONB DEFAULT '{}',
  documents JSONB DEFAULT '[]',
  work_history JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create payroll_structures table
CREATE TABLE IF NOT EXISTS public.payroll_structures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID NOT NULL,
  structure_name TEXT NOT NULL,
  base_salary DECIMAL(12,2),
  allowances JSONB DEFAULT '{}',
  deductions JSONB DEFAULT '{}',
  position_category TEXT,
  effective_date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create payroll_records table
CREATE TABLE IF NOT EXISTS public.payroll_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID NOT NULL,
  staff_id UUID NOT NULL REFERENCES public.staff_management(id) ON DELETE CASCADE,
  payroll_structure_id UUID REFERENCES public.payroll_structures(id),
  pay_period_start DATE NOT NULL,
  pay_period_end DATE NOT NULL,
  gross_salary DECIMAL(12,2),
  total_allowances DECIMAL(12,2) DEFAULT 0,
  total_deductions DECIMAL(12,2) DEFAULT 0,
  net_salary DECIMAL(12,2),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'cancelled')),
  payment_date DATE,
  payment_method TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create leave_management table
CREATE TABLE IF NOT EXISTS public.leave_management (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID NOT NULL,
  staff_id UUID NOT NULL REFERENCES public.staff_management(id) ON DELETE CASCADE,
  leave_type TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days_requested INTEGER NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  comments TEXT,
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create leave_balances table
CREATE TABLE IF NOT EXISTS public.leave_balances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID NOT NULL,
  staff_id UUID NOT NULL REFERENCES public.staff_management(id) ON DELETE CASCADE,
  leave_type TEXT NOT NULL,
  year INTEGER NOT NULL,
  allocated_days INTEGER DEFAULT 0,
  used_days INTEGER DEFAULT 0,
  remaining_days INTEGER DEFAULT 0,
  carried_forward INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(staff_id, leave_type, year)
);

-- Create staff_attendance table
CREATE TABLE IF NOT EXISTS public.staff_attendance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID NOT NULL,
  staff_id UUID NOT NULL REFERENCES public.staff_management(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  check_in_time TIME,
  check_out_time TIME,
  status TEXT DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late', 'half_day', 'on_leave')),
  hours_worked DECIMAL(4,2),
  overtime_hours DECIMAL(4,2) DEFAULT 0,
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(staff_id, date)
);

-- Create hr_notifications table
CREATE TABLE IF NOT EXISTS public.hr_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  target_roles TEXT[] DEFAULT ARRAY['teacher', 'principal', 'finance_officer'],
  target_staff_ids UUID[],
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'expired')),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all HR tables
ALTER TABLE public.staff_management ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_management ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for HR tables (school-isolated access)
-- Staff Management policies
CREATE POLICY "HR can manage staff in their school" ON public.staff_management
  FOR ALL USING (
    (school_id = get_current_user_school_id() AND get_current_user_role() IN ('hr', 'principal', 'school_owner')) 
    OR get_current_user_role() IN ('edufam_admin', 'elimisha_admin')
  );

-- Payroll policies
CREATE POLICY "HR can manage payroll in their school" ON public.payroll_structures
  FOR ALL USING (
    (school_id = get_current_user_school_id() AND get_current_user_role() IN ('hr', 'principal', 'school_owner')) 
    OR get_current_user_role() IN ('edufam_admin', 'elimisha_admin')
  );

CREATE POLICY "HR can manage payroll records in their school" ON public.payroll_records
  FOR ALL USING (
    (school_id = get_current_user_school_id() AND get_current_user_role() IN ('hr', 'principal', 'school_owner')) 
    OR get_current_user_role() IN ('edufam_admin', 'elimisha_admin')
  );

-- Leave management policies
CREATE POLICY "HR can manage leave in their school" ON public.leave_management
  FOR ALL USING (
    (school_id = get_current_user_school_id() AND get_current_user_role() IN ('hr', 'principal', 'school_owner')) 
    OR get_current_user_role() IN ('edufam_admin', 'elimisha_admin')
  );

CREATE POLICY "HR can manage leave balances in their school" ON public.leave_balances
  FOR ALL USING (
    (school_id = get_current_user_school_id() AND get_current_user_role() IN ('hr', 'principal', 'school_owner')) 
    OR get_current_user_role() IN ('edufam_admin', 'elimisha_admin')
  );

-- Staff attendance policies
CREATE POLICY "HR can manage staff attendance in their school" ON public.staff_attendance
  FOR ALL USING (
    (school_id = get_current_user_school_id() AND get_current_user_role() IN ('hr', 'principal', 'school_owner')) 
    OR get_current_user_role() IN ('edufam_admin', 'elimisha_admin')
  );

-- HR notifications policies
CREATE POLICY "HR can manage notifications in their school" ON public.hr_notifications
  FOR ALL USING (
    (school_id = get_current_user_school_id() AND get_current_user_role() IN ('hr', 'principal', 'school_owner')) 
    OR get_current_user_role() IN ('edufam_admin', 'elimisha_admin')
  );

-- Add triggers for updated_at
CREATE TRIGGER update_staff_management_updated_at
  BEFORE UPDATE ON public.staff_management
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payroll_structures_updated_at
  BEFORE UPDATE ON public.payroll_structures
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payroll_records_updated_at
  BEFORE UPDATE ON public.payroll_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leave_management_updated_at
  BEFORE UPDATE ON public.leave_management
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leave_balances_updated_at
  BEFORE UPDATE ON public.leave_balances
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staff_attendance_updated_at
  BEFORE UPDATE ON public.staff_attendance
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hr_notifications_updated_at
  BEFORE UPDATE ON public.hr_notifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_staff_management_school_id ON public.staff_management(school_id);
CREATE INDEX IF NOT EXISTS idx_staff_management_user_id ON public.staff_management(user_id);
CREATE INDEX IF NOT EXISTS idx_payroll_records_staff_id ON public.payroll_records(staff_id);
CREATE INDEX IF NOT EXISTS idx_leave_management_staff_id ON public.leave_management(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_attendance_staff_date ON public.staff_attendance(staff_id, date);

-- Create test HR user
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data,
  role,
  aud
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'hr@edufam.com',
  crypt('HRPassword123!', gen_salt('bf')),
  now(),
  now(),
  now(),
  jsonb_build_object('name', 'HR Manager', 'role', 'hr', 'created_by_admin', true),
  'authenticated',
  'authenticated'
) ON CONFLICT (email) DO NOTHING;

-- Create profile for HR test user
INSERT INTO public.profiles (id, email, name, role, school_id, created_at, updated_at)
SELECT 
  u.id,
  'hr@edufam.com',
  'HR Manager',
  'hr',
  s.id,
  now(),
  now()
FROM auth.users u
CROSS JOIN (SELECT id FROM public.schools ORDER BY created_at LIMIT 1) s
WHERE u.email = 'hr@edufam.com'
ON CONFLICT (id) DO NOTHING;