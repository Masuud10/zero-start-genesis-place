-- =====================================================
-- COMPREHENSIVE DATABASE EXPANSION FOR EDUFAM ADMIN APP
-- Phase 1: Foundational Database Expansion
-- =====================================================

-- 1. ACADEMIC TRIPS MODULE
-- =====================================================

-- Table to store the details of each academic trip package
CREATE TABLE IF NOT EXISTS public.academic_trips (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    trip_name TEXT NOT NULL,
    destination TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    price_per_student NUMERIC(10, 2) NOT NULL,
    capacity INT NOT NULL,
    target_age_group TEXT,
    itinerary_details JSONB,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Linking table to manage student registrations for trips
CREATE TABLE IF NOT EXISTS public.trip_registrations (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    trip_id BIGINT REFERENCES public.academic_trips(id) ON DELETE CASCADE NOT NULL,
    student_id UUID REFERENCES public.students(user_id) ON DELETE CASCADE NOT NULL,
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    registration_date TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    status TEXT NOT NULL DEFAULT 'registered', -- 'registered', 'paid', 'cancelled'
    registered_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. SUPPORT & HR MODULE
-- =====================================================

-- Support tickets table
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    submitted_by UUID REFERENCES auth.users(id) NOT NULL,
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
    status TEXT NOT NULL DEFAULT 'open', -- 'open', 'in_progress', 'resolved', 'closed'
    assigned_to UUID REFERENCES auth.users(id),
    category TEXT NOT NULL, -- 'technical', 'billing', 'feature_request', 'general'
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    resolved_at TIMESTAMPTZ
);

-- Client onboarding checklists
CREATE TABLE IF NOT EXISTS public.onboarding_checklists (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    checklist_type TEXT NOT NULL, -- 'initial_setup', 'training', 'go_live'
    items JSONB NOT NULL, -- Array of checklist items with status
    completed_at TIMESTAMPTZ,
    assigned_to UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- School health scores
CREATE TABLE IF NOT EXISTS public.school_health_scores (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    health_score TEXT NOT NULL, -- 'green', 'yellow', 'red'
    score_details JSONB NOT NULL, -- Detailed breakdown of factors
    last_calculated TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Internal HR management
CREATE TABLE IF NOT EXISTS public.internal_staff (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    employee_id TEXT UNIQUE NOT NULL,
    department TEXT NOT NULL,
    position TEXT NOT NULL,
    hire_date DATE NOT NULL,
    salary NUMERIC(10, 2),
    manager_id UUID REFERENCES auth.users(id),
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'inactive', 'terminated'
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Leave requests
CREATE TABLE IF NOT EXISTS public.leave_requests (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    employee_id BIGINT REFERENCES public.internal_staff(id) ON DELETE CASCADE NOT NULL,
    leave_type TEXT NOT NULL, -- 'annual', 'sick', 'personal', 'maternity', 'paternity'
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    approved_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. SALES & MARKETING MODULE
-- =====================================================

-- CRM leads
CREATE TABLE IF NOT EXISTS public.crm_leads (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    school_name TEXT NOT NULL,
    contact_person TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    school_size TEXT, -- 'small', 'medium', 'large'
    location TEXT,
    lead_source TEXT, -- 'website', 'referral', 'cold_outreach', 'event'
    status TEXT NOT NULL DEFAULT 'new', -- 'new', 'contacted', 'qualified', 'demo', 'proposal', 'closed_won', 'closed_lost'
    lead_score INT DEFAULT 0,
    assigned_to UUID REFERENCES auth.users(id),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Marketing campaigns
CREATE TABLE IF NOT EXISTS public.marketing_campaigns (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    campaign_name TEXT NOT NULL,
    campaign_type TEXT NOT NULL, -- 'email', 'social', 'webinar', 'event'
    target_audience TEXT,
    status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'active', 'paused', 'completed'
    start_date DATE,
    end_date DATE,
    budget NUMERIC(10, 2),
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Content management
CREATE TABLE IF NOT EXISTS public.content_posts (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    author_id UUID REFERENCES auth.users(id) NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'published', 'archived'
    published_at TIMESTAMPTZ,
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- School events
CREATE TABLE IF NOT EXISTS public.school_events (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    event_name TEXT NOT NULL,
    event_type TEXT NOT NULL, -- 'webinar', 'competition', 'workshop', 'conference'
    description TEXT,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    max_participants INT,
    registration_deadline DATE,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. FINANCE MODULE
-- =====================================================

-- Company expenses
CREATE TABLE IF NOT EXISTS public.company_expenses (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    expense_date DATE NOT NULL,
    description TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    category TEXT NOT NULL, -- 'operational', 'marketing', 'development', 'hr', 'other'
    vendor TEXT,
    receipt_url TEXT,
    approved_by UUID REFERENCES auth.users(id),
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Budget allocations
CREATE TABLE IF NOT EXISTS public.budget_allocations (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    department TEXT NOT NULL,
    budget_year INT NOT NULL,
    budget_amount NUMERIC(12, 2) NOT NULL,
    allocated_amount NUMERIC(12, 2) DEFAULT 0,
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(department, budget_year)
);

-- Financial metrics tracking
CREATE TABLE IF NOT EXISTS public.financial_metrics (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    metric_date DATE NOT NULL,
    mrr NUMERIC(12, 2) NOT NULL, -- Monthly Recurring Revenue
    arr NUMERIC(12, 2) NOT NULL, -- Annual Recurring Revenue
    churn_rate DECIMAL(5, 4), -- Churn rate as percentage
    customer_count INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. SOFTWARE ENGINEER MODULE
-- =====================================================

-- System health metrics
CREATE TABLE IF NOT EXISTS public.system_health_metrics (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    metric_type TEXT NOT NULL, -- 'cpu', 'memory', 'disk', 'api_response_time', 'error_rate'
    metric_value DECIMAL(10, 4) NOT NULL,
    metric_unit TEXT NOT NULL, -- 'percentage', 'milliseconds', 'count'
    recorded_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Error logs
CREATE TABLE IF NOT EXISTS public.error_logs (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    error_type TEXT NOT NULL, -- 'api_error', 'database_error', 'frontend_error'
    error_message TEXT NOT NULL,
    stack_trace TEXT,
    user_id UUID REFERENCES auth.users(id),
    school_id UUID REFERENCES public.schools(id),
    severity TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    resolved BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Database query performance
CREATE TABLE IF NOT EXISTS public.query_performance (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    query_hash TEXT NOT NULL,
    query_text TEXT NOT NULL,
    execution_time_ms INT NOT NULL,
    rows_returned INT,
    table_name TEXT,
    executed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Feature flags
CREATE TABLE IF NOT EXISTS public.feature_flags (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    flag_name TEXT UNIQUE NOT NULL,
    description TEXT,
    is_enabled BOOLEAN DEFAULT FALSE NOT NULL,
    target_roles TEXT[], -- Array of roles that can access this feature
    target_schools UUID[], -- Array of school IDs for school-specific features
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. AUDIT & COMPLIANCE
-- =====================================================

-- Comprehensive audit logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    table_name TEXT,
    record_id TEXT,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on all new tables
ALTER TABLE public.academic_trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_health_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internal_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.query_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Academic trips indexes
CREATE INDEX idx_trip_registrations_trip_id ON public.trip_registrations(trip_id);
CREATE INDEX idx_trip_registrations_school_id ON public.trip_registrations(school_id);
CREATE INDEX idx_academic_trips_active ON public.academic_trips(is_active);

-- Support tickets indexes
CREATE INDEX idx_support_tickets_school_id ON public.support_tickets(school_id);
CREATE INDEX idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX idx_support_tickets_assigned_to ON public.support_tickets(assigned_to);

-- CRM leads indexes
CREATE INDEX idx_crm_leads_status ON public.crm_leads(status);
CREATE INDEX idx_crm_leads_assigned_to ON public.crm_leads(assigned_to);
CREATE INDEX idx_crm_leads_created_at ON public.crm_leads(created_at);

-- Financial indexes
CREATE INDEX idx_company_expenses_category ON public.company_expenses(category);
CREATE INDEX idx_company_expenses_date ON public.company_expenses(expense_date);
CREATE INDEX idx_financial_metrics_date ON public.financial_metrics(metric_date);

-- System health indexes
CREATE INDEX idx_system_health_metrics_type ON public.system_health_metrics(metric_type);
CREATE INDEX idx_system_health_metrics_recorded_at ON public.system_health_metrics(recorded_at);
CREATE INDEX idx_error_logs_severity ON public.error_logs(severity);
CREATE INDEX idx_error_logs_created_at ON public.error_logs(created_at);

-- Audit logs indexes
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at);

-- =====================================================
-- CREATE RLS POLICIES
-- =====================================================

-- Super admin policies (full access to everything)
CREATE POLICY "Super admin full access" ON public.academic_trips FOR ALL USING (auth.jwt() ->> 'role' = 'super_admin');
CREATE POLICY "Super admin full access" ON public.trip_registrations FOR ALL USING (auth.jwt() ->> 'role' = 'super_admin');
CREATE POLICY "Super admin full access" ON public.support_tickets FOR ALL USING (auth.jwt() ->> 'role' = 'super_admin');
CREATE POLICY "Super admin full access" ON public.onboarding_checklists FOR ALL USING (auth.jwt() ->> 'role' = 'super_admin');
CREATE POLICY "Super admin full access" ON public.school_health_scores FOR ALL USING (auth.jwt() ->> 'role' = 'super_admin');
CREATE POLICY "Super admin full access" ON public.internal_staff FOR ALL USING (auth.jwt() ->> 'role' = 'super_admin');
CREATE POLICY "Super admin full access" ON public.leave_requests FOR ALL USING (auth.jwt() ->> 'role' = 'super_admin');
CREATE POLICY "Super admin full access" ON public.crm_leads FOR ALL USING (auth.jwt() ->> 'role' = 'super_admin');
CREATE POLICY "Super admin full access" ON public.marketing_campaigns FOR ALL USING (auth.jwt() ->> 'role' = 'super_admin');
CREATE POLICY "Super admin full access" ON public.content_posts FOR ALL USING (auth.jwt() ->> 'role' = 'super_admin');
CREATE POLICY "Super admin full access" ON public.school_events FOR ALL USING (auth.jwt() ->> 'role' = 'super_admin');
CREATE POLICY "Super admin full access" ON public.company_expenses FOR ALL USING (auth.jwt() ->> 'role' = 'super_admin');
CREATE POLICY "Super admin full access" ON public.budget_allocations FOR ALL USING (auth.jwt() ->> 'role' = 'super_admin');
CREATE POLICY "Super admin full access" ON public.financial_metrics FOR ALL USING (auth.jwt() ->> 'role' = 'super_admin');
CREATE POLICY "Super admin full access" ON public.system_health_metrics FOR ALL USING (auth.jwt() ->> 'role' = 'super_admin');
CREATE POLICY "Super admin full access" ON public.error_logs FOR ALL USING (auth.jwt() ->> 'role' = 'super_admin');
CREATE POLICY "Super admin full access" ON public.query_performance FOR ALL USING (auth.jwt() ->> 'role' = 'super_admin');
CREATE POLICY "Super admin full access" ON public.feature_flags FOR ALL USING (auth.jwt() ->> 'role' = 'super_admin');
CREATE POLICY "Super admin full access" ON public.audit_logs FOR ALL USING (auth.jwt() ->> 'role' = 'super_admin');

-- Support HR policies
CREATE POLICY "Support HR access" ON public.support_tickets FOR ALL USING (auth.jwt() ->> 'role' = 'support_hr');
CREATE POLICY "Support HR access" ON public.onboarding_checklists FOR ALL USING (auth.jwt() ->> 'role' = 'support_hr');
CREATE POLICY "Support HR access" ON public.school_health_scores FOR ALL USING (auth.jwt() ->> 'role' = 'support_hr');
CREATE POLICY "Support HR access" ON public.internal_staff FOR ALL USING (auth.jwt() ->> 'role' = 'support_hr');
CREATE POLICY "Support HR access" ON public.leave_requests FOR ALL USING (auth.jwt() ->> 'role' = 'support_hr');

-- Sales Marketing policies
CREATE POLICY "Sales Marketing access" ON public.academic_trips FOR ALL USING (auth.jwt() ->> 'role' = 'sales_marketing');
CREATE POLICY "Sales Marketing access" ON public.trip_registrations FOR ALL USING (auth.jwt() ->> 'role' = 'sales_marketing');
CREATE POLICY "Sales Marketing access" ON public.crm_leads FOR ALL USING (auth.jwt() ->> 'role' = 'sales_marketing');
CREATE POLICY "Sales Marketing access" ON public.marketing_campaigns FOR ALL USING (auth.jwt() ->> 'role' = 'sales_marketing');
CREATE POLICY "Sales Marketing access" ON public.content_posts FOR ALL USING (auth.jwt() ->> 'role' = 'sales_marketing');
CREATE POLICY "Sales Marketing access" ON public.school_events FOR ALL USING (auth.jwt() ->> 'role' = 'sales_marketing');

-- Finance policies
CREATE POLICY "Finance access" ON public.company_expenses FOR ALL USING (auth.jwt() ->> 'role' = 'finance');
CREATE POLICY "Finance access" ON public.budget_allocations FOR ALL USING (auth.jwt() ->> 'role' = 'finance');
CREATE POLICY "Finance access" ON public.financial_metrics FOR ALL USING (auth.jwt() ->> 'role' = 'finance');

-- Software Engineer policies
CREATE POLICY "Software Engineer access" ON public.system_health_metrics FOR ALL USING (auth.jwt() ->> 'role' = 'software_engineer');
CREATE POLICY "Software Engineer access" ON public.error_logs FOR ALL USING (auth.jwt() ->> 'role' = 'software_engineer');
CREATE POLICY "Software Engineer access" ON public.query_performance FOR ALL USING (auth.jwt() ->> 'role' = 'software_engineer');
CREATE POLICY "Software Engineer access" ON public.feature_flags FOR ALL USING (auth.jwt() ->> 'role' = 'software_engineer');

-- =====================================================
-- CREATE HELPER FUNCTIONS
-- =====================================================

-- Function to calculate school health score
CREATE OR REPLACE FUNCTION calculate_school_health_score(school_uuid UUID)
RETURNS TEXT AS $$
DECLARE
    health_score TEXT;
    usage_score INT := 0;
    support_score INT := 0;
    payment_score INT := 0;
BEGIN
    -- Calculate usage score (simplified)
    SELECT COUNT(*) INTO usage_score 
    FROM public.students 
    WHERE school_id = school_uuid;
    
    -- Calculate support score
    SELECT COUNT(*) INTO support_score 
    FROM public.support_tickets 
    WHERE school_id = school_uuid AND status = 'resolved';
    
    -- Calculate payment score (simplified)
    payment_score := 100; -- Placeholder
    
    -- Determine overall health score
    IF usage_score > 50 AND support_score > 0 AND payment_score > 80 THEN
        health_score := 'green';
    ELSIF usage_score > 20 AND payment_score > 60 THEN
        health_score := 'yellow';
    ELSE
        health_score := 'red';
    END IF;
    
    RETURN health_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update audit logs
CREATE OR REPLACE FUNCTION log_audit_event(
    action_name TEXT,
    table_name TEXT DEFAULT NULL,
    record_id TEXT DEFAULT NULL,
    old_vals JSONB DEFAULT NULL,
    new_vals JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.audit_logs (
        user_id,
        action,
        table_name,
        record_id,
        old_values,
        new_values,
        ip_address,
        user_agent
    ) VALUES (
        auth.uid(),
        action_name,
        table_name,
        record_id,
        old_vals,
        new_vals,
        inet_client_addr(),
        current_setting('request.headers', true)::json->>'user-agent'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- CREATE TRIGGERS
-- =====================================================

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_academic_trips_updated_at BEFORE UPDATE ON public.academic_trips FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON public.support_tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_onboarding_checklists_updated_at BEFORE UPDATE ON public.onboarding_checklists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_internal_staff_updated_at BEFORE UPDATE ON public.internal_staff FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leave_requests_updated_at BEFORE UPDATE ON public.leave_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_crm_leads_updated_at BEFORE UPDATE ON public.crm_leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_marketing_campaigns_updated_at BEFORE UPDATE ON public.marketing_campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_content_posts_updated_at BEFORE UPDATE ON public.content_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_school_events_updated_at BEFORE UPDATE ON public.school_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_company_expenses_updated_at BEFORE UPDATE ON public.company_expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_budget_allocations_updated_at BEFORE UPDATE ON public.budget_allocations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_feature_flags_updated_at BEFORE UPDATE ON public.feature_flags FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- INSERT SAMPLE DATA
-- =====================================================

-- Insert sample academic trips
INSERT INTO public.academic_trips (trip_name, destination, start_date, end_date, price_per_student, capacity, target_age_group, itinerary_details) VALUES
('Science Discovery Camp', 'Cape Town, South Africa', '2024-06-15', '2024-06-22', 2500.00, 30, '14-18', '{"day1": "Arrival and orientation", "day2": "Marine biology workshop", "day3": "Robotics lab visit"}'),
('Cultural Exchange Program', 'Nairobi, Kenya', '2024-07-10', '2024-07-17', 1800.00, 25, '16-19', '{"day1": "Welcome ceremony", "day2": "Local school visit", "day3": "Traditional dance workshop"}');

-- Insert sample feature flags
INSERT INTO public.feature_flags (flag_name, description, is_enabled, target_roles, created_by) VALUES
('academic_trips_enabled', 'Enable academic trips feature', true, ARRAY['super_admin', 'sales_marketing'], (SELECT id FROM auth.users LIMIT 1)),
('advanced_analytics', 'Enable advanced analytics dashboard', false, ARRAY['super_admin'], (SELECT id FROM auth.users LIMIT 1)),
('crm_automation', 'Enable CRM automation features', true, ARRAY['super_admin', 'sales_marketing'], (SELECT id FROM auth.users LIMIT 1));

-- Insert sample financial metrics
INSERT INTO public.financial_metrics (metric_date, mrr, arr, churn_rate, customer_count) VALUES
(CURRENT_DATE, 50000.00, 600000.00, 0.0250, 150),
(CURRENT_DATE - INTERVAL '1 month', 48000.00, 576000.00, 0.0300, 145);

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Log the migration
INSERT INTO public.audit_logs (action, table_name, new_values) VALUES 
('database_migration', 'comprehensive_expansion', '{"version": "20250121000000", "tables_created": 20, "features": ["academic_trips", "support_hr", "sales_marketing", "finance", "software_engineer"]}'); 