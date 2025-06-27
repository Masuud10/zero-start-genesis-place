
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, MapPin, User } from 'lucide-react';

interface ScheduleItem {
  id: string;
  className: string;
  subjectName: string;
  teacherName: string;
  startTime: string;
  endTime: string;
  room: string;
}

interface TodayScheduleProps {
  schedule: ScheduleItem[];
}

const TodaySchedule: React.FC<TodayScheduleProps> = ({ schedule }) => {
  const formatTime = (time: string) => {
    try {
      const [hours, minutes] = time.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      return time;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-gray-900 flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Today's Schedule
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {schedule.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            No classes scheduled for today
          </p>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {schedule.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{item.className}</span>
                    <span className="text-xs text-gray-500">•</span>
                    <span className="text-sm text-gray-600">{item.subjectName}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {item.teacherName}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {item.room}
                    </div>
                  </div>
                </div>
                <div className="text-xs font-medium text-blue-600">
                  {formatTime(item.startTime)} - {formatTime(item.endTime)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TodaySchedule;
