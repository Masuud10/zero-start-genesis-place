
-- Add school_id to profiles table to link users to schools
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS school_id uuid REFERENCES public.schools(id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_school_id ON public.profiles(school_id);
CREATE INDEX IF NOT EXISTS idx_students_school_id ON public.students(school_id);
CREATE INDEX IF NOT EXISTS idx_classes_school_id ON public.classes(school_id);
CREATE INDEX IF NOT EXISTS idx_subjects_school_id ON public.subjects(school_id);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable_slots ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for multi-tenancy

-- Profiles: Users can view their own profile and others in their school
CREATE POLICY "Users can view profiles in their school" ON public.profiles
FOR SELECT USING (
  auth.uid() = id OR 
  school_id = (SELECT school_id FROM public.profiles WHERE id = auth.uid()) OR
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('elimisha_admin', 'edufam_admin')
);

CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = id);

-- Schools: Elimisha/EduFam admins can see all, others only their school
CREATE POLICY "School access policy" ON public.schools
FOR SELECT USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('elimisha_admin', 'edufam_admin') OR
  id = (SELECT school_id FROM public.profiles WHERE id = auth.uid())
);

-- Students: Only accessible within the same school
CREATE POLICY "Students school access" ON public.students
FOR ALL USING (
  school_id = (SELECT school_id FROM public.profiles WHERE id = auth.uid()) OR
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('elimisha_admin', 'edufam_admin')
);

-- Classes: Only accessible within the same school
CREATE POLICY "Classes school access" ON public.classes
FOR ALL USING (
  school_id = (SELECT school_id FROM public.profiles WHERE id = auth.uid()) OR
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('elimisha_admin', 'edufam_admin')
);

-- Subjects: Only accessible within the same school
CREATE POLICY "Subjects school access" ON public.subjects
FOR ALL USING (
  school_id = (SELECT school_id FROM public.profiles WHERE id = auth.uid()) OR
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('elimisha_admin', 'edufam_admin')
);

-- Grades: Only accessible for students in the same school
CREATE POLICY "Grades school access" ON public.grades
FOR ALL USING (
  student_id IN (
    SELECT id FROM public.students 
    WHERE school_id = (SELECT school_id FROM public.profiles WHERE id = auth.uid())
  ) OR
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('elimisha_admin', 'edufam_admin')
);

-- Attendance: Only accessible for students in the same school
CREATE POLICY "Attendance school access" ON public.attendance
FOR ALL USING (
  student_id IN (
    SELECT id FROM public.students 
    WHERE school_id = (SELECT school_id FROM public.profiles WHERE id = auth.uid())
  ) OR
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('elimisha_admin', 'edufam_admin')
);

-- Fees: Only accessible for students in the same school
CREATE POLICY "Fees school access" ON public.fees
FOR ALL USING (
  student_id IN (
    SELECT id FROM public.students 
    WHERE school_id = (SELECT school_id FROM public.profiles WHERE id = auth.uid())
  ) OR
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('elimisha_admin', 'edufam_admin')
);

-- Announcements: School-specific or global
CREATE POLICY "Announcements school access" ON public.announcements
FOR ALL USING (
  is_global = true OR
  school_id = (SELECT school_id FROM public.profiles WHERE id = auth.uid()) OR
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('elimisha_admin', 'edufam_admin')
);

-- Messages: Users can see messages they sent or received
CREATE POLICY "Messages access" ON public.messages
FOR ALL USING (
  sender_id = auth.uid() OR 
  receiver_id = auth.uid() OR
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('elimisha_admin', 'edufam_admin')
);

-- Support tickets: School-specific access
CREATE POLICY "Support tickets school access" ON public.support_tickets
FOR ALL USING (
  school_id = (SELECT school_id FROM public.profiles WHERE id = auth.uid()) OR
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('elimisha_admin', 'edufam_admin')
);

-- Timetables: School-specific access
CREATE POLICY "Timetables school access" ON public.timetables
FOR ALL USING (
  school_id = (SELECT school_id FROM public.profiles WHERE id = auth.uid()) OR
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('elimisha_admin', 'edufam_admin')
);

-- Timetable slots: Access through timetables
CREATE POLICY "Timetable slots access" ON public.timetable_slots
FOR ALL USING (
  timetable_id IN (
    SELECT id FROM public.timetables 
    WHERE school_id = (SELECT school_id FROM public.profiles WHERE id = auth.uid())
  ) OR
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('elimisha_admin', 'edufam_admin')
);

-- Update the handle_new_user function to handle school assignment
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, name, role, school_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    CASE 
      WHEN NEW.email LIKE '%@elimisha.com' AND NEW.email NOT LIKE 'admin@elimisha.com' THEN 'elimisha_admin'
      WHEN NEW.email = 'admin@elimisha.com' THEN 'edufam_admin'
      WHEN NEW.email LIKE '%owner%' OR NEW.email LIKE '%principal%' THEN 'school_owner'
      ELSE COALESCE(NEW.raw_user_meta_data->>'role', 'parent')
    END,
    CASE 
      WHEN NEW.email LIKE '%@elimisha.com' OR NEW.email = 'admin@elimisha.com' THEN NULL
      ELSE COALESCE((NEW.raw_user_meta_data->>'school_id')::uuid, NULL)
    END
  );
  RETURN NEW;
END;
$function$;
