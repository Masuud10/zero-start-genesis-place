-- Fix Duplicate Foreign Key Constraints
-- This migration resolves the PGRST201 error caused by duplicate foreign key relationships

-- ============================================================================
-- PROBLEM ANALYSIS
-- ============================================================================
-- The error "Could not embed because more than one relationship was found for 'grades' and 'students'"
-- occurs because there are duplicate foreign key constraints:
-- 1. fk_grades_student_id
-- 2. grades_student_id_fkey
-- 
-- PostgREST cannot determine which relationship to use for embedding.

-- ============================================================================
-- SOLUTION: REMOVE DUPLICATE FOREIGN KEY CONSTRAINTS
-- ============================================================================

-- 1. Check for and remove duplicate foreign key constraints on grades table
DO $$
DECLARE
    constraint_record RECORD;
BEGIN
    -- Find all foreign key constraints on grades.student_id
    FOR constraint_record IN 
        SELECT conname, conrelid::regclass as table_name, a.attname as column_name
        FROM pg_constraint c
        JOIN pg_attribute a ON a.attnum = ANY(c.conkey) AND a.attrelid = c.conrelid
        WHERE c.conrelid = 'public.grades'::regclass 
        AND c.contype = 'f'
        AND a.attname = 'student_id'
    LOOP
        RAISE NOTICE 'Found foreign key constraint: % on table % column %', 
            constraint_record.conname, 
            constraint_record.table_name, 
            constraint_record.column_name;
    END LOOP;
END $$;

-- 2. Drop the duplicate constraint (grades_student_id_fkey) if it exists
-- Keep the properly named constraint (fk_grades_student_id)
ALTER TABLE public.grades DROP CONSTRAINT IF EXISTS grades_student_id_fkey;

-- 3. Ensure the correct constraint exists
DO $$
BEGIN
    -- Check if fk_grades_student_id exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'fk_grades_student_id' 
        AND conrelid = 'public.grades'::regclass
    ) THEN
        -- Add the constraint if it doesn't exist
        ALTER TABLE public.grades 
        ADD CONSTRAINT fk_grades_student_id 
        FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 4. Check for and fix other potential duplicate constraints
-- Check for duplicate constraints on other columns in grades table
DO $$
DECLARE
    constraint_record RECORD;
    constraint_count INTEGER;
BEGIN
    -- Check for duplicate constraints on class_id
    SELECT COUNT(*) INTO constraint_count
    FROM pg_constraint c
    JOIN pg_attribute a ON a.attnum = ANY(c.conkey) AND a.attrelid = c.conrelid
    WHERE c.conrelid = 'public.grades'::regclass 
    AND c.contype = 'f'
    AND a.attname = 'class_id';
    
    IF constraint_count > 1 THEN
        -- Drop the duplicate constraint (keep fk_grades_class_id)
        ALTER TABLE public.grades DROP CONSTRAINT IF EXISTS grades_class_id_fkey;
    END IF;
    
    -- Check for duplicate constraints on subject_id
    SELECT COUNT(*) INTO constraint_count
    FROM pg_constraint c
    JOIN pg_attribute a ON a.attnum = ANY(c.conkey) AND a.attrelid = c.conrelid
    WHERE c.conrelid = 'public.grades'::regclass 
    AND c.contype = 'f'
    AND a.attname = 'subject_id';
    
    IF constraint_count > 1 THEN
        -- Drop the duplicate constraint (keep fk_grades_subject_id)
        ALTER TABLE public.grades DROP CONSTRAINT IF EXISTS grades_subject_id_fkey;
    END IF;
    
    -- Check for duplicate constraints on submitted_by
    SELECT COUNT(*) INTO constraint_count
    FROM pg_constraint c
    JOIN pg_attribute a ON a.attnum = ANY(c.conkey) AND a.attrelid = c.conrelid
    WHERE c.conrelid = 'public.grades'::regclass 
    AND c.contype = 'f'
    AND a.attname = 'submitted_by';
    
    IF constraint_count > 1 THEN
        -- Drop the duplicate constraint (keep fk_grades_submitted_by)
        ALTER TABLE public.grades DROP CONSTRAINT IF EXISTS grades_submitted_by_fkey;
    END IF;
    
    -- Check for duplicate constraints on reviewed_by
    SELECT COUNT(*) INTO constraint_count
    FROM pg_constraint c
    JOIN pg_attribute a ON a.attnum = ANY(c.conkey) AND a.attrelid = c.conrelid
    WHERE c.conrelid = 'public.grades'::regclass 
    AND c.contype = 'f'
    AND a.attname = 'reviewed_by';
    
    IF constraint_count > 1 THEN
        -- Drop the duplicate constraint (keep fk_grades_reviewed_by)
        ALTER TABLE public.grades DROP CONSTRAINT IF EXISTS grades_reviewed_by_fkey;
    END IF;
END $$;

-- 5. Ensure all required foreign key constraints exist with correct names
DO $$
BEGIN
    -- Ensure class_id constraint exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'fk_grades_class_id' 
        AND conrelid = 'public.grades'::regclass
    ) THEN
        ALTER TABLE public.grades 
        ADD CONSTRAINT fk_grades_class_id 
        FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE;
    END IF;
    
    -- Ensure subject_id constraint exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'fk_grades_subject_id' 
        AND conrelid = 'public.grades'::regclass
    ) THEN
        ALTER TABLE public.grades 
        ADD CONSTRAINT fk_grades_subject_id 
        FOREIGN KEY (subject_id) REFERENCES public.subjects(id) ON DELETE CASCADE;
    END IF;
    
    -- Ensure submitted_by constraint exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'fk_grades_submitted_by' 
        AND conrelid = 'public.grades'::regclass
    ) THEN
        ALTER TABLE public.grades 
        ADD CONSTRAINT fk_grades_submitted_by 
        FOREIGN KEY (submitted_by) REFERENCES public.profiles(id) ON DELETE SET NULL;
    END IF;
    
    -- Ensure reviewed_by constraint exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'fk_grades_reviewed_by' 
        AND conrelid = 'public.grades'::regclass
    ) THEN
        ALTER TABLE public.grades 
        ADD CONSTRAINT fk_grades_reviewed_by 
        FOREIGN KEY (reviewed_by) REFERENCES public.profiles(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 6. Update table statistics
ANALYZE public.grades;