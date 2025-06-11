
-- Drop all existing policies on the profiles table
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "School users can view profiles in their school" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles in their school" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Create security definer functions (replace if they exist)
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
AS $function$
  SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$function$;

CREATE OR REPLACE FUNCTION public.get_current_user_school_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
AS $function$
  SELECT school_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$function$;

-- Create new, safe RLS policies using the security definer functions
CREATE POLICY "Users can view their own profile" ON public.profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT USING (
  public.get_current_user_role() IN ('elimisha_admin', 'edufam_admin')
);

CREATE POLICY "School users can view profiles in their school" ON public.profiles
FOR SELECT USING (
  school_id = public.get_current_user_school_id() AND 
  public.get_current_user_school_id() IS NOT NULL
);

CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = id);
