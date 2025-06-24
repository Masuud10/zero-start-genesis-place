
import { supabase } from '@/integrations/supabase/client';

export const fetchStudentsWithClasses = async (schoolId: string) => {
  const { data: studentsData, error: studentsError } = await supabase
    .from('students')
    .select(`
      id,
      name,
      admission_number,
      class_id,
      school_id,
      classes:class_id(name)
    `)
    .eq('school_id', schoolId);

  if (studentsError) throw studentsError;
  return studentsData;
};

export const fetchFeesWithRelations = async (schoolId: string) => {
  const { data: feesData, error: feesError } = await supabase
    .from('fees')
    .select(`
      *,
      students:student_id(name, admission_number),
      classes:class_id(name)
    `)
    .eq('school_id', schoolId);

  if (feesError) throw feesError;
  return feesData;
};
