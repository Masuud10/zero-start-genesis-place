import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useClassAnalytics } from '@/hooks/useSchoolAnalytics';
import { Loader2, Users, GraduationCap, TrendingUp } from 'lucide-react';

interface ClassPerformanceCardProps {
  schoolId: string;
}

const ClassPerformanceCard: React.FC<ClassPerformanceCardProps> = ({ schoolId }) => {
  const { data: classAnalytics, isLoading, error } = useClassAnalytics(schoolId);

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Class Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Class Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">Failed to load class performance data</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5" />
          Class Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {classAnalytics && classAnalytics.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Class</th>
                    <th className="text-center py-2">
                      <div className="flex items-center justify-center gap-1">
                        <Users className="h-4 w-4" />
                        Students
                      </div>
                    </th>
                    <th className="text-center py-2">
                      <div className="flex items-center justify-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        Avg Grade
                      </div>
                    </th>
                    <th className="text-center py-2">Attendance</th>
                  </tr>
                </thead>
                <tbody>
                  {classAnalytics.map((cls) => (
                    <tr key={cls.class_id} className="border-b">
                      <td className="py-2 font-medium">{cls.class_name}</td>
                      <td className="text-center py-2">{cls.student_count}</td>
                      <td className="text-center py-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          cls.average_grade >= 80 
                            ? 'bg-green-100 text-green-800' 
                            : cls.average_grade >= 60 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {cls.average_grade.toFixed(1)}%
                        </span>
                      </td>
                      <td className="text-center py-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          cls.attendance_rate >= 90 
                            ? 'bg-green-100 text-green-800' 
                            : cls.attendance_rate >= 75 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {cls.attendance_rate.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">No class data available</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ClassPerformanceCard;