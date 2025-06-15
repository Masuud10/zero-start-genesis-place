
import React from 'react';

interface Activity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
}

interface RecentActivitiesProps {
  recentActivities: Activity[];
}

const RecentActivities: React.FC<RecentActivitiesProps> = ({ recentActivities }) => {
  if (!recentActivities || recentActivities.length === 0) {
    return (
      <div className="text-sm text-gray-500">
        No recent activities to display.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {recentActivities.slice(0, 5).map((activity) => (
        <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">
              {activity.description}
            </p>
            <p className="text-xs text-gray-500">
              {new Date(activity.timestamp).toLocaleDateString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecentActivities;
