
-- Create enhanced announcements table with segmentation capabilities
ALTER TABLE public.announcements 
ADD COLUMN IF NOT EXISTS region text,
ADD COLUMN IF NOT EXISTS school_type text,
ADD COLUMN IF NOT EXISTS priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
ADD COLUMN IF NOT EXISTS delivery_channels text[] DEFAULT ARRAY['web'],
ADD COLUMN IF NOT EXISTS auto_archive_date date,
ADD COLUMN IF NOT EXISTS is_archived boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS tags text[],
ADD COLUMN IF NOT EXISTS read_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_recipients integer DEFAULT 0;

-- Create announcement recipients tracking table
CREATE TABLE IF NOT EXISTS public.announcement_recipients (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  announcement_id uuid NOT NULL REFERENCES public.announcements(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  school_id uuid,
  user_role text NOT NULL,
  region text,
  school_type text,
  delivered_at timestamp with time zone DEFAULT now(),
  read_at timestamp with time zone,
  delivery_status text DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'delivered', 'failed', 'read')),
  delivery_channel text DEFAULT 'web',
  created_at timestamp with time zone DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_announcement_recipients_announcement ON public.announcement_recipients(announcement_id);
CREATE INDEX IF NOT EXISTS idx_announcement_recipients_user ON public.announcement_recipients(user_id);
CREATE INDEX IF NOT EXISTS idx_announcement_recipients_school ON public.announcement_recipients(school_id);
CREATE INDEX IF NOT EXISTS idx_announcement_recipients_status ON public.announcement_recipients(delivery_status);
CREATE INDEX IF NOT EXISTS idx_announcements_archived ON public.announcements(is_archived);
CREATE INDEX IF NOT EXISTS idx_announcements_global ON public.announcements(is_global);
CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON public.announcements(created_at DESC);

-- Enable RLS on new table
ALTER TABLE public.announcement_recipients ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for announcement_recipients
CREATE POLICY "Users can view their own announcement receipts" 
  ON public.announcement_recipients 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "System admins can view all announcement receipts" 
  ON public.announcement_recipients 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('elimisha_admin', 'edufam_admin')
    )
  );

-- Create function to automatically calculate recipient metrics
CREATE OR REPLACE FUNCTION update_announcement_metrics()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    -- Update read count and total recipients
    UPDATE public.announcements 
    SET 
      read_count = (
        SELECT COUNT(*) 
        FROM public.announcement_recipients 
        WHERE announcement_id = NEW.announcement_id 
        AND read_at IS NOT NULL
      ),
      total_recipients = (
        SELECT COUNT(*) 
        FROM public.announcement_recipients 
        WHERE announcement_id = NEW.announcement_id
      )
    WHERE id = NEW.announcement_id;
    
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic metrics updates
DROP TRIGGER IF EXISTS trigger_update_announcement_metrics ON public.announcement_recipients;
CREATE TRIGGER trigger_update_announcement_metrics
  AFTER INSERT OR UPDATE ON public.announcement_recipients
  FOR EACH ROW EXECUTE FUNCTION update_announcement_metrics();

-- Create function to auto-archive announcements
CREATE OR REPLACE FUNCTION auto_archive_announcements()
RETURNS void AS $$
BEGIN
  UPDATE public.announcements 
  SET is_archived = true 
  WHERE auto_archive_date IS NOT NULL 
  AND auto_archive_date <= CURRENT_DATE 
  AND is_archived = false;
END;
$$ LANGUAGE plpgsql;
