-- Notifications and Audit System Migration
-- This migration adds comprehensive notification and audit logging capabilities

-- 1. Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT CHECK (type IN ('info', 'success', 'warning', 'error')) DEFAULT 'info',
    category TEXT CHECK (category IN ('grades', 'attendance', 'examinations', 'reports', 'analytics', 'system')) DEFAULT 'system',
    academic_context JSONB,
    action_url TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE
);

-- 2. Notification preferences table
CREATE TABLE IF NOT EXISTS public.notification_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    grade_submissions BOOLEAN DEFAULT true,
    grade_approvals BOOLEAN DEFAULT true,
    attendance_alerts BOOLEAN DEFAULT true,
    exam_reminders BOOLEAN DEFAULT true,
    report_generation BOOLEAN DEFAULT true,
    system_alerts BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Audit logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    academic_context JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. System events table
CREATE TABLE IF NOT EXISTS public.system_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type TEXT NOT NULL,
    event_data JSONB,
    severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    processed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_category ON public.notifications(category);
CREATE INDEX IF NOT EXISTS idx_notifications_school_id ON public.notifications(school_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_school_id ON public.audit_logs(school_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON public.audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_system_events_type ON public.system_events(event_type);
CREATE INDEX IF NOT EXISTS idx_system_events_severity ON public.system_events(severity);
CREATE INDEX IF NOT EXISTS idx_system_events_school_id ON public.system_events(school_id);
CREATE INDEX IF NOT EXISTS idx_system_events_created_at ON public.system_events(created_at);

-- 6. RLS Policies for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" ON public.notifications
    FOR INSERT WITH CHECK (true);

-- 7. RLS Policies for notification preferences
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own preferences" ON public.notification_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" ON public.notification_preferences
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" ON public.notification_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 8. RLS Policies for audit logs (read-only for users, full access for system)
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view audit logs for their school" ON public.audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND school_id = audit_logs.school_id
        )
    );

CREATE POLICY "System can insert audit logs" ON public.audit_logs
    FOR INSERT WITH CHECK (true);

-- 9. RLS Policies for system events
ALTER TABLE public.system_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view system events for their school" ON public.system_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND school_id = system_events.school_id
        )
    );

CREATE POLICY "System can insert system events" ON public.system_events
    FOR INSERT WITH CHECK (true);

-- 10. Function to automatically add school_id to notifications
CREATE OR REPLACE FUNCTION public.set_notification_school_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.school_id IS NULL THEN
        SELECT school_id INTO NEW.school_id 
        FROM public.profiles 
        WHERE id = NEW.user_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_notification_school_id_trigger
    BEFORE INSERT ON public.notifications
    FOR EACH ROW
    EXECUTE FUNCTION public.set_notification_school_id();

-- 11. Function to automatically add school_id to audit logs
CREATE OR REPLACE FUNCTION public.set_audit_log_school_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.school_id IS NULL THEN
        SELECT school_id INTO NEW.school_id 
        FROM public.profiles 
        WHERE id = NEW.user_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_audit_log_school_id_trigger
    BEFORE INSERT ON public.audit_logs
    FOR EACH ROW
    EXECUTE FUNCTION public.set_audit_log_school_id();

-- 12. Function to clean up expired notifications
CREATE OR REPLACE FUNCTION public.cleanup_expired_notifications()
RETURNS void AS $$
BEGIN
    DELETE FROM public.notifications 
    WHERE expires_at IS NOT NULL 
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- 13. Create a scheduled job to clean up expired notifications (runs daily)
SELECT cron.schedule(
    'cleanup-expired-notifications',
    '0 2 * * *', -- Daily at 2 AM
    'SELECT public.cleanup_expired_notifications();'
);

