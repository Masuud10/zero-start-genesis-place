
import React from 'react';
import { Clock } from 'lucide-react';

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

const TodaySchedule = ({ schedule }: TodayScheduleProps) => {
  return (
    <div>
      <h4 className="font-semibold mb-3 flex items-center gap-2">
        <Clock className="h-4 w-4" />
        Today's Schedule
      </h4>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {schedule.length > 0 ? (
          schedule.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">{item.subjectName}</p>
                <p className="text-sm text-gray-500">
                  {item.className} • {item.teacherName}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{item.startTime} - {item.endTime}</p>
                <p className="text-sm text-gray-500">{item.room}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center py-4">No classes scheduled for today</p>
        )}
      </div>
    </div>
  );
};

export default TodaySchedule;
