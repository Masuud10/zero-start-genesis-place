
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
  -- Get current user's role and school_id
  SELECT role, school_id INTO user_role, user_school_id
  FROM public.profiles
  WHERE id = auth.uid();

  -- Check if user has permission to view financial data for the given school
  IF user_role = 'edufam_admin' OR (user_role IN ('principal', 'school_owner', 'finance_officer') AND user_school_id = p_school_id) THEN
    -- Calculate outstanding fees for the school
    SELECT COALESCE(SUM(amount - paid_amount), 0)
    INTO outstanding_amount
    FROM public.fees
    WHERE school_id = p_school_id
    AND status IN ('pending', 'partial');
    
    RETURN outstanding_amount;
  ELSE
    -- User does not have permission, return 0 to prevent information leakage
    RETURN 0;
  END IF;
END;
$function$
