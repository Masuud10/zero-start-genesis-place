
import { useFeeData } from './fee-management/useFeeData';
import { useMpesaTransactions } from './fee-management/useMpesaTransactions';
import { useClassSummaries } from './fee-management/useClassSummaries';
import { useFeeActions } from './fee-management/useFeeActions';
import { useSchoolData } from './fee-management/useSchoolData';

export const useFeeManagement = () => {
  const { fees, loading: feeLoading, error: feeError, refetch: refetchFees } = useFeeData();
  const { mpesaTransactions, loading: mpesaLoading, error: mpesaError, refetch: refetchMpesa } = useMpesaTransactions();
  const { classSummaries, loading: summaryLoading, error: summaryError, refetch: refetchSummaries } = useClassSummaries();
  const { classes, students, feeStructures, loading: schoolLoading, error: schoolError, refetch: refetchSchoolData } = useSchoolData();
  const { assignFeeToClass, assignFeeToStudent, recordPayment } = useFeeActions();

  const loading = feeLoading || mpesaLoading || summaryLoading || schoolLoading;
  const error = feeError || mpesaError || summaryError || schoolError;

  const refetch = () => {
    refetchFees();
    refetchMpesa();
    refetchSummaries();
    refetchSchoolData();
  };

  const handleAssignFeeToClass = async (classId: string, feeData: any) => {
    const success = await assignFeeToClass(classId, feeData);
    if (success) {
      refetchFees();
      refetchSummaries();
    }
    return success;
  };

  const handleAssignFeeToStudent = async (studentId: string, feeData: any) => {
    const success = await assignFeeToStudent(studentId, feeData, students);
    if (success) {
      refetchFees();
      refetchSummaries();
    }
    return success;
  };

  const handleRecordPayment = async (feeId: string, paymentData: any) => {
    const success = await recordPayment(feeId, paymentData);
    if (success) {
      refetchFees();
      refetchMpesa();
      refetchSummaries();
    }
    return success;
  };

  return {
    fees,
    mpesaTransactions,
    classSummaries,
    feeStructures,
    classFeesSummary: classSummaries, // Alias for backward compatibility
    classes,
    students,
    loading,
    error,
    assignFeeToClass: handleAssignFeeToClass,
    assignFeeToStudent: handleAssignFeeToStudent,
    recordPayment: handleRecordPayment,
    refetch
  };
};
