
-- Drop the old timetable-related tables to avoid conflicts
DROP TABLE IF EXISTS public.timetable_slots;
DROP TABLE IF EXISTS public.timetables;

-- Create the new 'timetables' table with the correct structure
CREATE TABLE public.timetables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL,
  class_id UUID NOT NULL,
  subject_id UUID NOT NULL,
  teacher_id UUID NOT NULL,
  day_of_week TEXT NOT NULL, -- e.g. 'Monday'
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_by_principal_id UUID NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT false,
  term TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security for the new table
ALTER TABLE public.timetables ENABLE ROW LEVEL SECURITY;

-- Policy to allow users within a school and admins to view the timetable
CREATE POLICY "Allow school users and admin to see timetable" ON public.timetables
  FOR SELECT
  USING (school_id = (SELECT school_id FROM public.profiles WHERE id = auth.uid()) OR
         (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'edufam_admin');

-- Policy to allow principals to create, update, and delete timetable entries for their school
CREATE POLICY "Allow principals to insert/update within school" ON public.timetables
  FOR ALL
  USING (school_id = (SELECT school_id FROM public.profiles WHERE id = auth.uid()) AND
         (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'principal')
  WITH CHECK (school_id = (SELECT school_id FROM public.profiles WHERE id = auth.uid()));
