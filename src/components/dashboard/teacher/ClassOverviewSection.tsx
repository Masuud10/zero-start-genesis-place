
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, TrendingUp, Clock, FileText } from 'lucide-react';

interface ClassData {
  title: string;
  students: number;
  attendance: number;
  avgGrade: number;
  pendingGrades: number;
  nextClass: string;
}

interface ClassOverviewSectionProps {
  classes: ClassData[];
}

const ClassOverviewSection = ({ classes }: ClassOverviewSectionProps) => {
  const getGradeColor = (grade: number) => {
    if (grade >= 80) return "text-green-600";
    if (grade >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getAttendanceColor = (attendance: number) => {
    if (attendance >= 90) return "bg-green-500";
    if (attendance >= 80) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Class Overview
        </CardTitle>
        <CardDescription>
          Monitor your classes' performance and upcoming sessions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((classData, index) => (
            <Card key={index} className="border border-gray-200">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-lg">{classData.title}</h4>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="h-4 w-4" />
                      <span>{classData.students} students</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Attendance</span>
                      <span className="text-sm">{classData.attendance}%</span>
                    </div>
                    <Progress 
                      value={classData.attendance} 
                      className={`h-2 ${getAttendanceColor(classData.attendance)}`}
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">Avg Grade</span>
                    </div>
                    <span className={`text-sm font-bold ${getGradeColor(classData.avgGrade)}`}>
                      {classData.avgGrade}%
                    </span>
                  </div>

                  {classData.pendingGrades > 0 && (
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-orange-500" />
                      <span className="text-sm text-orange-600">
                        {classData.pendingGrades} pending grades
                      </span>
                      <Badge variant="outline" className="text-xs">
                        Action needed
                      </Badge>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-2 border-t">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      Next: {classData.nextClass}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ClassOverviewSection;
