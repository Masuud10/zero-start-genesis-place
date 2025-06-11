
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SystemAlert {
  type: string;
  message: string;
  time: string;
  severity: 'high' | 'medium' | 'low';
}

interface SystemAlertsSectionProps {
  alerts: SystemAlert[];
}

const SystemAlertsSection: React.FC<SystemAlertsSectionProps> = ({ alerts }) => {
  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>🚨</span>
          <span>System Alerts</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.map((alert, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-accent transition-colors">
              <div className={`w-2 h-2 rounded-full mt-2 ${
                alert.severity === 'high' ? 'bg-red-500' :
                alert.severity === 'medium' ? 'bg-yellow-500' :
                'bg-green-500'
              }`}></div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <Badge variant={
                    alert.severity === 'high' ? 'destructive' :
                    alert.severity === 'medium' ? 'secondary' : 'default'
                  }>
                    {alert.type}
                  </Badge>
                  <p className="text-xs text-muted-foreground">{alert.time}</p>
                </div>
                <p className="text-sm font-medium mt-1">{alert.message}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemAlertsSection;
