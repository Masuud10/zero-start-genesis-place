-- Add curriculum field to classes table for better curriculum tracking
ALTER TABLE public.classes 
ADD COLUMN curriculum TEXT;

-- Create index for better performance when filtering by curriculum
CREATE INDEX idx_classes_curriculum ON public.classes(curriculum);

-- Update any existing classes without curriculum to default to CBC
UPDATE public.classes 
SET curriculum = 'CBC' 
WHERE curriculum IS NULL;