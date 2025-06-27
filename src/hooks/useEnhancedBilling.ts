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

  const createSetupFee = useMutation({
    mutationFn: (schoolId: string) => EnhancedBillingService.createSetupFeeForSchool(schoolId),
    onSuccess: (result) => {
      if (result.success) {
        toast({
          title: "Setup Fee Created",
          description: "Setup fee has been created for the school.",
        });
        queryClient.invalidateQueries({ queryKey: ['school-billing-records'] });
        queryClient.invalidateQueries({ queryKey: ['enhanced-billing-summary'] });
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

  const calculateSubscriptionFee = useMutation({
    mutationFn: (schoolId: string) => EnhancedBillingService.calculateSchoolSubscriptionFee(schoolId),
    onSuccess: (result) => {
      console.log('Subscription fee calculated:', result.data);
    },
    onError: (error: any) => {
      toast({
        title: "Calculation Failed",
        description: error.message || "Failed to calculate subscription fee.",
        variant: "destructive",
      });
    },
  });

  const generateInvoice = useMutation({
    mutationFn: (recordId: string) => EnhancedBillingService.generateInvoiceData(recordId),
    onSuccess: (result) => {
      if (result.data) {
        toast({
          title: "Invoice Generated",
          description: "Invoice data has been generated successfully.",
        });
        // Here you could trigger a download or display the invoice
        console.log('Invoice data:', result.data);
      }
    },
    onError: (error: any) => {
      toast({
        title: "Invoice Generation Failed",
        description: error.message || "Failed to generate invoice.",
        variant: "destructive",
      });
    },
  });

  const createManualFee = useMutation({
    mutationFn: (data: {
      school_id: string;
      billing_type: 'setup_fee' | 'subscription_fee';
      amount: number;
      description: string;
      due_date: string;
    }) => EnhancedBillingService.createManualFeeRecord(data),
    onSuccess: (result) => {
      if (result.success) {
        toast({
          title: "Manual Fee Created",
          description: "Fee record has been created successfully.",
        });
        queryClient.invalidateQueries({ queryKey: ['school-billing-records'] });
        queryClient.invalidateQueries({ queryKey: ['enhanced-billing-summary'] });
      } else {
        toast({
          title: "Failed to Create Fee",
          description: result.error || "Failed to create fee record.",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Create Fee",
        description: error.message || "Failed to create fee record.",
        variant: "destructive",
      });
    },
  });

  return {
    updateBillingSettings,
    createSetupFee,
    createMonthlySubscriptions,
    updateRecordStatus,
    calculateSubscriptionFee,
    generateInvoice,
    createManualFee
  };
};
