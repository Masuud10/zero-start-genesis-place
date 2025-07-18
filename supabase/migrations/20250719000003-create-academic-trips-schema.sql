-- Academic Trips Database Schema
-- Date: 2025-07-19
-- This migration creates the foundation for the Academic Trips feature

-- Table to store the details of each academic trip package
CREATE TABLE public.academic_trips (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    trip_name TEXT NOT NULL,
    destination TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    price_per_student NUMERIC(10, 2) NOT NULL,
    capacity INT NOT NULL,
    target_age_group TEXT,
    itinerary_details JSONB, -- To store a structured itinerary
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    updated_by UUID REFERENCES auth.users(id)
);

-- Linking table to manage student registrations for trips
CREATE TABLE public.trip_registrations (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    trip_id BIGINT REFERENCES public.academic_trips(id) ON DELETE CASCADE NOT NULL,
    student_id UUID REFERENCES public.students(user_id) ON DELETE CASCADE NOT NULL,
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    registration_date TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    status TEXT NOT NULL DEFAULT 'registered', -- 'registered', 'paid', 'cancelled'
    payment_amount NUMERIC(10, 2),
    payment_date TIMESTAMPTZ,
    notes TEXT,
    registered_by UUID REFERENCES auth.users(id) NOT NULL, -- The parent's user ID
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Table for feature flags management
CREATE TABLE public.feature_flags (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    flag_name TEXT UNIQUE NOT NULL,
    flag_description TEXT,
    is_enabled BOOLEAN DEFAULT FALSE NOT NULL,
    target_scope TEXT DEFAULT 'global', -- 'global', 'school_specific', 'user_specific'
    target_schools UUID[], -- Array of school IDs for school_specific scope
    target_users UUID[], -- Array of user IDs for user_specific scope
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    updated_by UUID REFERENCES auth.users(id)
);

-- Table for system health monitoring
CREATE TABLE public.system_health_logs (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    service_name TEXT NOT NULL, -- 'database', 'auth_api', 'file_storage', etc.
    status TEXT NOT NULL, -- 'healthy', 'degraded', 'down'
    response_time_ms INTEGER,
    error_message TEXT,
    checked_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Table for detailed audit logs
CREATE TABLE public.detailed_audit_logs (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id UUID REFERENCES auth.users(id),
    action_type TEXT NOT NULL, -- 'password_reset', 'user_created', 'trip_registered', etc.
    action_description TEXT NOT NULL,
    target_user_id UUID REFERENCES auth.users(id),
    target_school_id UUID REFERENCES public.schools(id),
    ip_address INET,
    user_agent TEXT,
    metadata JSONB, -- Additional context data
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Table for client onboarding checklists
CREATE TABLE public.onboarding_checklists (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    checklist_name TEXT NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE NOT NULL,
    completed_by UUID REFERENCES auth.users(id),
    completed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Table for internal company announcements
CREATE TABLE public.internal_announcements (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    priority TEXT DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Table for API rate limit monitoring
CREATE TABLE public.api_rate_limits (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    endpoint TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    school_id UUID REFERENCES public.schools(id),
    request_count INTEGER DEFAULT 0 NOT NULL,
    limit_count INTEGER NOT NULL,
    window_start TIMESTAMPTZ NOT NULL,
    window_end TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Table for financial forecasting data
CREATE TABLE public.financial_forecasts (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    forecast_date DATE NOT NULL,
    mrr NUMERIC(12, 2) NOT NULL,
    growth_rate DECIMAL(5, 2) NOT NULL, -- Percentage
    churn_rate DECIMAL(5, 2) NOT NULL, -- Percentage
    projected_revenue NUMERIC(12, 2) NOT NULL,
    notes TEXT,
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Table for department budgets
CREATE TABLE public.department_budgets (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    department_name TEXT NOT NULL, -- 'Marketing', 'R&D', 'Support', etc.
    budget_period TEXT NOT NULL, -- 'monthly', 'quarterly', 'yearly'
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    allocated_budget NUMERIC(12, 2) NOT NULL,
    spent_amount NUMERIC(12, 2) DEFAULT 0 NOT NULL,
    notes TEXT,
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.academic_trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_health_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.detailed_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internal_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.department_budgets ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX idx_trip_registrations_trip_id ON public.trip_registrations(trip_id);
CREATE INDEX idx_trip_registrations_student_id ON public.trip_registrations(student_id);
CREATE INDEX idx_trip_registrations_school_id ON public.trip_registrations(school_id);
CREATE INDEX idx_trip_registrations_status ON public.trip_registrations(status);
CREATE INDEX idx_academic_trips_active ON public.academic_trips(is_active);
CREATE INDEX idx_academic_trips_dates ON public.academic_trips(start_date, end_date);
CREATE INDEX idx_feature_flags_enabled ON public.feature_flags(is_enabled);
CREATE INDEX idx_system_health_logs_service ON public.system_health_logs(service_name, checked_at);
CREATE INDEX idx_detailed_audit_logs_user ON public.detailed_audit_logs(user_id, created_at);
CREATE INDEX idx_detailed_audit_logs_action ON public.detailed_audit_logs(action_type, created_at);
CREATE INDEX idx_onboarding_checklists_school ON public.onboarding_checklists(school_id);
CREATE INDEX idx_internal_announcements_active ON public.internal_announcements(is_active, created_at);
CREATE INDEX idx_api_rate_limits_user ON public.api_rate_limits(user_id, endpoint);
CREATE INDEX idx_financial_forecasts_date ON public.financial_forecasts(forecast_date);
CREATE INDEX idx_department_budgets_period ON public.department_budgets(department_name, period_start, period_end);

-- RLS Policies for Academic Trips
CREATE POLICY "Allow full access to Edufam team" ON public.academic_trips FOR ALL USING (true);
CREATE POLICY "Allow full access to Edufam team" ON public.trip_registrations FOR ALL USING (true);

-- RLS Policies for Feature Flags (Super Admin only)
CREATE POLICY "Super admin can manage feature flags" ON public.feature_flags FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.admin_users 
        WHERE user_id = auth.uid() 
        AND role = 'super_admin' 
        AND is_active = true
    )
);

-- RLS Policies for System Health (Super Admin and Software Engineer)
CREATE POLICY "Admin team can view system health" ON public.system_health_logs FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.admin_users 
        WHERE user_id = auth.uid() 
        AND role IN ('super_admin', 'software_engineer') 
        AND is_active = true
    )
);

-- RLS Policies for Detailed Audit Logs (Super Admin only)
CREATE POLICY "Super admin can view audit logs" ON public.detailed_audit_logs FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.admin_users 
        WHERE user_id = auth.uid() 
        AND role = 'super_admin' 
        AND is_active = true
    )
);

-- RLS Policies for Onboarding Checklists (Support HR and Super Admin)
CREATE POLICY "Support team can manage onboarding" ON public.onboarding_checklists FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.admin_users 
        WHERE user_id = auth.uid() 
        AND role IN ('super_admin', 'support_hr') 
        AND is_active = true
    )
);

