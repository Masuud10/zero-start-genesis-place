import { supabase } from '@/integrations/supabase/client';

export interface SystemAnalyticsData {
  // User Analytics
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  userGrowthRate: number;
  userRoleDistribution: Array<{ role: string; count: number; percentage: number; color: string }>;
  userGrowthTrend: Array<{ month: string; users: number; growth: number }>;
  
  // School Analytics
  totalSchools: number;
  activeSchools: number;
  newSchoolsThisMonth: number;
  schoolGrowthRate: number;
  schoolRegistrationTrend: Array<{ month: string; schools: number; growth: number }>;
  schoolsByStatus: Array<{ status: string; count: number; color: string }>;
  
  // Subscription & Billing Analytics
  totalRevenue: number;
  monthlyRevenue: number;
  revenueGrowthRate: number;
  subscriptionData: Array<{ plan: string; count: number; revenue: number; color: string }>;
  billingTrend: Array<{ month: string; revenue: number; growth: number }>;
  
  // Usage Analytics
  totalLogins: number;
  averageLoginsPerDay: number;
  loginTrend: Array<{ date: string; logins: number; users: number }>;
  featureUsage: Array<{ feature: string; usage: number; percentage: number; color: string }>;
  activityFrequency: Array<{ frequency: string; users: number; percentage: number }>;
  
  // System Performance
  systemUptime: number;
  averageResponseTime: number;
  databasePerformance: number;
  apiSuccessRate: number;
  performanceMetrics: Array<{ metric: string; value: number; status: string; color: string }>;
  
  // Real-time Stats
  currentOnlineUsers: number;
  activeSessions: number;
  systemLoad: number;
  
  // Timestamps
  lastUpdated: string;
  dataFreshness: string;
}

export interface AnalyticsFilters {
  dateRange?: '7d' | '30d' | '90d' | '1y';
  schoolId?: string;
  userRole?: string;
  includeInactive?: boolean;
}

export class SystemAnalyticsService {
  static async getSystemAnalytics(filters: AnalyticsFilters = {}): Promise<SystemAnalyticsData> {
    console.log('📊 SystemAnalyticsService: Fetching system analytics with filters:', filters);
    
    try {
      const startTime = Date.now();
      
      // Fetch all data in parallel with error handling for each section
      const [
        usersData,
        schoolsData,
        loginData,
        billingData,
        activityData,
        performanceData
      ] = await Promise.allSettled([
        this.fetchUsersAnalytics(filters),
        this.fetchSchoolsAnalytics(filters),
        this.fetchLoginAnalytics(filters),
        this.fetchBillingAnalytics(filters),
        this.fetchActivityAnalytics(filters),
        this.fetchPerformanceAnalytics()
      ]);

      const processingTime = Date.now() - startTime;
      console.log(`📊 SystemAnalyticsService: Data fetched in ${processingTime}ms`);

      // Extract successful results or use fallback data
      const usersResult = usersData.status === 'fulfilled' ? usersData.value : this.getFallbackUserData();
      const schoolsResult = schoolsData.status === 'fulfilled' ? schoolsData.value : this.getFallbackSchoolData();
      const loginResult = loginData.status === 'fulfilled' ? loginData.value : this.getFallbackLoginData();
      const billingResult = billingData.status === 'fulfilled' ? billingData.value : this.getFallbackBillingData();
      const activityResult = activityData.status === 'fulfilled' ? activityData.value : this.getFallbackActivityData();
      const performanceResult = performanceData.status === 'fulfilled' ? performanceData.value : this.getFallbackPerformanceData();

      // Log any failed sections
      if (usersData.status === 'rejected') console.warn('⚠️ Users analytics failed:', usersData.reason);
      if (schoolsData.status === 'rejected') console.warn('⚠️ Schools analytics failed:', schoolsData.reason);
      if (loginData.status === 'rejected') console.warn('⚠️ Login analytics failed:', loginData.reason);
      if (billingData.status === 'rejected') console.warn('⚠️ Billing analytics failed:', billingData.reason);
      if (activityData.status === 'rejected') console.warn('⚠️ Activity analytics failed:', activityData.reason);
      if (performanceData.status === 'rejected') console.warn('⚠️ Performance analytics failed:', performanceData.reason);

      return {
        ...usersResult,
        ...schoolsResult,
        ...loginResult,
        ...billingResult,
        ...activityResult,
        ...performanceResult,
        lastUpdated: new Date().toISOString(),
        dataFreshness: `${processingTime}ms`
      };
    } catch (error) {
      console.error('❌ SystemAnalyticsService: Critical error fetching analytics:', error);
      // Return fallback data instead of throwing
      return this.getFallbackAnalyticsData();
    }
  }

