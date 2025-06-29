
import React from 'react';
import UserLoginChart from '../charts/UserLoginChart';
import PerformanceTrendsChart from '../charts/PerformanceTrendsChart';
import SchoolsOnboardedChart from '../charts/SchoolsOnboardedChart';
import UserDistributionChart from '../charts/UserDistributionChart';
import CurriculumDistributionChart from '../charts/CurriculumDistributionChart';

interface EnhancedSystemAnalyticsSectionProps {
  systemAnalytics: any;
}

const EnhancedSystemAnalyticsSection = ({ systemAnalytics }: EnhancedSystemAnalyticsSectionProps) => {
  if (!systemAnalytics) return null;

  return (
    <div className="space-y-6">
      <div className="border-t pt-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Enhanced System Analytics</h4>
        
        {/* Line Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <UserLoginChart data={systemAnalytics.userLogins || []} />
          <PerformanceTrendsChart data={systemAnalytics.performanceTrends || []} />
        </div>

        {/* Bar Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <SchoolsOnboardedChart data={systemAnalytics.schoolsOnboarded || []} />
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h5 className="text-sm font-medium mb-4 text-gray-900">Financial Summary</h5>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="text-sm text-gray-600">Total Subscriptions:</span>
                <span className="font-semibold text-green-600">
                  KES {(systemAnalytics.financeSummary?.total_subscriptions || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="text-sm text-gray-600">Setup Fees:</span>
                <span className="font-semibold text-blue-600">
                  KES {(systemAnalytics.financeSummary?.setup_fees || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="text-sm text-gray-600">Monthly Revenue:</span>
                <span className="font-semibold text-purple-600">
                  KES {(systemAnalytics.financeSummary?.monthly_revenue || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Pie Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <UserDistributionChart data={systemAnalytics.userDistribution || []} />
          <CurriculumDistributionChart data={systemAnalytics.curriculumTypes || []} />
        </div>
      </div>
    </div>
  );
};

export default EnhancedSystemAnalyticsSection;
