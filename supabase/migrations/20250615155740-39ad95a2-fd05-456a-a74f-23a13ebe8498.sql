
-- This function ensures that the school_id on a grade record matches the student's school.
CREATE OR REPLACE FUNCTION public.ensure_grades_school_id_consistency()
RETURNS TRIGGER AS $$
DECLARE
  student_school_id UUID;
BEGIN
  -- Get the school_id from the associated student
  SELECT school_id INTO student_school_id
  FROM public.students
  WHERE id = NEW.student_id;

  -- If student exists and has a school
  IF student_school_id IS NOT NULL THEN
    -- If the grade's school_id is not set, set it to the student's school_id.
    IF NEW.school_id IS NULL THEN
      NEW.school_id := student_school_id;
    -- If the grade's school_id is different from the student's, raise an error to prevent inconsistency.
    ELSIF NEW.school_id != student_school_id THEN
      RAISE EXCEPTION 'Inconsistent school ID: Grade school_id (%) does not match student''s school_id (%).', NEW.school_id, student_school_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop trigger if it exists to allow recreation
DROP TRIGGER IF EXISTS trigger_grades_school_id_consistency ON public.grades;

-- Create the trigger to run the function before inserting or updating a grade
CREATE TRIGGER trigger_grades_school_id_consistency
BEFORE INSERT OR UPDATE ON public.grades
FOR EACH ROW
EXECUTE FUNCTION public.ensure_grades_school_id_consistency();

-- This function does the same for the attendance table.
CREATE OR REPLACE FUNCTION public.ensure_attendance_school_id_consistency()
RETURNS TRIGGER AS $$
DECLARE
  student_school_id UUID;
BEGIN
  -- Get the school_id from the associated student
  SELECT school_id INTO student_school_id
  FROM public.students
  WHERE id = NEW.student_id;

  -- If student exists and has a school
  IF student_school_id IS NOT NULL THEN
    -- If the attendance record's school_id is not set, set it.
    IF NEW.school_id IS NULL THEN
      NEW.school_id := student_school_id;
    -- If the school_ids do not match, raise an error.
    ELSIF NEW.school_id != student_school_id THEN
      RAISE EXCEPTION 'Inconsistent school ID: Attendance school_id (%) does not match student''s school_id (%).', NEW.school_id, student_school_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop trigger if it exists to allow recreation
DROP TRIGGER IF EXISTS trigger_attendance_school_id_consistency ON public.attendance;

-- Create the trigger for the attendance table
CREATE TRIGGER trigger_attendance_school_id_consistency
BEFORE INSERT OR UPDATE ON public.attendance
FOR EACH ROW
EXECUTE FUNCTION public.ensure_attendance_school_id_consistency();
