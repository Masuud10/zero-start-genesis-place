
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ParentDashboardStats } from '@/hooks/useParentDashboardStats';

interface ParentStatCardsProps {
  stats: ParentDashboardStats;
  loading: boolean;
}

const ParentStatCards: React.FC<ParentStatCardsProps> = ({ stats, loading }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Children Enrolled</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {loading ? <span className="animate-pulse">...</span> : stats.childrenCount}
          </div>
          <p className="text-xs text-muted-foreground">
            {loading ? "" : stats.childrenCount === 0 ? "No children" : "Active students"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">This Month Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {loading ? <span className="animate-pulse">...</span> : `${stats.attendance.toFixed(1)}%`}
          </div>
          <p className="text-xs text-muted-foreground">
            {loading ? "" : stats.attendance === 0 ? "No data" : "Excellent attendance"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Fee Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">
            {loading ? <span className="animate-pulse">...</span> : `KES ${stats.feeBalance.toLocaleString()}`}
          </div>
          <p className="text-xs text-muted-foreground">
            {loading ? "" : stats.feeBalance === 0 ? "No balance" : "Due soon"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Recent Grade</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">
            {loading ? <span className="animate-pulse">...</span> : stats.recentGrade}
          </div>
          <p className="text-xs text-muted-foreground">
            {loading ? "" : stats.recentGrade === "" ? "No data" : stats.recentSubject}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ParentStatCards;
