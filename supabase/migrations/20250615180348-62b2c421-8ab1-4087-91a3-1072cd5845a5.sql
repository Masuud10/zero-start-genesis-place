
-- Step 1: Add school_id to junction tables if they don't exist
DO $$
BEGIN
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='student_classes' AND column_name='school_id') THEN
    ALTER TABLE public.student_classes ADD COLUMN school_id UUID;
  END IF;
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='parent_students' AND column_name='school_id') THEN
    ALTER TABLE public.parent_students ADD COLUMN school_id UUID;
  END IF;
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='teacher_classes' AND column_name='school_id') THEN
    ALTER TABLE public.teacher_classes ADD COLUMN school_id UUID;
  END IF;
END;
$$;

-- Step 2: Backfill school_id for existing records in junction tables
UPDATE public.student_classes sc
SET school_id = s.school_id
FROM public.students s
WHERE sc.student_id = s.id AND sc.school_id IS NULL;

UPDATE public.parent_students ps
SET school_id = s.school_id
FROM public.students s
WHERE ps.student_id = s.id AND ps.school_id IS NULL;

UPDATE public.teacher_classes tc
SET school_id = c.school_id
FROM public.classes c
WHERE tc.class_id = c.id AND tc.school_id IS NULL;

-- Step 3: Add foreign key constraints and indexes
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_student_classes_school_id') THEN
    ALTER TABLE public.student_classes
    ADD CONSTRAINT fk_student_classes_school_id FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE;
  END IF;
  CREATE INDEX IF NOT EXISTS idx_student_classes_school_id ON public.student_classes(school_id);

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_parent_students_school_id') THEN
    ALTER TABLE public.parent_students
    ADD CONSTRAINT fk_parent_students_school_id FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE;
  END IF;
  CREATE INDEX IF NOT EXISTS idx_parent_students_school_id ON public.parent_students(school_id);

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_teacher_classes_school_id') THEN
    ALTER TABLE public.teacher_classes
    ADD CONSTRAINT fk_teacher_classes_school_id FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE;
  END IF;
  CREATE INDEX IF NOT EXISTS idx_teacher_classes_school_id ON public.teacher_classes(school_id);
END;
$$;

-- Step 4: Apply Row Level Security policies to all school-scoped tables (CORRECTED)
CREATE OR REPLACE FUNCTION public.create_school_scoped_rls(p_table_name TEXT)
RETURNS void AS $$
DECLARE
  policy_name TEXT;
BEGIN
  policy_name := 'School-scoped access for ' || p_table_name;

  EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', p_table_name);

  -- CORRECTED: Use %I for policy_name to treat it as an identifier, not a literal string
  EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', policy_name, p_table_name);

  -- CORRECTED: Use %I for policy_name here as well
  EXECUTE format('
    CREATE POLICY %I ON public.%I
    FOR ALL
    USING (school_id = public.get_current_user_school_id() OR public.get_current_user_role() IN (''elimisha_admin'', ''edufam_admin''))
    WITH CHECK (school_id = public.get_current_user_school_id() OR public.get_current_user_role() IN (''elimisha_admin'', ''edufam_admin''));
  ', policy_name, p_table_name);
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  tables_to_secure TEXT[] := ARRAY[
    'students', 'classes', 'subjects', 'announcements', 'messages', 'timetables',
    'grades', 'attendance', 'fees', 'financial_transactions', 'support_tickets',
    'student_classes', 'parent_students', 'teacher_classes'
  ];
  t TEXT;
BEGIN
  FOREACH t IN ARRAY tables_to_secure
  LOOP
    -- Ensure table exists before trying to apply policy
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = t) THEN
        PERFORM public.create_school_scoped_rls(t);
    END IF;
  END LOOP;
END;
$$;

DROP FUNCTION public.create_school_scoped_rls;
