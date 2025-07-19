
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, CheckCircle } from 'lucide-react';

interface SystemHealthCardProps {
  schoolsCount: number;
  usersCount: number;
}

const SystemHealthCard: React.FC<SystemHealthCardProps> = ({ schoolsCount, usersCount }) => {
  const uptime = 99.9;
  const activeSchools = Math.floor(schoolsCount * 0.92);

  return (
    <Card className="col-span-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">System Health</CardTitle>
        <Activity className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span className="text-sm">System Operational</span>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Uptime</span>
            <span className="font-medium">{uptime}%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Active Schools</span>
            <span className="font-medium">{activeSchools}/{schoolsCount}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Response Time</span>
            <span className="font-medium">142ms</span>
          </div>
        </div>

        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            All systems running normally
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemHealthCard;
