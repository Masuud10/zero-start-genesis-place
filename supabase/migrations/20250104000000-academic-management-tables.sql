-- Academic Management Tables Migration
-- This migration creates tables for student transfers and exits

-- Create student_transfers table
CREATE TABLE IF NOT EXISTS public.student_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  from_class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  to_class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  transfer_date DATE NOT NULL,
  academic_year TEXT NOT NULL,
  term TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create student_exits table
CREATE TABLE IF NOT EXISTS public.student_exits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  exit_reason TEXT NOT NULL CHECK (exit_reason IN ('graduated', 'transferred', 'left', 'other')),
  exit_date DATE NOT NULL,
  academic_year TEXT NOT NULL,
  term TEXT NOT NULL,
  additional_notes TEXT,
  certificate_issued BOOLEAN DEFAULT false,
  records_transferred BOOLEAN DEFAULT false,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_student_transfers_student_id ON public.student_transfers(student_id);
CREATE INDEX IF NOT EXISTS idx_student_transfers_school_id ON public.student_transfers(school_id);
CREATE INDEX IF NOT EXISTS idx_student_transfers_status ON public.student_transfers(status);
CREATE INDEX IF NOT EXISTS idx_student_transfers_created_at ON public.student_transfers(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_student_exits_student_id ON public.student_exits(student_id);
CREATE INDEX IF NOT EXISTS idx_student_exits_school_id ON public.student_exits(school_id);
CREATE INDEX IF NOT EXISTS idx_student_exits_exit_reason ON public.student_exits(exit_reason);
CREATE INDEX IF NOT EXISTS idx_student_exits_created_at ON public.student_exits(created_at DESC);

-- Enable RLS on new tables
ALTER TABLE public.student_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_exits ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for student_transfers
CREATE POLICY "School isolation for student_transfers" ON public.student_transfers
  FOR ALL USING (
    school_id = public.get_current_user_school_id() OR 
    public.get_current_user_role() IN ('edufam_admin', 'elimisha_admin')
  );

-- Create RLS policies for student_exits
CREATE POLICY "School isolation for student_exits" ON public.student_exits
  FOR ALL USING (
    school_id = public.get_current_user_school_id() OR 
    public.get_current_user_role() IN ('edufam_admin', 'elimisha_admin')
  );

-- Add status column to students table if it doesn't exist
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'transferred', 'graduated', 'exited'));

-- Create index for students status
CREATE INDEX IF NOT EXISTS idx_students_status ON public.students(status);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_student_transfers_updated_at 
    BEFORE UPDATE ON public.student_transfers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_student_exits_updated_at 
    BEFORE UPDATE ON public.student_exits 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 