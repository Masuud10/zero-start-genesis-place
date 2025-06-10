
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle, XCircle, Clock, Bell } from 'lucide-react';

interface AlertItem {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  resolved: boolean;
  school?: string;
}

const AlertSystem = () => {
  const [alerts, setAlerts] = useState<AlertItem[]>([
    {
      id: '1',
      type: 'critical',
      title: 'System Downtime Alert',
      message: 'Greenwood Primary experiencing connection issues for 15+ minutes',
      timestamp: '2025-06-10 11:30:00',
      resolved: false,
      school: 'Greenwood Primary'
    },
    {
      id: '2',
      type: 'warning',
      title: 'High Transaction Volume',
      message: 'MPESA transaction volume 40% above normal levels',
      timestamp: '2025-06-10 10:45:00',
      resolved: false
    },
    {
      id: '3',
      type: 'info',
      title: 'Feature Usage Milestone',
      message: 'Analytics module reached 90% adoption across all schools',
      timestamp: '2025-06-10 09:15:00',
      resolved: true
    },
    {
      id: '4',
      type: 'warning',
      title: 'Support Ticket Backlog',
      message: '15+ open tickets awaiting response for >24h',
      timestamp: '2025-06-10 08:30:00',
      resolved: false
    }
  ]);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'info':
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getAlertVariant = (type: string): "default" | "destructive" => {
    return type === 'critical' ? 'destructive' : 'default';
  };

  const markAsResolved = (alertId: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId ? { ...alert, resolved: true } : alert
      )
    );
  };

  const activeAlerts = alerts.filter(alert => !alert.resolved);
  const resolvedAlerts = alerts.filter(alert => alert.resolved);

  return (
    <div className="space-y-4">
      {/* Alert Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              System Alerts
            </span>
            <Badge variant={activeAlerts.length > 0 ? "destructive" : "default"}>
              {activeAlerts.length} Active
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 border rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {activeAlerts.filter(a => a.type === 'critical').length}
              </div>
              <div className="text-sm text-muted-foreground">Critical</div>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {activeAlerts.filter(a => a.type === 'warning').length}
              </div>
              <div className="text-sm text-muted-foreground">Warnings</div>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {resolvedAlerts.length}
              </div>
              <div className="text-sm text-muted-foreground">Resolved Today</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Active Alerts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {activeAlerts.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-600" />
              <p>No active alerts. System running smoothly!</p>
            </div>
          ) : (
            activeAlerts.map((alert) => (
              <Alert key={alert.id} variant={getAlertVariant(alert.type)}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1">
                      <AlertTitle className="flex items-center gap-2">
                        {alert.title}
                        {alert.school && (
                          <Badge variant="outline" className="text-xs">
                            {alert.school}
                          </Badge>
                        )}
                      </AlertTitle>
                      <AlertDescription className="mt-1">
                        {alert.message}
                      </AlertDescription>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {alert.timestamp}
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => markAsResolved(alert.id)}
                  >
                    Resolve
                  </Button>
                </div>
              </Alert>
            ))
          )}
        </CardContent>
      </Card>

      {/* Alert Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Alert Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Automated Triggers</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• System downtime > 10 minutes</li>
                <li>• Transaction volume ±30% from baseline</li>
                <li>• Support tickets > 20 pending</li>
                <li>• Error rate > 2%</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Notification Channels</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Dashboard alerts (real-time)</li>
                <li>• Email notifications</li>
                <li>• SMS for critical alerts</li>
                <li>• Slack integration</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AlertSystem;
