import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ParentDashboardStats } from "@/hooks/useParentDashboardStats";

interface ParentStatCardsProps {
  stats: ParentDashboardStats;
  loading: boolean;
}

const ParentStatCards: React.FC<ParentStatCardsProps> = ({
  stats,
  loading,
}) => {
  // Safe value getters with fallbacks
  const getChildrenCount = () => {
    if (loading) return <span className="animate-pulse">...</span>;
    return stats?.childrenCount || 0;
  };

  const getAttendancePercentage = () => {
    if (loading) return <span className="animate-pulse">...</span>;
    const attendance = stats?.attendance || 0;
    return `${Math.max(0, Math.min(100, attendance)).toFixed(1)}%`;
  };

  const getFeeBalance = () => {
    if (loading) return <span className="animate-pulse">...</span>;
    const balance = stats?.feeBalance || 0;
    return `KES ${Math.max(0, balance).toLocaleString()}`;
  };

  const getRecentGrade = () => {
    if (loading) return <span className="animate-pulse">...</span>;
    return stats?.recentGrade || "-";
  };

  const getRecentSubject = () => {
    if (loading) return "";
    return stats?.recentSubject || "No data";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Children Enrolled
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {getChildrenCount()}
          </div>
          <p className="text-xs text-muted-foreground">
            {loading
              ? ""
              : (stats?.childrenCount || 0) === 0
              ? "No children"
              : "Active students"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            This Month Attendance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {getAttendancePercentage()}
          </div>
          <p className="text-xs text-muted-foreground">
            {loading
              ? ""
              : (stats?.attendance || 0) === 0
              ? "No data"
              : "Excellent attendance"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Fee Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">
            {getFeeBalance()}
          </div>
          <p className="text-xs text-muted-foreground">
            {loading
              ? ""
              : (stats?.feeBalance || 0) === 0
              ? "No balance"
              : "Due soon"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Recent Grade</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">
            {getRecentGrade()}
          </div>
          <p className="text-xs text-muted-foreground">
            {loading ? "" : getRecentSubject()}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ParentStatCards;
