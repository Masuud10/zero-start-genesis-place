-- Phase 1 Critical Fixes: Database Integrity and Performance (Fixed)

-- Fix 1: Update role check constraint to include 'hr' role
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('school_owner', 'principal', 'teacher', 'parent', 'finance_officer', 'hr', 'edufam_admin', 'elimisha_admin'));

-- Fix 2: Add critical missing indexes for performance (without function expressions)
-- Index for frequently queried combinations in grades table
CREATE INDEX IF NOT EXISTS idx_grades_school_term_status 
ON public.grades (school_id, term, status) 
WHERE status IN ('released', 'approved');

-- Index for student performance queries
CREATE INDEX IF NOT EXISTS idx_grades_student_released 
ON public.grades (student_id, created_at DESC) 
WHERE status = 'released';

-- Index for class analytics queries
CREATE INDEX IF NOT EXISTS idx_students_class_active_count 
ON public.students (class_id, is_active) 
WHERE is_active = true;

-- Fix 3: Add performance index for profiles queries
CREATE INDEX IF NOT EXISTS idx_profiles_email_role 
ON public.profiles (email, role) 
WHERE status = 'active';

-- Fix 4: Clean up orphaned data and ensure referential integrity
-- Update any students without school_id (this should not happen but let's be safe)
UPDATE public.students 
SET school_id = (
    SELECT c.school_id 
    FROM public.classes c 
    WHERE c.id = students.class_id 
    LIMIT 1
) 
WHERE school_id IS NULL AND class_id IS NOT NULL;

-- Update any classes without school_id
UPDATE public.classes 
SET school_id = (
    SELECT p.school_id 
    FROM public.profiles p 
    WHERE p.id = classes.teacher_id 
    AND p.school_id IS NOT NULL 
    LIMIT 1
) 
WHERE school_id IS NULL AND teacher_id IS NOT NULL;

-- Update any subjects without school_id
UPDATE public.subjects 
SET school_id = (
    SELECT c.school_id 
    FROM public.classes c 
    WHERE c.id = subjects.class_id 
    LIMIT 1
) 
WHERE school_id IS NULL AND class_id IS NOT NULL;