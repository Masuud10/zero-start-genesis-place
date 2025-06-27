
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, BookOpen, Users } from 'lucide-react';

interface TeacherTimetableViewProps {
  timetable: any[];
}

const TeacherTimetableView: React.FC<TeacherTimetableViewProps> = ({ timetable }) => {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  const timeSlots = [
    '08:00', '08:40', '09:20', '10:00', '10:40', '11:20', 
    '12:00', '12:40', '13:20', '14:00', '14:40', '15:20'
  ];

  const formatTime = (time: string) => {
    try {
      const timeObj = new Date(`1970-01-01T${time}`);
      return timeObj.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } catch {
      return time.substring(0, 5);
    }
  };

  const getTimetableEntry = (day: string, startTime: string) => {
    return timetable.find(entry => 
      entry.day_of_week === day && entry.start_time === startTime
    );
  };

  const getCurrentDay = () => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[new Date().getDay()];
  };

  const todaySchedule = timetable.filter(entry => 
    entry.day_of_week.toLowerCase() === getCurrentDay()
  );

  return (
    <div className="space-y-6">
      {/* Today's Schedule Highlight */}
      {todaySchedule.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Clock className="h-5 w-5" />
              Today's Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {todaySchedule.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-3 bg-white border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-blue-600 font-semibold">
                      {formatTime(entry.start_time)} - {formatTime(entry.end_time)}
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">{entry.subject.name}</span>
                      <span className="text-gray-600 ml-2">• {entry.class.name}</span>
                    </div>
                  </div>
                  {entry.room && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {entry.room}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weekly Timetable Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Weekly Timetable
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-semibold text-gray-700 min-w-[100px]">Time</th>
                  {days.map(day => (
                    <th key={day} className="text-left p-3 font-semibold text-gray-700 capitalize min-w-[180px]">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.slice(0, -1).map((startTime, index) => {
                  const endTime = timeSlots[index + 1];
                  return (
                    <tr key={startTime} className="border-b hover:bg-gray-50">
                      <td className="p-3 text-sm font-mono text-gray-600">
                        {formatTime(startTime)} - {formatTime(endTime)}
                      </td>
                      {days.map(day => {
                        const entry = getTimetableEntry(day, startTime);
                        return (
                          <td key={`${day}-${startTime}`} className="p-3">
                            {entry ? (
                              <div className="space-y-1">
                                <div className="font-semibold text-sm text-blue-800">
                                  {entry.subject.name}
                                </div>
                                <div className="flex items-center gap-1 text-xs text-gray-600">
                                  <Users className="h-3 w-3" />
                                  {entry.class.name}
                                </div>
                                {entry.room && (
                                  <Badge variant="outline" className="text-xs">
                                    <MapPin className="h-3 w-3 mr-1" />
                                    {entry.room}
                                  </Badge>
                                )}
                              </div>
                            ) : (
                              <div className="text-xs text-gray-400">Free</div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Classes</p>
                <p className="text-2xl font-bold text-gray-900">{timetable.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Today's Classes</p>
                <p className="text-2xl font-bold text-gray-900">{todaySchedule.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Different Classes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(timetable.map(entry => entry.class.name)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeacherTimetableView;