-- 14. Function to log grade changes
CREATE OR REPLACE FUNCTION public.log_grade_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.audit_logs (
            user_id, action, table_name, record_id, new_values, academic_context
        ) VALUES (
            auth.uid(), 'INSERT', TG_TABLE_NAME, NEW.id, to_jsonb(NEW), 
            jsonb_build_object(
                'academic_year_id', NEW.academic_year_id,
                'term_id', NEW.term_id,
                'class_id', NEW.class_id,
                'subject_id', NEW.subject_id
            )
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO public.audit_logs (
            user_id, action, table_name, record_id, old_values, new_values, academic_context
        ) VALUES (
            auth.uid(), 'UPDATE', TG_TABLE_NAME, NEW.id, to_jsonb(OLD), to_jsonb(NEW),
            jsonb_build_object(
                'academic_year_id', NEW.academic_year_id,
                'term_id', NEW.term_id,
                'class_id', NEW.class_id,
                'subject_id', NEW.subject_id
            )
        );
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO public.audit_logs (
            user_id, action, table_name, record_id, old_values, academic_context
        ) VALUES (
            auth.uid(), 'DELETE', TG_TABLE_NAME, OLD.id, to_jsonb(OLD),
            jsonb_build_object(
                'academic_year_id', OLD.academic_year_id,
                'term_id', OLD.term_id,
                'class_id', OLD.class_id,
                'subject_id', OLD.subject_id
            )
        );
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 15. Create triggers for grade-related tables
CREATE TRIGGER log_grades_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.grades
    FOR EACH ROW
    EXECUTE FUNCTION public.log_grade_changes();

-- 16. Function to log attendance changes
CREATE OR REPLACE FUNCTION public.log_attendance_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.audit_logs (
            user_id, action, table_name, record_id, new_values, academic_context
        ) VALUES (
            auth.uid(), 'INSERT', TG_TABLE_NAME, NEW.id, to_jsonb(NEW),
            jsonb_build_object(
                'academic_year_id', NEW.academic_year_id,
                'term_id', NEW.term_id,
                'class_id', NEW.class_id
            )
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO public.audit_logs (
            user_id, action, table_name, record_id, old_values, new_values, academic_context
        ) VALUES (
            auth.uid(), 'UPDATE', TG_TABLE_NAME, NEW.id, to_jsonb(OLD), to_jsonb(NEW),
            jsonb_build_object(
                'academic_year_id', NEW.academic_year_id,
                'term_id', NEW.term_id,
                'class_id', NEW.class_id
            )
        );
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO public.audit_logs (
            user_id, action, table_name, record_id, old_values, academic_context
        ) VALUES (
            auth.uid(), 'DELETE', TG_TABLE_NAME, OLD.id, to_jsonb(OLD),
            jsonb_build_object(
                'academic_year_id', OLD.academic_year_id,
                'term_id', OLD.term_id,
                'class_id', OLD.class_id
            )
        );
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_attendance_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.attendance
    FOR EACH ROW
    EXECUTE FUNCTION public.log_attendance_changes();

-- 17. Function to log examination changes
CREATE OR REPLACE FUNCTION public.log_examination_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.audit_logs (
            user_id, action, table_name, record_id, new_values, academic_context
        ) VALUES (
            auth.uid(), 'INSERT', TG_TABLE_NAME, NEW.id, to_jsonb(NEW),
            jsonb_build_object(
                'academic_year_id', NEW.academic_year_id,
                'term_id', NEW.term_id
            )
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO public.audit_logs (
            user_id, action, table_name, record_id, old_values, new_values, academic_context
        ) VALUES (
            auth.uid(), 'UPDATE', TG_TABLE_NAME, NEW.id, to_jsonb(OLD), to_jsonb(NEW),
            jsonb_build_object(
                'academic_year_id', NEW.academic_year_id,
                'term_id', NEW.term_id
            )
        );
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO public.audit_logs (
            user_id, action, table_name, record_id, old_values, academic_context
        ) VALUES (
            auth.uid(), 'DELETE', TG_TABLE_NAME, OLD.id, to_jsonb(OLD),
            jsonb_build_object(
                'academic_year_id', OLD.academic_year_id,
                'term_id', OLD.term_id
            )
        );
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_examination_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.examinations
    FOR EACH ROW
    EXECUTE FUNCTION public.log_examination_changes();

-- 18. Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON public.notifications TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.notification_preferences TO authenticated;
GRANT SELECT ON public.audit_logs TO authenticated;
GRANT SELECT ON public.system_events TO authenticated;

-- 19. Create views for easier querying
CREATE OR REPLACE VIEW public.user_notifications_view AS
SELECT 
    n.*,
    p.name as user_name,
    p.email as user_email,
    s.name as school_name
FROM public.notifications n
JOIN public.profiles p ON n.user_id = p.id
JOIN public.schools s ON n.school_id = s.id;

CREATE OR REPLACE VIEW public.audit_logs_view AS
SELECT 
    al.*,
    p.name as user_name,
    p.email as user_email,
    s.name as school_name
FROM public.audit_logs al
LEFT JOIN public.profiles p ON al.user_id = p.id
LEFT JOIN public.schools s ON al.school_id = s.id;

-- 20. Add comments for documentation
COMMENT ON TABLE public.notifications IS 'System notifications for users';
COMMENT ON TABLE public.notification_preferences IS 'User preferences for notification types';
COMMENT ON TABLE public.audit_logs IS 'Audit trail for all system actions';
COMMENT ON TABLE public.system_events IS 'System-level events and alerts'; 