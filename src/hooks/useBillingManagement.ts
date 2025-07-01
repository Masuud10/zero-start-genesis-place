
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface BillingRecord {
  id: string;
  school_id: string;
  invoice_number: string;
  amount: number;
  status: string;
  billing_type: string;
  description?: string;
  due_date?: string;
  created_at: string;
  schools?: {
    name: string;
    email: string;
  };
}

export const useBillingRecords = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['billing-records'],
    queryFn: async () => {
      if (!user || user.role !== 'edufam_admin') {
        throw new Error('Access denied. Only EduFam Admin can access billing data.');
      }

      const { data, error } = await supabase
        .from('school_billing_records')
        .select(`
          *,
          schools!inner(name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      return data as BillingRecord[];
    },
    enabled: user?.role === 'edufam_admin',
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useBillingStats = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['billing-stats'],
    queryFn: async () => {
      if (!user || user.role !== 'edufam_admin') {
        throw new Error('Access denied');
      }

      const { data: billingRecords, error } = await supabase
        .from('school_billing_records')
        .select('amount, status, billing_type');

      if (error) throw error;

      const totalRevenue = billingRecords?.reduce((sum, record) => sum + (record.amount || 0), 0) || 0;
      const pendingInvoices = billingRecords?.filter(r => r.status === 'pending').length || 0;
      const paidInvoices = billingRecords?.filter(r => r.status === 'paid').length || 0;
      const setupFees = billingRecords?.filter(r => r.billing_type === 'setup_fee').length || 0;

      return {
        totalRevenue,
        pendingInvoices,
        paidInvoices,
        setupFees,
        totalInvoices: billingRecords?.length || 0
      };
    },
    enabled: user?.role === 'edufam_admin',
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useBillingActions = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createSetupFees = useMutation({
    mutationFn: async () => {
      // Get all schools without setup fees
      const { data: schools, error: schoolsError } = await supabase
        .from('schools')
        .select('id, name')
        .not('id', 'in', 
          supabase
            .from('school_billing_records')
            .select('school_id')
            .eq('billing_type', 'setup_fee')
        );

      if (schoolsError) throw schoolsError;

      if (!schools || schools.length === 0) {
        return { message: 'All schools already have setup fees', recordsCreated: 0 };
      }

      // Create setup fee records
      const setupFeeRecords = schools.map(school => ({
        school_id: school.id,
        amount: 15000, // 15,000 KES setup fee
        billing_type: 'setup_fee',
        status: 'pending',
        description: `Setup fee for ${school.name}`,
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
      }));

      const { error: insertError } = await supabase
        .from('school_billing_records')
        .insert(setupFeeRecords);

      if (insertError) throw insertError;

      return { message: `Created setup fees for ${schools.length} schools`, recordsCreated: schools.length };
    },
    onSuccess: (result) => {
      toast({
        title: "Setup Fees Created",
        description: result.message,
      });
      queryClient.invalidateQueries({ queryKey: ['billing-records'] });
      queryClient.invalidateQueries({ queryKey: ['billing-stats'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create setup fees",
        variant: "destructive"
      });
    }
  });

  const createMonthlySubscriptions = useMutation({
    mutationFn: async () => {
      // Get all active schools
      const { data: schools, error: schoolsError } = await supabase
        .from('schools')
        .select('id, name')
        .eq('status', 'active');

      if (schoolsError) throw schoolsError;

      if (!schools || schools.length === 0) {
        return { message: 'No active schools found', recordsCreated: 0 };
      }

      // Create monthly subscription records
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
      const subscriptionRecords = schools.map(school => ({
        school_id: school.id,
        amount: 2500, // 2,500 KES monthly fee
        billing_type: 'subscription_fee',
        status: 'pending',
        description: `Monthly subscription for ${school.name} - ${currentMonth}`,
        due_date: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 5).toISOString() // 5th of next month
      }));

      const { error: insertError } = await supabase
        .from('school_billing_records')
        .insert(subscriptionRecords);

      if (insertError) throw insertError;

      return { message: `Created monthly subscriptions for ${schools.length} schools`, recordsCreated: schools.length };
    },
    onSuccess: (result) => {
      toast({
        title: "Monthly Subscriptions Created",
        description: result.message,
      });
      queryClient.invalidateQueries({ queryKey: ['billing-records'] });
      queryClient.invalidateQueries({ queryKey: ['billing-stats'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create monthly subscriptions",
        variant: "destructive"
      });
    }
  });

  return {
    createSetupFees,
    createMonthlySubscriptions
  };
};