-- RLS Policies for Internal Announcements (All admin users)
CREATE POLICY "Admin team can manage announcements" ON public.internal_announcements FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.admin_users 
        WHERE user_id = auth.uid() 
        AND is_active = true
    )
);

-- RLS Policies for API Rate Limits (Software Engineer and Super Admin)
CREATE POLICY "Tech team can view API limits" ON public.api_rate_limits FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.admin_users 
        WHERE user_id = auth.uid() 
        AND role IN ('super_admin', 'software_engineer') 
        AND is_active = true
    )
);

-- RLS Policies for Financial Data (Finance and Super Admin)
CREATE POLICY "Finance team can manage financial data" ON public.financial_forecasts FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.admin_users 
        WHERE user_id = auth.uid() 
        AND role IN ('super_admin', 'finance') 
        AND is_active = true
    )
);

CREATE POLICY "Finance team can manage budgets" ON public.department_budgets FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.admin_users 
        WHERE user_id = auth.uid() 
        AND role IN ('super_admin', 'finance') 
        AND is_active = true
    )
);

-- Insert some default feature flags
INSERT INTO public.feature_flags (flag_name, flag_description, is_enabled, target_scope, created_by) VALUES
('academic_trips', 'Enable Academic Trips feature for all schools', true, 'global', (SELECT user_id FROM public.admin_users WHERE role = 'super_admin' LIMIT 1)),
('advanced_analytics', 'Enable advanced analytics dashboard', false, 'global', (SELECT user_id FROM public.admin_users WHERE role = 'super_admin' LIMIT 1)),
('beta_features', 'Enable beta features for testing', false, 'global', (SELECT user_id FROM public.admin_users WHERE role = 'super_admin' LIMIT 1));

