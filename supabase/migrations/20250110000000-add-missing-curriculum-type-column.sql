-- Add missing curriculum_type column to schools table
-- This column was referenced in the create_comprehensive_school function but was missing from the table

ALTER TABLE public.schools 
ADD COLUMN IF NOT EXISTS curriculum_type TEXT DEFAULT 'cbc';

-- Add constraint to ensure only valid curriculum types are allowed
ALTER TABLE public.schools 
ADD CONSTRAINT IF NOT EXISTS schools_curriculum_type_check 
CHECK (curriculum_type IN ('cbc', 'igcse', 'cambridge'));

-- Set default value for existing rows that might have NULL values
UPDATE public.schools 
SET curriculum_type = 'cbc' 
WHERE curriculum_type IS NULL;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_schools_curriculum_type ON public.schools(curriculum_type);

-- Comment for documentation
COMMENT ON COLUMN public.schools.curriculum_type IS 'Curriculum type: cbc (Kenyan CBC), igcse (British International), cambridge (Cambridge International)'; 