
-- Fix subjects table performance and integrity issues

-- Add proper indexes for performance
CREATE INDEX IF NOT EXISTS idx_subjects_school_id_active ON public.subjects(school_id, is_active);
CREATE INDEX IF NOT EXISTS idx_subjects_school_curriculum ON public.subjects(school_id, curriculum) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_subjects_class_school ON public.subjects(class_id, school_id) WHERE is_active = true;

-- Ensure proper foreign key constraints
DO $$
BEGIN
    -- Add foreign key constraint for school_id if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'subjects_school_id_fkey' 
        AND table_name = 'subjects'
    ) THEN
        ALTER TABLE public.subjects 
        ADD CONSTRAINT subjects_school_id_fkey 
        FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE;
    END IF;

    -- Add foreign key constraint for class_id if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'subjects_class_id_fkey' 
        AND table_name = 'subjects'
    ) THEN
        ALTER TABLE public.subjects 
        ADD CONSTRAINT subjects_class_id_fkey 
        FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE SET NULL;
    END IF;

    -- Add foreign key constraint for teacher_id if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'subjects_teacher_id_fkey' 
        AND table_name = 'subjects'
    ) THEN
        ALTER TABLE public.subjects 
        ADD CONSTRAINT subjects_teacher_id_fkey 
        FOREIGN KEY (teacher_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
    END IF;
END
$$;

-- Clean up any orphaned data that might cause join failures
UPDATE public.subjects 
SET 
    curriculum = COALESCE(curriculum, 'cbc'),
    category = COALESCE(category, 'core'),
    is_active = COALESCE(is_active, true),
    credit_hours = COALESCE(credit_hours, 1),
    assessment_weight = COALESCE(assessment_weight, 100)
WHERE curriculum IS NULL 
   OR category IS NULL 
   OR is_active IS NULL
   OR credit_hours IS NULL
   OR assessment_weight IS NULL;

-- Remove any truly orphaned subjects (subjects without valid school_id)
DELETE FROM public.subjects 
WHERE school_id IS NULL 
   OR NOT EXISTS (SELECT 1 FROM public.schools WHERE id = subjects.school_id);

-- Analyze tables for better query planning
ANALYZE public.subjects;
ANALYZE public.schools;
ANALYZE public.classes;
ANALYZE public.profiles;
