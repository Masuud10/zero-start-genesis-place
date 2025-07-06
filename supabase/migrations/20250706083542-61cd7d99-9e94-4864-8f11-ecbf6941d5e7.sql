-- Create examinations table for managing school examinations
CREATE TABLE IF NOT EXISTS public.examinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Written', 'Practical', 'Mock', 'Final', 'Mid-Term', 'End-Term')),
  term TEXT NOT NULL CHECK (term IN ('Term 1', 'Term 2', 'Term 3')),
  academic_year TEXT NOT NULL,
  classes UUID[] NOT NULL, -- Array of class IDs
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  coordinator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  remarks TEXT,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_examinations_school_id ON public.examinations(school_id);
CREATE INDEX IF NOT EXISTS idx_examinations_academic_year ON public.examinations(academic_year);
CREATE INDEX IF NOT EXISTS idx_examinations_term ON public.examinations(term);
CREATE INDEX IF NOT EXISTS idx_examinations_type ON public.examinations(type);
CREATE INDEX IF NOT EXISTS idx_examinations_created_by ON public.examinations(created_by);
CREATE INDEX IF NOT EXISTS idx_examinations_coordinator_id ON public.examinations(coordinator_id);

-- Enable Row Level Security
ALTER TABLE public.examinations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for examinations
-- Principals can manage examinations for their school
CREATE POLICY "Principals can manage their school examinations" ON public.examinations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'principal' 
      AND school_id = examinations.school_id
    )
  );

-- Teachers can view examinations for their school
CREATE POLICY "Teachers can view their school examinations" ON public.examinations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'teacher' 
      AND school_id = examinations.school_id
    )
  );

-- EduFam admins can view all examinations
CREATE POLICY "EduFam admins can view all examinations" ON public.examinations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('edufam_admin', 'elimisha_admin')
    )
  );

-- Create updated_at trigger for examinations
CREATE OR REPLACE FUNCTION update_examinations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_examinations_updated_at
  BEFORE UPDATE ON public.examinations
  FOR EACH ROW
  EXECUTE FUNCTION update_examinations_updated_at();