
import { supabase } from '@/integrations/supabase/client';

export interface UserGrowthData {
  month: string;
  count: number;
}

export interface SchoolGrowthData {
  month: string;
  count: number;
}

export interface EnrollmentBySchoolData {
  school_name: string;
  student_count: number;
}

export interface UserRoleDistributionData {
  role: string;
  count: number;
}

export interface CurriculumDistributionData {
  curriculum_type: string;
  count: number;
  percentage: number;
}

export interface FinancialSummaryData {
  plan_type: string;
  revenue: number;
  percentage: number;
}

export class AdminAnalyticsService {
  static async getUserGrowthData(): Promise<UserGrowthData[]> {
    try {
      console.log('🔄 Fetching user growth data...');
      
      // Get user registrations for the last 12 months
      const { data, error } = await supabase
        .from('profiles')
        .select('created_at')
        .gte('created_at', new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: true });

      if (error) {
        console.error('❌ Error fetching user growth data:', error);
        throw error;
      }

      // Group by month and count
      const monthlyData = new Map<string, number>();
      
      // Initialize last 12 months
      for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
        monthlyData.set(monthKey, 0);
      }

      // Count actual registrations
      data?.forEach(user => {
        if (user.created_at) {
          const date = new Date(user.created_at);
          const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
          monthlyData.set(monthKey, (monthlyData.get(monthKey) || 0) + 1);
        }
      });

      const result = Array.from(monthlyData.entries()).map(([month, count]) => ({
        month,
        count
      }));

      console.log('✅ User growth data fetched successfully:', result.length, 'months');
      return result;
    } catch (error) {
      console.error('❌ Failed to fetch user growth data:', error);
      throw error;
    }
  }

  static async getSchoolGrowthData(): Promise<SchoolGrowthData[]> {
    try {
      console.log('🔄 Fetching school growth data...');
      
      const { data, error } = await supabase
        .from('schools')
        .select('created_at')
        .gte('created_at', new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: true });

      if (error) {
        console.error('❌ Error fetching school growth data:', error);
        throw error;
      }

      // Group by month and count
      const monthlyData = new Map<string, number>();
      
      // Initialize last 12 months
      for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
        monthlyData.set(monthKey, 0);
      }

      // Count actual school registrations
      data?.forEach(school => {
        if (school.created_at) {
          const date = new Date(school.created_at);
          const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
          monthlyData.set(monthKey, (monthlyData.get(monthKey) || 0) + 1);
        }
      });

      const result = Array.from(monthlyData.entries()).map(([month, count]) => ({
        month,
        count
      }));

      console.log('✅ School growth data fetched successfully:', result.length, 'months');
      return result;
    } catch (error) {
      console.error('❌ Failed to fetch school growth data:', error);
      throw error;
    }
  }

  static async getEnrollmentBySchoolData(): Promise<EnrollmentBySchoolData[]> {
    try {
      console.log('🔄 Fetching enrollment by school data...');
      
      const { data, error } = await supabase
        .from('schools')
        .select(`
          name,
          students!inner(id)
        `)
        .limit(10);

      if (error) {
        console.error('❌ Error fetching enrollment data:', error);
        throw error;
      }

      const result = (data || [])
        .map(school => ({
          school_name: school.name,
          student_count: school.students?.length || 0
        }))
        .sort((a, b) => b.student_count - a.student_count)
        .slice(0, 10);

      console.log('✅ Enrollment by school data fetched successfully:', result.length, 'schools');
      return result;
    } catch (error) {
      console.error('❌ Failed to fetch enrollment data:', error);
      // Return fallback data if query fails
      return [];
    }
  }

  static async getUserRoleDistributionData(): Promise<UserRoleDistributionData[]> {
    try {
      console.log('🔄 Fetching user role distribution data...');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('role');

      if (error) {
        console.error('❌ Error fetching user role data:', error);
        throw error;
      }

      // Count roles
      const roleCounts = new Map<string, number>();
      data?.forEach(user => {
        const role = user.role || 'unknown';
        const displayRole = role.replace('_', ' ').split(' ').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
        roleCounts.set(displayRole, (roleCounts.get(displayRole) || 0) + 1);
      });

      const result = Array.from(roleCounts.entries()).map(([role, count]) => ({
        role,
        count
      }));

      console.log('✅ User role distribution data fetched successfully:', result.length, 'roles');
      return result;
    } catch (error) {
      console.error('❌ Failed to fetch user role distribution data:', error);
      throw error;
    }
  }

  static async getCurriculumDistributionData(): Promise<CurriculumDistributionData[]> {
    try {
      console.log('🔄 Fetching curriculum distribution data...');
      
      const { data, error } = await supabase
        .from('schools')
        .select('curriculum_type');

      if (error) {
        console.error('❌ Error fetching curriculum data:', error);
        throw error;
      }

      // Count curriculum types
      const curriculumCounts = new Map<string, number>();
      const total = data?.length || 0;

      data?.forEach(school => {
        const curriculum = school.curriculum_type || 'Unknown';
        const displayCurriculum = curriculum.toUpperCase();
        curriculumCounts.set(displayCurriculum, (curriculumCounts.get(displayCurriculum) || 0) + 1);
      });

      const result = Array.from(curriculumCounts.entries()).map(([curriculum_type, count]) => ({
        curriculum_type,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0
      }));

      console.log('✅ Curriculum distribution data fetched successfully:', result.length, 'types');
      return result;
    } catch (error) {
      console.error('❌ Failed to fetch curriculum distribution data:', error);
      throw error;
    }
  }

  static async getFinancialSummaryData(): Promise<FinancialSummaryData[]> {
    try {
      console.log('🔄 Fetching financial summary data...');
      
      const { data, error } = await supabase
        .from('school_billing_records')
        .select('amount, billing_type, status')
        .eq('status', 'paid');

      if (error) {
        console.error('❌ Error fetching financial data:', error);
        throw error;
      }

      // Group by billing type and sum amounts
      const typeRevenue = new Map<string, number>();
      let totalRevenue = 0;

      data?.forEach(record => {
        if (record.amount) {
          const amount = parseFloat(record.amount.toString());
          const type = record.billing_type || 'Unknown';
          const displayType = type.replace('_', ' ').split(' ').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ');
          
          typeRevenue.set(displayType, (typeRevenue.get(displayType) || 0) + amount);
          totalRevenue += amount;
        }
      });

      const result = Array.from(typeRevenue.entries()).map(([plan_type, revenue]) => ({
        plan_type,
        revenue,
        percentage: totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0
      }));

      console.log('✅ Financial summary data fetched successfully:', result.length, 'types');
      return result;
    } catch (error) {
      console.error('❌ Failed to fetch financial summary data:', error);
      // Return empty array if no billing data
      return [];
    }
  }
}
