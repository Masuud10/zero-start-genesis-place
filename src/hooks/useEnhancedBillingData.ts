import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface BillingFilters {
  search: string;
  status: string;
  billingType: string;
  dateRange: string;
}

interface SchoolBillingData {
  id: string;
  name: string;
  email: string;
  status: string;
  setupCost: number;
  subscriptionCost: number;
  totalPaid: number;
  outstandingBalance: number;
  studentCount: number;
  lastBilledDate: string;
  billingStatus: 'active' | 'inactive' | 'suspended';
  totalRecords: number;
}

interface BillingStats {
  totalBilledSchools: number;
  totalSetupRevenue: number;
  totalSubscriptionRevenue: number;
  outstandingBalances: number;
  totalRevenue: number;
  pendingInvoices: number;
  paidInvoices: number;
  setupFees: number;
  totalInvoices: number;
  averageSetupFee: number;
  averageSubscriptionFee: number;
  collectionRate: number;
}

interface BillingRecord {
  id: string;
  school_id: string;
  billing_type: 'setup_fee' | 'subscription_fee';
  amount: number;
  currency: string;
  billing_period_start?: string;
  billing_period_end?: string;
  student_count?: number;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  invoice_number: string;
  description: string;
  due_date: string;
  paid_date?: string;
  payment_method?: string;
  created_at: string;
  updated_at: string;
}

interface EnhancedBillingData {
  schools: SchoolBillingData[];
  stats: BillingStats;
  records: BillingRecord[];
}

export const useEnhancedBillingData = (filters: BillingFilters) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['enhanced-billing-data', filters],
    queryFn: async (): Promise<EnhancedBillingData> => {
      if (!user || user.role !== 'edufam_admin') {
        throw new Error('Access denied. Only EduFam Admin can access billing data.');
      }

      console.log('📊 useEnhancedBillingData: Fetching billing data with filters:', filters);

      // Fetch all schools with their basic information
      const { data: schools, error: schoolsError } = await supabase
        .from('schools')
        .select('id, name, email, status')
        .order('name');

      if (schoolsError) {
        console.error('Error fetching schools:', schoolsError);
        throw schoolsError;
      }

      // Fetch all billing records
      const { data: billingRecords, error: billingError } = await supabase
        .from('school_billing_records')
        .select('*')
        .order('created_at', { ascending: false });

      if (billingError) {
        console.error('Error fetching billing records:', billingError);
        throw billingError;
      }

      // Fetch student counts for all schools
      const { data: studentCounts, error: studentError } = await supabase
        .from('students')
        .select('school_id')
        .eq('is_active', true);

      if (studentError) {
        console.error('Error fetching student counts:', studentError);
        throw studentError;
      }

      // Calculate student counts per school
      const studentCountMap = new Map<string, number>();
      studentCounts?.forEach(student => {
        const currentCount = studentCountMap.get(student.school_id) || 0;
        studentCountMap.set(student.school_id, currentCount + 1);
      });

      // Process schools with billing data
      const processedSchools: SchoolBillingData[] = (schools || []).map(school => {
        const schoolRecords = billingRecords?.filter(r => r.school_id === school.id) || [];
        const studentCount = studentCountMap.get(school.id) || 0;

        // Calculate billing totals
        const setupRecords = schoolRecords.filter(r => r.billing_type === 'setup_fee');
        const subscriptionRecords = schoolRecords.filter(r => r.billing_type === 'subscription_fee');
        
        const setupCost = setupRecords.reduce((sum, r) => sum + Number(r.amount), 0);
        const subscriptionCost = subscriptionRecords.reduce((sum, r) => sum + Number(r.amount), 0);
        const totalPaid = schoolRecords.filter(r => r.status === 'paid').reduce((sum, r) => sum + Number(r.amount), 0);
        const outstandingBalance = (setupCost + subscriptionCost) - totalPaid;

        // Get last billed date
        const lastBilledDate = schoolRecords.length > 0 
          ? schoolRecords[0].created_at 
          : new Date().toISOString();

        return {
          id: school.id,
          name: school.name,
          email: school.email,
          status: school.status || 'active',
          setupCost,
          subscriptionCost,
          totalPaid,
          outstandingBalance,
          studentCount,
          lastBilledDate,
          billingStatus: school.status as 'active' | 'inactive' | 'suspended' || 'active',
          totalRecords: schoolRecords.length
        };
      });

      // Calculate comprehensive stats
      const totalBilledSchools = processedSchools.filter(s => s.totalRecords > 0).length;
      const totalSetupRevenue = processedSchools.reduce((sum, s) => sum + s.setupCost, 0);
      const totalSubscriptionRevenue = processedSchools.reduce((sum, s) => sum + s.subscriptionCost, 0);
      const outstandingBalances = processedSchools.reduce((sum, s) => sum + s.outstandingBalance, 0);
      const totalRevenue = totalSetupRevenue + totalSubscriptionRevenue;

      const allRecords = billingRecords || [];
      const pendingInvoices = allRecords.filter(r => r.status === 'pending').length;
      const paidInvoices = allRecords.filter(r => r.status === 'paid').length;
      const setupFees = allRecords.filter(r => r.billing_type === 'setup_fee').length;
      const totalInvoices = allRecords.length;

      const averageSetupFee = setupFees > 0 ? totalSetupRevenue / setupFees : 0;
      const averageSubscriptionFee = (totalInvoices - setupFees) > 0 
        ? totalSubscriptionRevenue / (totalInvoices - setupFees) 
        : 0;
      const collectionRate = totalInvoices > 0 ? (paidInvoices / totalInvoices) * 100 : 0;

      const stats: BillingStats = {
        totalBilledSchools,
        totalSetupRevenue,
        totalSubscriptionRevenue,
        outstandingBalances,
        totalRevenue,
        pendingInvoices,
        paidInvoices,
        setupFees,
        totalInvoices,
        averageSetupFee,
        averageSubscriptionFee,
        collectionRate
      };

      // Apply filters to schools
      let filteredSchools = processedSchools;
      
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredSchools = filteredSchools.filter(school =>
          school.name.toLowerCase().includes(searchLower) ||
          school.email.toLowerCase().includes(searchLower)
        );
      }

      if (filters.status !== 'all') {
        filteredSchools = filteredSchools.filter(school => school.billingStatus === filters.status);
      }

      if (filters.billingType !== 'all') {
        filteredSchools = filteredSchools.filter(school => {
          if (filters.billingType === 'setup_fee') return school.setupCost > 0;
          if (filters.billingType === 'subscription_fee') return school.subscriptionCost > 0;
          return true;
        });
      }

      // Apply date range filter
      if (filters.dateRange !== 'all') {
        const now = new Date();
        let startDate: Date;
        
        switch (filters.dateRange) {
          case '30d':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          case '90d':
            startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            break;
          case '1y':
            startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
            break;
          default:
            startDate = new Date(0);
        }
        
        filteredSchools = filteredSchools.filter(school => 
          new Date(school.lastBilledDate) >= startDate
        );
      }

      console.log('📊 useEnhancedBillingData: Data processed successfully', {
        totalSchools: processedSchools.length,
        filteredSchools: filteredSchools.length,
        totalRecords: allRecords.length,
        stats
      });

      return {
        schools: filteredSchools,
        stats,
        records: allRecords as BillingRecord[]
      };
    },
    enabled: user?.role === 'edufam_admin',
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  });
}; 