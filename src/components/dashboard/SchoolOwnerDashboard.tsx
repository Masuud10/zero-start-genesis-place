
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, GraduationCap, DollarSign, TrendingUp, Settings, BarChart3, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import SchoolFilteredAnalytics from '../analytics/SchoolFilteredAnalytics';
import AnalyticsSecurityGuard from '../analytics/AnalyticsSecurityGuard';

interface SchoolMetrics {
  totalStudents: number;
  totalTeachers: number;
  totalRevenue: number;
  outstandingFees: number;
  monthlyGrowth: number;
}

const SchoolOwnerDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { getCurrentSchoolId, validateSchoolAccess } = useSchoolScopedData();
  const [metrics, setMetrics] = useState<SchoolMetrics>({
    totalStudents: 0,
    totalTeachers: 0,
    totalRevenue: 0,
    outstandingFees: 0,
    monthlyGrowth: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const schoolId = getCurrentSchoolId();

  useEffect(() => {
    if (schoolId && user) {
      fetchSchoolMetrics();
    } else {
      setLoading(false);
      setError('No school assignment found');
    }
  }, [schoolId, user]);

  const fetchSchoolMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!schoolId) {
        throw new Error('No school ID available');
      }

      console.log('📈 SchoolOwnerDashboard: Fetching metrics for school:', schoolId);

      // Validate school access - fix the type error
      if (!validateSchoolAccess(schoolId)) {
        throw new Error('Access denied to school data');
      }

      // Fetch students count
      const { data: students, error: studentsError, count: studentsCount } = await supabase
        .from('students')
        .select('id', { count: 'exact' })
        .eq('school_id', schoolId)
        .eq('is_active', true);

      // Fetch teachers count
      const { data: teachers, error: teachersError, count: teachersCount } = await supabase
        .from('profiles')
        .select('id', { count: 'exact' })
        .eq('school_id', schoolId)
        .eq('role', 'teacher');

      // Fetch financial data
      const { data: fees, error: feesError } = await supabase
        .from('fees')
        .select('amount, paid_amount, status')
        .eq('school_id', schoolId);

      // Check for errors
      if (studentsError || teachersError || feesError) {
        const errors = [studentsError, teachersError, feesError].filter(Boolean);
        console.error('📈 SchoolOwnerDashboard: Query errors:', errors);
        throw new Error('Failed to fetch some data');
      }

      // Calculate financial metrics
      const totalRevenue = (fees || [])
        .filter(fee => fee.status === 'paid')
        .reduce((sum, fee) => sum + (fee.paid_amount || 0), 0);

      const outstandingFees = (fees || [])
        .filter(fee => fee.status === 'pending')
        .reduce((sum, fee) => sum + (fee.amount - (fee.paid_amount || 0)), 0);

      setMetrics({
        totalStudents: studentsCount || 0,
        totalTeachers: teachersCount || 0,
        totalRevenue,
        outstandingFees,
        monthlyGrowth: 5.2 // Mock data for now
      });

      console.log('📈 SchoolOwnerDashboard: Metrics fetched successfully');

    } catch (error: any) {
      console.error('📈 SchoolOwnerDashboard: Error fetching metrics:', error);
      setError(error.message || 'Failed to fetch school metrics');
      
      toast({
        title: "Error",
        description: `Failed to fetch school metrics: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const metricsCards = [
    {
      title: "Total Students",
      value: metrics.totalStudents,
      description: "Active enrollments",
      icon: Users,
      color: "text-blue-600",
      change: "+12% from last month"
    },
    {
      title: "Teaching Staff",
      value: metrics.totalTeachers,
      description: "Active teachers",
      icon: GraduationCap,
      color: "text-green-600",
      change: "+2 new hires"
    },
    {
      title: "Revenue (YTD)",
      value: `$${metrics.totalRevenue.toLocaleString()}`,
      description: "Year to date",
      icon: DollarSign,
      color: "text-emerald-600",
      change: `+${metrics.monthlyGrowth}% growth`
    },
    {
      title: "Outstanding Fees",
      value: `$${metrics.outstandingFees.toLocaleString()}`,
      description: "Pending payments",
      icon: TrendingUp,
      color: "text-orange-600",
      change: "Follow up required"
    }
  ];

  // Error state
  if (error && !loading) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Dashboard Error
          </CardTitle>
          <CardDescription>
            There was a problem loading your dashboard data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchSchoolMetrics} variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricsCards.map((card, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  <p className="text-xs text-gray-500">{card.description}</p>
                </div>
                <card.icon className={`h-8 w-8 ${card.color}`} />
              </div>
              <div className="text-xs text-green-600 mt-2">{card.change}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Management Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            School Management
          </CardTitle>
          <CardDescription>
            Key administrative functions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-24 flex-col gap-2 hover:bg-blue-50">
              <Users className="h-8 w-8" />
              <span className="font-medium">Manage Users</span>
              <span className="text-xs text-gray-500">Teachers & Staff</span>
            </Button>
            <Button variant="outline" className="h-24 flex-col gap-2 hover:bg-green-50">
              <DollarSign className="h-8 w-8" />
              <span className="font-medium">Financial Reports</span>
              <span className="text-xs text-gray-500">Revenue & Expenses</span>
            </Button>
            <Button variant="outline" className="h-24 flex-col gap-2 hover:bg-purple-50">
              <BarChart3 className="h-8 w-8" />
              <span className="font-medium">Analytics</span>
              <span className="text-xs text-gray-500">Performance Insights</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* School Analytics */}
      <AnalyticsSecurityGuard 
        requiredPermission="school" 
        schoolId={schoolId}
        fallbackMessage="You need school owner permissions to view analytics."
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              School Performance Analytics
            </CardTitle>
            <CardDescription>
              Real-time insights into your school's performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SchoolFilteredAnalytics 
              schoolId={schoolId} 
              timeRange="30d"
            />
          </CardContent>
        </Card>
      </AnalyticsSecurityGuard>
    </div>
  );
};

export default SchoolOwnerDashboard;
