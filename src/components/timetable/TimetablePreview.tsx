
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TimetablePreviewProps {
  timetableData: any[];
  classData: any;
  schoolData: any;
}

const TimetablePreview: React.FC<TimetablePreviewProps> = ({ 
  timetableData, 
  classData, 
  schoolData 
}) => {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  const timeSlots = [
    '08:00', '08:40', '09:20', '10:00', '10:40', '11:20', 
    '12:00', '12:40', '13:20', '14:00', '14:40', '15:20'
  ];

  const formatTime = (time: string) => {
    return time.substring(0, 5); // Remove seconds
  };

  const getTimetableEntry = (day: string, startTime: string) => {
    return timetableData.find(entry => 
      entry.day_of_week === day && entry.start_time === startTime
    );
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">{schoolData?.name || 'School Name'}</h2>
          <h3 className="text-lg font-semibold">
            Class Timetable - {classData?.name || 'Class Name'}
          </h3>
          <p className="text-sm text-muted-foreground">
            Academic Year {new Date().getFullYear()}
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2 text-sm font-semibold">Time</th>
                {days.map(day => (
                  <th key={day} className="border border-gray-300 p-2 text-sm font-semibold capitalize">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.slice(0, -1).map((startTime, index) => {
                const endTime = timeSlots[index + 1];
                return (
                  <tr key={startTime}>
                    <td className="border border-gray-300 p-2 text-xs font-mono">
                      {formatTime(startTime)} - {formatTime(endTime)}
                    </td>
                    {days.map(day => {
                      const entry = getTimetableEntry(day, startTime);
                      return (
                        <td key={`${day}-${startTime}`} className="border border-gray-300 p-2">
                          {entry ? (
                            <div className="space-y-1">
                              <div className="font-semibold text-xs text-blue-800">
                                {entry.subjects?.name || 'Subject'}
                              </div>
                              <div className="text-xs text-gray-600">
                                {entry.profiles?.name || 'Teacher'}
                              </div>
                              {entry.room && (
                                <Badge variant="outline" className="text-xs">
                                  {entry.room}
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <div className="text-xs text-gray-400">-</div>
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
        
        <div className="mt-4 text-center text-xs text-muted-foreground">
          <p>Generated on {new Date().toLocaleDateString()}</p>
          <p>{schoolData?.address && `${schoolData.address} | `}
             {schoolData?.phone && `Tel: ${schoolData.phone} | `}
             {schoolData?.email && `Email: ${schoolData.email}`}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TimetablePreview;
