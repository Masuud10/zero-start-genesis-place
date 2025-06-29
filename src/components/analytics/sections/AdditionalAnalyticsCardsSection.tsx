
import React from 'react';

interface AdditionalAnalyticsCardsSectionProps {
  systemAnalytics: any;
}

const AdditionalAnalyticsCardsSection = ({ systemAnalytics }: AdditionalAnalyticsCardsSectionProps) => {
  if (!systemAnalytics) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Top Active Schools */}
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <h5 className="text-sm font-medium mb-4 text-gray-900">Top 5 Most Active Schools</h5>
        <div className="space-y-3">
          {systemAnalytics.topActiveSchools && systemAnalytics.topActiveSchools.length > 0 ? (
            systemAnalytics.topActiveSchools.map((school: any, index: number) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <span className="truncate text-gray-700">{school.school_name}</span>
                <span className="font-medium text-blue-600">{school.total_users} users</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No active schools data available</p>
          )}
        </div>
      </div>

      {/* Grade Approval Stats */}
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <h5 className="text-sm font-medium mb-4 text-gray-900">Grade Approval Status</h5>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-2 bg-green-50 rounded">
            <span className="text-sm text-green-700">Approved:</span>
            <span className="font-semibold text-green-600">
              {systemAnalytics.gradeApprovalStats?.approved || 0}
            </span>
          </div>
          <div className="flex justify-between items-center p-2 bg-yellow-50 rounded">
            <span className="text-sm text-yellow-700">Pending:</span>
            <span className="font-semibold text-yellow-600">
              {systemAnalytics.gradeApprovalStats?.pending || 0}
            </span>
          </div>
          <div className="flex justify-between items-center p-2 bg-red-50 rounded">
            <span className="text-sm text-red-700">Rejected:</span>
            <span className="font-semibold text-red-600">
              {systemAnalytics.gradeApprovalStats?.rejected || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Announcement Engagement */}
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <h5 className="text-sm font-medium mb-4 text-gray-900">Recent Announcement Engagement</h5>
        <div className="space-y-3">
          {systemAnalytics.announcementEngagement && systemAnalytics.announcementEngagement.length > 0 ? (
            systemAnalytics.announcementEngagement.slice(-3).map((item: any, index: number) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <span className="text-gray-700">{item.month}:</span>
                <span className="font-medium text-purple-600">{item.engagement_rate.toFixed(1)}%</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No engagement data available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdditionalAnalyticsCardsSection;
