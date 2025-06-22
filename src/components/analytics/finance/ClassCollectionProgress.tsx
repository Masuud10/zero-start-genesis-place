
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { GraduationCap } from 'lucide-react';

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
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-blue-600" />
          Class Collection Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((classData, index) => {
            const percentage = classData.expected > 0 ? (classData.collected / classData.expected) * 100 : 0;
            
            return (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{classData.class}</span>
                  <span className="text-sm text-gray-600">
                    {percentage.toFixed(1)}%
                  </span>
                </div>
                <Progress value={percentage} className="h-2" />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Collected: KES {classData.collected.toLocaleString()}</span>
                  <span>Expected: KES {classData.expected.toLocaleString()}</span>
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
