
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { CalendarCheck, Users, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AttendanceModalProps {
  onClose: () => void;
  userRole: string;
}

const AttendanceModal: React.FC<AttendanceModalProps> = ({ onClose, userRole }) => {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [session, setSession] = useState('morning');
  const [students, setStudents] = useState([
    { id: 1, name: 'John Doe', admissionNo: 'STU001', status: 'present', remarks: '' },
    { id: 2, name: 'Jane Smith', admissionNo: 'STU002', status: 'present', remarks: '' },
    { id: 3, name: 'Mike Johnson', admissionNo: 'STU003', status: 'absent', remarks: 'Sick' },
    { id: 4, name: 'Sarah Wilson', admissionNo: 'STU004', status: 'late', remarks: 'Traffic' },
  ]);
  const { toast } = useToast();

  const handleStatusChange = (id: number, newStatus: string) => {
    setStudents(prev => prev.map(student => 
      student.id === id ? { ...student, status: newStatus } : student
    ));
  };

  const handleRemarksChange = (id: number, remarks: string) => {
    setStudents(prev => prev.map(student => 
      student.id === id ? { ...student, remarks } : student
    ));
  };

  const handleSaveAttendance = () => {
    toast({
      title: "Attendance Saved",
      description: "Student attendance has been successfully recorded.",
    });
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
                        <SelectItem value="grade8a">Grade 8A</SelectItem>
                        <SelectItem value="grade8b">Grade 8B</SelectItem>
                        <SelectItem value="grade7a">Grade 7A</SelectItem>
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
                  <Button onClick={handleMarkAllPresent} variant="outline">
                    <CalendarCheck className="w-4 h-4 mr-2" />
                    Mark All Present
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

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
              <div className="space-y-4">
                {students.map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-muted-foreground">{student.admissionNo}</p>
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
                          <Badge variant={getStatusColor(student.status)}>
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
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>Close</Button>
            {canEdit && (
              <Button onClick={handleSaveAttendance}>
                <Save className="w-4 h-4 mr-2" />
                Save Attendance
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AttendanceModal;
