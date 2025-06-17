
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, MapPin } from 'lucide-react';

interface TimetableEntry {
  id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  class: { id: string; name: string };
  subject: { id: string; name: string };
  room?: string;
  term: string;
}

interface TeacherTimetableViewProps {
  timetable: TimetableEntry[];
}

const TeacherTimetableView: React.FC<TeacherTimetableViewProps> = ({ timetable }) => {
  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
      {daysOfWeek.map(day => {
        const daySchedule = timetable
          .filter(entry => entry.day_of_week.toLowerCase() === day)
          .sort((a, b) => a.start_time.localeCompare(b.start_time));

        return (
          <Card key={day}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg capitalize">{day}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {daySchedule.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  No classes
                </div>
              ) : (
                daySchedule.map((entry) => (
                  <div key={entry.id} className="p-3 border rounded-lg bg-blue-50">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">
                        {entry.start_time} - {entry.end_time}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <Badge variant="outline" className="text-xs">
                        {entry.subject.name}
                      </Badge>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {entry.class.name}
                      </div>
                      {entry.room && (
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          Room {entry.room}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default TeacherTimetableView;
