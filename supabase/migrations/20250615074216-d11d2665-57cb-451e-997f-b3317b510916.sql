
-- Delete any non-admin users who do not have a school_id
DELETE FROM public.profiles
WHERE school_id IS NULL
  AND role NOT IN ('elimisha_admin', 'edufam_admin');
