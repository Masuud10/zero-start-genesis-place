
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
import SchoolOwnerStatsCards, { SchoolMetrics } from "./school-owner/SchoolOwnerStatsCards";
import SchoolManagementActions from "./school-owner/SchoolManagementActions";

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

      if (!validateSchoolAccess(schoolId)) {
        throw new Error('Access denied to school data');
      }

      const studentsCountPromise = supabase
        .from('students')
        .select('id', { count: 'exact' })
        .eq('school_id', schoolId)
        .eq('is_active', true);

      const teachersCountPromise = supabase
        .from('profiles')
        .select('id', { count: 'exact' })
        .eq('school_id', schoolId)
        .eq('role', 'teacher');
      
      const revenuePromise = supabase
        .from('fees')
        .select('paid_amount')
        .eq('school_id', schoolId)
        .eq('status', 'paid');
        
      const outstandingFeesPromise = supabase.rpc('get_outstanding_fees', { p_school_id: schoolId });

      const [
          { count: studentsCount, error: studentsError },
          { count: teachersCount, error: teachersError },
          { data: revenueData, error: revenueError },
          { data: outstandingFees, error: outstandingError }
      ] = await Promise.all([
          studentsCountPromise,
          teachersCountPromise,
          revenuePromise,
          outstandingFeesPromise
      ]);
      
      if (studentsError || teachersError || revenueError || outstandingError) {
        const errors = [studentsError, teachersError, revenueError, outstandingError].filter(Boolean);
        console.error('📈 SchoolOwnerDashboard: Query errors:', errors);
        throw new Error('Failed to fetch some data');
      }

      const totalRevenue = (revenueData || []).reduce((sum, fee) => sum + (fee.paid_amount || 0), 0);

      setMetrics({
        totalStudents: studentsCount || 0,
        totalTeachers: teachersCount || 0,
        totalRevenue,
        outstandingFees: outstandingFees || 0,
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

  // Action button handler for Management section
  const handleManagementAction = (action: string) => {
    console.log("Clicked School Management Action:", action);
    // TODO: Implement further modal or page navigation as needed
  };

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
      {/* Metrics Cards (refactored) */}
      <SchoolOwnerStatsCards metrics={metrics} loading={loading} />

      {/* Management Actions (refactored) */}
      <div className="rounded-lg bg-white/75 border shadow-sm">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2 font-semibold text-lg">
            <Settings className="h-5 w-5" />
            School Management
          </div>
          <div className="mb-2 text-muted-foreground text-sm">Key administrative functions</div>
          <SchoolManagementActions onAction={handleManagementAction} />
        </div>
      </div>

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
