
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

interface Student {
  id: string;
  name: string;
  admissionNumber: string;
  rollNumber: string;
}

interface AttendanceEntry {
  studentId: string;
  status: 'present' | 'absent' | 'late';
  remarks?: string;
}

interface BulkAttendanceTableProps {
  students: Student[];
  date: string;
  sessionType: 'morning' | 'afternoon' | 'full-day';
  onSubmit: (entries: AttendanceEntry[]) => void;
  isSubmitting: boolean;
}

const BulkAttendanceTable: React.FC<BulkAttendanceTableProps> = ({
  students,
  date,
  sessionType,
  onSubmit,
  isSubmitting
}) => {
  const [attendance, setAttendance] = useState<Record<string, AttendanceEntry>>({});

  const handleStatusChange = (studentId: string, status: 'present' | 'absent' | 'late') => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: {
        studentId,
        status,
        remarks: prev[studentId]?.remarks || ''
      }
    }));
  };

  const handleSubmit = () => {
    const entries = students.map(student => 
      attendance[student.id] || {
        studentId: student.id,
        status: 'present' as const,
        remarks: ''
      }
    );
    onSubmit(entries);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'default';
      case 'absent': return 'destructive';
      case 'late': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance - {new Date(date).toLocaleDateString()}</CardTitle>
        <div className="text-sm text-muted-foreground">
          Session: {sessionType.replace('-', ' ').toUpperCase()}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-12 gap-4 font-medium text-sm border-b pb-2">
            <div className="col-span-1">Roll</div>
            <div className="col-span-4">Name</div>
            <div className="col-span-2">Admission</div>
            <div className="col-span-5">Status</div>
          </div>
          
          {students.map((student) => {
            const studentAttendance = attendance[student.id];
            
            return (
              <div key={student.id} className="grid grid-cols-12 gap-4 items-center py-2 border-b">
                <div className="col-span-1 text-sm">{student.rollNumber}</div>
                <div className="col-span-4 text-sm font-medium">{student.name}</div>
                <div className="col-span-2 text-sm">{student.admissionNumber}</div>
                <div className="col-span-5 flex gap-2">
                  <Button
                    size="sm"
                    variant={studentAttendance?.status === 'present' ? 'default' : 'outline'}
                    onClick={() => handleStatusChange(student.id, 'present')}
                  >
                    Present
                  </Button>
                  <Button
                    size="sm"
                    variant={studentAttendance?.status === 'absent' ? 'destructive' : 'outline'}
                    onClick={() => handleStatusChange(student.id, 'absent')}
                  >
                    Absent
                  </Button>
                  <Button
                    size="sm"
                    variant={studentAttendance?.status === 'late' ? 'secondary' : 'outline'}
                    onClick={() => handleStatusChange(student.id, 'late')}
                  >
                    Late
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="flex justify-end mt-6">
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Attendance'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BulkAttendanceTable;
