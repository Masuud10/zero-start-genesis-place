import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

// Basic billing record type for internal admin use
export interface BillingRecord {
  id: string;
  description: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  due_date: string;
  created_at: string;
  updated_at: string;
}

// Billing stats for internal admin use
export interface BillingStats {
  totalRevenue: number;
  monthlyRevenue: number;
  outstandingAmount: number;
  paidThisMonth: number;
  overdueAmount: number;
  totalRecords: number;
}

// Mock data for internal admin billing
const mockBillingRecords: BillingRecord[] = [
  {
    id: '1',
    description: 'EduFam Platform Subscription - Q1 2024',
    amount: 500000,
    currency: 'KES',
    status: 'paid',
    due_date: '2024-03-31',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-03-15T00:00:00Z',
  },
  {
    id: '2',
    description: 'EduFam Platform Subscription - Q2 2024',
    amount: 500000,
    currency: 'KES',
    status: 'pending',
    due_date: '2024-06-30',
    created_at: '2024-04-01T00:00:00Z',
    updated_at: '2024-04-01T00:00:00Z',
  },
];

const mockBillingStats: BillingStats = {
  totalRevenue: 1500000,
  monthlyRevenue: 500000,
  outstandingAmount: 500000,
  paidThisMonth: 500000,
  overdueAmount: 0,
  totalRecords: 2,
};

// Hook for billing records
export const useBillingRecords = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['billing-records'],
    queryFn: async (): Promise<BillingRecord[]> => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockBillingRecords;
    },
    enabled: user?.role === 'edufam_admin',
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for billing stats
export const useBillingStats = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['billing-stats'],
    queryFn: async (): Promise<BillingStats> => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockBillingStats;
    },
    enabled: user?.role === 'edufam_admin',
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for billing actions
export const useBillingActions = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const createSetupFees = useMutation({
    mutationFn: async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Setup fees created successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create setup fees',
        variant: 'destructive',
      });
    },
  });

  const createMonthlySubscriptions = useMutation({
    mutationFn: async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Monthly subscriptions created successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create monthly subscriptions',
        variant: 'destructive',
      });
    },
  });

  return {
    createSetupFees,
    createMonthlySubscriptions,
  };
};

// Hook for all schools (simplified for internal admin use)
export const useAllSchools = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['all-schools'],
    queryFn: async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return [
        { id: '1', name: 'Demo School 1', status: 'active' },
        { id: '2', name: 'Demo School 2', status: 'active' },
      ];
    },
    enabled: user?.role === 'edufam_admin',
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}; 