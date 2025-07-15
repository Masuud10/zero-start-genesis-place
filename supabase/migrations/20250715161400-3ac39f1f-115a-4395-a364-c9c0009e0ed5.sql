-- Phase 1: Transport Management Database Schema
-- Creating comprehensive transport management tables with proper RLS policies

-- Table to store transport routes (e.g., "Route A - Westlands", "Route B - South C")
CREATE TABLE public.transport_routes (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    route_name TEXT NOT NULL,
    route_description TEXT,
    monthly_fee NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Table to store vehicle information (e.g., KDA 123X, Bus 05)
CREATE TABLE public.transport_vehicles (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    vehicle_name TEXT NOT NULL, -- e.g., "Bus 1"
    registration_number TEXT NOT NULL,
    capacity INT NOT NULL CHECK (capacity > 0),
    assigned_route_id BIGINT REFERENCES public.transport_routes(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(school_id, registration_number)
);

-- Table to store student transport assignments
CREATE TABLE public.student_transport_assignments (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    route_id BIGINT REFERENCES public.transport_routes(id) ON DELETE CASCADE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    assignment_date DATE DEFAULT CURRENT_DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(student_id, route_id, is_active) DEFERRABLE INITIALLY DEFERRED
);

-- Create indexes for performance
CREATE INDEX idx_transport_routes_school_id ON public.transport_routes(school_id);
CREATE INDEX idx_transport_vehicles_school_id ON public.transport_vehicles(school_id);
CREATE INDEX idx_transport_vehicles_route_id ON public.transport_vehicles(assigned_route_id);
CREATE INDEX idx_student_transport_assignments_student_id ON public.student_transport_assignments(student_id);
CREATE INDEX idx_student_transport_assignments_route_id ON public.student_transport_assignments(route_id);
CREATE INDEX idx_student_transport_assignments_active ON public.student_transport_assignments(is_active) WHERE is_active = true;

-- Enable Row-Level Security on all new tables
ALTER TABLE public.transport_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transport_vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_transport_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for transport_routes
CREATE POLICY "Finance officers can manage routes for their school" 
ON public.transport_routes FOR ALL 
USING (
    school_id = get_current_user_school_id() AND 
    get_current_user_role() = 'finance_officer'
)
WITH CHECK (
    school_id = get_current_user_school_id() AND 
    get_current_user_role() = 'finance_officer'
);

CREATE POLICY "School staff can view routes for their school" 
ON public.transport_routes FOR SELECT 
USING (
    school_id = get_current_user_school_id() AND 
    get_current_user_role() IN ('principal', 'school_owner', 'teacher', 'finance_officer')
);

CREATE POLICY "System admins can manage all routes" 
ON public.transport_routes FOR ALL 
USING (get_current_user_role() IN ('elimisha_admin', 'edufam_admin'))
WITH CHECK (get_current_user_role() IN ('elimisha_admin', 'edufam_admin'));

-- RLS Policies for transport_vehicles
CREATE POLICY "Finance officers can manage vehicles for their school" 
ON public.transport_vehicles FOR ALL 
USING (
    school_id = get_current_user_school_id() AND 
    get_current_user_role() = 'finance_officer'
)
WITH CHECK (
    school_id = get_current_user_school_id() AND 
    get_current_user_role() = 'finance_officer'
);

CREATE POLICY "School staff can view vehicles for their school" 
ON public.transport_vehicles FOR SELECT 
USING (
    school_id = get_current_user_school_id() AND 
    get_current_user_role() IN ('principal', 'school_owner', 'teacher', 'finance_officer')
);

CREATE POLICY "System admins can manage all vehicles" 
ON public.transport_vehicles FOR ALL 
USING (get_current_user_role() IN ('elimisha_admin', 'edufam_admin'))
WITH CHECK (get_current_user_role() IN ('elimisha_admin', 'edufam_admin'));

-- RLS Policies for student_transport_assignments
CREATE POLICY "Finance officers can manage assignments for their school students" 
ON public.student_transport_assignments FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.students s 
        WHERE s.id = student_id 
        AND s.school_id = get_current_user_school_id()
    ) AND get_current_user_role() = 'finance_officer'
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.students s 
        WHERE s.id = student_id 
        AND s.school_id = get_current_user_school_id()
    ) AND get_current_user_role() = 'finance_officer'
);

CREATE POLICY "School staff can view assignments for their school students" 
ON public.student_transport_assignments FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.students s 
        WHERE s.id = student_id 
        AND s.school_id = get_current_user_school_id()
    ) AND get_current_user_role() IN ('principal', 'school_owner', 'teacher', 'finance_officer')
);

CREATE POLICY "Parents can view their children's transport assignments" 
ON public.student_transport_assignments FOR SELECT 
USING (
    get_current_user_role() = 'parent' AND
    student_id IN (
        SELECT s.id FROM public.students s 
        WHERE s.parent_id = auth.uid()
    )
);

CREATE POLICY "System admins can manage all assignments" 
ON public.student_transport_assignments FOR ALL 
USING (get_current_user_role() IN ('elimisha_admin', 'edufam_admin'))
WITH CHECK (get_current_user_role() IN ('elimisha_admin', 'edufam_admin'));

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_transport_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_transport_routes_updated_at
  BEFORE UPDATE ON public.transport_routes
  FOR EACH ROW EXECUTE FUNCTION update_transport_updated_at();

CREATE TRIGGER update_transport_vehicles_updated_at
  BEFORE UPDATE ON public.transport_vehicles
  FOR EACH ROW EXECUTE FUNCTION update_transport_updated_at();

CREATE TRIGGER update_student_transport_assignments_updated_at
  BEFORE UPDATE ON public.student_transport_assignments
  FOR EACH ROW EXECUTE FUNCTION update_transport_updated_at();