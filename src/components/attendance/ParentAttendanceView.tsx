
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

interface AttendanceRecord {
  id: string;
  date: string;
  status: AttendanceStatus;
  studentName: string;
  className: string;
}

const getStatusBadgeVariant = (status: AttendanceStatus) => {
  switch (status) {
    case 'present':
      return 'bg-green-100 text-green-800 hover:bg-green-200';
    case 'absent':
      return 'bg-red-100 text-red-800 hover:bg-red-200';
    case 'late':
      return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
    case 'excused':
      return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
  }
};

const ParentAttendanceView: React.FC = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAttendance = async () => {
      if (!user?.id) return;
      setLoading(true);
      setError(null);

      try {
        const { data: parentStudents, error: parentStudentsError } = await supabase
          .from('parent_students')
          .select('students!student_id(id, name, classes!class_id(name))')
          .eq('parent_id', user.id);
        
        if (parentStudentsError) throw parentStudentsError;
        
        const studentMap = new Map(parentStudents.map((ps: any) => {
            const student = ps.students;
            if (!student) return [null, {}];
            return [student.id, { name: student.name, className: student.classes?.name || 'N/A' }];
        }).filter(item => item[0]));

        const studentIds = Array.from(studentMap.keys());

        if (studentIds.length === 0) {
          setError("No children found for your account.");
          setRecords([]);
          setLoading(false);
          return;
        }

        const { data: attendanceData, error: attendanceError } = await supabase
          .from('attendance')
          .select('id, date, status, student_id')
          .in('student_id', studentIds)
          .order('date', { ascending: false })
          .limit(50);

        if (attendanceError) throw attendanceError;

        const formattedRecords = attendanceData.map((rec: any) => {
          const studentInfo = studentMap.get(rec.student_id);
          return {
            id: rec.id,
            date: new Date(rec.date).toLocaleDateString(),
            status: rec.status,
            studentName: studentInfo?.name || 'Unknown Student',
            className: studentInfo?.className || 'N/A',
          };
        });
        
        setRecords(formattedRecords as AttendanceRecord[]);
      } catch (err: any) {
        setError(`Failed to fetch attendance data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, [user]);

  if (loading) return <div>Loading attendance records...</div>;

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error Loading Attendance</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div>
      <h3 className="text-xl font-bold mb-4">Child Attendance Records</h3>
      {records.length === 0 ? (
        <p>No attendance records found for your child(ren).</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map(record => (
              <TableRow key={record.id}>
                <TableCell>{record.studentName}</TableCell>
                <TableCell>{record.className}</TableCell>
                <TableCell>{record.date}</TableCell>
                <TableCell>
                  <Badge className={getStatusBadgeVariant(record.status)}>
                    {record.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default ParentAttendanceView;
