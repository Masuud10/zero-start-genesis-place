
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Users, BookOpen } from 'lucide-react';

interface TodayScheduleProps {
  schedule: Array<{
    id: string;
    className: string;
    subjectName: string;
    teacherName: string;
    startTime: string;
    endTime: string;
    room: string;
  }>;
}

const TodaySchedule: React.FC<TodayScheduleProps> = ({ schedule }) => {
  const formatTime = (timeString: string) => {
    try {
      const time = new Date(`1970-01-01T${timeString}`);
      return time.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } catch {
      return timeString.substring(0, 5);
    }
  };

  const getCurrentTimeStatus = (startTime: string, endTime: string) => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    
    if (currentTime < startMinutes) return 'upcoming';
    if (currentTime >= startMinutes && currentTime <= endMinutes) return 'current';
    return 'completed';
  };

  if (schedule.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-700">
            <Clock className="h-5 w-5" />
            Today's Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium">No Classes Today</p>
            <p className="text-sm mt-1">All classes are free or it's a holiday.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-gray-700">
            <Clock className="h-5 w-5" />
            Today's Schedule
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {schedule.length} {schedule.length === 1 ? 'Class' : 'Classes'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {schedule.map((item) => {
            const timeStatus = getCurrentTimeStatus(item.startTime, item.endTime);
            return (
              <div 
                key={item.id} 
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  timeStatus === 'current' 
                    ? 'bg-blue-50 border-blue-200' 
                    : timeStatus === 'upcoming'
                    ? 'bg-gray-50 border-gray-200'
                    : 'bg-gray-100 border-gray-300 opacity-75'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`text-sm font-mono font-semibold ${
                    timeStatus === 'current' ? 'text-blue-600' : 'text-gray-600'
                  }`}>
                    {formatTime(item.startTime)} - {formatTime(item.endTime)}
                  </div>
                  
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-gray-500" />
                      <span className="font-medium text-gray-900">{item.subjectName}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <Users className="h-3 w-3" />
                        {item.className}
                      </div>
                      <div className="text-xs text-gray-600">
                        {item.teacherName}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {item.room && (
                    <Badge variant="outline" className="text-xs flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {item.room}
                    </Badge>
                  )}
                  {timeStatus === 'current' && (
                    <Badge className="bg-blue-600 text-xs">Live</Badge>
                  )}
                  {timeStatus === 'upcoming' && (
                    <Badge variant="secondary" className="text-xs">Upcoming</Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default TodaySchedule;
