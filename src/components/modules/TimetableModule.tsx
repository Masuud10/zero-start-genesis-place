
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, BookOpen, Plus, Edit, Download } from 'lucide-react';

const TimetableModule = () => {
  const [selectedClass, setSelectedClass] = useState('8a');
  const [selectedWeek, setSelectedWeek] = useState('current');

  const classes = [
    { id: '8a', name: 'Grade 8A' },
    { id: '8b', name: 'Grade 8B' },
    { id: '7a', name: 'Grade 7A' },
    { id: '7b', name: 'Grade 7B' },
  ];

  const timeSlots = [
    '8:00 - 8:45',
    '8:45 - 9:30',
    '9:30 - 10:15',
    '10:15 - 10:30', // Break
    '10:30 - 11:15',
    '11:15 - 12:00',
    '12:00 - 12:45',
    '12:45 - 13:30', // Lunch
    '13:30 - 14:15',
    '14:15 - 15:00'
  ];

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const timetableData = {
    'Monday': {
      '8:00 - 8:45': { subject: 'Mathematics', teacher: 'Ms. Johnson', room: 'Room 101' },
      '8:45 - 9:30': { subject: 'English', teacher: 'Mr. Smith', room: 'Room 203' },
      '9:30 - 10:15': { subject: 'Science', teacher: 'Dr. Wilson', room: 'Lab 1' },
      '10:15 - 10:30': { subject: 'Break', teacher: '', room: '' },
      '10:30 - 11:15': { subject: 'Social Studies', teacher: 'Mrs. Davis', room: 'Room 105' },
      '11:15 - 12:00': { subject: 'PE', teacher: 'Coach Brown', room: 'Gym' },
      '12:00 - 12:45': { subject: 'Art', teacher: 'Ms. Taylor', room: 'Art Room' },
      '12:45 - 13:30': { subject: 'Lunch', teacher: '', room: '' },
      '13:30 - 14:15': { subject: 'Music', teacher: 'Mr. Lee', room: 'Music Room' },
      '14:15 - 15:00': { subject: 'Study Hall', teacher: 'Ms. Johnson', room: 'Room 101' }
    },
    // Add more days as needed
  };

  const getCellContent = (day: string, time: string) => {
    const content = timetableData[day]?.[time];
    if (!content) return null;

    if (content.subject === 'Break' || content.subject === 'Lunch') {
      return (
        <div className="text-center p-2 bg-gray-100 rounded">
          <span className="text-sm font-medium text-gray-600">{content.subject}</span>
        </div>
      );
    }

    return (
      <div className="p-2 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 cursor-pointer">
        <div className="font-medium text-sm text-blue-900">{content.subject}</div>
        <div className="text-xs text-blue-700">{content.teacher}</div>
        <div className="text-xs text-blue-600">{content.room}</div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Timetable Management
          </h1>
          <p className="text-muted-foreground">Manage class schedules and assignments</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Period
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={selectedClass} onValueChange={setSelectedClass}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select class" />
          </SelectTrigger>
          <SelectContent>
            {classes.map((cls) => (
              <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedWeek} onValueChange={setSelectedWeek}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select week" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="current">Current Week</SelectItem>
            <SelectItem value="next">Next Week</SelectItem>
            <SelectItem value="custom">Custom Range</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Timetable Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Weekly Timetable - {classes.find(c => c.id === selectedClass)?.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border p-3 bg-gray-50 text-left font-medium">Time</th>
                  {days.map(day => (
                    <th key={day} className="border p-3 bg-gray-50 text-center font-medium min-w-[180px]">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map(time => (
                  <tr key={time}>
                    <td className="border p-3 bg-gray-50 font-medium text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {time}
                      </div>
                    </td>
                    {days.map(day => (
                      <td key={`${day}-${time}`} className="border p-1">
                        {getCellContent(day, time)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TimetableModule;
