import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface CreateBillingRecordData {
  school_id: string;
  billing_type: 'setup_fee' | 'subscription_fee';
  amount: number;
  description: string;
  due_date: string;
  student_count?: number;
  billing_period_start?: string;
  billing_period_end?: string;
}

interface UpdateBillingRecordData {
  id: string;
  amount?: number;
  description?: string;
  due_date?: string;
  status?: 'pending' | 'paid' | 'overdue' | 'cancelled';
  paid_date?: string;
  payment_method?: string;
}

interface ExportBillingDataOptions {
  format: 'pdf' | 'excel';
  filters?: {
    school_id?: string;
    status?: string;
    billing_type?: string;
    date_from?: string;
    date_to?: string;
  };
}

export const useBillingActions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createBillingRecord = useMutation({
    mutationFn: async (data: CreateBillingRecordData) => {
      if (!user || user.role !== 'edufam_admin') {
        throw new Error('Access denied. Only EduFam Admin can create billing records.');
      }

      console.log('📊 Creating billing record:', data);

      // Generate invoice number
      const { data: lastRecord } = await supabase
        .from('school_billing_records')
        .select('invoice_number')
        .order('created_at', { ascending: false })
        .limit(1);

      const lastInvoiceNumber = lastRecord?.[0]?.invoice_number || 'EF-2024-0000';
      const lastNumber = parseInt(lastInvoiceNumber.split('-').pop() || '0');
      const newInvoiceNumber = `EF-${new Date().getFullYear()}-${String(lastNumber + 1).padStart(4, '0')}`;

      const { data: newRecord, error } = await supabase
        .from('school_billing_records')
        .insert({
          ...data,
          invoice_number: newInvoiceNumber,
          currency: 'KES',
          status: 'pending',
          created_by: user.id
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating billing record:', error);
        throw error;
      }

      console.log('📊 Billing record created successfully:', newRecord);
      return newRecord;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enhanced-billing-data'] });
      queryClient.invalidateQueries({ queryKey: ['billing-records'] });
      queryClient.invalidateQueries({ queryKey: ['billing-stats'] });
    },
    onError: (error: Error) => {
      console.error('Failed to create billing record:', error);
      toast({
        title: "Error",
        description: `Failed to create billing record: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const updateBillingRecord = useMutation({
    mutationFn: async (data: UpdateBillingRecordData) => {
      if (!user || user.role !== 'edufam_admin') {
        throw new Error('Access denied. Only EduFam Admin can update billing records.');
      }

      console.log('📊 Updating billing record:', data);

      const { data: updatedRecord, error } = await supabase
        .from('school_billing_records')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', data.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating billing record:', error);
        throw error;
      }

      console.log('📊 Billing record updated successfully:', updatedRecord);
      return updatedRecord;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enhanced-billing-data'] });
      queryClient.invalidateQueries({ queryKey: ['billing-records'] });
      queryClient.invalidateQueries({ queryKey: ['billing-stats'] });
    },
    onError: (error: Error) => {
      console.error('Failed to update billing record:', error);
      toast({
        title: "Error",
        description: `Failed to update billing record: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const deleteBillingRecord = useMutation({
    mutationFn: async (recordId: string) => {
      if (!user || user.role !== 'edufam_admin') {
        throw new Error('Access denied. Only EduFam Admin can delete billing records.');
      }

      console.log('📊 Deleting billing record:', recordId);

      const { error } = await supabase
        .from('school_billing_records')
        .delete()
        .eq('id', recordId);

      if (error) {
        console.error('Error deleting billing record:', error);
        throw error;
      }

      console.log('📊 Billing record deleted successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enhanced-billing-data'] });
      queryClient.invalidateQueries({ queryKey: ['billing-records'] });
      queryClient.invalidateQueries({ queryKey: ['billing-stats'] });
    },
    onError: (error: Error) => {
      console.error('Failed to delete billing record:', error);
      toast({
        title: "Error",
        description: `Failed to delete billing record: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const exportBillingData = useMutation({
    mutationFn: async (options: ExportBillingDataOptions) => {
      if (!user || user.role !== 'edufam_admin') {
        throw new Error('Access denied. Only EduFam Admin can export billing data.');
      }

      console.log('📊 Exporting billing data:', options);

      // Build query with filters
      let query = supabase
        .from('school_billing_records')
        .select(`
          *,
          school:schools(id, name, email)
        `)
        .order('created_at', { ascending: false });

      if (options.filters?.school_id) {
        query = query.eq('school_id', options.filters.school_id);
      }
      if (options.filters?.status) {
        query = query.eq('status', options.filters.status);
      }
      if (options.filters?.billing_type) {
        query = query.eq('billing_type', options.filters.billing_type);
      }
      if (options.filters?.date_from) {
        query = query.gte('created_at', options.filters.date_from);
      }
      if (options.filters?.date_to) {
        query = query.lte('created_at', options.filters.date_to);
      }

      const { data: records, error } = await query;

      if (error) {
        console.error('Error fetching billing data for export:', error);
        throw error;
      }

      // Generate export file
      const exportData = {
        format: options.format,
        data: records,
        generatedAt: new Date().toISOString(),
        generatedBy: user.email
      };

      // In a real implementation, you would generate the actual file here
      // For now, we'll simulate the export
      console.log('📊 Export data prepared:', exportData);

      // Simulate file download
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: options.format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `billing-export-${new Date().toISOString().split('T')[0]}.${options.format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      return exportData;
    },
    onError: (error: Error) => {
      console.error('Failed to export billing data:', error);
      toast({
        title: "Export Error",
        description: `Failed to export billing data: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const createSetupFees = useMutation({
    mutationFn: async (customAmount?: number) => {
      if (!user || user.role !== 'edufam_admin') {
        throw new Error('Access denied. Only EduFam Admin can create setup fees.');
      }

      console.log('📊 Creating setup fees for all schools');

      // Get all schools without setup fees
      const { data: schools, error: schoolsError } = await supabase
        .from('schools')
        .select('id, name')
        .eq('status', 'active');

      if (schoolsError) {
        throw schoolsError;
      }

      const setupFeeAmount = customAmount || 20000; // Use custom amount or default KES 20,000
      const createdRecords = [];

      for (const school of schools || []) {
        // Check if setup fee already exists
        const { data: existingSetupFee } = await supabase
          .from('school_billing_records')
          .select('id')
          .eq('school_id', school.id)
          .eq('billing_type', 'setup_fee')
          .single();

        if (!existingSetupFee) {
          // Generate invoice number
          const { data: lastRecord } = await supabase
            .from('school_billing_records')
            .select('invoice_number')
            .order('created_at', { ascending: false })
            .limit(1);

          const lastInvoiceNumber = lastRecord?.[0]?.invoice_number || 'EF-2024-0000';
          const lastNumber = parseInt(lastInvoiceNumber.split('-').pop() || '0');
          const newInvoiceNumber = `EF-${new Date().getFullYear()}-${String(lastNumber + 1).padStart(4, '0')}`;

          const { data: newRecord, error } = await supabase
            .from('school_billing_records')
            .insert({
              school_id: school.id,
              billing_type: 'setup_fee',
              amount: setupFeeAmount,
              currency: 'KES',
              status: 'pending',
              invoice_number: newInvoiceNumber,
              description: `Setup fee for ${school.name}`,
              due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              created_by: user.id
            })
            .select()
            .single();

          if (error) {
            console.error(`Error creating setup fee for school ${school.name}:`, error);
            continue;
          }

          createdRecords.push(newRecord);
        }
      }

      console.log(`📊 Created ${createdRecords.length} setup fee records`);
      return createdRecords;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['enhanced-billing-data'] });
      queryClient.invalidateQueries({ queryKey: ['billing-records'] });
      queryClient.invalidateQueries({ queryKey: ['billing-stats'] });
      
      toast({
        title: "Setup Fees Created",
        description: `Successfully created ${data.length} setup fee records.`,
      });
    },
    onError: (error: Error) => {
      console.error('Failed to create setup fees:', error);
      toast({
        title: "Error",
        description: `Failed to create setup fees: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const createMonthlySubscriptions = useMutation({
    mutationFn: async (customPerStudentRate?: number) => {
      if (!user || user.role !== 'edufam_admin') {
        throw new Error('Access denied. Only EduFam Admin can create monthly subscriptions.');
      }

      console.log('📊 Creating monthly subscriptions for all schools');

      // Get all active schools
      const { data: schools, error: schoolsError } = await supabase
        .from('schools')
        .select('id, name')
        .eq('status', 'active');

      if (schoolsError) {
        throw schoolsError;
      }

      const perStudentRate = customPerStudentRate || 150; // Use custom rate or default KES 150 per student
      const createdRecords = [];

      for (const school of schools || []) {
        // Get student count for this school
        const { count: studentCount } = await supabase
          .from('students')
          .select('*', { count: 'exact', head: true })
          .eq('school_id', school.id)
          .eq('is_active', true);

        if (studentCount && studentCount > 0) {
          const subscriptionAmount = studentCount * perStudentRate;

          // Check if subscription for current month already exists
          const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
          const { data: existingSubscription } = await supabase
            .from('school_billing_records')
            .select('id')
            .eq('school_id', school.id)
            .eq('billing_type', 'subscription_fee')
            .gte('billing_period_start', `${currentMonth}-01`)
            .lte('billing_period_start', `${currentMonth}-31`)
            .single();

          if (!existingSubscription) {
            // Generate invoice number
            const { data: lastRecord } = await supabase
              .from('school_billing_records')
              .select('invoice_number')
              .order('created_at', { ascending: false })
              .limit(1);

            const lastInvoiceNumber = lastRecord?.[0]?.invoice_number || 'EF-2024-0000';
            const lastNumber = parseInt(lastInvoiceNumber.split('-').pop() || '0');
            const newInvoiceNumber = `EF-${new Date().getFullYear()}-${String(lastNumber + 1).padStart(4, '0')}`;

            const { data: newRecord, error } = await supabase
              .from('school_billing_records')
              .insert({
                school_id: school.id,
                billing_type: 'subscription_fee',
                amount: subscriptionAmount,
                currency: 'KES',
                status: 'pending',
                invoice_number: newInvoiceNumber,
                description: `Monthly subscription for ${school.name} (${studentCount} students)`,
                due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                student_count: studentCount,
                billing_period_start: `${currentMonth}-01`,
                billing_period_end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0],
                created_by: user.id
              })
              .select()
              .single();

            if (error) {
              console.error(`Error creating subscription for school ${school.name}:`, error);
              continue;
            }

            createdRecords.push(newRecord);
          }
        }
      }

      console.log(`📊 Created ${createdRecords.length} subscription records`);
      return createdRecords;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['enhanced-billing-data'] });
      queryClient.invalidateQueries({ queryKey: ['billing-records'] });
      queryClient.invalidateQueries({ queryKey: ['billing-stats'] });
      
      toast({
        title: "Monthly Subscriptions Created",
        description: `Successfully created ${data.length} subscription records.`,
      });
    },
    onError: (error: Error) => {
      console.error('Failed to create monthly subscriptions:', error);
      toast({
        title: "Error",
        description: `Failed to create monthly subscriptions: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  return {
    createBillingRecord,
    updateBillingRecord,
    deleteBillingRecord,
    exportBillingData,
    createSetupFees,
    createMonthlySubscriptions
  };
}; 