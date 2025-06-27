
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { EnhancedBillingService } from '@/services/billing/enhancedBillingService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useBillingSettings = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['billing-settings'],
    queryFn: () => EnhancedBillingService.getBillingSettings(),
    enabled: user?.role === 'edufam_admin',
    staleTime: 5 * 60 * 1000, // 5 minutes
    select: (response) => response.data,
  });
};

export const useSchoolBillingRecords = (filters?: any) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['school-billing-records', filters],
    queryFn: () => EnhancedBillingService.getSchoolBillingRecords(filters),
    enabled: user?.role === 'edufam_admin',
    staleTime: 2 * 60 * 1000, // 2 minutes
    select: (response) => response.data,
  });
};

export const useEnhancedBillingSummary = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['enhanced-billing-summary'],
    queryFn: () => EnhancedBillingService.getBillingSummary(),
    enabled: user?.role === 'edufam_admin',
    staleTime: 5 * 60 * 1000, // 5 minutes
    select: (response) => response.data,
  });
};

export const useBillingActions = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updateBillingSettings = useMutation({
    mutationFn: ({ settingKey, settingValue }: { settingKey: string; settingValue: any }) => 
      EnhancedBillingService.updateBillingSettings(settingKey, settingValue),
    onSuccess: () => {
      toast({
        title: "Settings Updated",
        description: "Billing settings have been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['billing-settings'] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update billing settings.",
        variant: "destructive",
      });
    },
  });

  const createMonthlySubscriptions = useMutation({
    mutationFn: () => EnhancedBillingService.createMonthlySubscriptionFees(),
    onSuccess: (result) => {
      toast({
        title: "Subscription Fees Created",
        description: `Created ${result.recordsCreated} subscription fee records.`,
      });
      queryClient.invalidateQueries({ queryKey: ['school-billing-records'] });
      queryClient.invalidateQueries({ queryKey: ['enhanced-billing-summary'] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Create Subscriptions",
        description: error.message || "Failed to create monthly subscription fees.",
        variant: "destructive",
      });
    },
  });

  const updateRecordStatus = useMutation({
    mutationFn: ({ recordId, status, paymentMethod }: { recordId: string; status: string; paymentMethod?: string }) => 
      EnhancedBillingService.updateBillingRecordStatus(recordId, status, paymentMethod),
    onSuccess: () => {
      toast({
        title: "Status Updated",
        description: "Billing record status has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['school-billing-records'] });
      queryClient.invalidateQueries({ queryKey: ['enhanced-billing-summary'] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update billing record status.",
        variant: "destructive",
      });
    },
  });

  return {
    updateBillingSettings,
    createMonthlySubscriptions,
    updateRecordStatus
  };
};
