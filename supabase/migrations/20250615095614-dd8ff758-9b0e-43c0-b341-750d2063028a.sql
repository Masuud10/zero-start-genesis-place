
-- Enable Row Level Security on system_status
ALTER TABLE public.system_status ENABLE ROW LEVEL SECURITY;

-- Only allow authenticated users with admin roles to select system status
CREATE POLICY "Admins can view system status"
  ON public.system_status
  FOR SELECT
  USING (
    public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin')
  );
