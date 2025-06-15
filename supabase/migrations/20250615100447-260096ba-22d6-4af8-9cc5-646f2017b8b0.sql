
-- Harden get_current_user_school_id with explicit search_path for security

CREATE OR REPLACE FUNCTION public.get_current_user_school_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT school_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$function$;
