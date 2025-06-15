
-- Step 1: Backfill school_id for grades from the associated student's school.
-- This ensures that existing grade records are linked to a school.
UPDATE public.grades g
SET school_id = s.school_id
FROM public.students s
WHERE g.student_id = s.id AND g.school_id IS NULL;

-- Step 2: Backfill school_id for attendance records from the associated student's school.
UPDATE public.attendance a
SET school_id = s.school_id
FROM public.students s
WHERE a.student_id = s.id AND a.school_id IS NULL;

-- Step 3: Enforce NOT NULL constraint on school_id for tables where it's critical for RLS.
-- This prevents new records from being created without a school_id, ensuring data integrity.
-- An error will be thrown if any records failed to backfill, which is a safety check.
DO $$
BEGIN
  -- We only alter columns if they exist and are nullable
  IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='grades' AND column_name='school_id' AND is_nullable = 'YES') THEN
    ALTER TABLE public.grades ALTER COLUMN school_id SET NOT NULL;
  END IF;
  IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='attendance' AND column_name='school_id' AND is_nullable = 'YES') THEN
    ALTER TABLE public.attendance ALTER COLUMN school_id SET NOT NULL;
  END IF;
  IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='student_classes' AND column_name='school_id' AND is_nullable = 'YES') THEN
    ALTER TABLE public.student_classes ALTER COLUMN school_id SET NOT NULL;
  END IF;
  IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='parent_students' AND column_name='school_id' AND is_nullable = 'YES') THEN
    ALTER TABLE public.parent_students ALTER COLUMN school_id SET NOT NULL;
  END IF;
  IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='teacher_classes' AND column_name='school_id' AND is_nullable = 'YES') THEN
    ALTER TABLE public.teacher_classes ALTER COLUMN school_id SET NOT NULL;
  END IF;
END;
$$;
