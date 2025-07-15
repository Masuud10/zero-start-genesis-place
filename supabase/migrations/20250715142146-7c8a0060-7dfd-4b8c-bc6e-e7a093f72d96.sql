-- Phase 1: Principal Dashboard Critical Database Fixes (Fixed)

-- Fix 1: Add missing critical indexes for Principal dashboard performance
-- These are essential for fast data loading in principal dashboard
CREATE INDEX IF NOT EXISTS idx_students_school_id_active 
ON public.students (school_id, is_active) 
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_profiles_school_role_status 
ON public.profiles (school_id, role, status) 
WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_grades_school_status_submitted 
ON public.grades (school_id, status, submitted_at DESC) 
WHERE status IN ('submitted', 'approved', 'rejected', 'released');

CREATE INDEX IF NOT EXISTS idx_certificates_school_generated 
ON public.certificates (school_id, generated_at DESC);

-- Fixed: Remove date-based index predicate that requires immutable functions
CREATE INDEX IF NOT EXISTS idx_attendance_school_date 
ON public.attendance (school_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_fees_school_status 
ON public.fees (school_id, status) 
WHERE status IN ('pending', 'paid', 'overdue');

-- Fix 2: Add missing RLS policies for tables that have RLS enabled but no policies
-- This is a critical security issue identified by the linter

-- Students table policies (if missing)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'students' AND schemaname = 'public'
  ) THEN
    -- Students can only be accessed within the user's school
    CREATE POLICY "Students multi-tenant access" 
    ON public.students 
    FOR ALL 
    USING ((school_id = get_current_user_school_id()) OR (get_current_user_role() = ANY (ARRAY['elimisha_admin'::text, 'edufam_admin'::text])));
  END IF;
END $$;

-- Fix 3: Verify and enhance the update_grade_status function for proper principal access
CREATE OR REPLACE FUNCTION public.update_grade_status(
    grade_ids uuid[], 
    new_status text, 
    user_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    updated_count INTEGER := 0;
    user_role TEXT;
    user_school_id UUID;
    grade_school_id UUID;
BEGIN
    -- Get user role and school
    SELECT role, school_id INTO user_role, user_school_id 
    FROM public.profiles 
    WHERE id = user_id;
    
    -- CRITICAL: Only principals can approve and release grades
    IF new_status IN ('approved', 'released') AND user_role != 'principal' THEN
        RETURN jsonb_build_object('error', 'Only principals can approve or release grades');
    END IF;
    
    -- CRITICAL: Verify all grades belong to the principal's school
    IF user_role = 'principal' THEN
        FOR grade_school_id IN 
            SELECT DISTINCT school_id FROM public.grades WHERE id = ANY(grade_ids)
        LOOP
            IF grade_school_id != user_school_id THEN
                RETURN jsonb_build_object('error', 'Cannot modify grades from other schools');
            END IF;
        END LOOP;
    END IF;
    
    -- Update grades based on status with proper validation
    IF new_status = 'approved' THEN
        UPDATE public.grades 
        SET 
            status = 'approved',
            approved_by = user_id,
            approved_at = NOW(),
            updated_at = NOW()
        WHERE id = ANY(grade_ids) 
        AND status = 'submitted'
        AND (user_role = ANY(ARRAY['principal'::text, 'edufam_admin'::text, 'elimisha_admin'::text]));
        
        GET DIAGNOSTICS updated_count = ROW_COUNT;
        
    ELSIF new_status = 'released' THEN
        UPDATE public.grades 
        SET 
            status = 'released',
            released_by = user_id,
            released_at = NOW(),
            is_released = TRUE,
            updated_at = NOW()
        WHERE id = ANY(grade_ids) 
        AND status = 'approved'
        AND (user_role = ANY(ARRAY['principal'::text, 'edufam_admin'::text, 'elimisha_admin'::text]));
        
        GET DIAGNOSTICS updated_count = ROW_COUNT;
        
    ELSIF new_status = 'rejected' THEN
        UPDATE public.grades 
        SET 
            status = 'rejected',
            reviewed_by = user_id,
            reviewed_at = NOW(),
            updated_at = NOW()
        WHERE id = ANY(grade_ids) 
        AND status = 'submitted'
        AND (user_role = ANY(ARRAY['principal'::text, 'edufam_admin'::text, 'elimisha_admin'::text]));
        
        GET DIAGNOSTICS updated_count = ROW_COUNT;
    ELSE
        RETURN jsonb_build_object('error', 'Invalid status specified');
    END IF;
    
    -- Log the action for audit trail
    INSERT INTO public.audit_logs (
        action, 
        target_entity, 
        performed_by_user_id, 
        performed_by_role,
        school_id,
        metadata
    ) VALUES (
        'GRADE_STATUS_UPDATE',
        'grades',
        user_id,
        user_role,
        user_school_id,
        jsonb_build_object(
            'grade_ids', grade_ids,
            'new_status', new_status,
            'updated_count', updated_count
        )
    );
    
    RETURN jsonb_build_object('success', TRUE, 'updated_count', updated_count);
END;
$$;

-- Fix 4: Enhance get_current_user_school_id function security
CREATE OR REPLACE FUNCTION public.get_current_user_school_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT school_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- Fix 5: Enhance get_current_user_role function security  
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;