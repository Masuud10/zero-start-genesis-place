
import React from 'react';
import SystemGrowthTrendsChart from '../charts/SystemGrowthTrendsChart';
import PlatformUsageChart from '../charts/PlatformUsageChart';
import RevenueAnalyticsChart from '../charts/RevenueAnalyticsChart';
import PerformanceInsightsChart from '../charts/PerformanceInsightsChart';
import UserRoleDistributionChart from '../charts/UserRoleDistributionChart';
import EnrollmentBySchoolChart from '../charts/EnrollmentBySchoolChart';
import CurriculumDistributionPieChart from '../charts/CurriculumDistributionPieChart';
import FinancialSummaryPieChart from '../charts/FinancialSummaryPieChart';

const SystemAnalyticsChartsSection = () => {
  console.log('📊 SystemAnalyticsChartsSection: Rendering system analytics charts section');

  return (
    <div className="space-y-6">
      {/* Growth and Usage Trends Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SystemGrowthTrendsChart />
        <PlatformUsageChart />
      </div>

      {/* Revenue and Performance Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueAnalyticsChart />
        <PerformanceInsightsChart />
      </div>

      {/* Distribution Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <UserRoleDistributionChart />
        <CurriculumDistributionPieChart />
        <FinancialSummaryPieChart />
      </div>

      {/* School-specific Analytics Row */}
      <div className="grid grid-cols-1 gap-6">
        <EnrollmentBySchoolChart />
      </div>
    </div>
  );
};

export default SystemAnalyticsChartsSection;
