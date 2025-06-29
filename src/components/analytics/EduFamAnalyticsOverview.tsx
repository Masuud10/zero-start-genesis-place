import React from 'react';
import { useAdminSchoolsData } from '@/hooks/useAdminSchoolsData';
import { useAdminUsersData } from '@/hooks/useAdminUsersData';
import { useEduFamAnalyticsData } from '@/hooks/useEduFamAnalyticsData';
import { TrendingUp } from 'lucide-react';
import SystemGrowthChart from './charts/SystemGrowthChart';
import GradeDistributionChart from './charts/GradeDistributionChart';
import RevenueTrendsChart from './charts/RevenueTrendsChart';
import AttendanceAnalyticsChart from './charts/AttendanceAnalyticsChart';
import SystemHealthCard from './cards/SystemHealthCard';
import SchoolAnalyticsDetail from './SchoolAnalyticsDetail';

const EduFamAnalyticsOverview = () => {
  const { data: schoolsData = [], isLoading: schoolsLoading } = useAdminSchoolsData(0);
  const { data: usersData = [], isLoading: usersLoading } = useAdminUsersData(0);
  const { data: analyticsData, isLoading: analyticsLoading } = useEduFamAnalyticsData();

  if (schoolsLoading || usersLoading || analyticsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-semibold text-gray-900">Real-Time Analytics Overview</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg h-64"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-6 h-6 text-blue-600" />
        <h3 className="text-xl font-semibold text-gray-900">Real-Time Analytics Overview</h3>
        <div className="ml-auto text-sm text-gray-500">
          Live data • Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* System Overview Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Schools & Users Growth Chart */}
        <SystemGrowthChart 
          schoolsCount={schoolsData.length} 
          usersCount={usersData.length} 
        />

        {/* Grade Distribution */}
        <GradeDistributionChart data={analyticsData?.gradesChartData || []} />

        {/* Monthly Revenue */}
        <RevenueTrendsChart 
          data={analyticsData?.revenueChartData || []} 
          totalRevenue={analyticsData?.totalRevenue || 0}
        />

        {/* Weekly Attendance Summary */}
        <AttendanceAnalyticsChart data={analyticsData?.attendanceChartData || []} />

        {/* System Health and Statistics */}
        <SystemHealthCard 
          schoolsCount={schoolsData.length} 
          usersCount={usersData.length} 
        />
      </div>

      {/* Individual School Analytics - This is the key addition */}
      <SchoolAnalyticsDetail />
    </div>
  );
};

export default EduFamAnalyticsOverview;
