
import { useQuery } from '@tanstack/react-query';
import { BillingService } from '@/services/billing/billingService';
import { useAuth } from '@/contexts/AuthContext';
import { validateUuid, validateSchoolAccess } from '@/utils/uuidValidation';

export const useSchoolBillingData = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['school-billing-data', user?.school_id],
    queryFn: async () => {
      // Validate user and school ID before making request
      if (!user) {
        throw new Error('User authentication required');
      }

      const schoolValidation = validateSchoolAccess(user.school_id);
      if (!schoolValidation.isValid) {
        throw new Error(schoolValidation.error || 'Invalid school access');
      }

      return BillingService.getSchoolBillingData();
    },
    enabled: !!(user?.role === 'edufam_admin' && user?.school_id),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
    select: (response) => response.data,
    retry: (failureCount, error) => {
      // Don't retry on UUID validation errors
      if (error.message.includes('Invalid') || error.message.includes('null')) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

export const useBillingTransactions = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['billing-transactions', user?.school_id],
    queryFn: async () => {
      if (!user) {
        throw new Error('User authentication required');
      }

      const schoolValidation = validateSchoolAccess(user.school_id);
      if (!schoolValidation.isValid) {
        throw new Error(schoolValidation.error || 'Invalid school access');
      }

      return BillingService.getTransactions();
    },
    enabled: !!(user?.role === 'edufam_admin' && user?.school_id),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
    select: (response) => response.data,
    retry: (failureCount, error) => {
      if (error.message.includes('Invalid') || error.message.includes('null')) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

export const useFinancialSummary = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['financial-summary', user?.school_id],
    queryFn: async () => {
      if (!user) {
        throw new Error('User authentication required');
      }

      const schoolValidation = validateSchoolAccess(user.school_id);
      if (!schoolValidation.isValid) {
        throw new Error(schoolValidation.error || 'Invalid school access');
      }

      return BillingService.getSchoolFinancialSummary();
    },
    enabled: !!(user?.role === 'edufam_admin' && user?.school_id),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
    select: (response) => response.data,
    retry: (failureCount, error) => {
      if (error.message.includes('Invalid') || error.message.includes('null')) {
        return false;
      }
      return failureCount < 3;
    },
  });
};
