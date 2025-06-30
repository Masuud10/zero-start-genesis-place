
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { FeeRecord } from './types';
import { transformFeeRecord } from './utils/dataTransformers';
import { validateUuid, validateSchoolAccess, safeUuidOrNull } from '@/utils/uuidValidation';

export const useFeeData = () => {
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchFees = async () => {
    if (!user?.school_id) {
      setError('User is not associated with a school');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Validate school ID before making query
      const schoolValidation = validateSchoolAccess(user.school_id);
      if (!schoolValidation.isValid) {
        throw new Error(schoolValidation.error || 'Invalid school access');
      }

      const validSchoolId = schoolValidation.sanitizedValue!;
      console.log('🔍 Fetching fees for school:', validSchoolId);

      // Create timeout for query
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      try {
        // Simplified query without complex joins to avoid relationship issues
        const { data, error: fetchError } = await supabase
          .from('fees')
          .select(`
            id,
            student_id,
            class_id,
            amount,
            paid_amount,
            due_date,
            term,
            category,
            status,
            payment_method,
            paid_date,
            created_at,
            academic_year
          `)
          .eq('school_id', validSchoolId)
          .not('id', 'is', null)
          .not('amount', 'is', null)
          .order('created_at', { ascending: false })
          .limit(300); // Reduced limit for faster loading

        clearTimeout(timeoutId);

        if (fetchError) {
          console.error('Supabase error fetching fees:', fetchError);
          throw new Error(`Failed to fetch fees: ${fetchError.message}`);
        }

        console.log('✅ Fees data fetched:', data?.length || 0, 'records');

        if (!data || data.length === 0) {
          setFees([]);
          setError(null);
          return;
        }

        // Get student and class data separately
        const studentIds = [...new Set(data.map(item => item.student_id).filter(Boolean))];
        const classIds = [...new Set(data.map(item => item.class_id).filter(Boolean))];

        const [studentsResult, classesResult] = await Promise.allSettled([
          studentIds.length > 0 ? supabase
            .from('students')
            .select('id, name, admission_number')
            .in('id', studentIds)
            .eq('school_id', validSchoolId)
            .limit(200) : Promise.resolve({ data: [] }),
          
          classIds.length > 0 ? supabase
            .from('classes')
            .select('id, name')
            .in('id', classIds)
            .eq('school_id', validSchoolId)
            .limit(50) : Promise.resolve({ data: [] })
        ]);

        const students = studentsResult.status === 'fulfilled' ? studentsResult.value.data || [] : [];
        const classes = classesResult.status === 'fulfilled' ? classesResult.value.data || [] : [];

        // Create lookup maps
        const studentMap = new Map(students.map(s => [s.id, s]));
        const classMap = new Map(classes.map(c => [c.id, c]));
        
        const transformedData: FeeRecord[] = data.map((item, index) => {
          try {
            const studentId = safeUuidOrNull(item.student_id);
            const classId = safeUuidOrNull(item.class_id);
            
            if (!studentId) {
              console.warn(`Fee record ${item.id} has invalid student_id:`, item.student_id);
            }

            const student = studentMap.get(item.student_id);
            const studentClass = classMap.get(item.class_id);

            return {
              id: item.id,
              studentId: studentId || '',
              amount: Number(item.amount) || 0,
              dueDate: item.due_date || new Date().toISOString(),
              term: item.term || '',
              category: item.category || 'Unknown',
              status: (item.status as 'pending' | 'paid' | 'partial' | 'overdue') || 'pending',
              paidAmount: Number(item.paid_amount) || 0,
              studentName: student?.name || 'Unknown Student',
              admissionNumber: student?.admission_number || 'N/A',
              className: studentClass?.name || 'Unknown Class',
              academicYear: item.academic_year || new Date().getFullYear().toString(),
              paymentMethod: item.payment_method,
              paidDate: item.paid_date,
              createdAt: item.created_at || new Date().toISOString(),
              classId: classId,
            };
          } catch (transformError) {
            console.error(`Error transforming fee record ${index}:`, transformError);
            return {
              id: item.id,
              studentId: safeUuidOrNull(item.student_id) || '',
              amount: Number(item.amount) || 0,
              dueDate: item.due_date || new Date().toISOString(),
              term: item.term || '',
              category: item.category || 'Unknown',
              status: (item.status as 'pending' | 'paid' | 'partial' | 'overdue') || 'pending',
              paidAmount: Number(item.paid_amount) || 0,
              studentName: 'Unknown Student',
              admissionNumber: 'N/A',
              className: 'Unknown Class',
              academicYear: item.academic_year || new Date().getFullYear().toString(),
              paymentMethod: item.payment_method,
              paidDate: item.paid_date,
              createdAt: item.created_at || new Date().toISOString(),
              classId: safeUuidOrNull(item.class_id),
            };
          }
        }).filter(fee => fee.id); // Filter out any fees without valid IDs
        
        setFees(transformedData);
        setError(null);
      } catch (queryError) {
        clearTimeout(timeoutId);
        throw queryError;
      }
    } catch (err: any) {
      console.error('Error fetching fees:', err);
      setError(err.message || 'Failed to fetch student fees');
      setFees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.school_id) {
      fetchFees();
    } else {
      setError('User school ID is required');
      setLoading(false);
    }
  }, [user?.school_id]);

  return {
    fees,
    loading,
    error,
    refetch: fetchFees
  };
};
