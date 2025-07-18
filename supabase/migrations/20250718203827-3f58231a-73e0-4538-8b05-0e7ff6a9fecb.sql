-- Academic Trips Module Database Schema
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
    itinerary_details JSONB,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Linking table to manage student registrations for trips
CREATE TABLE public.trip_registrations (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    trip_id BIGINT REFERENCES public.academic_trips(id) ON DELETE CASCADE NOT NULL,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    registration_date TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    status TEXT NOT NULL DEFAULT 'registered', -- 'registered', 'paid', 'cancelled'
    registered_by UUID REFERENCES auth.users(id) NOT NULL
);

-- Enable RLS and add indexes
ALTER TABLE public.academic_trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_registrations ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_trip_registrations_trip_id ON public.trip_registrations(trip_id);
CREATE INDEX idx_trip_registrations_school_id ON public.trip_registrations(school_id);

-- RLS Policies for academic_trips
CREATE POLICY "Admin users can manage academic trips" 
ON public.academic_trips 
FOR ALL 
USING (is_admin_user());

-- RLS Policies for trip_registrations  
CREATE POLICY "Admin users can manage trip registrations"
ON public.trip_registrations
FOR ALL 
USING (is_admin_user());

CREATE POLICY "Schools can view their own trip registrations"
ON public.trip_registrations
FOR SELECT
USING (school_id = get_current_user_school_id());