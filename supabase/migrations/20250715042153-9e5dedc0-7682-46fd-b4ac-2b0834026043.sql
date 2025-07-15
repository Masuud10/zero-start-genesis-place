-- Add unique constraint for attendance to prevent duplicate entries for same day/session
-- This ensures one attendance record per student per class per date per session
DO $$ 
BEGIN
    -- Check if constraint already exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'attendance_unique_session_constraint'
    ) THEN
        ALTER TABLE public.attendance 
        ADD CONSTRAINT attendance_unique_session_constraint 
        UNIQUE (school_id, class_id, student_id, date, session);
    END IF;
END $$;

-- Create function to validate grade editing permissions
CREATE OR REPLACE FUNCTION public.validate_grade_edit_permission(grade_id uuid, user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    grade_status text;
    user_role text;
    is_grade_owner boolean;
BEGIN
    -- Get grade status and check if user is the one who submitted it
    SELECT g.status, (g.submitted_by = user_id) 
    INTO grade_status, is_grade_owner
    FROM public.grades g 
    WHERE g.id = grade_id;
    
    -- Get user role
    SELECT role INTO user_role 
    FROM public.profiles 
    WHERE id = user_id;
    
    -- Teachers can only edit their own draft grades
    -- Principals can edit any grade regardless of status
    RETURN (
        (user_role = 'teacher' AND is_grade_owner AND grade_status = 'draft') OR
        (user_role IN ('principal', 'school_owner', 'edufam_admin', 'elimisha_admin'))
    );
END;
$$;

-- Add trigger to enforce grade editing permissions
CREATE OR REPLACE FUNCTION public.enforce_grade_edit_permissions()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    -- Skip validation for inserts or if no user is authenticated
    IF TG_OP = 'INSERT' OR auth.uid() IS NULL THEN
        RETURN NEW;
    END IF;
    
    -- Check permission for updates
    IF NOT public.validate_grade_edit_permission(OLD.id, auth.uid()) THEN
        RAISE EXCEPTION 'Permission denied: You cannot edit this grade. Teachers can only edit their own draft grades.';
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'enforce_grade_permissions_trigger'
    ) THEN
        CREATE TRIGGER enforce_grade_permissions_trigger
            BEFORE UPDATE ON public.grades
            FOR EACH ROW 
            EXECUTE FUNCTION public.enforce_grade_edit_permissions();
    END IF;
END $$;