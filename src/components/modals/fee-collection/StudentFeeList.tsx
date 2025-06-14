
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';

interface FeeStudent {
  id: string;
  name: string;
  admissionNo: string;
  class: string;
  totalFees: number;
  paidAmount: number;
  balance: number;
  lastPayment: string;
}

interface StudentFeeListProps {
  students: FeeStudent[];
  onRecordPayment: (student: FeeStudent) => void;
}

const StudentFeeList: React.FC<StudentFeeListProps> = ({
  students,
  onRecordPayment
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Students Fee Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {students.map((student) => (
            <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <div>
                  <p className="font-medium">{student.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {student.admissionNo} • {student.class}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm">
                    Paid: <span className="font-medium">KES {student.paidAmount.toLocaleString()}</span>
                  </p>
                  <p className="text-sm">
                    Balance: <span className={`font-medium ${student.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      KES {student.balance.toLocaleString()}
                    </span>
                  </p>
                </div>
                <Badge variant={student.balance === 0 ? 'default' : 'destructive'}>
                  {student.balance === 0 ? 'Paid' : 'Pending'}
                </Badge>
                {student.balance > 0 && (
                  <Button 
                    size="sm" 
                    onClick={() => onRecordPayment(student)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Record Payment
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentFeeList;
