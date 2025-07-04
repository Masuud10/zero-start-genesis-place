-- Add missing columns to schools table for enhanced school registration
ALTER TABLE public.schools 
ADD COLUMN IF NOT EXISTS school_type TEXT DEFAULT 'primary',
ADD COLUMN IF NOT EXISTS term_structure TEXT DEFAULT '3-term',
ADD COLUMN IF NOT EXISTS registration_number TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS year_established INTEGER,
ADD COLUMN IF NOT EXISTS max_students INTEGER DEFAULT 1000,
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Africa/Nairobi',
ADD COLUMN IF NOT EXISTS website_url TEXT,
ADD COLUMN IF NOT EXISTS motto TEXT,
ADD COLUMN IF NOT EXISTS slogan TEXT,
ADD COLUMN IF NOT EXISTS owner_information TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'basic';

-- Add constraints for the new columns
ALTER TABLE public.schools 
ADD CONSTRAINT schools_school_type_check 
CHECK (school_type IN ('primary', 'secondary', 'tertiary'));

ALTER TABLE public.schools 
ADD CONSTRAINT schools_term_structure_check 
CHECK (term_structure IN ('3-term', '2-term', 'trimester'));

ALTER TABLE public.schools 
ADD CONSTRAINT schools_status_check 
CHECK (status IN ('active', 'inactive', 'suspended'));

ALTER TABLE public.schools 
ADD CONSTRAINT schools_subscription_plan_check 
CHECK (subscription_plan IN ('basic', 'premium', 'enterprise'));

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_schools_school_type ON public.schools(school_type);
CREATE INDEX IF NOT EXISTS idx_schools_status ON public.schools(status);
CREATE INDEX IF NOT EXISTS idx_schools_registration_number ON public.schools(registration_number) WHERE registration_number IS NOT NULL; 