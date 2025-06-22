
-- Fix RLS policies for company_details table to allow proper access for EduFam admins

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Only EduFam admins can view company details" ON public.company_details;
DROP POLICY IF EXISTS "Only EduFam admins can update company details" ON public.company_details;

-- Create comprehensive RLS policies for company_details
CREATE POLICY "EduFam admins can view company details" 
  ON public.company_details 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('edufam_admin', 'elimisha_admin')
    )
  );

CREATE POLICY "EduFam admins can insert company details" 
  ON public.company_details 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('edufam_admin', 'elimisha_admin')
    )
  );

CREATE POLICY "EduFam admins can update company details" 
  ON public.company_details 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('edufam_admin', 'elimisha_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('edufam_admin', 'elimisha_admin')
    )
  );

-- Ensure company_metrics table has proper RLS policies
CREATE POLICY "EduFam admins can insert company metrics" 
  ON public.company_metrics 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('edufam_admin', 'elimisha_admin')
    )
  );

CREATE POLICY "EduFam admins can update company metrics" 
  ON public.company_metrics 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('edufam_admin', 'elimisha_admin')
    )
  );
