-- Critical Performance Indexes - Core Tables
-- Students table - heavily queried by school_id and class_id
CREATE INDEX IF NOT EXISTS idx_students_school_id ON students(school_id);
CREATE INDEX IF NOT EXISTS idx_students_class_id ON students(class_id);
CREATE INDEX IF NOT EXISTS idx_students_school_class ON students(school_id, class_id);
CREATE INDEX IF NOT EXISTS idx_students_active ON students(is_active) WHERE is_active = true;

-- Grades table - performance critical for analytics and reports
CREATE INDEX IF NOT EXISTS idx_grades_student_school ON grades(student_id, school_id);
CREATE INDEX IF NOT EXISTS idx_grades_class_term ON grades(class_id, term);
CREATE INDEX IF NOT EXISTS idx_grades_status_released ON grades(status) WHERE status = 'released';
CREATE INDEX IF NOT EXISTS idx_grades_subject_class ON grades(subject_id, class_id);

-- Attendance table - queried frequently for analytics
CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON attendance(student_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_class_date ON attendance(class_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_school_term ON attendance(school_id, term);
CREATE INDEX IF NOT EXISTS idx_attendance_academic_year ON attendance(academic_year);

-- Fees table - critical for financial reports
CREATE INDEX IF NOT EXISTS idx_fees_student_status ON fees(student_id, status);
CREATE INDEX IF NOT EXISTS idx_fees_school_term ON fees(school_id, term);
CREATE INDEX IF NOT EXISTS idx_fees_due_date ON fees(due_date);
CREATE INDEX IF NOT EXISTS idx_fees_academic_year ON fees(academic_year);

-- Profiles table - authentication critical
CREATE INDEX IF NOT EXISTS idx_profiles_school_role ON profiles(school_id, role);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);