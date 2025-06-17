
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock } from 'lucide-react';
import { useTeacherTimetable } from '@/hooks/useTeacherTimetable';

const DAYS_OF_WEEK = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

const CompactTeacherTimetable = () => {
  const { data: timetable, isLoading, error } = useTeacherTimetable();
  const [selectedDay, setSelectedDay] = useState<string>('Monday');

  if (isLoading) {
    return (
      <Card className="h-64">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5" />
            My Timetable
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading timetable...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-64">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5" />
            My Timetable
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Failed to load timetable
          </div>
        </CardContent>
      </Card>
    );
  }

  const daySchedule = timetable?.filter(entry => entry.day_of_week === selectedDay) || [];

  return (
    <Card className="h-64">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="h-5 w-5" />
          My Timetable
        </CardTitle>
        <Select value={selectedDay} onValueChange={setSelectedDay}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DAYS_OF_WEEK.map((day) => (
              <SelectItem key={day} value={day}>
                {day}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="space-y-2 max-h-36 overflow-y-auto">
        {daySchedule.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground text-sm">
            No classes scheduled for {selectedDay}
          </div>
        ) : (
          daySchedule
            .sort((a, b) => a.start_time.localeCompare(b.start_time))
            .map((entry) => (
              <div key={entry.id} className="flex items-center justify-between p-2 border rounded-lg bg-gray-50">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {entry.start_time} - {entry.end_time}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {entry.subject.name}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {entry.class.name}
                  </span>
                  {entry.room && (
                    <span className="text-xs text-muted-foreground">
                      Room {entry.room}
                    </span>
                  )}
                </div>
              </div>
            ))
        )}
      </CardContent>
    </Card>
  );
};

export default CompactTeacherTimetable;
