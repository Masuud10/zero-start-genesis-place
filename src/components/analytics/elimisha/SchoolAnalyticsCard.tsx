
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface SchoolAnalyticsCardProps {
  school: {
    id: string;
    name: string;
    totalStudents: number;
    averageGrade: number;
    attendanceRate: number;
    presentStudents: number;
    absentStudents: number;
    totalSubjects: number;
    passRate: number;
    totalClasses: number;
  };
}

const SchoolAnalyticsCard: React.FC<SchoolAnalyticsCardProps> = ({ school }) => {
  const getPerformanceColor = (value: number, type: 'grade' | 'attendance' | 'pass') => {
    const thresholds = {
      grade: { good: 80, fair: 70 },
      attendance: { good: 90, fair: 80 },
      pass: { good: 85, fair: 75 }
    };
    
    const threshold = thresholds[type];
    if (value >= threshold.good) return 'text-green-600';
    if (value >= threshold.fair) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceTrend = (value: number, type: 'grade' | 'attendance' | 'pass') => {
    const thresholds = {
      grade: { good: 80, fair: 70 },
      attendance: { good: 90, fair: 80 },
      pass: { good: 85, fair: 75 }
    };
    
    const threshold = thresholds[type];
    if (value >= threshold.good) return <TrendingUp className="h-3 w-3 text-green-500" />;
    if (value >= threshold.fair) return <Minus className="h-3 w-3 text-yellow-500" />;
    return <TrendingDown className="h-3 w-3 text-red-500" />;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold">{school.name}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              ID: {school.id.substring(0, 8)}...
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              {school.totalStudents} students
            </Badge>
            <Badge variant="outline" className="text-xs">
              {school.totalClasses} classes
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className={`text-xl font-bold flex items-center justify-center gap-1 ${getPerformanceColor(school.averageGrade, 'grade')}`}>
              {school.averageGrade.toFixed(1)}%
              {getPerformanceTrend(school.averageGrade, 'grade')}
            </div>
            <p className="text-xs text-muted-foreground">Avg Grade</p>
          </div>
          
          <div className="text-center">
            <div className={`text-xl font-bold flex items-center justify-center gap-1 ${getPerformanceColor(school.attendanceRate, 'attendance')}`}>
              {school.attendanceRate.toFixed(1)}%
              {getPerformanceTrend(school.attendanceRate, 'attendance')}
            </div>
            <p className="text-xs text-muted-foreground">Attendance</p>
          </div>
          
          <div className="text-center">
            <div className={`text-xl font-bold flex items-center justify-center gap-1 ${getPerformanceColor(school.passRate, 'pass')}`}>
              {school.passRate.toFixed(1)}%
              {getPerformanceTrend(school.passRate, 'pass')}
            </div>
            <p className="text-xs text-muted-foreground">Pass Rate</p>
          </div>
          
          <div className="text-center">
            <div className="text-xl font-bold text-blue-600 flex items-center justify-center gap-1">
              <Users className="h-4 w-4" />
              {school.presentStudents}
            </div>
            <p className="text-xs text-muted-foreground">Present Today</p>
          </div>
        </div>

        {/* Performance indicators */}
        <div className="mt-4 pt-3 border-t">
          <div className="flex flex-wrap gap-2 text-xs">
            {school.averageGrade >= 80 && (
              <Badge variant="secondary" className="text-green-700 bg-green-50">
                High Performance
              </Badge>
            )}
            {school.attendanceRate >= 95 && (
              <Badge variant="secondary" className="text-blue-700 bg-blue-50">
                Excellent Attendance
              </Badge>
            )}
            {school.passRate >= 90 && (
              <Badge variant="secondary" className="text-purple-700 bg-purple-50">
                High Pass Rate
              </Badge>
            )}
            {school.averageGrade < 70 && (
              <Badge variant="secondary" className="text-red-700 bg-red-50">
                Needs Attention
              </Badge>
            )}
            {school.totalSubjects > 10 && (
              <Badge variant="secondary" className="text-indigo-700 bg-indigo-50">
                Diverse Curriculum
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SchoolAnalyticsCard;
