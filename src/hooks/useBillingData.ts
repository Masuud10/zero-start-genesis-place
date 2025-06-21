
import { useQuery } from '@tanstack/react-query';
import { BillingService } from '@/services/billing/billingService';
import { useAuth } from '@/contexts/AuthContext';

export const useBillingSubscriptions = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['billing-subscriptions'],
    queryFn: () => BillingService.getSubscriptions(),
    enabled: user?.role === 'edufam_admin',
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
    select: (response) => response.data,
  });
};

export const useBillingTransactions = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['billing-transactions'],
    queryFn: () => BillingService.getTransactions(),
    enabled: user?.role === 'edufam_admin',
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
    select: (response) => response.data,
  });
};
