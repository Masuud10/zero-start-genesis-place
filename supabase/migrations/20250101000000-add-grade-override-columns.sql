-- Add grade override functionality columns to grades table
DO $$
BEGIN
    -- Add overridden_by column for tracking who overrode the grade
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'grades' AND column_name = 'overridden_by') THEN
        ALTER TABLE public.grades ADD COLUMN overridden_by UUID REFERENCES auth.users(id);
    END IF;
    
    -- Add overridden_at column for tracking when the grade was overrode
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'grades' AND column_name = 'overridden_at') THEN
        ALTER TABLE public.grades ADD COLUMN overridden_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Add principal_notes column for principal comments on grade overrides
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'grades' AND column_name = 'principal_notes') THEN
        ALTER TABLE public.grades ADD COLUMN principal_notes TEXT;
    END IF;
    
    -- Add reviewed_by column for tracking who reviewed the grade
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'grades' AND column_name = 'reviewed_by') THEN
        ALTER TABLE public.grades ADD COLUMN reviewed_by UUID REFERENCES auth.users(id);
    END IF;
    
    -- Add reviewed_at column for tracking when the grade was reviewed
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'grades' AND column_name = 'reviewed_at') THEN
        ALTER TABLE public.grades ADD COLUMN reviewed_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Add is_released column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'grades' AND column_name = 'is_released') THEN
        ALTER TABLE public.grades ADD COLUMN is_released BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Create index for better performance on grade status queries
CREATE INDEX IF NOT EXISTS idx_grades_status_school_class ON public.grades(status, school_id, class_id);
CREATE INDEX IF NOT EXISTS idx_grades_submitted_at ON public.grades(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_grades_approved_at ON public.grades(approved_at DESC);
CREATE INDEX IF NOT EXISTS idx_grades_released_at ON public.grades(released_at DESC); 