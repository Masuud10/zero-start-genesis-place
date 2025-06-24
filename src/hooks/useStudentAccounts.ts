
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Student } from '@/hooks/fee-management/types';
import { StudentAccount } from './student-accounts/types';
import { transformStudentData, createStudentAccountsMap, processFeeData } from './student-accounts/utils';
import { fetchStudentsWithClasses, fetchFeesWithRelations } from './student-accounts/dataService';

export type { StudentAccount } from './student-accounts/types';

export const useStudentAccounts = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [studentAccounts, setStudentAccounts] = useState<StudentAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStudentsAndFees = async () => {
    if (!user?.school_id) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch students with proper class relationship using explicit join
      const studentsData = await fetchStudentsWithClasses(user.school_id);
      
      // Transform students data with proper error handling and null checks
      const transformedStudents = transformStudentData(studentsData);
      setStudents(transformedStudents);

      // Fetch fees for all students with explicit join
      const feesData = await fetchFeesWithRelations(user.school_id);

      // Group fees by student and calculate totals
      const accountsMap = createStudentAccountsMap(transformedStudents);
      processFeeData(feesData, accountsMap);

      setStudentAccounts(Array.from(accountsMap.values()));
    } catch (err: any) {
      console.error('Error fetching student accounts:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentsAndFees();
  }, [user?.school_id]);

  return {
    students,
    studentAccounts,
    loading,
    error,
    refetch: fetchStudentsAndFees
  };
};
