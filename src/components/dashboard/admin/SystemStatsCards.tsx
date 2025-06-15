
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SystemStatsCardsProps {
  stats: {
    totalSchools: number;
    totalUsers: number;
    activeUsers: number;
    systemHealth: string;
    totalTransactions: number;
    avgPerformance: number;
  };
  loading: boolean;
}

const SystemStatsCards: React.FC<SystemStatsCardsProps> = ({ stats, loading }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Schools</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {loading ? <span className="animate-pulse">...</span> : stats.totalSchools}
          </div>
          <p className="text-xs text-muted-foreground">
            {loading ? "" : stats.totalSchools === 0 ? "No schools" : "Active institutions"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {loading ? <span className="animate-pulse">...</span> : stats.totalUsers}
          </div>
          <p className="text-xs text-muted-foreground">
            {loading ? "" : `${stats.activeUsers} active users`}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">System Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {loading ? <span className="animate-pulse">...</span> : stats.systemHealth}
          </div>
          <p className="text-xs text-muted-foreground">
            {loading ? "" : `${stats.avgPerformance}% uptime`}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">
            {loading ? <span className="animate-pulse">...</span> : stats.totalTransactions}
          </div>
          <p className="text-xs text-muted-foreground">
            {loading ? "" : "System-wide"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemStatsCards;
