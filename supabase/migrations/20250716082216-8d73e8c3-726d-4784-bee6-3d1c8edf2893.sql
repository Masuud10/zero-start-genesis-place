-- Update RLS policies and functions to use school_director instead of school_owner

-- Update comprehensive attendance access policy
DROP POLICY IF EXISTS "Comprehensive attendance access with parent support" ON public.attendance;
CREATE POLICY "Comprehensive attendance access with parent support" ON public.attendance
FOR ALL
USING (
  (get_current_user_role() = ANY (ARRAY['elimisha_admin'::text, 'edufam_admin'::text])) OR 
  ((school_id = get_current_user_school_id()) AND (get_current_user_role() = ANY (ARRAY['principal'::text, 'school_director'::text, 'teacher'::text, 'finance_officer'::text]))) OR 
  ((get_current_user_role() = 'parent'::text) AND is_parent_authorized_for_student(student_id))
)
WITH CHECK (
  (get_current_user_role() = ANY (ARRAY['elimisha_admin'::text, 'edufam_admin'::text])) OR 
  ((school_id = get_current_user_school_id()) AND (get_current_user_role() = ANY (ARRAY['principal'::text, 'school_director'::text, 'teacher'::text, 'finance_officer'::text])))
);

-- Update admin communications policy
UPDATE public.admin_communications 
SET target_roles = array_replace(target_roles, 'school_owner', 'school_director')
WHERE 'school_owner' = ANY(target_roles);

-- Update admin communications insertion example
UPDATE public.admin_communications 
SET target_roles = ARRAY['teacher', 'principal', 'school_director', 'finance_officer', 'parent']
WHERE target_roles = ARRAY['teacher', 'principal', 'school_owner', 'finance_officer', 'parent'];

-- Update announcements policy to include school_director
DROP POLICY IF EXISTS "Authorized users can create announcements" ON public.announcements;
CREATE POLICY "Authorized users can create announcements" ON public.announcements
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM profiles
    WHERE profiles.id = auth.uid() 
    AND profiles.role = ANY (ARRAY['principal'::text, 'school_director'::text, 'edufam_admin'::text])
  )
);

-- Update certificate policies
DROP POLICY IF EXISTS "Authorized users can create certificates" ON public.certificates;
CREATE POLICY "Authorized users can create certificates" ON public.certificates
FOR INSERT
WITH CHECK (
  (get_current_user_role() = ANY (ARRAY['principal'::text, 'school_director'::text, 'edufam_admin'::text, 'elimisha_admin'::text])) AND 
  ((get_current_user_role() = ANY (ARRAY['edufam_admin'::text, 'elimisha_admin'::text])) OR (school_id = get_current_user_school_id()))
);

DROP POLICY IF EXISTS "Principals can manage certificates for their school" ON public.certificates;
CREATE POLICY "School directors and principals can manage certificates for their school" ON public.certificates
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM profiles
    WHERE profiles.id = auth.uid() 
    AND profiles.role = ANY (ARRAY['principal'::text, 'school_director'::text]) 
    AND profiles.school_id = certificates.school_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM profiles
    WHERE profiles.id = auth.uid() 
    AND profiles.role = ANY (ARRAY['principal'::text, 'school_director'::text]) 
    AND profiles.school_id = certificates.school_id
  )
);

DROP POLICY IF EXISTS "School owners can view certificates for their school" ON public.certificates;
CREATE POLICY "School directors can view certificates for their school" ON public.certificates
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM profiles
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'school_director'::text 
    AND profiles.school_id = certificates.school_id
  )
);

DROP POLICY IF EXISTS "Users can update their school certificates" ON public.certificates;
CREATE POLICY "Users can update their school certificates" ON public.certificates
FOR UPDATE
USING (
  (get_current_user_role() = ANY (ARRAY['principal'::text, 'school_director'::text, 'edufam_admin'::text, 'elimisha_admin'::text])) AND 
  ((get_current_user_role() = ANY (ARRAY['edufam_admin'::text, 'elimisha_admin'::text])) OR (school_id = get_current_user_school_id()))
);

DROP POLICY IF EXISTS "Users can delete their school certificates" ON public.certificates;
CREATE POLICY "Users can delete their school certificates" ON public.certificates
FOR DELETE
USING (
  (get_current_user_role() = ANY (ARRAY['principal'::text, 'school_director'::text, 'edufam_admin'::text, 'elimisha_admin'::text])) AND 
  ((get_current_user_role() = ANY (ARRAY['edufam_admin'::text, 'elimisha_admin'::text])) OR (school_id = get_current_user_school_id()))
);