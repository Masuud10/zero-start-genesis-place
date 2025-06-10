
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/components/ui/use-toast';

interface AttendanceModalProps {
  onClose: () => void;
  userRole: string;
}

const AttendanceModal: React.FC<AttendanceModalProps> = ({ onClose, userRole }) => {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});

  const mockClasses = ['Grade 1A', 'Grade 1B', 'Grade 2A', 'Grade 2B'];
  const mockStudents = [
    { id: '1', name: 'John Doe', status: 'present' },
    { id: '2', name: 'Jane Smith', status: 'present' },
    { id: '3', name: 'Mike Johnson', status: 'absent' },
    { id: '4', name: 'Sarah Wilson', status: 'present' },
    { id: '5', name: 'David Brown', status: 'late' },
  ];

  const mockAttendanceRecords = [
    { date: '2024-01-15', present: 23, absent: 2, late: 1 },
    { date: '2024-01-16', present: 24, absent: 1, late: 1 },
    { date: '2024-01-17', present: 25, absent: 1, late: 0 },
  ];

  const handleAttendanceChange = (studentId: string, isPresent: boolean) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: isPresent
    }));
  };

  const handleSubmitAttendance = () => {
    if (!selectedClass) {
      toast({
        title: "Error",
        description: "Please select a class",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Success",
      description: "Attendance marked successfully",
    });
    
    onClose();
  };

  const isTeacher = userRole === 'teacher';
  const isParent = userRole === 'parent';

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isTeacher ? 'Mark Attendance' : isParent ? 'View Child Attendance' : 'Attendance Management'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {isTeacher && (
            <Card>
              <CardHeader>
                <CardTitle>Mark Today's Attendance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="class">Class</Label>
                    <Select value={selectedClass} onValueChange={setSelectedClass}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockClasses.map(cls => (
                          <SelectItem key={cls} value={cls}>{cls}</SelectItem>
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
                      className="w-full px-3 py-2 border border-input rounded-md"
                    />
                  </div>
                </div>

                {selectedClass && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Students</h4>
                    {mockStudents.map(student => (
                      <div key={student.id} className="flex items-center justify-between p-2 border rounded">
                        <span>{student.name}</span>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`present-${student.id}`}
                            checked={attendance[student.id] !== false}
                            onCheckedChange={(checked) => handleAttendanceChange(student.id, checked as boolean)}
                          />
                          <Label htmlFor={`present-${student.id}`}>Present</Label>
                        </div>
                      </div>
                    ))}
                    <Button onClick={handleSubmitAttendance} className="w-full mt-4">
                      Submit Attendance
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Attendance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {mockAttendanceRecords.map((record, index) => (
                  <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{record.date}</p>
                    </div>
                    <div className="flex space-x-4 text-sm">
                      <span className="text-green-600">Present: {record.present}</span>
                      <span className="text-red-600">Absent: {record.absent}</span>
                      <span className="text-orange-600">Late: {record.late}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AttendanceModal;
