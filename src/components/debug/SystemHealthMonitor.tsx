import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Database,
  RefreshCw,
  Zap
} from 'lucide-react';
import { DatabasePerformance } from '@/utils/databasePerformance';
import { EnhancedErrorHandler } from '@/utils/enhancedErrorHandler';
import { useAuth } from '@/contexts/AuthContext';

interface SystemHealthProps {
  onlyShowCritical?: boolean;
}

export const SystemHealthMonitor: React.FC<SystemHealthProps> = ({ 
  onlyShowCritical = false 
}) => {
  const { user } = useAuth();
  const [healthData, setHealthData] = useState({
    slowQueries: [] as Array<{ name: string; avgTime: number; executions: number }>,
    circuitBreakers: [] as Array<{ name: string; state: any }>,
    lastUpdate: new Date(),
    systemStatus: 'healthy' as 'healthy' | 'warning' | 'critical'
  });

  const isAuthorized = user?.role === 'edufam_admin' || user?.role === 'elimisha_admin';

  useEffect(() => {
    if (!isAuthorized) return;

    const updateHealthData = () => {
      const slowQueries = DatabasePerformance.getSlowQueries();
      const circuitBreakers = EnhancedErrorHandler.getCircuitBreakerStatus();
      
      // Determine system status
      let systemStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
      
      if (circuitBreakers.some(cb => cb.state.state === 'open')) {
        systemStatus = 'critical';
      } else if (slowQueries.length > 3 || circuitBreakers.some(cb => cb.state.failures > 2)) {
        systemStatus = 'warning';
      }

      setHealthData({
        slowQueries,
        circuitBreakers,
        lastUpdate: new Date(),
        systemStatus
      });
    };

    // Update immediately
    updateHealthData();

    // Update every 30 seconds
    const interval = setInterval(updateHealthData, 30000);
    return () => clearInterval(interval);
  }, [isAuthorized]);

  if (!isAuthorized) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          System health monitoring is only available to system administrators.
        </AlertDescription>
      </Alert>
    );
  }

  const StatusIcon = () => {
    switch (healthData.systemStatus) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
    }
  };

  const StatusBadge = () => {
    const variants = {
      healthy: { className: "bg-green-100 text-green-800", text: "Healthy" },
      warning: { className: "bg-yellow-100 text-yellow-800", text: "Warning" },
      critical: { className: "bg-red-100 text-red-800", text: "Critical" }
    };
    const variant = variants[healthData.systemStatus];
    
    return (
      <Badge className={variant.className}>
        {variant.text}
      </Badge>
    );
  };

  // Filter data if onlyShowCritical is true
  const filteredSlowQueries = onlyShowCritical 
    ? healthData.slowQueries.filter(q => q.avgTime > 3000)
    : healthData.slowQueries;

  const filteredCircuitBreakers = onlyShowCritical
    ? healthData.circuitBreakers.filter(cb => cb.state.state === 'open')
    : healthData.circuitBreakers;

  return (
    <div className="space-y-4">
      {/* System Status Overview */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-lg">
            <div className="flex items-center gap-2">
              <StatusIcon />
              System Health
            </div>
            <StatusBadge />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Last updated: {healthData.lastUpdate.toLocaleTimeString()}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Performance Issues */}
      {filteredSlowQueries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-yellow-600" />
              Slow Queries ({filteredSlowQueries.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {filteredSlowQueries.map((query, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200"
              >
                <div>
                  <div className="font-medium text-sm">{query.name.replace(/_/g, ' ')}</div>
                  <div className="text-xs text-muted-foreground">
                    {query.executions} executions
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-yellow-800">
                    {Math.round(query.avgTime)}ms
                  </div>
                  <div className="text-xs text-yellow-600">avg time</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Circuit Breaker Status */}
      {filteredCircuitBreakers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Zap className="h-5 w-5 text-red-600" />
              Circuit Breakers ({filteredCircuitBreakers.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {filteredCircuitBreakers.map((cb, index) => (
              <div 
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  cb.state.state === 'open' 
                    ? 'bg-red-50 border-red-200' 
                    : 'bg-yellow-50 border-yellow-200'
                }`}
              >
                <div>
                  <div className="font-medium text-sm">{cb.name.replace(/_/g, ' ')}</div>
                  <div className="text-xs text-muted-foreground">
                    {cb.state.failures} failures
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={
                    cb.state.state === 'open' 
                      ? "bg-red-100 text-red-800" 
                      : "bg-yellow-100 text-yellow-800"
                  }>
                    {cb.state.state}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Healthy State */}
      {onlyShowCritical && filteredSlowQueries.length === 0 && filteredCircuitBreakers.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              No Critical Issues Detected
            </h3>
            <p className="text-sm text-muted-foreground">
              All systems are operating within normal parameters.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SystemHealthMonitor;