-- Insert sample academic trips
INSERT INTO public.academic_trips (trip_name, destination, start_date, end_date, price_per_student, capacity, target_age_group, itinerary_details, created_by) VALUES
('Science Discovery Camp', 'Nairobi National Park', '2025-08-15', '2025-08-17', 15000.00, 50, '12-15 years', 
 '{"day1": "Arrival and orientation", "day2": "Wildlife observation and research", "day3": "Conservation workshop and departure"}', 
 (SELECT user_id FROM public.admin_users WHERE role = 'super_admin' LIMIT 1)),
('Historical Heritage Tour', 'Fort Jesus, Mombasa', '2025-09-20', '2025-09-22', 12000.00, 40, '14-18 years',
 '{"day1": "Travel to Mombasa", "day2": "Fort Jesus guided tour", "day3": "Old Town exploration and return"}',
 (SELECT user_id FROM public.admin_users WHERE role = 'super_admin' LIMIT 1)),
('Agricultural Learning Trip', 'Kakamega Forest', '2025-10-10', '2025-10-12', 8000.00, 60, '10-14 years',
 '{"day1": "Forest ecosystem introduction", "day2": "Sustainable farming practices", "day3": "Environmental conservation workshop"}',
 (SELECT user_id FROM public.admin_users WHERE role = 'super_admin' LIMIT 1));

-- Insert sample internal announcement
INSERT INTO public.internal_announcements (title, content, priority, created_by) VALUES
('Welcome to the New Academic Trips Feature!', 'We are excited to announce the launch of our Academic Trips management system. This feature will help schools organize educational trips more efficiently.', 'normal',
 (SELECT user_id FROM public.admin_users WHERE role = 'super_admin' LIMIT 1));

-- Insert sample department budgets
INSERT INTO public.department_budgets (department_name, budget_period, period_start, period_end, allocated_budget, created_by) VALUES
('Marketing', 'monthly', '2025-07-01', '2025-07-31', 50000.00, (SELECT user_id FROM public.admin_users WHERE role = 'super_admin' LIMIT 1)),
('R&D', 'monthly', '2025-07-01', '2025-07-31', 75000.00, (SELECT user_id FROM public.admin_users WHERE role = 'super_admin' LIMIT 1)),
('Support', 'monthly', '2025-07-01', '2025-07-31', 30000.00, (SELECT user_id FROM public.admin_users WHERE role = 'super_admin' LIMIT 1));

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_academic_trips_updated_at BEFORE UPDATE ON public.academic_trips FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_trip_registrations_updated_at BEFORE UPDATE ON public.trip_registrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_feature_flags_updated_at BEFORE UPDATE ON public.feature_flags FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_onboarding_checklists_updated_at BEFORE UPDATE ON public.onboarding_checklists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_internal_announcements_updated_at BEFORE UPDATE ON public.internal_announcements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_api_rate_limits_updated_at BEFORE UPDATE ON public.api_rate_limits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_department_budgets_updated_at BEFORE UPDATE ON public.department_budgets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 