  private static async fetchUsersAnalytics(filters: AnalyticsFilters) {
    try {
      const { data: users, error } = await supabase
        .from('profiles')
        .select('id, role, created_at, school_id')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('⚠️ Profiles query failed:', error);
        throw error;
      }

      const now = new Date();
      const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());

      // Filter users based on criteria
      const filteredUsers = users?.filter(user => {
        if (filters.schoolId && user.school_id !== filters.schoolId) return false;
        if (filters.userRole && user.role !== filters.userRole) return false;
        return true;
      }) || [];

      // Calculate user statistics
      const totalUsers = filteredUsers.length;
      const activeUsers = filteredUsers.length; // Simplified - assume all users are active
      const newUsersThisMonth = filteredUsers.filter(u => 
        new Date(u.created_at) >= oneMonthAgo).length;

      // User role distribution
      const roleCounts = filteredUsers.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const roleColors = {
        'edufam_admin': '#3b82f6',
        'school_owner': '#10b981',
        'principal': '#f59e0b',
        'teacher': '#06b6d4',
        'finance_officer': '#8b5cf6',
        'parent': '#ec4899',
        'student': '#84cc16'
      };

      const userRoleDistribution = Object.entries(roleCounts).map(([role, count]) => ({
        role: role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        count,
        percentage: totalUsers > 0 ? (count / totalUsers) * 100 : 0,
        color: roleColors[role as keyof typeof roleColors] || '#6b7280'
      }));

      // User growth trend (last 6 months)
      const userGrowthTrend = [];
      for (let i = 5; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = monthDate.toLocaleDateString('en-US', { month: 'short' });
        
        const usersInMonth = filteredUsers.filter(u => 
          new Date(u.created_at) <= monthDate
        ).length;
        
        const previousMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() - 1, 1);
        const usersInPreviousMonth = filteredUsers.filter(u => 
          new Date(u.created_at) <= previousMonth
        ).length;
        
        const growth = usersInPreviousMonth > 0 
          ? ((usersInMonth - usersInPreviousMonth) / usersInPreviousMonth) * 100 
          : 0;

