
-- First, let's check if there are any principal users without school assignments
-- and fix any orphaned principals by assigning them to schools

-- Update any principal users who don't have a school_id assigned
-- This will assign them to the first available school
UPDATE public.profiles 
SET school_id = (
  SELECT id FROM public.schools 
  ORDER BY created_at 
  LIMIT 1
)
WHERE role = 'principal' 
AND school_id IS NULL
AND EXISTS (SELECT 1 FROM public.schools);

-- Also ensure that schools have proper principal assignments
-- Update schools to have a principal_id if they don't have one
UPDATE public.schools 
SET principal_id = (
  SELECT id FROM public.profiles 
  WHERE role = 'principal' 
  AND school_id = schools.id 
  LIMIT 1
)
WHERE principal_id IS NULL
AND EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE role = 'principal' 
  AND school_id = schools.id
);

-- Create a trigger to ensure principals always have school assignments
CREATE OR REPLACE FUNCTION ensure_principal_school_assignment()
RETURNS TRIGGER AS $$
BEGIN
  -- If creating/updating a principal without school_id, assign to first school
  IF NEW.role = 'principal' AND NEW.school_id IS NULL THEN
    SELECT id INTO NEW.school_id 
    FROM public.schools 
    ORDER BY created_at 
    LIMIT 1;
    
    -- If no schools exist, raise an error
    IF NEW.school_id IS NULL THEN
      RAISE EXCEPTION 'Cannot create principal user: No schools exist in the system';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for principal school assignment
DROP TRIGGER IF EXISTS trigger_ensure_principal_school_assignment ON public.profiles;
CREATE TRIGGER trigger_ensure_principal_school_assignment
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION ensure_principal_school_assignment();
