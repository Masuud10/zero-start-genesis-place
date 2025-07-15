
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
        console.log('📚 Parent Attendance: Starting fetch for parent:', user.id);
        
        // Step 1: Get student IDs for the parent with enhanced validation
        const { data: parentStudentLinks, error: parentStudentsError } = await supabase
          .from('parent_students')
          .select('student_id')
          .eq('parent_id', user.id)
          .limit(50); // Add reasonable limit for performance
        
        if (parentStudentsError) {
          console.error('📚 Parent students query error:', parentStudentsError);
          throw new Error(`Could not fetch your children information: ${parentStudentsError.message}`);
        }

        if (!parentStudentLinks || parentStudentLinks.length === 0) {
          setError("No children found for your account.");
          setRecords([]);
          setLoading(false);
          return;
        }
        
        const studentIds = parentStudentLinks.map(ps => ps.student_id);

        // Step 2: Get student info and their active class with enhanced security validation
        const { data: studentDetails, error: studentDetailsError } = await supabase
          .from('students')
          .select(`
            id, 
            name, 
            class_id,
            classes!students_class_id_fkey(name)
          `)
          .in('id', studentIds);
        
        if (studentDetailsError) {
          console.error('📚 Student details query error:', studentDetailsError);
          throw new Error(`Could not fetch student information: ${studentDetailsError.message}`);
        }

        // Create student map with enhanced error handling
        const studentMap = new Map<string, { name: string; className: string }>();
        
        (studentDetails || []).forEach((student) => {
          if (student && student.id) {
            // Enhanced validation and fallback
            const className = student.classes?.name || 'Unknown Class';
            studentMap.set(student.id, { 
              name: student.name || 'Unknown Student', 
              className 
            });
          }
        });

        // Step 3: Fetch attendance for these students with date filtering
        const { data: attendanceData, error: attendanceError } = await supabase
          .from('attendance')
          .select('id, date, status, student_id')
          .in('student_id', studentIds)
          .gte('date', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]) // Last 3 months only
          .order('date', { ascending: false })
          .limit(100); // Reasonable limit

        if (attendanceError) {
          console.error('📚 Attendance query error:', attendanceError);
          throw new Error(`Could not fetch attendance data: ${attendanceError.message}`);
        }

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
        console.log('📚 Successfully loaded attendance for', formattedRecords.length, 'records');
      } catch (err: unknown) {
        console.error('📚 Error fetching attendance:', err);
        const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred while fetching attendance data';
        setError(errorMessage);
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
