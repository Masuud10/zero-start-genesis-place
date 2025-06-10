
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ClassPerformanceItem {
  class: string;
  students: number;
  attendance: number;
  avgGrade: number;
  teacher: string;
}

interface ClassPerformanceSectionProps {
  classPerformance: ClassPerformanceItem[];
}

const ClassPerformanceSection: React.FC<ClassPerformanceSectionProps> = ({ classPerformance }) => {
  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>📚</span>
          <span>Class Performance Overview</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {classPerformance.map((cls, index) => (
            <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <div>
                  <p className="font-medium">{cls.class}</p>
                  <p className="text-sm text-muted-foreground">Teacher: {cls.teacher}</p>
                </div>
                <div className="text-sm text-muted-foreground">
                  {cls.students} students
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-sm font-medium">{cls.attendance}%</p>
                  <p className="text-xs text-muted-foreground">Attendance</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">{cls.avgGrade}%</p>
                  <p className="text-xs text-muted-foreground">Avg Grade</p>
                </div>
                <Badge variant={cls.avgGrade >= 80 ? 'default' : cls.avgGrade >= 70 ? 'secondary' : 'destructive'}>
                  {cls.avgGrade >= 80 ? 'Excellent' : cls.avgGrade >= 70 ? 'Good' : 'Needs Attention'}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ClassPerformanceSection;
