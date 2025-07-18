-- 20250719000003-create-academic-trips-schema.sql
-- Create academic trips functionality schema

-- Create academic_trips table
CREATE TABLE IF NOT EXISTS public.academic_trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    trip_name TEXT NOT NULL,
    description TEXT,
    destination TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    cost_per_student DECIMAL(10,2) DEFAULT 0,
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0,
    trip_type TEXT DEFAULT 'educational' CHECK (trip_type IN ('educational', 'cultural', 'sports', 'science', 'arts', 'community_service')),
    status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'open_registration', 'closed_registration', 'in_progress', 'completed', 'cancelled')),
    requirements TEXT,
    organizer_id UUID REFERENCES public.profiles(id),
    contact_person TEXT,
    contact_phone TEXT,
    emergency_contact TEXT,
    emergency_phone TEXT,
    transportation_details TEXT,
    accommodation_details TEXT,
    itinerary JSONB DEFAULT '[]'::jsonb,
    required_documents JSONB DEFAULT '[]'::jsonb,
    safety_guidelines TEXT,
    medical_requirements TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID REFERENCES public.profiles(id)
);

-- Create trip_participants table
CREATE TABLE IF NOT EXISTS public.trip_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL REFERENCES public.academic_trips(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    registration_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
    status TEXT DEFAULT 'registered' CHECK (status IN ('registered', 'confirmed', 'cancelled', 'completed')),
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid', 'refunded')),
    amount_paid DECIMAL(10,2) DEFAULT 0,
    parent_consent BOOLEAN DEFAULT false,
    medical_clearance BOOLEAN DEFAULT false,
    documents_submitted JSONB DEFAULT '[]'::jsonb,
    special_requirements TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(trip_id, student_id)
);

-- Create trip_expenses table
CREATE TABLE IF NOT EXISTS public.trip_expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL REFERENCES public.academic_trips(id) ON DELETE CASCADE,
    expense_category TEXT NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    expense_date DATE NOT NULL,
    receipt_url TEXT,
    paid_by UUID REFERENCES public.profiles(id),
    approved_by UUID REFERENCES public.profiles(id),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'reimbursed')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create trip_activities table
CREATE TABLE IF NOT EXISTS public.trip_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL REFERENCES public.academic_trips(id) ON DELETE CASCADE,
    activity_name TEXT NOT NULL,
    description TEXT,
    location TEXT,
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    activity_type TEXT DEFAULT 'educational' CHECK (activity_type IN ('educational', 'recreational', 'meal', 'transportation', 'accommodation', 'cultural', 'sports')),
    responsible_person TEXT,
    cost DECIMAL(10,2) DEFAULT 0,
    requirements TEXT,
    safety_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.academic_trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_activities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for academic_trips
CREATE POLICY "School isolation for academic_trips" 
ON public.academic_trips 
FOR ALL 
USING (
    (school_id = get_current_user_school_id()) OR 
    (get_current_user_role() = ANY (ARRAY['elimisha_admin'::text, 'edufam_admin'::text]))
);

-- Create RLS policies for trip_participants
CREATE POLICY "School isolation for trip_participants" 
ON public.trip_participants 
FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.academic_trips at 
        WHERE at.id = trip_participants.trip_id 
        AND (at.school_id = get_current_user_school_id() OR get_current_user_role() = ANY (ARRAY['elimisha_admin'::text, 'edufam_admin'::text]))
    )
);

-- Create RLS policies for trip_expenses
CREATE POLICY "School isolation for trip_expenses" 
ON public.trip_expenses 
FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.academic_trips at 
        WHERE at.id = trip_expenses.trip_id 
        AND (at.school_id = get_current_user_school_id() OR get_current_user_role() = ANY (ARRAY['elimisha_admin'::text, 'edufam_admin'::text]))
    )
);

-- Create RLS policies for trip_activities
CREATE POLICY "School isolation for trip_activities" 
ON public.trip_activities 
FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.academic_trips at 
        WHERE at.id = trip_activities.trip_id 
        AND (at.school_id = get_current_user_school_id() OR get_current_user_role() = ANY (ARRAY['elimisha_admin'::text, 'edufam_admin'::text]))
    )
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_academic_trips_school_id ON public.academic_trips(school_id);
CREATE INDEX IF NOT EXISTS idx_academic_trips_status ON public.academic_trips(status);
CREATE INDEX IF NOT EXISTS idx_academic_trips_dates ON public.academic_trips(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_trip_participants_trip_id ON public.trip_participants(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_participants_student_id ON public.trip_participants(student_id);
CREATE INDEX IF NOT EXISTS idx_trip_expenses_trip_id ON public.trip_expenses(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_activities_trip_id ON public.trip_activities(trip_id);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_trips_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER academic_trips_updated_at
    BEFORE UPDATE ON public.academic_trips
    FOR EACH ROW
    EXECUTE FUNCTION public.update_trips_updated_at();

CREATE TRIGGER trip_participants_updated_at
    BEFORE UPDATE ON public.trip_participants
    FOR EACH ROW
    EXECUTE FUNCTION public.update_trips_updated_at();

CREATE TRIGGER trip_expenses_updated_at
    BEFORE UPDATE ON public.trip_expenses
    FOR EACH ROW
    EXECUTE FUNCTION public.update_trips_updated_at();

CREATE TRIGGER trip_activities_updated_at
    BEFORE UPDATE ON public.trip_activities
    FOR EACH ROW
    EXECUTE FUNCTION public.update_trips_updated_at();