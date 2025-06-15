
-- Create table for system health status
CREATE TABLE public.system_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  current_status TEXT NOT NULL DEFAULT 'unknown',
  supabase_connected BOOLEAN NOT NULL DEFAULT false,
  uptime_percent NUMERIC NOT NULL DEFAULT 99.0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Optional: You might want to populate it with an initial row so your queries (like .maybeSingle()) work without errors.
INSERT INTO public.system_status (current_status, supabase_connected, uptime_percent)
VALUES ('healthy', true, 99.98);

-- (Leave RLS off for now so all admins/devs can see health. Apply RLS later if needed.)
