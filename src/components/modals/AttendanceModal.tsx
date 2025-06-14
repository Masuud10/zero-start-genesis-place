
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { CalendarCheck, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface AttendanceModalProps {
  onClose: () => void;
  userRole: string;
}

interface Student {
  id: string;
  name: string;
  admission_number: string;
  status: string;
  remarks: string;
}

const AttendanceModal: React.FC<AttendanceModalProps> = ({ onClose, userRole }) => {
  const { user } = useAuth();
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [session, setSession] = useState('morning');
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadClasses = async () => {
      if (!user?.school_id) return;
      
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('school_id', user.school_id);
      
      if (!error && data) {
        setClasses(data);
      }
    };

    loadClasses();
  }, [user?.school_id]);

  useEffect(() => {
    const loadStudents = async () => {
      if (!selectedClass || !user?.school_id) return;
      
      try {
        // Fetch students for the selected class
        const { data: studentsData, error: studentsError } = await supabase
          .from('students')
          .select('id, name, admission_number')
          .eq('class_id', selectedClass)
          .eq('school_id', user.school_id)
          .eq('is_active', true);

        if (studentsError) {
          throw studentsError;
        }

        // Check if attendance already exists for this date
        const { data: attendanceData, error: attendanceError } = await supabase
          .from('attendance')
          .select('student_id, status, remarks')
          .eq('class_id', selectedClass)
          .eq('date', selectedDate)
          .eq('session', session);

        if (attendanceError) {
          throw attendanceError;
        }

        // Create attendance map for existing records
        const attendanceMap = new Map();
        attendanceData?.forEach(record => {
          attendanceMap.set(record.student_id, {
            status: record.status,
            remarks: record.remarks
          });
        });

        // Transform students data with existing attendance
        const transformedStudents: Student[] = (studentsData || []).map(student => ({
          id: student.id,
          name: student.name,
          admission_number: student.admission_number,
          status: attendanceMap.get(student.id)?.status || 'present',
          remarks: attendanceMap.get(student.id)?.remarks || ''
        }));

        setStudents(transformedStudents);
      } catch (error) {
        console.error('Error loading students:', error);
        toast({
          title: "Error",
          description: "Failed to load students.",
          variant: "destructive"
        });
      }
    };

    loadStudents();
  }, [selectedClass, selectedDate, session, user?.school_id]);

  const handleStatusChange = (id: string, newStatus: string) => {
    setStudents(prev => prev.map(student => 
      student.id === id ? { ...student, status: newStatus } : student
    ));
  };

  const handleRemarksChange = (id: string, remarks: string) => {
    setStudents(prev => prev.map(student => 
      student.id === id ? { ...student, remarks } : student
    ));
  };

  const handleSaveAttendance = async () => {
    if (!selectedClass || !user) {
      toast({
        title: "Error",
        description: "Please select a class.",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);

      // Prepare attendance records
      const attendanceRecords = students.map(student => ({
        student_id: student.id,
        class_id: selectedClass,
        date: selectedDate,
        session: session,
        status: student.status,
        remarks: student.remarks || null,
        submitted_by: user.id,
        school_id: user.school_id,
        term: 'term1', // You might want to make this dynamic
        academic_year: new Date().getFullYear().toString()
      }));

      // Delete existing attendance for this date/session/class
      await supabase
        .from('attendance')
        .delete()
        .eq('class_id', selectedClass)
        .eq('date', selectedDate)
        .eq('session', session);

      // Insert new attendance records
      const { error } = await supabase
        .from('attendance')
        .insert(attendanceRecords);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Attendance has been successfully recorded.",
      });
    } catch (error) {
      console.error('Error saving attendance:', error);
      toast({
        title: "Error",
        description: "Failed to save attendance. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllPresent = () => {
    setStudents(prev => prev.map(student => ({ ...student, status: 'present', remarks: '' })));
    toast({
      title: "All Marked Present",
      description: "All students have been marked as present.",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'default';
      case 'absent': return 'destructive';
      case 'late': return 'secondary';
      default: return 'outline';
    }
  };

  const canEdit = ['teacher', 'principal', 'school_owner'].includes(userRole);
  const presentCount = students.filter(s => s.status === 'present').length;
  const absentCount = students.filter(s => s.status === 'absent').length;
  const lateCount = students.filter(s => s.status === 'late').length;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Attendance Management</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {canEdit && (
            <Card>
              <CardHeader>
                <CardTitle>Attendance Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="class">Class</Label>
                    <Select value={selectedClass} onValueChange={setSelectedClass}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id}>
                            {cls.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="session">Session</Label>
                    <Select value={session} onValueChange={setSession}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="morning">Morning</SelectItem>
                        <SelectItem value="afternoon">Afternoon</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleMarkAllPresent} variant="outline" disabled={!selectedClass}>
                    <CalendarCheck className="w-4 h-4 mr-2" />
                    Mark All Present
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {selectedClass && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Attendance Summary</span>
                  <div className="flex gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Present: {presentCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      Absent: {absentCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      Late: {lateCount}
                    </span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {students.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No students found for the selected class.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {students.map((student) => (
                      <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="font-medium">{student.name}</p>
                            <p className="text-sm text-muted-foreground">{student.admission_number}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Label>Status:</Label>
                            {canEdit ? (
                              <Select 
                                value={student.status} 
                                onValueChange={(value) => handleStatusChange(student.id, value)}
                              >
                                <SelectTrigger className="w-28">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="present">Present</SelectItem>
                                  <SelectItem value="absent">Absent</SelectItem>
                                  <SelectItem value="late">Late</SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              <Badge variant={getStatusColor(student.status) as any}>
                                {student.status}
                              </Badge>
                            )}
                          </div>
                          {canEdit && (
                            <div className="flex items-center gap-2">
                              <Label>Remarks:</Label>
                              <Textarea
                                value={student.remarks}
                                onChange={(e) => handleRemarksChange(student.id, e.target.value)}
                                placeholder="Optional remarks"
                                className="w-32 h-8 resize-none"
                              />
                            </div>
                          )}
                          {!canEdit && student.remarks && (
                            <div className="text-sm text-muted-foreground">
                              {student.remarks}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>Close</Button>
            {canEdit && selectedClass && (
              <Button onClick={handleSaveAttendance} disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Saving...' : 'Save Attendance'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AttendanceModal;
