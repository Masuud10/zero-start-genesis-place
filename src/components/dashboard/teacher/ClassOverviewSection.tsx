
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ClassItem {
  title: string;
  students: number;
  attendance: number;
  avgGrade: number;
  pendingGrades: number;
  nextClass: string;
}

interface ClassOverviewSectionProps {
  classes: ClassItem[];
}

const ClassOverviewSection: React.FC<ClassOverviewSectionProps> = ({ classes }) => {
  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>📚</span>
          <span>My Classes</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {classes.map((cls, index) => (
            <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-medium">{cls.title}</h3>
                  <p className="text-sm text-muted-foreground">Next class: {cls.nextClass}</p>
                </div>
                {cls.pendingGrades > 0 && (
                  <Badge variant="destructive">
                    {cls.pendingGrades} pending grades
                  </Badge>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Students</p>
                  <p className="font-medium">{cls.students}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Attendance</p>
                  <p className="font-medium text-green-600">{cls.attendance}%</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Class Average</p>
                  <p className="font-medium text-blue-600">{cls.avgGrade}%</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge variant={cls.pendingGrades === 0 ? 'default' : 'secondary'}>
                    {cls.pendingGrades === 0 ? 'Up to date' : 'Pending work'}
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

export default ClassOverviewSection;
