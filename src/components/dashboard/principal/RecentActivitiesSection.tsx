
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RecentActivity {
  action: string;
  user: string;
  time: string;
  type: string;
}

interface RecentActivitiesSectionProps {
  activities: RecentActivity[];
}

const RecentActivitiesSection: React.FC<RecentActivitiesSectionProps> = ({ activities }) => {
  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>📋</span>
          <span>Recent School Activities</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-accent transition-colors">
              <div className={`w-2 h-2 rounded-full mt-2 ${
                activity.type === 'grade' ? 'bg-blue-500' :
                activity.type === 'attendance' ? 'bg-green-500' :
                activity.type === 'admin' ? 'bg-purple-500' :
                'bg-orange-500'
              }`}></div>
              <div className="flex-1">
                <p className="text-sm font-medium">{activity.action}</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-muted-foreground">by {activity.user}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivitiesSection;
