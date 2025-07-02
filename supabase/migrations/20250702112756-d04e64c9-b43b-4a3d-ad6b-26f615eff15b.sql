-- Fix Parent Dashboard Performance Issues
-- Add critical missing indexes for parent queries

-- Optimize parent_students lookups with composite indexes
CREATE INDEX IF NOT EXISTS idx_parent_students_parent_school ON public.parent_students(parent_id, school_id);

-- Optimize grades queries for parents (status + created_at for sorting)
CREATE INDEX IF NOT EXISTS idx_grades_student_status_created ON public.grades(student_id, status, created_at DESC) WHERE status = 'released';

-- Optimize attendance queries for parents (student + date range)
CREATE INDEX IF NOT EXISTS idx_attendance_student_date_range ON public.attendance(student_id, date DESC, status);

-- Optimize student_fees parent queries
CREATE INDEX IF NOT EXISTS idx_student_fees_student_due_date ON public.student_fees(student_id, due_date DESC, status);

-- Optimize fees table for parent fee overview queries
CREATE INDEX IF NOT EXISTS idx_fees_student_academic ON public.fees(student_id, academic_year, term, created_at DESC);

-- Composite index for parent dashboard stats (attendance by date range)
CREATE INDEX IF NOT EXISTS idx_attendance_date_range_status ON public.attendance(date, status) WHERE status IS NOT NULL;

-- Update table statistics for query planner optimization
ANALYZE public.parent_students;
ANALYZE public.grades;
ANALYZE public.attendance;
ANALYZE public.student_fees;
ANALYZE public.fees;