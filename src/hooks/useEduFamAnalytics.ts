// This file has been replaced by useEduFamSystemAnalytics
// Keeping for backward compatibility, but redirecting to new implementation

import { useEduFamSystemAnalytics } from './useEduFamSystemAnalytics';

export const useEduFamAnalytics = (filters: any) => {
  const { data, isLoading, error, refetch } = useEduFamSystemAnalytics();
  
  return {
    summary: data ? {
      grades: {
        totalGrades: data.grades.total_grades,
        averageGrade: data.grades.average_grade,
      },
      attendance: {
        totalRecords: data.attendance.total_records,
        attendanceRate: data.attendance.average_attendance_rate,
      },
      finance: {
        totalCollected: data.finance.total_collected,
        transactionsCount: data.finance.schools_with_finance,
      },
    } : null,
    loading: isLoading,
    error: error ? 'Failed to load analytics data' : null,
    retry: refetch,
  };
};
