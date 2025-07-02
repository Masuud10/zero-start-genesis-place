-- Database Performance Analysis and Index Creation
-- Critical indexes for frequently queried foreign keys and WHERE clauses

-- Students table - heavily queried by school_id and class_id
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_students_school_id ON students(school_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_students_class_id ON students(class_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_students_school_class ON students(school_id, class_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_students_active ON students(is_active) WHERE is_active = true;

-- Grades table - performance critical for analytics and reports
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_grades_student_school ON grades(student_id, school_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_grades_class_term ON grades(class_id, term);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_grades_academic_year ON grades(academic_year);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_grades_status_released ON grades(status) WHERE status = 'released';
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_grades_subject_class ON grades(subject_id, class_id);

-- Attendance table - queried frequently for analytics
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_attendance_student_date ON attendance(student_id, date);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_attendance_class_date ON attendance(class_id, date);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_attendance_school_term ON attendance(school_id, term);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_attendance_academic_year ON attendance(academic_year);

-- Fees table - critical for financial reports
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_fees_student_status ON fees(student_id, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_fees_school_term ON fees(school_id, term);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_fees_due_date ON fees(due_date);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_fees_academic_year ON fees(academic_year);

-- Profiles table - authentication critical
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_school_role ON profiles(school_id, role);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_status ON profiles(status) WHERE status IS NOT NULL;

-- Classes table
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_classes_school_active ON classes(school_id, is_active) WHERE is_active = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_classes_teacher ON classes(teacher_id);

-- Subjects table
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subjects_school_class ON subjects(school_id, class_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subjects_teacher ON subjects(teacher_id);

-- Subject teacher assignments - critical for teacher queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subject_teacher_assignments_teacher ON subject_teacher_assignments(teacher_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subject_teacher_assignments_subject ON subject_teacher_assignments(subject_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subject_teacher_assignments_active ON subject_teacher_assignments(is_active) WHERE is_active = true;

-- Parent students relationship
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_parent_students_parent ON parent_students(parent_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_parent_students_student ON parent_students(student_id);

-- Financial transactions
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_financial_transactions_school_date ON financial_transactions(school_id, processed_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_financial_transactions_student ON financial_transactions(student_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_financial_transactions_type ON financial_transactions(transaction_type);

-- Mpesa transactions
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_mpesa_transactions_school_date ON mpesa_transactions(school_id, transaction_date);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_mpesa_transactions_student ON mpesa_transactions(student_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_mpesa_transactions_status ON mpesa_transactions(transaction_status);

-- Announcements
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_announcements_school_date ON announcements(school_id, created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_announcements_target_audience ON announcements(target_audience);

-- Support tickets
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_support_tickets_school_status ON support_tickets(school_id, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_support_tickets_created_by ON support_tickets(created_by);

-- Security audit logs
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_security_audit_logs_user_date ON security_audit_logs(user_id, created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_security_audit_logs_school_action ON security_audit_logs(school_id, action);

-- Academic years and terms
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_academic_years_school_current ON academic_years(school_id, is_current);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_academic_terms_year ON academic_terms(academic_year_id);

-- Composite indexes for common query patterns
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_grades_analytics ON grades(school_id, class_id, academic_year, term, status) WHERE status = 'released';
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_attendance_analytics ON attendance(school_id, class_id, academic_year, term, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_fees_collection_analytics ON fees(school_id, academic_year, term, status);