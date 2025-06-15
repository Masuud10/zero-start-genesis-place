
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

interface RecentActivity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
}

interface RecentActivitiesProps {
  recentActivities: RecentActivity[];
}

const RecentActivities: React.FC<RecentActivitiesProps> = ({ recentActivities }) => (
  <Card>
    <CardHeader>
      <CardTitle>Recent Activities</CardTitle>
      <CardDescription>
        Latest activities in your school
      </CardDescription>
    </CardHeader>
    <CardContent>
      {recentActivities.length > 0 ? (
        <div className="space-y-3">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">{activity.description}</p>
                <p className="text-sm text-gray-600">{activity.type}</p>
              </div>
              <div className="text-xs text-gray-500">
                {new Date(activity.timestamp).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No recent activities</p>
        </div>
      )}
    </CardContent>
  </Card>
);

export default RecentActivities;
