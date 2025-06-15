
-- Add columns to the classes table to store level, stream, and year information
ALTER TABLE public.classes
ADD COLUMN IF NOT EXISTS level TEXT,
ADD COLUMN IF NOT EXISTS stream TEXT,
ADD COLUMN IF NOT EXISTS year TEXT;

-- Add curriculum column to the subjects table
ALTER TABLE public.subjects
ADD COLUMN IF NOT EXISTS curriculum TEXT;
