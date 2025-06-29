
import React from 'react';
import SystemGrowthChart from '../charts/SystemGrowthChart';
import GradeDistributionChart from '../charts/GradeDistributionChart';
import RevenueTrendsChart from '../charts/RevenueTrendsChart';
import AttendanceAnalyticsChart from '../charts/AttendanceAnalyticsChart';
import SystemHealthCard from '../cards/SystemHealthCard';

interface SystemOverviewChartsSectionProps {
  schoolsCount: number;
  usersCount: number;
  analyticsData: any;
}

const SystemOverviewChartsSection = ({ 
  schoolsCount, 
  usersCount, 
  analyticsData 
}: SystemOverviewChartsSectionProps) => {
  return (
    <div className="space-y-6">
      {/* First Row - Key Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <SystemGrowthChart 
          schoolsCount={schoolsCount} 
          usersCount={usersCount} 
        />
        <GradeDistributionChart 
          data={analyticsData?.gradesChartData || []} 
        />
        <RevenueTrendsChart 
          data={analyticsData?.revenueChartData || []} 
          totalRevenue={analyticsData?.totalRevenue || 0}
        />
      </div>
      
      {/* Second Row - Additional Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AttendanceAnalyticsChart 
          data={analyticsData?.attendanceChartData || []} 
        />
        <SystemHealthCard 
          schoolsCount={schoolsCount} 
          usersCount={usersCount} 
        />
      </div>
    </div>
  );
};

export default SystemOverviewChartsSection;
