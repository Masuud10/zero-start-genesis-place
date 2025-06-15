
-- 1. Main AI-Generated Timetables Table
CREATE TABLE IF NOT EXISTS public.timetables (
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

-- 2. Teachers’ Availability Slots Table
CREATE TABLE IF NOT EXISTS public.teachers_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL,
  teacher_id UUID NOT NULL,
  day_of_week TEXT NOT NULL,        -- e.g. 'Monday'
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Subjects Priority Table (e.g., core/optional, priority weight)
CREATE TABLE IF NOT EXISTS public.subjects_priority (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL,
  subject_id UUID NOT NULL,
  priority_weight INTEGER NOT NULL DEFAULT 1, -- higher = more important
  is_core BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. School Timetable Preferences Table
CREATE TABLE IF NOT EXISTS public.school_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL UNIQUE,
  max_periods_per_day INTEGER NOT NULL DEFAULT 7,
  min_break_minutes INTEGER NOT NULL DEFAULT 5,
  no_lessons_days TEXT[],
  preferred_break_times JSONB,     -- e.g., [{"day": "Friday", "start": "12:00", "end": "14:00"}]
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. RLS: Strict Isolation by school_id for all new tables
-- Allow only users with matching school_id or "edufam_admin" to access their records

-- Timetables
ALTER TABLE public.timetables ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow school users and admin to see timetable" ON public.timetables
  FOR SELECT
  USING (school_id = (SELECT school_id FROM public.profiles WHERE id = auth.uid()) OR
         (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'edufam_admin');
CREATE POLICY "Allow principals to insert/update within school" ON public.timetables
  FOR ALL
  USING (school_id = (SELECT school_id FROM public.profiles WHERE id = auth.uid()) AND
         (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'principal')
  WITH CHECK (school_id = (SELECT school_id FROM public.profiles WHERE id = auth.uid()));

-- Teachers’ Availability
ALTER TABLE public.teachers_availability ENABLE ROW LEVEL SECURITY;
CREATE POLICY "School users can read/write their teacher availability" ON public.teachers_availability
  FOR ALL
  USING (school_id = (SELECT school_id FROM public.profiles WHERE id = auth.uid()));

-- Subject Priorities
ALTER TABLE public.subjects_priority ENABLE ROW LEVEL SECURITY;
CREATE POLICY "School users can read/write subject priorities" ON public.subjects_priority
  FOR ALL
  USING (school_id = (SELECT school_id FROM public.profiles WHERE id = auth.uid()));

-- School Preferences
ALTER TABLE public.school_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Principal and admins can read/write school preferences" ON public.school_preferences
  FOR ALL
  USING (school_id = (SELECT school_id FROM public.profiles WHERE id = auth.uid()));
