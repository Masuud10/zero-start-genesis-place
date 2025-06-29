
import React from 'react';
import UserGrowthChart from './charts/UserGrowthChart';
import SchoolGrowthChart from './charts/SchoolGrowthChart';
import EnrollmentBySchoolChart from './charts/EnrollmentBySchoolChart';
import UserRoleDistributionChart from './charts/UserRoleDistributionChart';
import CurriculumDistributionPieChart from './charts/CurriculumDistributionPieChart';
import FinancialSummaryPieChart from './charts/FinancialSummaryPieChart';

const ComprehensiveAnalyticsDashboard = () => {
  return (
    <div className="space-y-8">
      {/* Section 1: User & School Growth Trends */}
      <div className="space-y-4">
        <div className="border-b pb-2">
          <h3 className="text-lg font-semibold text-gray-900">Growth Trends</h3>
          <p className="text-sm text-gray-600">User and school registration trends over the last 12 months</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UserGrowthChart />
          <SchoolGrowthChart />
        </div>
      </div>

      {/* Section 2: System-Wide Distribution */}
      <div className="space-y-4">
        <div className="border-b pb-2">
          <h3 className="text-lg font-semibold text-gray-900">System Distribution</h3>
          <p className="text-sm text-gray-600">Current distribution of schools and users across the platform</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EnrollmentBySchoolChart />
          <UserRoleDistributionChart />
        </div>
      </div>

      {/* Section 3: System Composition */}
      <div className="space-y-4">
        <div className="border-b pb-2">
          <h3 className="text-lg font-semibold text-gray-900">System Composition</h3>
          <p className="text-sm text-gray-600">Breakdown of curriculum types and financial performance</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CurriculumDistributionPieChart />
          <FinancialSummaryPieChart />
        </div>
      </div>
    </div>
  );
};

export default ComprehensiveAnalyticsDashboard;
