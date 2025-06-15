
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

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
        // Step 1: Get student IDs for the parent
        const { data: parentStudentLinks, error: parentStudentsError } = await supabase
          .from('parent_students')
          .select('student_id')
          .eq('parent_id', user.id);
        
        if (parentStudentsError) throw parentStudentsError;

        if (!parentStudentLinks || parentStudentLinks.length === 0) {
          setError("No children found for your account.");
          setRecords([]);
          setLoading(false);
          return;
        }
        
        const studentIds = parentStudentLinks.map(ps => ps.student_id);

        // Step 2: Get student info and their active class
        const { data: studentDetails, error: studentDetailsError } = await supabase
          .from('students')
          .select('id, name, student_classes(is_active, classes(name))')
          .in('id', studentIds);
        
        if (studentDetailsError) throw studentDetailsError;

        const studentMap = (studentDetails || []).reduce((acc, student) => {
            const s = student as { id: string; name: string; student_classes: { is_active: boolean; classes: { name: string } | null }[] };
            if (s && s.id) {
                const activeEnrollment = s.student_classes.find(sc => sc.is_active);
                const className = activeEnrollment?.classes?.name || 'N/A';
                acc.set(s.id, { name: s.name, className: className });
            }
            return acc;
        }, new Map<string, { name: string; className: string }>());

        // Step 3: Fetch attendance for these students
        const { data: attendanceData, error: attendanceError } = await supabase
          .from('attendance')
          .select('id, date, status, student_id')
          .in('student_id', studentIds)
          .order('date', { ascending: false })
          .limit(50);

        if (attendanceError) throw attendanceError;

        if (!attendanceData) {
          setRecords([]);
          setLoading(false);
          return;
        }

        const formattedRecords: AttendanceRecord[] = attendanceData.map((rec) => {
          const studentInfo = studentMap.get(rec.student_id);
          return {
            id: rec.id,
            date: new Date(rec.date).toLocaleDateString(),
            status: rec.status as AttendanceStatus,
            studentName: studentInfo?.name || 'Unknown Student',
            className: studentInfo?.className || 'N/A',
          };
        });
        
        setRecords(formattedRecords);
      } catch (err: any) {
        setError(`Failed to fetch attendance data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, [user]);

  const recordsByStudent = records.reduce((acc, record) => {
    const { studentName } = record;
    if (!acc[studentName]) {
      acc[studentName] = [];
    }
    acc[studentName].push(record);
    return acc;
  }, {} as Record<string, AttendanceRecord[]>);

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
    <div className="space-y-6">
      <h3 className="text-2xl font-bold mb-2">Child Attendance Records</h3>
      {records.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p>No attendance records found for your child(ren).</p>
          </CardContent>
        </Card>
      ) : (
        Object.entries(recordsByStudent).map(([studentName, studentRecords]) => (
          <Card key={studentName}>
            <CardHeader>
              <CardTitle>{studentName}</CardTitle>
              {studentRecords[0]?.className && studentRecords[0].className !== 'N/A' && (
                  <CardDescription>Class: {studentRecords[0].className}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentRecords.map(record => (
                    <TableRow key={record.id}>
                      <TableCell>{record.date}</TableCell>
                      <TableCell className="text-right">
                        <Badge className={`${getStatusBadgeVariant(record.status)} transition-colors`}>
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default ParentAttendanceView;
