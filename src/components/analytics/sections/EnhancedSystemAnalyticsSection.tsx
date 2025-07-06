import React from "react";
import UserLoginChart from "../charts/UserLoginChart";
import PerformanceTrendsChart from "../charts/PerformanceTrendsChart";
import SchoolsOnboardedChart from "../charts/SchoolsOnboardedChart";
import UserDistributionChart from "../charts/UserDistributionChart";
import CurriculumDistributionChart from "../charts/CurriculumDistributionChart";
import { SystemAnalyticsData } from "@/services/analytics/systemAnalyticsService";

interface EnhancedSystemAnalyticsSectionProps {
  systemAnalytics: SystemAnalyticsData;
}

const EnhancedSystemAnalyticsSection = ({
  systemAnalytics,
}: EnhancedSystemAnalyticsSectionProps) => {
  if (!systemAnalytics) {
    console.warn(
      "⚠️ EnhancedSystemAnalyticsSection: No system analytics data provided"
    );
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-yellow-800 mb-2">
          Charts Loading...
        </h4>
        <p className="text-yellow-700">
          System analytics data is being processed. Charts will appear shortly.
        </p>
      </div>
    );
  }

  // Debug logging for chart data
  console.log("📊 EnhancedSystemAnalyticsSection - Chart Data:", {
    loginTrend: systemAnalytics.loginTrend?.length || 0,
    performanceMetrics: systemAnalytics.performanceMetrics?.length || 0,
    schoolRegistrationTrend:
      systemAnalytics.schoolRegistrationTrend?.length || 0,
    userRoleDistribution: systemAnalytics.userRoleDistribution?.length || 0,
    subscriptionData: systemAnalytics.subscriptionData?.length || 0,
    totalRevenue: systemAnalytics.totalRevenue ? "Available" : "Not Available",
  });

  return (
    <div className="space-y-6">
      <div className="border-t pt-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          Enhanced System Analytics
        </h4>

        {/* Line Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border">
            <UserLoginChart
              data={(systemAnalytics.loginTrend || []).map((item) => ({
                date: item.date,
                admin: 0,
                teacher: 0,
                principal: 0,
                parent: 0,
                finance_officer: 0,
                school_owner: 0,
                // Optionally, you can try to infer from item.users or item.logins if you want to distribute
              }))}
            />
          </div>
          <div className="bg-white rounded-lg shadow-sm border">
            <PerformanceTrendsChart
              data={(systemAnalytics.performanceMetrics || []).map((item) => ({
                month: item.metric || "N/A",
                average_grade: typeof item.value === "number" ? item.value : 0,
                total_grades: 0,
              }))}
            />
          </div>
        </div>

        {/* Bar Chart and Financial Summary Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border">
            <SchoolsOnboardedChart
              data={(systemAnalytics.schoolRegistrationTrend || []).map(
                (item) => ({
                  month: item.month,
                  count: typeof item.schools === "number" ? item.schools : 0,
                })
              )}
            />
          </div>
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h5 className="text-sm font-medium mb-4 text-gray-900">
              Financial Summary
            </h5>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="text-sm text-gray-600">Total Revenue:</span>
                <span className="font-semibold text-green-600">
                  KES {(systemAnalytics.totalRevenue || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="text-sm text-gray-600">Monthly Revenue:</span>
                <span className="font-semibold text-blue-600">
                  KES {(systemAnalytics.monthlyRevenue || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="text-sm text-gray-600">
                  Subscription Plans:
                </span>
                <span className="font-semibold text-purple-600">
                  {systemAnalytics.subscriptionData?.length || 0} Types
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Pie Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border">
            <UserDistributionChart
              data={systemAnalytics.userRoleDistribution || []}
            />
          </div>
          <div className="bg-white rounded-lg shadow-sm border">
            <CurriculumDistributionChart
              data={(systemAnalytics.subscriptionData || []).map((item) => ({
                type: item.plan || "N/A",
                count: typeof item.count === "number" ? item.count : 0,
                percentage: 0,
              }))}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedSystemAnalyticsSection;
