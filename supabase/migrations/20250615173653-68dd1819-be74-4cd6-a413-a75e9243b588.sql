
-- This function is being updated to ensure Principals have the correct access to financial data,
-- matching other administrative roles, and to add better logging for access control.
CREATE OR REPLACE FUNCTION public.get_outstanding_fees(p_school_id uuid)
 RETURNS numeric
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  user_role TEXT;
  user_school_id UUID;
  outstanding_amount NUMERIC;
BEGIN
  -- Get current user's role and school_id from their profile
  SELECT role, school_id INTO user_role, user_school_id
  FROM public.profiles
  WHERE id = auth.uid();

  -- Check if user has permission to view financial data for the given school.
  -- EduFam Admins can view any school's data.
  -- Principals, School Owners, and Finance Officers can only view data for their assigned school.
  IF user_role = 'edufam_admin' OR (user_role IN ('principal', 'school_owner', 'finance_officer') AND user_school_id = p_school_id) THEN
    -- If permission is granted, calculate the total outstanding fees
    SELECT COALESCE(SUM(amount - paid_amount), 0)
    INTO outstanding_amount
    FROM public.fees
    WHERE school_id = p_school_id
    AND status IN ('pending', 'partial');
    
    RETURN outstanding_amount;
  ELSE
    -- If user does not have permission, return 0 to prevent leaking financial information.
    -- A warning is logged for audit purposes.
    RAISE WARNING 'User % with role % attempted to access fees for school % without permission.', auth.uid(), user_role, p_school_id;
    RETURN 0;
  END IF;
END;
$function$
