
-- Add foreign keys to 'timetables' table to fix relationship errors
DO $$
BEGIN
  -- Link timetables to classes
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'timetables_class_id_fkey') THEN
    ALTER TABLE public.timetables ADD CONSTRAINT timetables_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE;
  END IF;
  
  -- Link timetables to subjects
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'timetables_subject_id_fkey') THEN
    ALTER TABLE public.timetables ADD CONSTRAINT timetables_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id) ON DELETE CASCADE;
  END IF;
  
  -- Link timetables to teachers (profiles)
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'timetables_teacher_id_fkey') THEN
    ALTER TABLE public.timetables ADD CONSTRAINT timetables_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END;
$$;

-- Add foreign keys to 'teacher_classes' table for data consistency
DO $$
BEGIN
  -- Link teacher_classes to classes
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'teacher_classes_class_id_fkey') THEN
    ALTER TABLE public.teacher_classes ADD CONSTRAINT teacher_classes_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE;
  END IF;

  -- Link teacher_classes to subjects
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'teacher_classes_subject_id_fkey') THEN
    ALTER TABLE public.teacher_classes ADD CONSTRAINT teacher_classes_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id) ON DELETE CASCADE;
  END IF;
  
  -- Link teacher_classes to teachers (profiles)
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'teacher_classes_teacher_id_fkey') THEN
    ALTER TABLE public.teacher_classes ADD CONSTRAINT teacher_classes_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END;
$$;
