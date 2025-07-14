-- FIX DUPLICATE FOREIGN KEY CONSTRAINTS
-- This script resolves the PGRST201 error: "Could not embed because more than one relationship was found"
-- Run this script on your Supabase database to fix the issue

-- ============================================================================
-- PROBLEM ANALYSIS
-- ============================================================================
-- The error occurs because there are duplicate foreign key constraints between tables.
-- PostgREST cannot determine which relationship to use for embedding.
-- 
-- Error details:
-- - fk_grades_student_id using grades(student_id) and students(id)
-- - grades_student_id_fkey using grades(student_id) and students(id)
-- 
-- Both constraints reference the same columns, causing ambiguity.

-- ============================================================================
-- SOLUTION: REMOVE DUPLICATE CONSTRAINTS
-- ============================================================================

-- 1. First, let's see what foreign key constraints currently exist
SELECT 
    'Current foreign key constraints on grades table:' as info;

SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition,
    a.attname as column_name
FROM pg_constraint c
JOIN pg_attribute a ON a.attnum = ANY(c.conkey) AND a.attrelid = c.conrelid
WHERE c.conrelid = 'public.grades'::regclass 
AND c.contype = 'f'
ORDER BY conname;

-- 2. Remove the duplicate constraint (grades_student_id_fkey)
-- Keep the properly named constraint (fk_grades_student_id)
ALTER TABLE public.grades DROP CONSTRAINT IF EXISTS grades_student_id_fkey;

-- 3. Remove other potential duplicate constraints
ALTER TABLE public.grades DROP CONSTRAINT IF EXISTS grades_class_id_fkey;
ALTER TABLE public.grades DROP CONSTRAINT IF EXISTS grades_subject_id_fkey;
ALTER TABLE public.grades DROP CONSTRAINT IF EXISTS grades_submitted_by_fkey;
ALTER TABLE public.grades DROP CONSTRAINT IF EXISTS grades_reviewed_by_fkey;
ALTER TABLE public.grades DROP CONSTRAINT IF EXISTS grades_school_id_fkey;

-- 4. Ensure the correct constraints exist
DO $$
BEGIN
    -- Ensure student_id constraint exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'fk_grades_student_id' 
        AND conrelid = 'public.grades'::regclass
    ) THEN
        ALTER TABLE public.grades 
        ADD CONSTRAINT fk_grades_student_id 
        FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;
    END IF;
    
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
    
    -- Ensure school_id constraint exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'fk_grades_school_id' 
        AND conrelid = 'public.grades'::regclass
    ) THEN
        ALTER TABLE public.grades 
        ADD CONSTRAINT fk_grades_school_id 
        FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 5. Check for and fix duplicate constraints on other tables that might cause similar issues
-- Attendance table
ALTER TABLE public.attendance DROP CONSTRAINT IF EXISTS attendance_student_id_fkey;
ALTER TABLE public.attendance DROP CONSTRAINT IF EXISTS attendance_class_id_fkey;
ALTER TABLE public.attendance DROP CONSTRAINT IF EXISTS attendance_submitted_by_fkey;

-- Fees table
ALTER TABLE public.fees DROP CONSTRAINT IF EXISTS fees_student_id_fkey;

-- Students table
ALTER TABLE public.students DROP CONSTRAINT IF EXISTS students_school_id_fkey;
ALTER TABLE public.students DROP CONSTRAINT IF EXISTS students_class_id_fkey;

-- Classes table
ALTER TABLE public.classes DROP CONSTRAINT IF EXISTS classes_school_id_fkey;
ALTER TABLE public.classes DROP CONSTRAINT IF EXISTS classes_teacher_id_fkey;

-- Subjects table
ALTER TABLE public.subjects DROP CONSTRAINT IF EXISTS subjects_school_id_fkey;

-- Profiles table
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_school_id_fkey;

-- 6. Update table statistics for better query performance
ANALYZE public.grades;
ANALYZE public.students;
ANALYZE public.classes;
ANALYZE public.subjects;
ANALYZE public.attendance;
ANALYZE public.fees;
ANALYZE public.profiles;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Check the final state of foreign key constraints
SELECT 
    'Final foreign key constraints on grades table:' as info;

SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.grades'::regclass 
AND contype = 'f'
ORDER BY conname;

-- Check specifically for student_id constraints (should be only one)
SELECT 
    'Student ID constraints on grades table:' as info;

SELECT 
    conname as constraint_name,
    a.attname as column_name,
    confrelid::regclass as referenced_table
FROM pg_constraint c
JOIN pg_attribute a ON a.attnum = ANY(c.conkey) AND a.attrelid = c.conrelid
WHERE c.conrelid = 'public.grades'::regclass 
AND c.contype = 'f'
AND a.attname = 'student_id'
ORDER BY conname;

-- ============================================================================
-- TESTING QUERIES
-- ============================================================================
-- After running this script, test these queries to verify the fix:

-- Test 1: Basic grades query with students embedding
-- This should work without PGRST201 error
-- SELECT * FROM grades?select=*,students!fk_grades_student_id(*)

-- Test 2: Grades query with multiple embeddings
-- This should work without ambiguity
-- SELECT * FROM grades?select=*,students!fk_grades_student_id(*),classes!fk_grades_class_id(*)

-- Test 3: Complex query with filters
-- This should work correctly
-- SELECT * FROM grades?select=*,students!fk_grades_student_id(name,admission_number)&student_id=eq.some-student-id

-- ============================================================================
-- EXPECTED RESULTS
-- ============================================================================
-- After running this script, you should see:
-- 1. Only one foreign key constraint for each relationship
-- 2. Consistent naming convention (fk_table_column)
-- 3. No duplicate constraints
-- 4. PostgREST queries work without PGRST201 errors
-- 5. Proper data relationships maintained

-- ============================================================================
-- TROUBLESHOOTING
-- ============================================================================
-- If you still see PGRST201 errors after running this script:

-- 1. Check if there are any remaining duplicate constraints:
-- SELECT conname, COUNT(*) 
-- FROM pg_constraint c
-- JOIN pg_attribute a ON a.attnum = ANY(c.conkey) AND a.attrelid = c.conrelid
-- WHERE c.conrelid = 'public.grades'::regclass 
-- AND c.contype = 'f'
-- GROUP BY conname
-- HAVING COUNT(*) > 1;

-- 2. Verify the constraint names in your queries match exactly:
-- Use the constraint names shown in the verification queries above

-- 3. If using Supabase client, regenerate types:
-- npx supabase gen types typescript --project-id your-project-id > src/types/database.types.ts

-- 4. Clear any cached queries in your application 