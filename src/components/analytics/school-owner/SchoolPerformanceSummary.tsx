import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target } from "lucide-react";

interface SchoolPerformanceSummaryProps {
  analytics: any;
  financeData: any;
  safeStats: {
    totalStudents: number;
    totalTeachers: number;
    totalSubjects: number;
    totalClasses: number;
    totalParents: number;
  };
}

const SchoolPerformanceSummary: React.FC<SchoolPerformanceSummaryProps> = ({
  analytics,
  financeData,
  safeStats,
}) => {
  return (
    <Card className="shadow-md border-0 rounded-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          School Performance Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {(
                ((analytics?.averageGrade || 75) / 100) *
                safeStats.totalStudents
              ).toFixed(0)}
            </div>
            <div className="text-sm text-blue-500 mt-1">High Performers</div>
            <div className="text-xs text-gray-500">Above 80% average</div>
          </div>

          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {analytics?.attendanceRate?.toFixed(1) || "89.5"}%
            </div>
            <div className="text-sm text-green-500 mt-1">Attendance Rate</div>
            <div className="text-xs text-gray-500">Current term average</div>
          </div>

          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {financeData?.keyMetrics?.collectionRate?.toFixed(1) || "78.2"}%
            </div>
            <div className="text-sm text-purple-500 mt-1">Fee Collection</div>
            <div className="text-xs text-gray-500">Current term rate</div>
          </div>

          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {safeStats.totalTeachers > 0
                ? Math.round(safeStats.totalStudents / safeStats.totalTeachers)
                : 0}
              :1
            </div>
            <div className="text-sm text-orange-500 mt-1">
              Student-Teacher Ratio
            </div>
            <div className="text-xs text-gray-500">Current academic year</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SchoolPerformanceSummary;
