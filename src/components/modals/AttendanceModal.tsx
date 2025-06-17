
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSchool } from '@/contexts/SchoolContext';
import { useCurrentAcademicInfo } from '@/hooks/useCurrentAcademicInfo';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface AttendanceModalProps {
  onClose: () => void;
  userRole: string;
}

interface Student {
  id: string;
  name: string;
  admission_number: string;
}

interface AttendanceRecord {
  student_id: string;
  morning_status: 'present' | 'absent' | 'late' | 'excused';
  afternoon_status: 'present' | 'absent' | 'late' | 'excused';
  remarks: string;
}

const AttendanceModal: React.FC<AttendanceModalProps> = ({ onClose, userRole }) => {
  const { user } = useAuth();
  const { currentSchool } = useSchool();
  const { toast } = useToast();
  const { academicInfo } = useCurrentAcademicInfo(currentSchool?.id);

  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [attendance, setAttendance] = useState<Record<string, AttendanceRecord>>({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (currentSchool?.id) {
      fetchClasses();
    }
  }, [currentSchool?.id]);

  useEffect(() => {
    if (selectedClass) {
      fetchStudents();
      fetchExistingAttendance();
    }
  }, [selectedClass, selectedDate]);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('classes')
        .select('*')
        .eq('school_id', currentSchool?.id);

      // If user is a teacher, only show classes they teach
      if (userRole === 'teacher') {
        query = query.eq('teacher_id', user?.id);
      }

      const { data, error } = await query.order('name');
      
      if (error) throw error;
      setClasses(data || []);
    } catch (error: any) {
      console.error('Error fetching classes:', error);
      toast({
        title: "Error",
        description: "Failed to load classes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    if (!selectedClass) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('students')
        .select('id, name, admission_number')
        .eq('class_id', selectedClass)
        .eq('school_id', currentSchool?.id)
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      setStudents(data || []);

      // Initialize attendance records
      const initialAttendance: Record<string, AttendanceRecord> = {};
      (data || []).forEach(student => {
        initialAttendance[student.id] = {
          student_id: student.id,
          morning_status: 'present',
          afternoon_status: 'present',
          remarks: ''
        };
      });
      setAttendance(initialAttendance);
    } catch (error: any) {
      console.error('Error fetching students:', error);
      toast({
        title: "Error",
        description: "Failed to load students",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchExistingAttendance = async () => {
    if (!selectedClass || !selectedDate) return;

    try {
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('class_id', selectedClass)
        .eq('date', selectedDate)
        .eq('school_id', currentSchool?.id);

      if (error) throw error;

      if (data && data.length > 0) {
        const existingAttendance: Record<string, AttendanceRecord> = {};
        
        // Group by student and session
        const grouped = data.reduce((acc: any, record: any) => {
          if (!acc[record.student_id]) {
            acc[record.student_id] = {
              student_id: record.student_id,
              morning_status: 'present',
              afternoon_status: 'present',
              remarks: ''
            };
          }
          
          if (record.session === 'morning') {
            acc[record.student_id].morning_status = record.status;
          } else if (record.session === 'afternoon') {
            acc[record.student_id].afternoon_status = record.status;
          }
          
          if (record.remarks) {
            acc[record.student_id].remarks = record.remarks;
          }
          
          return acc;
        }, {});

        setAttendance(prev => ({ ...prev, ...grouped }));
      }
    } catch (error: any) {
      console.error('Error fetching existing attendance:', error);
    }
  };

  const handleAttendanceChange = (studentId: string, session: 'morning' | 'afternoon', status: string) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [`${session}_status`]: status as any
      }
    }));
  };

  const handleRemarksChange = (studentId: string, remarks: string) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks
      }
    }));
  };

  const handleSubmit = async () => {
    if (!selectedClass || !selectedDate || !academicInfo.term) {
      toast({
        title: "Missing Information",
        description: "Please ensure class, date, and academic term are selected",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      const attendanceRecords = [];
      
      // Create records for each student and session
      Object.values(attendance).forEach(record => {
        // Morning session
        attendanceRecords.push({
          school_id: currentSchool?.id,
          student_id: record.student_id,
          class_id: selectedClass,
          date: selectedDate,
          session: 'morning',
          status: record.morning_status,
          remarks: record.remarks || null,
          submitted_by: user?.id,
          submitted_at: new Date().toISOString(),
          term: academicInfo.term,
          academic_year: academicInfo.year || new Date().getFullYear().toString()
        });

        // Afternoon session
        attendanceRecords.push({
          school_id: currentSchool?.id,
          student_id: record.student_id,
          class_id: selectedClass,
          date: selectedDate,
          session: 'afternoon',
          status: record.afternoon_status,
          remarks: record.remarks || null,
          submitted_by: user?.id,
          submitted_at: new Date().toISOString(),
          term: academicInfo.term,
          academic_year: academicInfo.year || new Date().getFullYear().toString()
        });
      });

      // Use upsert to handle existing records
      const { error } = await supabase
        .from('attendance')
        .upsert(attendanceRecords, {
          onConflict: 'school_id,class_id,student_id,date,session'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Attendance saved successfully",
      });
      
      onClose();
    } catch (error: any) {
      console.error('Error saving attendance:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save attendance",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Record Attendance
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="class">Class</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Class" />
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
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                max={format(new Date(), 'yyyy-MM-dd')}
              />
            </div>

            <div>
              <Label>Academic Info</Label>
              <div className="text-sm text-muted-foreground p-2 border rounded">
                <div>Term: {academicInfo.term || 'Not Set'}</div>
                <div>Year: {academicInfo.year || 'Not Set'}</div>
              </div>
            </div>
          </div>

          {selectedClass && students.length > 0 && (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Admission No.</TableHead>
                    <TableHead>Morning</TableHead>
                    <TableHead>Afternoon</TableHead>
                    <TableHead>Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>{student.admission_number}</TableCell>
                      <TableCell>
                        <Select
                          value={attendance[student.id]?.morning_status || 'present'}
                          onValueChange={(value) => handleAttendanceChange(student.id, 'morning', value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="present">Present</SelectItem>
                            <SelectItem value="absent">Absent</SelectItem>
                            <SelectItem value="late">Late</SelectItem>
                            <SelectItem value="excused">Excused</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={attendance[student.id]?.afternoon_status || 'present'}
                          onValueChange={(value) => handleAttendanceChange(student.id, 'afternoon', value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="present">Present</SelectItem>
                            <SelectItem value="absent">Absent</SelectItem>
                            <SelectItem value="late">Late</SelectItem>
                            <SelectItem value="excused">Excused</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <input
                          type="text"
                          value={attendance[student.id]?.remarks || ''}
                          onChange={(e) => handleRemarksChange(student.id, e.target.value)}
                          placeholder="Optional remarks"
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {selectedClass && students.length === 0 && !loading && (
            <div className="text-center py-8 text-muted-foreground">
              No students found for the selected class.
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={submitting || !selectedClass || students.length === 0}
          >
            {submitting ? 'Saving...' : 'Save Attendance'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AttendanceModal;
