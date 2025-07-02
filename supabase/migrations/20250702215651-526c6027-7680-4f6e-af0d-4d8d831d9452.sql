-- Additional Performance Indexes - Secondary Tables
-- Classes table
CREATE INDEX IF NOT EXISTS idx_classes_school_teacher ON classes(school_id, teacher_id);
CREATE INDEX IF NOT EXISTS idx_classes_teacher ON classes(teacher_id);

-- Subjects table
CREATE INDEX IF NOT EXISTS idx_subjects_school_class ON subjects(school_id, class_id);
CREATE INDEX IF NOT EXISTS idx_subjects_teacher ON subjects(teacher_id);
CREATE INDEX IF NOT EXISTS idx_subjects_active ON subjects(is_active) WHERE is_active = true;

-- Financial transactions performance
CREATE INDEX IF NOT EXISTS idx_financial_transactions_school_date ON financial_transactions(school_id, created_at);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_student ON financial_transactions(student_id);

-- Support tickets
CREATE INDEX IF NOT EXISTS idx_support_tickets_school_status ON support_tickets(school_id, status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_by ON support_tickets(created_by);

-- Security audit logs for monitoring
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_user_date ON security_audit_logs(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_school_action ON security_audit_logs(school_id, action);