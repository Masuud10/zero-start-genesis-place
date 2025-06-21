
-- Add missing registration_number column to schools table
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS registration_number TEXT;

-- Add missing year_established column to schools table  
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS year_established INTEGER;

-- Add missing term_structure column to schools table
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS term_structure TEXT DEFAULT '3-term';

-- Add missing owner_information column to schools table
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS owner_information TEXT;

-- Drop existing policy if it exists and create new one
DROP POLICY IF EXISTS "EduFam admins can read all schools" ON public.schools;

-- Create RLS policy to ensure edufam_admin can read all school data
CREATE POLICY "EduFam admins can read all schools" 
ON public.schools FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'edufam_admin'
  )
);
