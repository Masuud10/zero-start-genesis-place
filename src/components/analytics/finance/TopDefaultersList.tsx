
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';

interface TopDefaultersListProps {
  data: {
    student_name: string;
    admission_number: string;
    outstanding_amount: number;
    class_name: string;
    days_overdue: number;
  }[];
}

const TopDefaultersList: React.FC<TopDefaultersListProps> = ({ data }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          Top Defaulters
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.slice(0, 10).map((student, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex-1">
                <div className="font-medium">{student.student_name}</div>
                <div className="text-sm text-gray-500">
                  {student.admission_number} • {student.class_name}
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-red-600">
                  KES {student.outstanding_amount.toLocaleString()}
                </div>
                <Badge variant="destructive" className="text-xs">
                  {student.days_overdue} days overdue
                </Badge>
              </div>
            </div>
          ))}
          {data.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No defaulters found</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TopDefaultersList;
