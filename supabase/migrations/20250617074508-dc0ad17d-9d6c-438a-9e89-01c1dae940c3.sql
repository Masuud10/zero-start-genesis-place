
-- Fix the attendance constraint error by ensuring the unique constraint exists
-- Drop existing constraint if it exists and recreate it properly
ALTER TABLE public.attendance DROP CONSTRAINT IF EXISTS attendance_unique_constraint;

-- Add the correct unique constraint for attendance upsert operations
ALTER TABLE public.attendance 
ADD CONSTRAINT attendance_unique_constraint 
UNIQUE (school_id, class_id, student_id, date, session);

-- Ensure grades table has proper constraint for upsert operations
ALTER TABLE public.grades DROP CONSTRAINT IF EXISTS grades_unique_constraint;

-- Recreate grades constraint to match the upsert operation
ALTER TABLE public.grades
ADD CONSTRAINT grades_unique_constraint 
UNIQUE (school_id, student_id, subject_id, class_id, term, exam_type);

-- Add approval workflow columns to grades table if they don't exist
DO $$
BEGIN
    -- Add approval workflow columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'grades' AND column_name = 'approved_by') THEN
        ALTER TABLE public.grades ADD COLUMN approved_by UUID REFERENCES auth.users(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'grades' AND column_name = 'approved_at') THEN
        ALTER TABLE public.grades ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'grades' AND column_name = 'released_by') THEN
        ALTER TABLE public.grades ADD COLUMN released_by UUID REFERENCES auth.users(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'grades' AND column_name = 'released_at') THEN
        ALTER TABLE public.grades ADD COLUMN released_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Create a function to update grade status workflow
CREATE OR REPLACE FUNCTION public.update_grade_status(
    grade_ids UUID[],
    new_status TEXT,
    user_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    updated_count INTEGER := 0;
    user_role TEXT;
BEGIN
    -- Get user role
    SELECT role INTO user_role FROM public.profiles WHERE id = user_id;
    
    -- Only principals can approve and release grades
    IF new_status IN ('approved', 'released') AND user_role != 'principal' THEN
        RETURN jsonb_build_object('error', 'Only principals can approve or release grades');
    END IF;
    
    -- Update grades based on status
    IF new_status = 'approved' THEN
        UPDATE public.grades 
        SET 
            status = 'approved',
            approved_by = user_id,
            approved_at = NOW()
        WHERE id = ANY(grade_ids) AND status = 'submitted';
        
        GET DIAGNOSTICS updated_count = ROW_COUNT;
        
    ELSIF new_status = 'released' THEN
        UPDATE public.grades 
        SET 
            status = 'released',
            released_by = user_id,
            released_at = NOW(),
            is_released = TRUE
        WHERE id = ANY(grade_ids) AND status = 'approved';
        
        GET DIAGNOSTICS updated_count = ROW_COUNT;
        
    ELSE
        UPDATE public.grades 
        SET status = new_status
        WHERE id = ANY(grade_ids);
        
        GET DIAGNOSTICS updated_count = ROW_COUNT;
    END IF;
    
    RETURN jsonb_build_object('success', TRUE, 'updated_count', updated_count);
END;
$$;
