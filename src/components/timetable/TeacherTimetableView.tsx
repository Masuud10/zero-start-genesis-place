
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, BookOpen } from 'lucide-react';

interface TimetableEntry {
  id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  room?: string;
  subjects: {
    name: string;
  };
  classes: {
    name: string;
  };
}

interface TeacherTimetableViewProps {
  timetable: TimetableEntry[];
}

const TeacherTimetableView: React.FC<TeacherTimetableViewProps> = ({ timetable }) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  
  // Group timetable entries by day
  const timetableByDay = days.reduce((acc, day) => {
    acc[day] = timetable
      .filter(entry => entry.day_of_week.toLowerCase() === day.toLowerCase())
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
    return acc;
  }, {} as Record<string, TimetableEntry[]>);

  const formatTime = (time: string) => {
    return new Date(`1970-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {days.map(day => (
          <Card key={day} className="h-fit">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-center text-blue-600">
                {day}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {timetableByDay[day].length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No classes scheduled</p>
                </div>
              ) : (
                timetableByDay[day].map(entry => (
                  <div
                    key={entry.id}
                    className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">
                        {formatTime(entry.start_time)} - {formatTime(entry.end_time)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-semibold text-green-700">
                        {entry.subjects.name}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        {entry.classes.name}
                      </Badge>
                      
                      {entry.room && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-gray-500" />
                          <span className="text-xs text-gray-600">
                            {entry.room}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Summary Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {timetable.length}
              </div>
              <p className="text-sm text-muted-foreground">Total Classes</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {new Set(timetable.map(t => t.subjects.name)).size}
              </div>
              <p className="text-sm text-muted-foreground">Subjects</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {new Set(timetable.map(t => t.classes.name)).size}
              </div>
              <p className="text-sm text-muted-foreground">Classes</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {days.filter(day => timetableByDay[day].length > 0).length}
              </div>
              <p className="text-sm text-muted-foreground">Active Days</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherTimetableView;
