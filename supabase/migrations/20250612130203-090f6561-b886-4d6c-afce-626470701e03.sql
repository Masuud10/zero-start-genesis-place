
-- Ensure all relevant tables have school_id columns and proper RLS policies

-- Update existing RLS policies for complete multi-tenant isolation
DROP POLICY IF EXISTS "Multi-tenant profiles access" ON public.profiles;
DROP POLICY IF EXISTS "User creation policy" ON public.profiles;

-- Enhanced profiles policies
CREATE POLICY "Multi-tenant profiles access" ON public.profiles
FOR ALL USING (
  -- Users can access their own profile
  auth.uid() = id OR 
  -- Users can access profiles in their school (if they have a school)
  (school_id IS NOT NULL AND school_id = public.get_current_user_school_id()) OR
  -- System admins can access all profiles
  public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin')
);

CREATE POLICY "User creation policy" ON public.profiles
FOR INSERT WITH CHECK (
  -- System admins can create any user
  public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin') OR
  -- School admins can only create users in their school
  (public.get_current_user_role() IN ('school_owner', 'principal') AND 
   school_id = public.get_current_user_school_id()) OR
  -- Users can create their own profile during signup
  auth.uid() = id
);

-- Complete RLS policies for all school-scoped tables
DROP POLICY IF EXISTS "School isolation policy" ON public.students;
CREATE POLICY "School isolation policy" ON public.students
FOR ALL USING (
  public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin') OR
  school_id = public.get_current_user_school_id()
);

DROP POLICY IF EXISTS "School isolation policy" ON public.classes;
CREATE POLICY "School isolation policy" ON public.classes
FOR ALL USING (
  public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin') OR
  school_id = public.get_current_user_school_id()
);

DROP POLICY IF EXISTS "School isolation policy" ON public.subjects;
CREATE POLICY "School isolation policy" ON public.subjects
FOR ALL USING (
  public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin') OR
  school_id = public.get_current_user_school_id()
);

DROP POLICY IF EXISTS "School isolation policy" ON public.announcements;
CREATE POLICY "School isolation policy" ON public.announcements
FOR ALL USING (
  public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin') OR
  school_id = public.get_current_user_school_id() OR
  is_global = true
);

DROP POLICY IF EXISTS "School isolation policy" ON public.grades;
CREATE POLICY "School isolation policy" ON public.grades
FOR ALL USING (
  public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin') OR
  EXISTS (
    SELECT 1 FROM public.students s 
    WHERE s.id = student_id AND s.school_id = public.get_current_user_school_id()
  )
);

DROP POLICY IF EXISTS "School isolation policy" ON public.attendance;
CREATE POLICY "School isolation policy" ON public.attendance
FOR ALL USING (
  public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin') OR
  EXISTS (
    SELECT 1 FROM public.students s 
    WHERE s.id = student_id AND s.school_id = public.get_current_user_school_id()
  )
);

DROP POLICY IF EXISTS "School isolation policy" ON public.fees;
CREATE POLICY "School isolation policy" ON public.fees
FOR ALL USING (
  public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin') OR
  EXISTS (
    SELECT 1 FROM public.students s 
    WHERE s.id = student_id AND s.school_id = public.get_current_user_school_id()
  )
);

DROP POLICY IF EXISTS "School isolation policy" ON public.cbc_assessments;
CREATE POLICY "School isolation policy" ON public.cbc_assessments
FOR ALL USING (
  public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin') OR
  EXISTS (
    SELECT 1 FROM public.students s 
    WHERE s.id = student_id AND s.school_id = public.get_current_user_school_id()
  )
);

DROP POLICY IF EXISTS "School isolation policy" ON public.competency_progress;
CREATE POLICY "School isolation policy" ON public.competency_progress
FOR ALL USING (
  public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin') OR
  EXISTS (
    SELECT 1 FROM public.students s 
    WHERE s.id = student_id AND s.school_id = public.get_current_user_school_id()
  )
);

DROP POLICY IF EXISTS "School isolation policy" ON public.learner_portfolios;
CREATE POLICY "School isolation policy" ON public.learner_portfolios
FOR ALL USING (
  public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin') OR
  EXISTS (
    SELECT 1 FROM public.students s 
    WHERE s.id = student_id AND s.school_id = public.get_current_user_school_id()
  )
);

DROP POLICY IF EXISTS "School isolation policy" ON public.parent_engagements;
CREATE POLICY "School isolation policy" ON public.parent_engagements
FOR ALL USING (
  public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin') OR
  EXISTS (
    SELECT 1 FROM public.students s 
    WHERE s.id = student_id AND s.school_id = public.get_current_user_school_id()
  )
);

DROP POLICY IF EXISTS "School isolation policy" ON public.messages;
CREATE POLICY "School isolation policy" ON public.messages
FOR ALL USING (
  public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin') OR
  school_id = public.get_current_user_school_id()
);

DROP POLICY IF EXISTS "School isolation policy" ON public.support_tickets;
CREATE POLICY "School isolation policy" ON public.support_tickets
FOR ALL USING (
  public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin') OR
  school_id = public.get_current_user_school_id()
);

DROP POLICY IF EXISTS "School isolation policy" ON public.timetables;
CREATE POLICY "School isolation policy" ON public.timetables
FOR ALL USING (
  public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin') OR
  school_id = public.get_current_user_school_id()
);

-- Enable RLS on all tables that don't have it enabled
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cbc_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competency_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learner_portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_engagements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;

-- Schools access policy
DROP POLICY IF EXISTS "Schools access policy" ON public.schools;
CREATE POLICY "Schools access policy" ON public.schools
FOR ALL USING (
  -- System admins can access all schools
  public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin') OR
  -- School users can only access their own school
  id = public.get_current_user_school_id()
);

-- Enhanced validation trigger for multi-tenancy
CREATE OR REPLACE FUNCTION public.validate_school_isolation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- For non-admin users, ensure they can only create/modify records in their own school
  IF public.get_current_user_role() NOT IN ('elimisha_admin', 'edufam_admin') THEN
    -- Check if the record has a school_id field
    IF TG_TABLE_NAME IN ('students', 'classes', 'subjects', 'messages', 'announcements', 'support_tickets', 'timetables') THEN
      -- For INSERT operations
      IF TG_OP = 'INSERT' THEN
        IF NEW.school_id IS DISTINCT FROM public.get_current_user_school_id() THEN
          RAISE EXCEPTION 'Access denied: Cannot create records for other schools';
        END IF;
      END IF;
      
      -- For UPDATE operations
      IF TG_OP = 'UPDATE' THEN
        IF OLD.school_id IS DISTINCT FROM public.get_current_user_school_id() 
           OR NEW.school_id IS DISTINCT FROM public.get_current_user_school_id() THEN
          RAISE EXCEPTION 'Access denied: Cannot modify records for other schools';
        END IF;
      END IF;
    END IF;
  END IF;
  
  -- Return the appropriate row
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$function$;

-- Apply the validation trigger to all relevant tables
DO $$
DECLARE
    tbl text;
BEGIN
    FOR tbl IN 
        SELECT unnest(ARRAY['students', 'classes', 'subjects', 'messages', 'announcements', 'support_tickets', 'timetables'])
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS validate_school_isolation_trigger ON public.%I', tbl);
        EXECUTE format('CREATE TRIGGER validate_school_isolation_trigger
            BEFORE INSERT OR UPDATE ON public.%I
            FOR EACH ROW EXECUTE FUNCTION public.validate_school_isolation()', tbl);
    END LOOP;
END $$;
