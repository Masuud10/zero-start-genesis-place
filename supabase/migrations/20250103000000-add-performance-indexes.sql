-- Performance Optimization Indexes
-- This migration adds indexes for frequently queried fields to improve query performance

-- Students table indexes
CREATE INDEX IF NOT EXISTS idx_students_school_id_active ON students(school_id, is_active);
CREATE INDEX IF NOT EXISTS idx_students_class_id ON students(class_id);
CREATE INDEX IF NOT EXISTS idx_students_parent_id ON students(parent_id);
CREATE INDEX IF NOT EXISTS idx_students_created_at ON students(created_at DESC);

-- Profiles table indexes
CREATE INDEX IF NOT EXISTS idx_profiles_school_id_role ON profiles(school_id, role);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);

-- Classes table indexes
CREATE INDEX IF NOT EXISTS idx_classes_school_id ON classes(school_id);
CREATE INDEX IF NOT EXISTS idx_classes_level_stream ON classes(level, stream);

-- Subjects table indexes
CREATE INDEX IF NOT EXISTS idx_subjects_school_id ON subjects(school_id);
CREATE INDEX IF NOT EXISTS idx_subjects_code ON subjects(code);

-- Grades table indexes
CREATE INDEX IF NOT EXISTS idx_grades_school_id ON grades(school_id);
CREATE INDEX IF NOT EXISTS idx_grades_student_id ON grades(student_id);
CREATE INDEX IF NOT EXISTS idx_grades_submitted_by ON grades(submitted_by);
CREATE INDEX IF NOT EXISTS idx_grades_status ON grades(status);
CREATE INDEX IF NOT EXISTS idx_grades_created_at ON grades(created_at DESC);

-- Attendance table indexes
CREATE INDEX IF NOT EXISTS idx_attendance_school_id ON attendance(school_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_class_id ON attendance(class_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_attendance_submitted_by ON attendance(submitted_by);
CREATE INDEX IF NOT EXISTS idx_attendance_school_date ON attendance(school_id, date);

-- Fees table indexes
CREATE INDEX IF NOT EXISTS idx_fees_school_id ON fees(school_id);
CREATE INDEX IF NOT EXISTS idx_fees_student_id ON fees(student_id);
CREATE INDEX IF NOT EXISTS idx_fees_status ON fees(status);
CREATE INDEX IF NOT EXISTS idx_fees_due_date ON fees(due_date);

-- Financial transactions table indexes
CREATE INDEX IF NOT EXISTS idx_financial_transactions_school_id ON financial_transactions(school_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_transaction_type ON financial_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_created_at ON financial_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_school_type_date ON financial_transactions(school_id, transaction_type, created_at);

-- Parent students relationship table indexes
CREATE INDEX IF NOT EXISTS idx_parent_students_parent_id ON parent_students(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_students_student_id ON parent_students(student_id);

-- Teacher assignments indexes
CREATE INDEX IF NOT EXISTS idx_teacher_classes_teacher_id ON teacher_classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_classes_school_id ON teacher_classes(school_id);
CREATE INDEX IF NOT EXISTS idx_subject_teacher_assignments_teacher_id ON subject_teacher_assignments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_subject_teacher_assignments_school_id ON subject_teacher_assignments(school_id);

-- Examinations table indexes
CREATE INDEX IF NOT EXISTS idx_examinations_school_id ON examinations(school_id);
CREATE INDEX IF NOT EXISTS idx_examinations_created_by ON examinations(created_by);
CREATE INDEX IF NOT EXISTS idx_examinations_academic_year ON examinations(academic_year);
CREATE INDEX IF NOT EXISTS idx_examinations_start_date ON examinations(start_date);

-- Announcements table indexes
CREATE INDEX IF NOT EXISTS idx_announcements_school_id ON announcements(school_id);
CREATE INDEX IF NOT EXISTS idx_announcements_created_by ON announcements(created_by);
CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON announcements(created_at DESC);

-- Certificates table indexes
CREATE INDEX IF NOT EXISTS idx_certificates_school_id ON certificates(school_id);
CREATE INDEX IF NOT EXISTS idx_certificates_student_id ON certificates(student_id);
CREATE INDEX IF NOT EXISTS idx_certificates_created_at ON certificates(created_at DESC);

-- Schools table indexes
CREATE INDEX IF NOT EXISTS idx_schools_status ON schools(status);
CREATE INDEX IF NOT EXISTS idx_schools_created_at ON schools(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_schools_owner_id ON schools(owner_id);

-- Composite indexes for complex queries
CREATE INDEX IF NOT EXISTS idx_students_school_class_active ON students(school_id, class_id, is_active);
CREATE INDEX IF NOT EXISTS idx_grades_school_student_status ON grades(school_id, student_id, status);
CREATE INDEX IF NOT EXISTS idx_attendance_school_class_date ON attendance(school_id, class_id, date);
CREATE INDEX IF NOT EXISTS idx_fees_school_student_status ON fees(school_id, student_id, status);

-- Partial indexes for active records
CREATE INDEX IF NOT EXISTS idx_students_active_only ON students(school_id, class_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_profiles_active_only ON profiles(school_id, role) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_grades_submitted_only ON grades(school_id, submitted_by) WHERE status = 'submitted';

-- Add comments for documentation
COMMENT ON INDEX idx_students_school_id_active IS 'Optimizes queries for active students by school';
COMMENT ON INDEX idx_profiles_school_id_role IS 'Optimizes role-based user queries by school';
COMMENT ON INDEX idx_grades_school_student_status IS 'Optimizes grade queries by school, student, and status';
COMMENT ON INDEX idx_attendance_school_class_date IS 'Optimizes attendance queries by school, class, and date';
COMMENT ON INDEX idx_fees_school_student_status IS 'Optimizes fee queries by school, student, and status'; 