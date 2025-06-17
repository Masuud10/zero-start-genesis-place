
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
  const [selectedDay, setSelectedDay] = useState<string>(() => {
    const today = new Date();
    return DAYS_OF_WEEK[today.getDay() === 0 ? 6 : today.getDay() - 1]; // Convert Sunday=0 to Saturday=6
  });

  if (isLoading) {
    return (
      <Card className="h-80">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5" />
            My Timetable
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
            <span className="ml-2 text-sm">Loading timetable...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-80">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5" />
            My Timetable
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">Failed to load timetable</p>
            <p className="text-xs mt-1">Please try refreshing the page</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const daySchedule = timetable?.filter(entry => entry.day_of_week === selectedDay) || [];
  const sortedSchedule = daySchedule.sort((a, b) => a.start_time.localeCompare(b.start_time));

  return (
    <Card className="h-80">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="h-5 w-5" />
          My Timetable
        </CardTitle>
        <div className="pt-2">
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
        </div>
      </CardHeader>
      <CardContent className="space-y-2 h-48 overflow-y-auto">
        {sortedSchedule.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <p className="text-sm">No classes scheduled</p>
            <p className="text-xs">for {selectedDay}</p>
          </div>
        ) : (
          sortedSchedule.map((entry) => (
            <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span className="font-medium">
                    {entry.start_time} - {entry.end_time}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {entry.subject.name}
                    </Badge>
                    <span className="text-xs text-muted-foreground truncate">
                      {entry.class.name}
                    </span>
                  </div>
                  {entry.room && (
                    <span className="text-xs text-muted-foreground">
                      Room {entry.room}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default CompactTeacherTimetable;
