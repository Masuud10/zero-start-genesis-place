-- Create support staff table for HR management
CREATE TABLE public.support_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  employee_id TEXT UNIQUE,
  full_name TEXT NOT NULL,
  role_title TEXT NOT NULL,
  department TEXT,
  profile_photo_url TEXT,
  salary_amount DECIMAL(10,2),
  salary_currency TEXT DEFAULT 'KES',
  employment_type TEXT NOT NULL DEFAULT 'permanent',
  phone TEXT,
  email TEXT,
  address TEXT,
  date_of_hire DATE NOT NULL DEFAULT CURRENT_DATE,
  supervisor_id UUID REFERENCES public.profiles(id),
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id)
);

-- Add employment type constraint
ALTER TABLE public.support_staff ADD CONSTRAINT support_staff_employment_type_check 
CHECK (employment_type IN ('permanent', 'contract', 'temporary'));

-- Add role title constraint for predefined roles
ALTER TABLE public.support_staff ADD CONSTRAINT support_staff_role_title_check 
CHECK (role_title IN ('Driver', 'Receptionist', 'Cleaner', 'Secretary', 'Chef', 'Nurse', 'Watchman', 'Librarian', 'Support Staff'));

-- Create indexes for better performance
CREATE INDEX idx_support_staff_school_id ON public.support_staff(school_id);
CREATE INDEX idx_support_staff_role_title ON public.support_staff(role_title);
CREATE INDEX idx_support_staff_is_active ON public.support_staff(is_active);
CREATE INDEX idx_support_staff_created_by ON public.support_staff(created_by);

-- Enable Row Level Security
ALTER TABLE public.support_staff ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for support staff
CREATE POLICY "HR can manage support staff in their school" 
ON public.support_staff 
FOR ALL 
USING (
  school_id = get_current_user_school_id() AND 
  get_current_user_role() = 'hr'
);

CREATE POLICY "School admins can view support staff in their school" 
ON public.support_staff 
FOR SELECT 
USING (
  school_id = get_current_user_school_id() AND 
  get_current_user_role() IN ('principal', 'school_owner')
);

CREATE POLICY "System admins can manage all support staff" 
ON public.support_staff 
FOR ALL 
USING (get_current_user_role() IN ('edufam_admin', 'elimisha_admin'));

-- Create trigger for updated_at
CREATE TRIGGER support_staff_updated_at
  BEFORE UPDATE ON public.support_staff
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate employee ID
CREATE OR REPLACE FUNCTION public.generate_support_staff_employee_id()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  new_id TEXT;
  counter INTEGER;
BEGIN
  -- Get current year
  SELECT 'SS-' || EXTRACT(YEAR FROM now()) || '-' || 
         LPAD((COUNT(*) + 1)::TEXT, 4, '0')
  INTO new_id
  FROM public.support_staff
  WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM now());
  
  RETURN new_id;
END;
$$;

-- Trigger to auto-generate employee ID
CREATE OR REPLACE FUNCTION public.set_support_staff_employee_id()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.employee_id IS NULL THEN
    NEW.employee_id := public.generate_support_staff_employee_id();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER support_staff_employee_id_trigger
  BEFORE INSERT ON public.support_staff
  FOR EACH ROW
  EXECUTE FUNCTION public.set_support_staff_employee_id();

-- Create storage bucket for support staff photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('support-staff-photos', 'support-staff-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for support staff photos
CREATE POLICY "HR can upload support staff photos"
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'support-staff-photos' AND 
  auth.uid() IS NOT NULL
);

CREATE POLICY "Support staff photos are publicly viewable"
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'support-staff-photos');

CREATE POLICY "HR can update support staff photos"
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'support-staff-photos' AND 
  auth.uid() IS NOT NULL
);

CREATE POLICY "HR can delete support staff photos"
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'support-staff-photos' AND 
  auth.uid() IS NOT NULL
);