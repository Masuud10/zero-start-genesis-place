
-- Replace the function with an explicit search_path for security
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$function$;
