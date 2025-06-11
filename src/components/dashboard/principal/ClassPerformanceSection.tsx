
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface ClassPerformanceSectionProps {
  classPerformance: Array<{
    class: string;
    students: number;
    attendance: number;
    avgGrade: number;
    teacher: string;
  }>;
}

const ClassPerformanceSection: React.FC<ClassPerformanceSectionProps> = ({ classPerformance }) => {
  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>🎓</span>
          <span>Class Performance Overview</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {classPerformance.map((classData, index) => (
            <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-all duration-200">
              <div>
                <h3 className="font-medium">{classData.class}</h3>
                <p className="text-sm text-muted-foreground">Teacher: {classData.teacher}</p>
                <p className="text-xs text-muted-foreground">{classData.students} students</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <Progress value={classData.attendance} className="w-16 h-2 mb-1" />
                  <p className="text-xs text-muted-foreground">{classData.attendance}% attendance</p>
                </div>
                <div className="text-center">
                  <Badge variant={classData.avgGrade >= 80 ? 'default' : classData.avgGrade >= 70 ? 'secondary' : 'destructive'}>
                    {classData.avgGrade}% avg
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ClassPerformanceSection;
