
-- Ensure subjects table has all required fields with proper constraints
ALTER TABLE public.subjects 
ADD COLUMN IF NOT EXISTS curriculum TEXT DEFAULT 'cbc',
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'core',
ADD COLUMN IF NOT EXISTS credit_hours INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS assessment_weight NUMERIC DEFAULT 100,
ADD COLUMN IF NOT EXISTS prerequisites TEXT[],
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Ensure proper indexes exist for performance
CREATE INDEX IF NOT EXISTS idx_subjects_school_id ON public.subjects(school_id);
CREATE INDEX IF NOT EXISTS idx_subjects_class_id ON public.subjects(class_id);
CREATE INDEX IF NOT EXISTS idx_subjects_teacher_id ON public.subjects(teacher_id);
CREATE INDEX IF NOT EXISTS idx_subjects_active ON public.subjects(is_active);

-- Ensure unique constraint on subject code per school
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'unique_subject_code_per_school' 
        AND table_name = 'subjects'
    ) THEN
        ALTER TABLE public.subjects 
        ADD CONSTRAINT unique_subject_code_per_school 
        UNIQUE (code, school_id);
    END IF;
END
$$;

-- Update existing subjects to have default values if null
UPDATE public.subjects 
SET 
    curriculum = COALESCE(curriculum, 'cbc'),
    category = COALESCE(category, 'core'),
    credit_hours = COALESCE(credit_hours, 1),
    assessment_weight = COALESCE(assessment_weight, 100),
    is_active = COALESCE(is_active, true)
WHERE curriculum IS NULL 
   OR category IS NULL 
   OR credit_hours IS NULL 
   OR assessment_weight IS NULL 
   OR is_active IS NULL;
