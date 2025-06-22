
-- Add status field to profiles table to track active/inactive users
ALTER TABLE public.profiles 
ADD COLUMN status text DEFAULT 'active' CHECK (status IN ('active', 'inactive'));

-- Create index for better query performance
CREATE INDEX idx_profiles_status ON public.profiles(status);

-- Update existing users to have active status (they're already active)
UPDATE public.profiles SET status = 'active' WHERE status IS NULL;
