
import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAnalyticsPermissions } from '@/hooks/useAnalyticsPermissions';
import { useAuth } from '@/contexts/AuthContext';
import { useSchool } from '@/contexts/SchoolContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface SchoolAnalyticsData {
  totalEvents: number;
  gradeEvents: number;
  attendanceEvents: number;
  financeEvents: number;
  userActivityEvents: number;
  lastEventTime: string | null;
}

interface SchoolFilteredAnalyticsProps {
  schoolId?: string;
  timeRange?: '24h' | '7d' | '30d' | '90d';
}

const SchoolFilteredAnalytics: React.FC<SchoolFilteredAnalyticsProps> = ({
  schoolId,
  timeRange = '24h'
}) => {
  const { user } = useAuth();
  const { currentSchool } = useSchool();
  const { canViewSchoolAnalytics, allowedSchoolIds } = useAnalyticsPermissions();

  const targetSchoolId = schoolId || currentSchool?.id || user?.school_id;

  // Calculate time filter
  const timeFilter = useMemo(() => {
    const now = new Date();
    const hours = {
      '24h': 24,
      '7d': 24 * 7,
      '30d': 24 * 30,
      '90d': 24 * 90
    };
    return new Date(now.getTime() - hours[timeRange] * 60 * 60 * 1000).toISOString();
  }, [timeRange]);

  const { data: analyticsData, isLoading, error } = useQuery({
    queryKey: ['school-analytics', targetSchoolId, timeRange],
    queryFn: async (): Promise<SchoolAnalyticsData> => {
      // Verify permission to access this school's data
      if (!canViewSchoolAnalytics(targetSchoolId)) {
        throw new Error('Insufficient permissions for this school');
      }

      // Verify school is in allowed list for non-system admins
      if (allowedSchoolIds && !allowedSchoolIds.includes(targetSchoolId!)) {
        throw new Error('School access denied');
      }

      let query = (supabase as any)
        .from('analytics_events')
        .select('event_category, timestamp')
        .gte('timestamp', timeFilter);

      // Apply school filter
      if (targetSchoolId) {
        query = query.eq('school_id', targetSchoolId);
      }

      const { data: events, error } = await query;

      if (error) {
        console.error('Analytics query error:', error);
        throw error;
      }

      // Process events into analytics data
      const processedData = (events || []).reduce((acc: any, event: any) => {
        acc.totalEvents++;
        
        switch (event.event_category) {
          case 'grades':
            acc.gradeEvents++;
            break;
          case 'attendance':
            acc.attendanceEvents++;
            break;
          case 'finance':
            acc.financeEvents++;
            break;
          case 'user_activity':
            acc.userActivityEvents++;
            break;
        }

        // Track latest event time
        if (!acc.lastEventTime || event.timestamp > acc.lastEventTime) {
          acc.lastEventTime = event.timestamp;
        }

        return acc;
      }, {
        totalEvents: 0,
        gradeEvents: 0,
        attendanceEvents: 0,
        financeEvents: 0,
        userActivityEvents: 0,
        lastEventTime: null
      });

      return processedData;
    },
    enabled: !!targetSchoolId && canViewSchoolAnalytics(targetSchoolId),
    staleTime: 30000,
    refetchInterval: 60000
  });

  if (!targetSchoolId) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">No school selected for analytics.</p>
        </CardContent>
      </Card>
    );
  }

  if (!canViewSchoolAnalytics(targetSchoolId)) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6">
          <p className="text-red-600">Access denied for this school's analytics.</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading analytics data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6">
          <p className="text-red-600">Error loading analytics: {error.message}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>School Analytics ({timeRange})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {analyticsData?.totalEvents || 0}
            </div>
            <p className="text-xs text-muted-foreground">Total Events</p>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {analyticsData?.gradeEvents || 0}
            </div>
            <p className="text-xs text-muted-foreground">Grades</p>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {analyticsData?.attendanceEvents || 0}
            </div>
            <p className="text-xs text-muted-foreground">Attendance</p>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {analyticsData?.financeEvents || 0}
            </div>
            <p className="text-xs text-muted-foreground">Finance</p>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {analyticsData?.userActivityEvents || 0}
            </div>
            <p className="text-xs text-muted-foreground">User Activity</p>
          </div>
        </div>
        
        {analyticsData?.lastEventTime && (
          <div className="mt-4 pt-4 border-t text-sm text-muted-foreground">
            Last activity: {new Date(analyticsData.lastEventTime).toLocaleString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SchoolFilteredAnalytics;
