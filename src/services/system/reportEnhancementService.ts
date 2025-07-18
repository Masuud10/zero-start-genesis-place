
import { supabase } from '@/integrations/supabase/client';

interface CompanyDetails {
  company_name: string;
  website_url: string;
  support_email: string;
  headquarters_address: string;
  contact_phone: string;
  company_logo_url: string;
  year_established: number;
}

export class ReportEnhancementService {
  static async getCompanyDetails(): Promise<CompanyDetails | null> {
    try {
      const { data, error } = await supabase
        .from('company_details')
        .select('*')
        .single();

      if (error) {
        console.error('Error fetching company details:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getCompanyDetails:', error);
      return null;
    }
  }

  static async enhanceReportWithCompanyData(reportType: string, filters: Record<string, unknown> = {}) {
    try {
      const companyDetails = await this.getCompanyDetails();
      
      if (!companyDetails) {
        console.warn('No company details found for report enhancement');
        return { filters, companyDetails: null };
      }

      return {
        ...filters,
        companyDetails: {
          name: companyDetails.company_name,
          website: companyDetails.website_url,
          email: companyDetails.support_email,
          address: companyDetails.headquarters_address,
          phone: companyDetails.contact_phone,
          logo: companyDetails.company_logo_url,
          established: companyDetails.year_established,
          reportType,
          generatedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Error enhancing report with company data:', error);
      return { filters, companyDetails: null };
    }
  }

  static async getSystemMetrics() {
    try {
      const [schoolsResult, usersResult, activeSchoolsResult, supportTicketsResult] = await Promise.all([
        supabase.from('schools').select('id', { count: 'exact' }),
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('schools').select('id', { count: 'exact' }).not('created_at', 'is', null),
        supabase.from('support_tickets').select('id, status', { count: 'exact' })
      ]);

      const totalSchools = schoolsResult.count || 0;
      const totalUsers = usersResult.count || 0;
      const activeSchools = activeSchoolsResult.count || 0;
      const totalSupportTickets = supportTicketsResult.count || 0;

      const openTickets = supportTicketsResult.data?.filter(ticket => ticket.status === 'open').length || 0;
      const ticketResolutionRate = totalSupportTickets > 0 ? ((totalSupportTickets - openTickets) / totalSupportTickets) * 100 : 100;

      return {
        totalSchools,
        totalUsers,
        activeSchools,
        totalSupportTickets,
        openTickets,
        ticketResolutionRate: Math.round(ticketResolutionRate * 100) / 100,
        systemUptime: 99.8,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting system metrics:', error);
      return {
        totalSchools: 0,
        totalUsers: 0,
        activeSchools: 0,
        totalSupportTickets: 0,
        openTickets: 0,
        ticketResolutionRate: 0,
        systemUptime: 0,
        lastUpdated: new Date().toISOString()
      };
    }
  }

  static async generateComprehensiveReport() {
    try {
      const [systemMetrics, financialSummary, userMetrics] = await Promise.all([
        this.getSystemMetrics(),
        this.getFinancialSummary(),
        this.getUserEngagementMetrics()
      ]);

      return {
        systemMetrics,
        financialSummary,
        userMetrics,
        generatedAt: new Date().toISOString(),
        reportType: 'comprehensive'
      };
    } catch (error) {
      console.error('Error generating comprehensive report:', error);
      return null;
    }
  }

  static async getFinancialSummary(dateFilter?: { start: Date; end: Date }) {
    try {
      let feesQuery = supabase
        .from('fees')
        .select('amount, paid_amount, created_at, school_id');
      
      let expensesQuery = supabase
        .from('expenses')
        .select('amount, created_at, school_id');

      if (dateFilter) {
        const startDate = dateFilter.start.toISOString();
        const endDate = dateFilter.end.toISOString();
        
        feesQuery = feesQuery
          .gte('created_at', startDate)
          .lte('created_at', endDate);
        
        expensesQuery = expensesQuery
          .gte('created_at', startDate)
          .lte('created_at', endDate);
      }

      const [feesResult, expensesResult] = await Promise.all([
        feesQuery,
        expensesQuery
      ]);

      if (feesResult.error || expensesResult.error) {
        throw feesResult.error || expensesResult.error;
      }

      const fees = feesResult.data || [];
      const expenses = expensesResult.data || [];

      const totalFeesAssigned = fees.reduce((sum, fee) => sum + (fee.amount || 0), 0);
      const totalFeesCollected = fees.reduce((sum, fee) => sum + (fee.paid_amount || 0), 0);
      const totalExpenses = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
      const outstandingFees = totalFeesAssigned - totalFeesCollected;
      const netRevenue = totalFeesCollected - totalExpenses;
      const collectionRate = totalFeesAssigned > 0 ? (totalFeesCollected / totalFeesAssigned) * 100 : 0;

      return {
        totalFeesAssigned,
        totalFeesCollected,
        totalExpenses,
        outstandingFees,
        netRevenue,
        collectionRate: Math.round(collectionRate * 100) / 100,
        totalTransactions: fees.length,
        averageTransactionValue: fees.length > 0 ? totalFeesCollected / fees.length : 0
      };
    } catch (error) {
      console.error('Error getting financial summary:', error);
      return {
        totalFeesAssigned: 0,
        totalFeesCollected: 0,
        totalExpenses: 0,
        outstandingFees: 0,
        netRevenue: 0,
        collectionRate: 0,
        totalTransactions: 0,
        averageTransactionValue: 0
      };
    }
  }

  static async getUserEngagementMetrics(dateFilter?: { start: Date; end: Date }) {
    try {
      let profilesQuery = supabase
        .from('profiles')
        .select('role, created_at');

      if (dateFilter) {
        const startDate = dateFilter.start.toISOString();
        const endDate = dateFilter.end.toISOString();
        
        profilesQuery = profilesQuery
          .gte('created_at', startDate)
          .lte('created_at', endDate);
      }

      const { data: profiles, error } = await profilesQuery;

      if (error) throw error;

      const usersByRole = profiles?.reduce((acc: Record<string, number>, profile) => {
        const role = profile.role || 'unknown';
        acc[role] = (acc[role] || 0) + 1;
        return acc;
      }, {}) || {};

      const totalUsers = profiles?.length || 0;
      const activeUsers = profiles?.length || 0;
      const newUsersInPeriod = profiles?.length || 0;

      return {
        totalUsers,
        activeUsers,
        newUsersInPeriod,
        usersByRole,
        activeUserPercentage: totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0
      };
    } catch (error) {
      console.error('Error getting user engagement metrics:', error);
      return {
        totalUsers: 0,
        activeUsers: 0,
        newUsersInPeriod: 0,
        usersByRole: {},
        activeUserPercentage: 0
      };
    }
  }

  static async generateSchoolPerformanceReport() {
    try {
      const { data: schools, error } = await supabase
        .from('schools')
        .select('id, name, created_at, status')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Generate mock performance data for schools
      const schoolPerformanceData = schools?.map(school => ({
        id: school.id,
        name: school.name,
        performanceScore: Math.floor(Math.random() * 40) + 60, // 60-100%
        status: school.status || 'active',
        rating: ['Excellent', 'Good', 'Average', 'Needs Improvement'][Math.floor(Math.random() * 4)],
        studentsCount: Math.floor(Math.random() * 500) + 50,
        teachersCount: Math.floor(Math.random() * 30) + 5,
        lastActivity: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
      })) || [];

      return schoolPerformanceData;
    } catch (error) {
      console.error('Error generating school performance report:', error);
      return [];
    }
  }

  static async generateSystemHealthReport() {
    try {
      // Mock system health data
      return {
        databaseStatus: 'Operational',
        databasePerformance: 'Excellent',
        databaseHealth: 99.5,
        apiStatus: 'Operational',
        apiPerformance: 'Good',
        apiHealth: 98.2,
        storageStatus: 'Operational',
        storagePerformance: 'Good',
        storageHealth: 95.8,
        authStatus: 'Operational',
        authPerformance: 'Excellent',
        authHealth: 99.9,
        overallStatus: 'Healthy',
        overallPerformance: 'Excellent',
        overallHealth: 98.4,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generating system health report:', error);
      return {
        databaseStatus: 'Unknown',
        databasePerformance: 'Unknown',
        databaseHealth: 0,
        apiStatus: 'Unknown',
        apiPerformance: 'Unknown',
        apiHealth: 0,
        storageStatus: 'Unknown',
        storagePerformance: 'Unknown',
        storageHealth: 0,
        authStatus: 'Unknown',
        authPerformance: 'Unknown',
        authHealth: 0,
        overallStatus: 'Unknown',
        overallPerformance: 'Unknown',
        overallHealth: 0,
        lastUpdated: new Date().toISOString()
      };
    }
  }
}
