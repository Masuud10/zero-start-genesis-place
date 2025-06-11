
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ChildData {
  name: string;
  class: string;
  avgGrade: number;
  attendance: number;
  recentGrade: string;
  nextFee: string;
  dueDate: string;
}

interface ChildrenOverviewSectionProps {
  children: ChildData[];
}

const ChildrenOverviewSection: React.FC<ChildrenOverviewSectionProps> = ({ children }) => {
  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>👦</span>
          <span>My Children</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {children.map((child, index) => (
            <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-medium">{child.name}</h3>
                  <p className="text-sm text-muted-foreground">{child.class}</p>
                </div>
                <Badge variant={child.avgGrade >= 80 ? 'default' : child.avgGrade >= 70 ? 'secondary' : 'destructive'}>
                  {child.avgGrade >= 80 ? 'Excellent' : child.avgGrade >= 70 ? 'Good' : 'Needs Attention'}
                </Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Average Grade</p>
                  <p className="font-medium text-blue-600">{child.avgGrade}%</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Attendance</p>
                  <p className="font-medium text-green-600">{child.attendance}%</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Recent Grade</p>
                  <p className="font-medium">{child.recentGrade}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Next Fee</p>
                  <p className="font-medium text-orange-600">{child.nextFee}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ChildrenOverviewSection;
