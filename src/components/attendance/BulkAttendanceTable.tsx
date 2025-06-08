
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BulkAttendanceEntry } from '@/types/attendance';

interface BulkAttendanceTableProps {
  students: Array<{ id: string; name: string; admissionNumber: string; rollNumber: string }>;
  date: string;
  sessionType: 'morning' | 'afternoon' | 'full-day';
  onSubmit: (entries: BulkAttendanceEntry[]) => void;
  isSubmitting?: boolean;
}

const BulkAttendanceTable = ({ students, date, sessionType, onSubmit, isSubmitting }: BulkAttendanceTableProps) => {
  const [entries, setEntries] = useState<BulkAttendanceEntry[]>(
    students.map(student => ({
      studentId: student.id,
      name: student.name,
      admissionNumber: student.admissionNumber,
      morningStatus: 'present',
      afternoonStatus: 'present',
      remarks: ''
    }))
  );

  const updateEntry = (studentId: string, field: keyof BulkAttendanceEntry, value: string) => {
    setEntries(prev => prev.map(entry => 
      entry.studentId === studentId ? { ...entry, [field]: value } : entry
    ));
  };

  const setAllStatus = (session: 'morning' | 'afternoon', status: 'present' | 'absent' | 'late') => {
    const field = session === 'morning' ? 'morningStatus' : 'afternoonStatus';
    setEntries(prev => prev.map(entry => ({ ...entry, [field]: status })));
  };

  const getStats = () => {
    const morning = entries.reduce((acc, entry) => {
      acc[entry.morningStatus] = (acc[entry.morningStatus] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const afternoon = entries.reduce((acc, entry) => {
      acc[entry.afternoonStatus] = (acc[entry.afternoonStatus] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { morning, afternoon };
  };

  const stats = getStats();

  const handleSubmit = () => {
    onSubmit(entries);
  };

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Morning Session - Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setAllStatus('morning', 'present')}
                className="flex-1"
              >
                All Present
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setAllStatus('morning', 'absent')}
                className="flex-1"
              >
                All Absent
              </Button>
            </div>
            <div className="flex gap-2 text-xs">
              <Badge variant="default">Present: {stats.morning.present || 0}</Badge>
              <Badge variant="destructive">Absent: {stats.morning.absent || 0}</Badge>
              <Badge variant="secondary">Late: {stats.morning.late || 0}</Badge>
            </div>
          </CardContent>
        </Card>

        {sessionType === 'full-day' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Afternoon Session - Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setAllStatus('afternoon', 'present')}
                  className="flex-1"
                >
                  All Present
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setAllStatus('afternoon', 'absent')}
                  className="flex-1"
                >
                  All Absent
                </Button>
              </div>
              <div className="flex gap-2 text-xs">
                <Badge variant="default">Present: {stats.afternoon.present || 0}</Badge>
                <Badge variant="destructive">Absent: {stats.afternoon.absent || 0}</Badge>
                <Badge variant="secondary">Late: {stats.afternoon.late || 0}</Badge>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Attendance Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Student Name</TableHead>
              <TableHead>Adm No.</TableHead>
              <TableHead>Morning</TableHead>
              {sessionType === 'full-day' && <TableHead>Afternoon</TableHead>}
              <TableHead>Remarks</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry, index) => (
              <TableRow key={entry.studentId}>
                <TableCell className="font-medium">{index + 1}</TableCell>
                <TableCell className="font-medium">{entry.name}</TableCell>
                <TableCell>{entry.admissionNumber}</TableCell>
                <TableCell>
                  <Select
                    value={entry.morningStatus}
                    onValueChange={(value) => updateEntry(entry.studentId, 'morningStatus', value)}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="present">Present</SelectItem>
                      <SelectItem value="absent">Absent</SelectItem>
                      <SelectItem value="late">Late</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                {sessionType === 'full-day' && (
                  <TableCell>
                    <Select
                      value={entry.afternoonStatus}
                      onValueChange={(value) => updateEntry(entry.studentId, 'afternoonStatus', value)}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="present">Present</SelectItem>
                        <SelectItem value="absent">Absent</SelectItem>
                        <SelectItem value="late">Late</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                )}
                <TableCell>
                  <Input
                    placeholder="Optional remarks..."
                    value={entry.remarks || ''}
                    onChange={(e) => updateEntry(entry.studentId, 'remarks', e.target.value)}
                    className="w-full min-w-32"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Attendance'}
        </Button>
      </div>
    </div>
  );
};

export default BulkAttendanceTable;