        userGrowthTrend.push({
          month: monthName,
          users: usersInMonth,
          growth: Math.round(growth * 100) / 100
        });
      }

      const userGrowthRate = userGrowthTrend.length > 1 
        ? userGrowthTrend[userGrowthTrend.length - 1].growth 
        : 0;

      return {
        totalUsers,
        activeUsers,
        newUsersThisMonth,
        userGrowthRate,
        userRoleDistribution,
        userGrowthTrend
      };
    } catch (error) {
      console.error('❌ fetchUsersAnalytics error:', error);
      throw error;
    }
  }

  private static async fetchSchoolsAnalytics(filters: AnalyticsFilters) {
    try {
      const { data: schools, error } = await supabase
        .from('schools')
        .select('id, name, created_at, subscription_plan')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('⚠️ Schools query failed:', error);
        throw error;
      }

      const now = new Date();
      const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

      const filteredSchools = schools?.filter(school => {
        if (filters.schoolId && school.id !== filters.schoolId) return false;
        return true;
      }) || [];

      const totalSchools = filteredSchools.length;
      const activeSchools = filteredSchools.length; // Simplified - assume all schools are active
      const newSchoolsThisMonth = filteredSchools.filter(s => 
        new Date(s.created_at) >= oneMonthAgo).length;

      // School status distribution (simplified)
      const schoolsByStatus = [
        {
          status: 'Active',
          count: totalSchools,
          color: '#10b981'
        }
      ];

      // School registration trend
      const schoolRegistrationTrend = [];
      for (let i = 5; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = monthDate.toLocaleDateString('en-US', { month: 'short' });
        
        const schoolsInMonth = filteredSchools.filter(s => 
          new Date(s.created_at) <= monthDate
        ).length;
        
        const previousMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() - 1, 1);
        const schoolsInPreviousMonth = filteredSchools.filter(s => 
          new Date(s.created_at) <= previousMonth
        ).length;
        
        const growth = schoolsInPreviousMonth > 0 
          ? ((schoolsInMonth - schoolsInPreviousMonth) / schoolsInPreviousMonth) * 100 
          : 0;

        schoolRegistrationTrend.push({
          month: monthName,
          schools: schoolsInMonth,
          growth: Math.round(growth * 100) / 100
        });
      }

      const schoolGrowthRate = schoolRegistrationTrend.length > 1 
        ? schoolRegistrationTrend[schoolRegistrationTrend.length - 1].growth 
        : 0;

      return {
        totalSchools,
        activeSchools,
        newSchoolsThisMonth,
        schoolGrowthRate,
        schoolRegistrationTrend,
        schoolsByStatus
      };
    } catch (error) {
      console.error('❌ fetchSchoolsAnalytics error:', error);
      throw error;
    }
  }

  private static async fetchLoginAnalytics(filters: AnalyticsFilters) {
    try {
      const { data: users, error } = await supabase
        .from('profiles')
        .select('id, created_at, role, school_id')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('⚠️ Login analytics query failed:', error);
        throw error;
      }

      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const filteredUsers = users?.filter(user => {
        if (filters.schoolId && user.school_id !== filters.schoolId) return false;
        if (filters.userRole && user.role !== filters.userRole) return false;
        return true;
      }) || [];

      const totalLogins = filteredUsers.length;
      const recentLogins = filteredUsers.filter(u => 
        new Date(u.created_at) >= oneWeekAgo
      ).length;

      // Generate login trend for the last 7 days
      const loginTrend = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        const loginsOnDate = filteredUsers.filter(u => {
          const loginDate = new Date(u.created_at);
          return loginDate.toDateString() === date.toDateString();
        }).length;

        loginTrend.push({
          date: dateStr,
          logins: loginsOnDate,
          users: loginsOnDate
        });
      }

      const averageLoginsPerDay = loginTrend.reduce((sum, day) => sum + day.logins, 0) / 7;

      return {
        totalLogins,
        averageLoginsPerDay: Math.round(averageLoginsPerDay * 100) / 100,
        loginTrend
      };
    } catch (error) {
      console.error('❌ fetchLoginAnalytics error:', error);
      throw error;
    }
  }

  private static async fetchBillingAnalytics(filters: AnalyticsFilters) {
    try {
      // Try to fetch fees data, but don't fail if table doesn't exist
      let fees: Array<{ amount: number; paid_amount: number; school_id: string; created_at: string; status: string }> = [];
      try {
        const { data: feesData, error: feesError } = await supabase
          .from('fees')
          .select('amount, paid_amount, school_id, created_at, status');
        
        if (!feesError) {
          fees = feesData || [];
        } else {
          console.warn('⚠️ Fees table not available:', feesError);
        }
      } catch (e) {
        console.warn('⚠️ Fees table does not exist, using fallback data');
      }

      // Try to fetch schools data for subscription info
      let schools: Array<{ id: string; subscription_plan: string; created_at: string }> = [];
      try {
        const { data: schoolsData, error: schoolsError } = await supabase
          .from('schools')
          .select('id, subscription_plan, created_at');
        
        if (!schoolsError) {
          schools = schoolsData || [];
        } else {
          console.warn('⚠️ Schools query for billing failed:', schoolsError);
        }
      } catch (e) {
        console.warn('⚠️ Schools table not available for billing analytics');
      }

      const now = new Date();
      const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

      // Filter data based on criteria
      const filteredFees = fees.filter(fee => {
        if (filters.schoolId && fee.school_id !== filters.schoolId) return false;
        return true;
      });

      const filteredSchools = schools.filter(school => {
        if (filters.schoolId && school.id !== filters.schoolId) return false;
        return true;
      });

      // Calculate revenue metrics
      const totalRevenue = filteredFees.reduce((sum, fee) => sum + (fee.paid_amount || 0), 0);
      const monthlyRevenue = filteredFees
        .filter(fee => new Date(fee.created_at) >= oneMonthAgo)
        .reduce((sum, fee) => sum + (fee.paid_amount || 0), 0);

      // Subscription plan distribution
      const planCounts = filteredSchools.reduce((acc, school) => {
        const plan = school.subscription_plan || 'basic';
        acc[plan] = (acc[plan] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const planColors = {
        'basic': '#6b7280',
        'premium': '#3b82f6',
        'enterprise': '#10b981',
        'custom': '#f59e0b'
      };

      const subscriptionData = Object.entries(planCounts).map(([plan, count]) => ({
        plan: plan.charAt(0).toUpperCase() + plan.slice(1),
        count: count as number,
        revenue: (count as number) * (plan === 'premium' ? 100 : plan === 'enterprise' ? 500 : 50),
        color: planColors[plan as keyof typeof planColors] || '#6b7280'
      }));

      // Billing trend
      const billingTrend = [];
      for (let i = 5; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = monthDate.toLocaleDateString('en-US', { month: 'short' });
        
        const revenueInMonth = filteredFees
          .filter(fee => {
            const feeDate = new Date(fee.created_at);
            return feeDate.getMonth() === monthDate.getMonth() && 
                   feeDate.getFullYear() === monthDate.getFullYear();
          })
          .reduce((sum, fee) => sum + (fee.paid_amount || 0), 0);
        
        const previousMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() - 1, 1);
        const revenueInPreviousMonth = filteredFees
          .filter(fee => {
            const feeDate = new Date(fee.created_at);
            return feeDate.getMonth() === previousMonth.getMonth() && 
                   feeDate.getFullYear() === previousMonth.getFullYear();
          })
          .reduce((sum, fee) => sum + (fee.paid_amount || 0), 0);
        
        const growth = revenueInPreviousMonth > 0 
          ? ((revenueInMonth - revenueInPreviousMonth) / revenueInPreviousMonth) * 100 
          : 0;

        billingTrend.push({
          month: monthName,
          revenue: Math.round(revenueInMonth * 100) / 100,
          growth: Math.round(growth * 100) / 100
        });
      }

      const revenueGrowthRate = billingTrend.length > 1 
        ? billingTrend[billingTrend.length - 1].growth 
        : 0;

      return {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        monthlyRevenue: Math.round(monthlyRevenue * 100) / 100,
        revenueGrowthRate,
        subscriptionData,
        billingTrend
      };
    } catch (error) {
      console.error('❌ fetchBillingAnalytics error:', error);
      throw error;
    }
  }

  private static async fetchActivityAnalytics(filters: AnalyticsFilters) {
    try {
      // Try to fetch activity data from various tables, but don't fail if they don't exist
      let grades: Array<{ id: string; school_id: string; created_at?: string }> = [];
      let attendance: Array<{ id: string; school_id: string; created_at?: string }> = [];
      let announcements: Array<{ id: string; school_id: string; created_at?: string }> = [];

      try {
        const { data: gradesData, error: gradesError } = await supabase
          .from('grades')
          .select('id, school_id');
        if (!gradesError && gradesData) {
          grades = gradesData.map(grade => ({ ...grade, created_at: new Date().toISOString() }));
        }
      } catch (e) {
        console.warn('⚠️ Grades table not available');
      }

      try {
        const { data: attendanceData, error: attendanceError } = await supabase
          .from('attendance')
          .select('id, school_id');
        if (!attendanceError && attendanceData) {
          attendance = attendanceData.map(att => ({ ...att, created_at: new Date().toISOString() }));
        }
      } catch (e) {
        console.warn('⚠️ Attendance table not available');
      }

      try {
        const { data: announcementsData, error: announcementsError } = await supabase
          .from('announcements')
          .select('id, school_id');
        if (!announcementsError && announcementsData) {
          announcements = announcementsData.map(ann => ({ ...ann, created_at: new Date().toISOString() }));
        }
      } catch (e) {
        console.warn('⚠️ Announcements table not available');
      }

      const now = new Date();
      const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

      // Filter data based on criteria
      const filteredGrades = grades.filter(grade => {
        if (filters.schoolId && grade.school_id !== filters.schoolId) return false;
        return true;
      });

      const filteredAttendance = attendance.filter(attendance => {
        if (filters.schoolId && attendance.school_id !== filters.schoolId) return false;
        return true;
      });

      const filteredAnnouncements = announcements.filter(announcement => {
        if (filters.schoolId && announcement.school_id !== filters.schoolId) return false;
        return true;
      });

      // Feature usage analysis
      const featureUsage = [
        {
          feature: 'Grade Management',
          usage: filteredGrades.length,
          percentage: 100,
          color: '#3b82f6'
        },
        {
          feature: 'Attendance Tracking',
          usage: filteredAttendance.length,
          percentage: 100,
          color: '#10b981'
        },
        {
          feature: 'Announcements',
          usage: filteredAnnouncements.length,
          percentage: 100,
          color: '#f59e0b'
        }
      ];

      // Activity frequency analysis
      const totalActivities = filteredGrades.length + filteredAttendance.length + filteredAnnouncements.length;
      const activityFrequency = [
        {
          frequency: 'High Activity',
          users: Math.floor(totalActivities * 0.3),
          percentage: 30
        },
        {
          frequency: 'Medium Activity',
          users: Math.floor(totalActivities * 0.5),
          percentage: 50
        },
        {
          frequency: 'Low Activity',
          users: Math.floor(totalActivities * 0.2),
          percentage: 20
        }
      ];

      return {
        featureUsage,
        activityFrequency
      };
    } catch (error) {
      console.error('❌ fetchActivityAnalytics error:', error);
      throw error;
    }
  }

  private static async fetchPerformanceAnalytics() {
    try {
      // Simulate performance metrics (in real implementation, these would come from monitoring systems)
      const systemUptime = 99.9;
      const averageResponseTime = 150; // ms
      const databasePerformance = 95;
      const apiSuccessRate = 99.5;

      const performanceMetrics = [
        {
          metric: 'System Uptime',
          value: systemUptime,
          status: systemUptime >= 99.9 ? 'excellent' : systemUptime >= 99.5 ? 'good' : 'poor',
          color: systemUptime >= 99.9 ? '#10b981' : systemUptime >= 99.5 ? '#f59e0b' : '#ef4444'
        },
        {
          metric: 'Response Time',
          value: averageResponseTime,
          status: averageResponseTime <= 200 ? 'excellent' : averageResponseTime <= 500 ? 'good' : 'poor',
          color: averageResponseTime <= 200 ? '#10b981' : averageResponseTime <= 500 ? '#f59e0b' : '#ef4444'
        },
        {
          metric: 'Database Performance',
          value: databasePerformance,
          status: databasePerformance >= 95 ? 'excellent' : databasePerformance >= 90 ? 'good' : 'poor',
          color: databasePerformance >= 95 ? '#10b981' : databasePerformance >= 90 ? '#f59e0b' : '#ef4444'
        },
        {
          metric: 'API Success Rate',
          value: apiSuccessRate,
          status: apiSuccessRate >= 99.5 ? 'excellent' : apiSuccessRate >= 99 ? 'good' : 'poor',
          color: apiSuccessRate >= 99.5 ? '#10b981' : apiSuccessRate >= 99 ? '#f59e0b' : '#ef4444'
        }
      ];

      // Real-time stats (simulated)
      const currentOnlineUsers = Math.floor(Math.random() * 100) + 50;
      const activeSessions = Math.floor(Math.random() * 200) + 100;
      const systemLoad = Math.random() * 30 + 20; // 20-50%

      return {
        systemUptime,
        averageResponseTime,
        databasePerformance,
        apiSuccessRate,
        performanceMetrics,
        currentOnlineUsers,
        activeSessions,
        systemLoad: Math.round(systemLoad * 100) / 100
      };
    } catch (error) {
      console.error('❌ fetchPerformanceAnalytics error:', error);
      throw error;
    }
  }

  // Fallback data methods
  private static getFallbackUserData() {
    return {
      totalUsers: 0,
      activeUsers: 0,
      newUsersThisMonth: 0,
      userGrowthRate: 0,
      userRoleDistribution: [],
      userGrowthTrend: []
    };
  }

  private static getFallbackSchoolData() {
    return {
      totalSchools: 0,
      activeSchools: 0,
      newSchoolsThisMonth: 0,
      schoolGrowthRate: 0,
      schoolRegistrationTrend: [],
      schoolsByStatus: []
    };
  }

  private static getFallbackLoginData() {
    return {
      totalLogins: 0,
      averageLoginsPerDay: 0,
      loginTrend: []
    };
  }

  private static getFallbackBillingData() {
    return {
      totalRevenue: 0,
      monthlyRevenue: 0,
      revenueGrowthRate: 0,
      subscriptionData: [],
      billingTrend: []
    };
  }

  private static getFallbackActivityData() {
    return {
      featureUsage: [],
      activityFrequency: []
    };
  }

  private static getFallbackPerformanceData() {
    return {
      systemUptime: 99.9,
      averageResponseTime: 150,
      databasePerformance: 95,
      apiSuccessRate: 99.5,
      performanceMetrics: [
        { metric: 'System Uptime', value: 99.9, status: 'excellent', color: '#10b981' },
        { metric: 'Response Time', value: 150, status: 'excellent', color: '#10b981' },
        { metric: 'Database Performance', value: 95, status: 'excellent', color: '#10b981' },
        { metric: 'API Success Rate', value: 99.5, status: 'excellent', color: '#10b981' }
      ],
      currentOnlineUsers: 75,
      activeSessions: 150,
      systemLoad: 35
    };
  }

  private static getFallbackAnalyticsData(): SystemAnalyticsData {
    return {
      ...this.getFallbackUserData(),
      ...this.getFallbackSchoolData(),
      ...this.getFallbackLoginData(),
      ...this.getFallbackBillingData(),
      ...this.getFallbackActivityData(),
      ...this.getFallbackPerformanceData(),
      lastUpdated: new Date().toISOString(),
      dataFreshness: 'fallback'
    };
  }

  static async exportAnalyticsData(filters: AnalyticsFilters = {}): Promise<Blob> {
    console.log('📊 SystemAnalyticsService: Exporting analytics data');
    
    try {
      const analyticsData = await this.getSystemAnalytics(filters);
      
      // Create export data structure
      const exportData = {
        exportInfo: {
          timestamp: new Date().toISOString(),
          filters,
          generatedBy: 'EduFam System Analytics',
          version: '1.0'
        },
        summary: {
          totalSchools: analyticsData.totalSchools,
          totalUsers: analyticsData.totalUsers,
          totalRevenue: analyticsData.totalRevenue,
          systemUptime: analyticsData.systemUptime
        },
        detailedData: analyticsData
      };

      // Convert to JSON and create blob
      const jsonContent = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      
      return blob;
    } catch (error) {
      console.error('❌ SystemAnalyticsService: Error exporting analytics:', error);
      throw new Error(`Failed to export analytics data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
