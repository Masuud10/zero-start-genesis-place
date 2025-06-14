
-- Create analytics_events table for storing all analytics events
CREATE TABLE public.analytics_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  event_category TEXT NOT NULL,
  school_id UUID REFERENCES public.schools(id),
  user_id UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create school_analytics_summary table for aggregated school data
CREATE TABLE public.school_analytics_summary (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID NOT NULL REFERENCES public.schools(id),
  grade_submissions INTEGER DEFAULT 0,
  attendance_updates INTEGER DEFAULT 0,
  finance_transactions INTEGER DEFAULT 0,
  user_activities INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(school_id)
);

-- Add indexes for better query performance
CREATE INDEX idx_analytics_events_school_id ON public.analytics_events(school_id);
CREATE INDEX idx_analytics_events_timestamp ON public.analytics_events(timestamp);
CREATE INDEX idx_analytics_events_category ON public.analytics_events(event_category);
CREATE INDEX idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX idx_school_analytics_summary_school_id ON public.school_analytics_summary(school_id);

-- Enable Row Level Security
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_analytics_summary ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for analytics_events
CREATE POLICY "Users can view analytics events for their school" 
  ON public.analytics_events 
  FOR SELECT 
  USING (
    school_id = public.get_current_user_school_id() 
    OR public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin')
  );

CREATE POLICY "Users can insert analytics events for their school" 
  ON public.analytics_events 
  FOR INSERT 
  WITH CHECK (
    school_id = public.get_current_user_school_id() 
    OR public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin')
  );

-- Create RLS policies for school_analytics_summary
CREATE POLICY "Users can view analytics summary for their school" 
  ON public.school_analytics_summary 
  FOR SELECT 
  USING (
    school_id = public.get_current_user_school_id() 
    OR public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin')
  );

CREATE POLICY "System can update analytics summary" 
  ON public.school_analytics_summary 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Create trigger to auto-set school_id for analytics events
CREATE TRIGGER set_analytics_events_school_id
  BEFORE INSERT ON public.analytics_events
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_set_school_id();

-- Create trigger to validate school isolation for analytics
CREATE TRIGGER validate_analytics_events_isolation
  BEFORE INSERT OR UPDATE ON public.analytics_events
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_school_isolation();
