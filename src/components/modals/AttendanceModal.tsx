
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { UserRole } from '@/types';

interface AttendanceModalProps {
  onClose: () => void;
  userRole?: UserRole;
}

const AttendanceModal = ({ onClose, userRole }: AttendanceModalProps) => {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState<Record<number, { morning: boolean; afternoon: boolean }>>({});

  const mockStudents = [
    { id: 1, name: 'John Doe', admNo: 'ADM001' },
    { id: 2, name: 'Jane Smith', admNo: 'ADM002' },
    { id: 3, name: 'Mike Johnson', admNo: 'ADM003' },
    { id: 4, name: 'Sarah Wilson', admNo: 'ADM004' },
    { id: 5, name: 'Emma Brown', admNo: 'ADM005' },
  ];

  const mockChildAttendance = [
    { date: '2024-01-15', morning: true, afternoon: true, status: 'Present' },
    { date: '2024-01-16', morning: true, afternoon: false, status: 'Half Day' },
    { date: '2024-01-17', morning: false, afternoon: false, status: 'Absent' },
    { date: '2024-01-18', morning: true, afternoon: true, status: 'Present' },
    { date: '2024-01-19', morning: true, afternoon: true, status: 'Present' },
  ];

  const handleAttendanceChange = (studentId: number, session: 'morning' | 'afternoon', checked: boolean) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [session]: checked
      }
    }));
  };

  const handleSubmitAttendance = () => {
    console.log('Attendance submitted for:', selectedClass, selectedDate, attendance);
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {userRole === 'parent' ? "Child's Attendance" : 'Mark Attendance'}
          </DialogTitle>
          <DialogDescription>
            {userRole === 'parent' 
              ? "View your child's attendance record and daily presence"
              : "Record daily attendance for your class students"
            }
          </DialogDescription>
        </DialogHeader>

        {userRole === 'parent' ? (
          <div className="space-y-4">
            <div className="grid gap-4">
              <h3 className="text-lg font-semibold">Recent Attendance Record</h3>
              {mockChildAttendance.map((record, index) => (
                <Card key={index} className="border border-border">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-medium">{new Date(record.date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant={record.morning ? "default" : "destructive"} className="text-xs">
                            Morning: {record.morning ? 'Present' : 'Absent'}
                          </Badge>
                          <Badge variant={record.afternoon ? "default" : "destructive"} className="text-xs">
                            Afternoon: {record.afternoon ? 'Present' : 'Absent'}
                          </Badge>
                        </div>
                      </div>
                      <Badge 
                        variant={record.status === 'Present' ? 'default' : record.status === 'Half Day' ? 'secondary' : 'destructive'}
                        className="w-fit"
                      >
                        {record.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Selection Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Class</label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grade-1a">Grade 1A</SelectItem>
                    <SelectItem value="grade-1b">Grade 1B</SelectItem>
                    <SelectItem value="grade-2a">Grade 2A</SelectItem>
                    <SelectItem value="grade-3a">Grade 3A</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Date</label>
                <input 
                  type="date" 
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Attendance Grid */}
            {selectedClass && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Mark Attendance for {selectedClass}</h3>
                <div className="space-y-2">
                  {mockStudents.map((student) => (
                    <Card key={student.id} className="border border-border">
                      <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex-1">
                            <p className="font-medium">{student.name}</p>
                            <p className="text-sm text-muted-foreground">Adm No: {student.admNo}</p>
                          </div>
                          <div className="flex gap-6">
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                id={`morning-${student.id}`}
                                checked={attendance[student.id]?.morning || false}
                                onCheckedChange={(checked) => 
                                  handleAttendanceChange(student.id, 'morning', checked as boolean)
                                }
                              />
                              <label 
                                htmlFor={`morning-${student.id}`} 
                                className="text-sm font-medium cursor-pointer"
                              >
                                Morning
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                id={`afternoon-${student.id}`}
                                checked={attendance[student.id]?.afternoon || false}
                                onCheckedChange={(checked) => 
                                  handleAttendanceChange(student.id, 'afternoon', checked as boolean)
                                }
                              />
                              <label 
                                htmlFor={`afternoon-${student.id}`} 
                                className="text-sm font-medium cursor-pointer"
                              >
                                Afternoon
                              </label>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button 
                onClick={handleSubmitAttendance}
                disabled={!selectedClass}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Submit Attendance
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AttendanceModal;
