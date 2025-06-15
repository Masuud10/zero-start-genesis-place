
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, GraduationCap, DollarSign, TrendingUp } from 'lucide-react';

export interface SchoolMetrics {
  totalStudents: number;
  totalTeachers: number;
  totalRevenue: number;
  outstandingFees: number;
  monthlyGrowth: number;
}

interface SchoolOwnerStatsCardsProps {
  metrics: SchoolMetrics;
  loading: boolean;
}

const SchoolOwnerStatsCards: React.FC<SchoolOwnerStatsCardsProps> = ({ metrics, loading }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Users className="h-4 w-4" />
            Total Students
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {loading ? <span className="animate-pulse">...</span> : metrics.totalStudents}
          </div>
          <p className="text-xs text-muted-foreground">
            {loading ? "" : "Enrolled students"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Total Teachers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {loading ? <span className="animate-pulse">...</span> : metrics.totalTeachers}
          </div>
          <p className="text-xs text-muted-foreground">
            {loading ? "" : "Teaching staff"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Total Revenue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">
            {loading ? <span className="animate-pulse">...</span> : `KES ${metrics.totalRevenue.toLocaleString()}`}
          </div>
          <p className="text-xs text-muted-foreground">
            {loading ? "" : "Current year"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Monthly Growth
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">
            {loading ? <span className="animate-pulse">...</span> : `${metrics.monthlyGrowth.toFixed(1)}%`}
          </div>
          <p className="text-xs text-muted-foreground">
            {loading ? "" : "Compared to last month"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SchoolOwnerStatsCards;
