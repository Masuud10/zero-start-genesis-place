
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BillingManagementService } from '@/services/billing/billingManagementService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useBillingRecords = (filters?: {
  status?: string;
  school_name?: string;
  month?: string;
  year?: string;
}) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['billing-records', filters],
    queryFn: () => BillingManagementService.getAllBillingRecords(filters),
    enabled: user?.role === 'edufam_admin',
    staleTime: 2 * 60 * 1000, // 2 minutes
    select: (response) => response.data,
    refetchOnWindowFocus: true,
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  });
};

export const useSchoolBillingRecords = (schoolId?: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['school-billing-records', schoolId],
    queryFn: () => BillingManagementService.getSchoolBillingRecords(schoolId!),
    enabled: user?.role === 'edufam_admin' && !!schoolId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    select: (response) => response.data,
    refetchOnWindowFocus: true,
  });
};

export const useBillingStats = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['billing-stats'],
    queryFn: () => BillingManagementService.getBillingStats(),
    enabled: user?.role === 'edufam_admin',
    staleTime: 2 * 60 * 1000, // 2 minutes
    select: (response) => response.data,
    refetchOnWindowFocus: true,
    refetchInterval: 3 * 60 * 1000, // 3 minutes
  });
};

export const useSchoolBillingSummaries = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['school-billing-summaries'],
    queryFn: () => BillingManagementService.getSchoolBillingSummaries(),
    enabled: user?.role === 'edufam_admin',
    staleTime: 5 * 60 * 1000, // 5 minutes
    select: (response) => response.data,
    refetchOnWindowFocus: true,
  });
};

export const usePaymentHistory = (schoolId?: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['payment-history', schoolId],
    queryFn: () => BillingManagementService.getPaymentHistory(schoolId),
    enabled: user?.role === 'edufam_admin',
    staleTime: 5 * 60 * 1000, // 5 minutes
    select: (response) => response.data,
  });
};

export const useAllSchools = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['all-schools'],
    queryFn: () => BillingManagementService.getAllSchools(),
    enabled: user?.role === 'edufam_admin',
    staleTime: 5 * 60 * 1000, // 5 minutes
    select: (response) => response.data,
  });
};

export const useInvoiceData = (recordId?: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['invoice-data', recordId],
    queryFn: () => BillingManagementService.generateInvoiceData(recordId!),
    enabled: user?.role === 'edufam_admin' && !!recordId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    select: (response) => response.data,
  });
};

export const useBillingActions = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updateBillingStatus = useMutation({
    mutationFn: ({ recordId, status, paymentMethod }: { recordId: string; status: string; paymentMethod?: string }) => 
      BillingManagementService.updateBillingStatus(recordId, status, paymentMethod),
    onSuccess: () => {
      toast({
        title: "Status Updated",
        description: "Billing record status has been updated successfully.",
      });
      // Invalidate all related queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['billing-records'] });
      queryClient.invalidateQueries({ queryKey: ['billing-stats'] });
      queryClient.invalidateQueries({ queryKey: ['school-billing-records'] });
      queryClient.invalidateQueries({ queryKey: ['school-billing-summaries'] });
      queryClient.invalidateQueries({ queryKey: ['payment-history'] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update billing status.",
        variant: "destructive",
      });
    },
  });

  const createSetupFee = useMutation({
    mutationFn: (schoolId: string) => BillingManagementService.createSetupFee(schoolId),
    onSuccess: (result) => {
      if (result.success) {
        toast({
          title: "Setup Fee Created",
          description: "Setup fee has been created for the school.",
        });
        // Invalidate all related queries
        queryClient.invalidateQueries({ queryKey: ['billing-records'] });
        queryClient.invalidateQueries({ queryKey: ['billing-stats'] });
        queryClient.invalidateQueries({ queryKey: ['school-billing-records'] });
        queryClient.invalidateQueries({ queryKey: ['school-billing-summaries'] });
      } else {
        toast({
          title: "Setup Fee Creation Failed",
          description: result.error || "Failed to create setup fee.",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Setup Fee Creation Failed",
        description: error.message || "Failed to create setup fee.",
        variant: "destructive",
      });
    },
  });

  const createMonthlySubscriptions = useMutation({
    mutationFn: () => BillingManagementService.createMonthlySubscriptions(),
    onSuccess: (result) => {
      toast({
        title: "Subscription Fees Created",
        description: `Created ${result.recordsCreated} subscription fee records.`,
      });
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ['billing-records'] });
      queryClient.invalidateQueries({ queryKey: ['billing-stats'] });
      queryClient.invalidateQueries({ queryKey: ['school-billing-summaries'] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Create Subscriptions",
        description: error.message || "Failed to create monthly subscription fees.",
        variant: "destructive",
      });
    },
  });

  const updateBillingRecord = useMutation({
    mutationFn: ({ recordId, updates }: { recordId: string; updates: any }) => 
      BillingManagementService.updateBillingRecord(recordId, updates),
    onSuccess: () => {
      toast({
        title: "Record Updated",
        description: "Billing record has been updated successfully.",
      });
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ['billing-records'] });
      queryClient.invalidateQueries({ queryKey: ['billing-stats'] });
      queryClient.invalidateQueries({ queryKey: ['school-billing-records'] });
      queryClient.invalidateQueries({ queryKey: ['school-billing-summaries'] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update billing record.",
        variant: "destructive",
      });
    },
  });

  return {
    updateBillingStatus,
    createSetupFee,
    createMonthlySubscriptions,
    updateBillingRecord
  };
};
