-- Add missing columns to finance_settings table for enhanced MPESA configuration
ALTER TABLE public.finance_settings 
ADD COLUMN IF NOT EXISTS mpesa_business_name TEXT,
ADD COLUMN IF NOT EXISTS mpesa_callback_url TEXT,
ADD COLUMN IF NOT EXISTS mpesa_shortcode TEXT;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_finance_settings_school_id ON public.finance_settings(school_id);
CREATE INDEX IF NOT EXISTS idx_finance_settings_mpesa_enabled ON public.finance_settings((settings_data->>'mpesa_enabled')); 