
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface ClassCollectionProgressProps {
  data: {
    class: string;
    collected: number;
    expected: number;
  }[];
}

const ClassCollectionProgress: React.FC<ClassCollectionProgressProps> = ({ data }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Class-wise Collection Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((classData) => {
            const percentage = classData.expected > 0 ? (classData.collected / classData.expected) * 100 : 0;
            return (
              <div key={classData.class} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{classData.class}</p>
                  <p className="text-sm text-muted-foreground">
                    KES {classData.collected.toLocaleString()} / {classData.expected.toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-32">
                    <Progress value={percentage} className="h-2" />
                  </div>
                  <Badge variant={percentage >= 90 ? 'default' : percentage >= 75 ? 'secondary' : 'destructive'}>
                    {percentage.toFixed(1)}%
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ClassCollectionProgress;
