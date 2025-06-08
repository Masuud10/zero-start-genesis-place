
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserRole } from '@/types';
import { BulkAttendanceEntry } from '@/types/attendance';
import BulkAttendanceTable from '@/components/attendance/BulkAttendanceTable';
import AttendanceAnalytics from '@/components/attendance/AttendanceAnalytics';

interface AttendanceModalProps {
  onClose: () => void;
  userRole?: UserRole;
}

const AttendanceModal = ({ onClose, userRole }: AttendanceModalProps) => {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [sessionType, setSessionType] = useState<'morning' | 'afternoon' | 'full-day'>('full-day');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const mockStudents = [
    { id: '1', name: 'John Doe', admissionNumber: 'ADM001', rollNumber: 'R001' },
    { id: '2', name: 'Jane Smith', admissionNumber: 'ADM002', rollNumber: 'R002' },
    { id: '3', name: 'Mike Johnson', admissionNumber: 'ADM003', rollNumber: 'R003' },
    { id: '4', name: 'Sarah Wilson', admissionNumber: 'ADM004', rollNumber: 'R004' },
    { id: '5', name: 'Emma Brown', admissionNumber: 'ADM005', rollNumber: 'R005' },
  ];

  const mockChildAttendance = [
    { date: '2024-01-15', morning: true, afternoon: true, status: 'Present', remarks: '' },
    { date: '2024-01-16', morning: true, afternoon: false, status: 'Half Day', remarks: 'Left early for appointment' },
    { date: '2024-01-17', morning: false, afternoon: false, status: 'Absent', remarks: 'Sick leave' },
    { date: '2024-01-18', morning: true, afternoon: true, status: 'Present', remarks: '' },
    { date: '2024-01-19', morning: true, afternoon: true, status: 'Present', remarks: '' },
  ];

  const mockAttendanceStats = [
    {
      studentId: '1',
      totalDays: 20,
      presentDays: 18,
      absentDays: 2,
      lateDays: 1,
      attendanceRate: 90,
      morningAttendanceRate: 95,
      afternoonAttendanceRate: 85
    },
    {
      studentId: '2',
      totalDays: 20,
      presentDays: 16,
      absentDays: 3,
      lateDays: 2,
      attendanceRate: 80,
      morningAttendanceRate: 85,
      afternoonAttendanceRate: 75
    },
    {
      studentId: '3',
      totalDays: 20,
      presentDays: 19,
      absentDays: 1,
      lateDays: 0,
      attendanceRate: 95,
      morningAttendanceRate: 95,
      afternoonAttendanceRate: 95
    }
  ];

  const handleSubmitAttendance = async (entries: BulkAttendanceEntry[]) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Attendance submitted:', {
        class: selectedClass,
        date: selectedDate,
        session: sessionType,
        entries,
        submittedBy: 'current-user-id',
        submittedAt: new Date()
      });
      onClose();
    } catch (error) {
      console.error('Failed to submit attendance:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const exportAttendance = (format: 'csv' | 'pdf' | 'excel') => {
    console.log(`Exporting attendance as ${format.toUpperCase()}`);
    // Implementation for export functionality
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {userRole === 'parent' ? "Child's Attendance" : 'Attendance Management'}
          </DialogTitle>
          <DialogDescription>
            {userRole === 'parent' 
              ? "View your child's attendance record and analytics"
              : "Bulk attendance entry with morning/afternoon sessions and analytics"
            }
          </DialogDescription>
        </DialogHeader>

        {userRole === 'parent' ? (
          <Tabs defaultValue="records" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="records">Attendance Records</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="records" className="space-y-4">
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
                          {record.remarks && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Remarks: {record.remarks}
                            </p>
                          )}
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
            </TabsContent>
            
            <TabsContent value="analytics">
              <AttendanceAnalytics stats={mockAttendanceStats.slice(0, 1)} />
            </TabsContent>
          </Tabs>
        ) : (
          <Tabs defaultValue="entry" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="entry">Bulk Entry</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="entry" className="space-y-6">
              {/* Selection Controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                <div>
                  <label className="block text-sm font-medium mb-2">Session Type</label>
                  <Select value={sessionType} onValueChange={(value: 'morning' | 'afternoon' | 'full-day') => setSessionType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-day">Full Day</SelectItem>
                      <SelectItem value="morning">Morning Only</SelectItem>
                      <SelectItem value="afternoon">Afternoon Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Export Options */}
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => exportAttendance('csv')}
                >
                  Export CSV
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => exportAttendance('excel')}
                >
                  Export Excel
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => exportAttendance('pdf')}
                >
                  Export PDF
                </Button>
              </div>

              {/* Bulk Attendance Table */}
              {selectedClass && (
                <BulkAttendanceTable
                  students={mockStudents}
                  date={selectedDate}
                  sessionType={sessionType}
                  onSubmit={handleSubmitAttendance}
                  isSubmitting={isSubmitting}
                />
              )}
            </TabsContent>
            
            <TabsContent value="analytics">
              <AttendanceAnalytics stats={mockAttendanceStats} />
            </TabsContent>
          </Tabs>
        )}

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AttendanceModal;
