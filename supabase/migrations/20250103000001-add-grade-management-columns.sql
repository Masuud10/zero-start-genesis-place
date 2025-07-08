-- Add missing columns for principal grade management
DO $$
BEGIN
    -- Add rejected_reason column for tracking rejection reasons
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'grades' AND column_name = 'rejected_reason') THEN
        ALTER TABLE public.grades ADD COLUMN rejected_reason TEXT;
    END IF;
    
    -- Add overridden_by column for tracking who overrode the grade
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'grades' AND column_name = 'overridden_by') THEN
        ALTER TABLE public.grades ADD COLUMN overridden_by UUID REFERENCES auth.users(id);
    END IF;
    
    -- Add overridden_at column for tracking when the grade was overrode
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'grades' AND column_name = 'overridden_at') THEN
        ALTER TABLE public.grades ADD COLUMN overridden_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Add principal_notes column for principal comments
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'grades' AND column_name = 'principal_notes') THEN
        ALTER TABLE public.grades ADD COLUMN principal_notes TEXT;
    END IF;
    
    -- Add released_by column for tracking who released the grades
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'grades' AND column_name = 'released_by') THEN
        ALTER TABLE public.grades ADD COLUMN released_by UUID REFERENCES auth.users(id);
    END IF;
    
    -- Add released_at column for tracking when grades were released
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'grades' AND column_name = 'released_at') THEN
        ALTER TABLE public.grades ADD COLUMN released_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Add approved_by column for tracking who approved the grades
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'grades' AND column_name = 'approved_by') THEN
        ALTER TABLE public.grades ADD COLUMN approved_by UUID REFERENCES auth.users(id);
    END IF;
    
    -- Add approved_at column for tracking when grades were approved
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'grades' AND column_name = 'approved_at') THEN
        ALTER TABLE public.grades ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Create grade_audit_logs table for tracking all grade changes
CREATE TABLE IF NOT EXISTS public.grade_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grade_id UUID REFERENCES public.grades(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  user_role TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('approve', 'reject', 'override', 'release', 'submit', 'edit')),
  old_values JSONB DEFAULT '{}'::jsonb,
  new_values JSONB DEFAULT '{}'::jsonb,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_grades_status_school ON public.grades(status, school_id);
CREATE INDEX IF NOT EXISTS idx_grades_submitted_at ON public.grades(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_grades_approved_at ON public.grades(approved_at DESC);
CREATE INDEX IF NOT EXISTS idx_grades_released_at ON public.grades(released_at DESC);
CREATE INDEX IF NOT EXISTS idx_grade_audit_logs_grade_id ON public.grade_audit_logs(grade_id);
CREATE INDEX IF NOT EXISTS idx_grade_audit_logs_user_id ON public.grade_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_grade_audit_logs_created_at ON public.grade_audit_logs(created_at DESC);

-- Enable RLS on grade_audit_logs
ALTER TABLE public.grade_audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for grade_audit_logs
CREATE POLICY "Users can view audit logs for their school's grades"
  ON public.grade_audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.grades g
      WHERE g.id = grade_audit_logs.grade_id
      AND g.school_id = public.get_current_user_school_id()
    )
  );

CREATE POLICY "Principals can create audit logs"
  ON public.grade_audit_logs FOR INSERT
  WITH CHECK (
    public.get_current_user_role() = 'principal'
    AND EXISTS (
      SELECT 1 FROM public.grades g
      WHERE g.id = grade_audit_logs.grade_id
      AND g.school_id = public.get_current_user_school_id()
    )
  );

-- Update existing RLS policies for grades to include new columns
DROP POLICY IF EXISTS "Principals can update grade status" ON public.grades;
CREATE POLICY "Principals can update grade status"
  ON public.grades
  FOR UPDATE
  USING (
    public.get_current_user_role() = 'principal' 
    AND school_id = public.get_current_user_school_id()
    AND status IN ('submitted', 'approved')
  );

-- Add policy for principals to override grades
CREATE POLICY "Principals can override grades"
  ON public.grades
  FOR UPDATE
  USING (
    public.get_current_user_role() = 'principal' 
    AND school_id = public.get_current_user_school_id()
  );

-- Function to automatically create audit logs when grades are updated
CREATE OR REPLACE FUNCTION public.create_grade_audit_log()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Get user role
  SELECT role INTO user_role FROM public.profiles WHERE id = auth.uid();
  
  -- Insert audit log
  INSERT INTO public.grade_audit_logs (
    grade_id,
    user_id,
    user_role,
    action,
    old_values,
    new_values,
    notes
  ) VALUES (
    NEW.id,
    auth.uid(),
    user_role,
    CASE 
      WHEN OLD.status != NEW.status THEN
        CASE NEW.status
          WHEN 'approved' THEN 'approve'
          WHEN 'rejected' THEN 'reject'
          WHEN 'released' THEN 'release'
          ELSE 'edit'
        END
      WHEN OLD.score != NEW.score OR OLD.percentage != NEW.percentage THEN 'override'
      ELSE 'edit'
    END,
    to_jsonb(OLD),
    to_jsonb(NEW),
    COALESCE(NEW.principal_notes, NEW.rejected_reason)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic audit logging
DROP TRIGGER IF EXISTS grade_audit_trigger ON public.grades;
CREATE TRIGGER grade_audit_trigger
  AFTER UPDATE ON public.grades
  FOR EACH ROW
  EXECUTE FUNCTION public.create_grade_audit_log(); 