
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SchoolAdminStats } from '@/hooks/useSchoolAdminStats';

interface SchoolAdminStatsCardsProps {
  stats: SchoolAdminStats;
  loading: boolean;
}

const SchoolAdminStatsCards: React.FC<SchoolAdminStatsCardsProps> = ({ stats, loading }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Students</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {loading ? <span className="animate-pulse">...</span> : stats.students}
          </div>
          <p className="text-xs text-muted-foreground">
            {loading ? "" : stats.students === 0 ? "No students" : "Active students"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {loading ? <span className="animate-pulse">...</span> : `${stats.attendanceRate.toFixed(1)}%`}
          </div>
          <p className="text-xs text-muted-foreground">
            {loading ? "" : stats.attendanceRate === 0 ? "No data" : "Today"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Fee Collection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">
            {loading ? <span className="animate-pulse">...</span> : `${stats.feeCollection.toFixed(1)}%`}
          </div>
          <p className="text-xs text-muted-foreground">
            {loading ? "" : stats.feeCollection === 0 ? "No data" : "Current term"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Active Teachers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">
            {loading ? <span className="animate-pulse">...</span> : stats.teachers}
          </div>
          <p className="text-xs text-muted-foreground">
            {loading ? "" : stats.teachers === 0 ? "No teachers" : "All departments"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SchoolAdminStatsCards;
