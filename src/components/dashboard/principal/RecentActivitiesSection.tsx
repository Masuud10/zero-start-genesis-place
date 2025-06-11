
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface RecentActivitiesSectionProps {
  activities: Array<{
    action: string;
    user: string;
    time: string;
    type: string;
  }>;
}

const RecentActivitiesSection: React.FC<RecentActivitiesSectionProps> = ({ activities }) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'grade': return '📝';
      case 'attendance': return '📅';
      case 'admin': return '⚙️';
      case 'student': return '👨‍🎓';
      default: return '📋';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'grade': return 'default';
      case 'attendance': return 'secondary';
      case 'admin': return 'outline';
      case 'student': return 'default';
      default: return 'secondary';
    }
  };

  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>🔄</span>
          <span>Recent Activities</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-start justify-between p-3 border rounded-lg hover:shadow-sm transition-all duration-200">
              <div className="flex items-start gap-3">
                <span className="text-lg">{getActivityIcon(activity.type)}</span>
                <div>
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">by {activity.user}</p>
                </div>
              </div>
              <div className="text-right">
                <Badge variant={getActivityColor(activity.type) as any}>
                  {activity.type}
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivitiesSection;
