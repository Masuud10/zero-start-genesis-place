
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Calendar, Clock, Users, MapPin } from 'lucide-react';

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
    return timetableData.find(entry => 
      entry.day_of_week === day && entry.start_time === startTime
    );
  };

  const isBreakTime = (time: string) => {
    return time === '10:40' || time === '12:40';
  };

  const getBreakLabel = (time: string) => {
    if (time === '10:40') return '☕ Tea Break';
    if (time === '12:40') return '🍽️ Lunch Break';
    return '';
  };

  return (
    <Card className="border-2 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Eye className="h-5 w-5" />
          Timetable Preview
        </CardTitle>
        <div className="text-sm text-gray-600">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {classData?.name || 'Class'}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {schoolData?.name || 'School'}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="border border-gray-300 p-3 text-left font-semibold min-w-[100px]">
                  <Clock className="h-4 w-4 inline mr-2" />
                  Time
                </th>
                {days.map(day => (
                  <th key={day} className="border border-gray-300 p-3 text-center font-semibold capitalize min-w-[140px]">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.slice(0, -1).map((startTime, index) => {
                const endTime = timeSlots[index + 1];
                const isBreak = isBreakTime(startTime);
                
                if (isBreak) {
                  return (
                    <tr key={`break-${startTime}`} className="bg-yellow-100">
                      <td className="border border-gray-300 p-3 font-mono text-sm font-semibold text-yellow-800">
                        {formatTime(startTime)} - {formatTime(endTime)}
                      </td>
                      <td colSpan={5} className="border border-gray-300 p-3 text-center font-semibold text-yellow-800">
                        {getBreakLabel(startTime)}
                      </td>
                    </tr>
                  );
                }
                
                return (
                  <tr key={startTime} className="hover:bg-gray-50">
                    <td className="border border-gray-300 p-3 font-mono text-sm font-semibold text-gray-700 bg-gray-50">
                      {formatTime(startTime)} - {formatTime(endTime)}
                    </td>
                    {days.map(day => {
                      const entry = getTimetableEntry(day, startTime);
                      return (
                        <td key={`${day}-${startTime}`} className="border border-gray-300 p-3 text-center">
                          {entry ? (
                            <div className="space-y-1">
                              <div className="font-semibold text-blue-800 text-sm">
                                {entry.subjects?.name || 'Subject'}
                              </div>
                              <div className="text-xs text-green-700 font-medium">
                                {entry.profiles?.name || 'Teacher'}
                              </div>
                              {entry.room && (
                                <Badge variant="outline" className="text-xs flex items-center gap-1 justify-center">
                                  <MapPin className="h-3 w-3" />
                                  {entry.room}
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <div className="text-xs text-gray-400 italic">
                              Free Period
                            </div>
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
        
        {/* Preview Statistics */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Periods</p>
                <p className="text-2xl font-bold text-blue-800">{timetableData.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-green-600 font-medium">Unique Teachers</p>
                <p className="text-2xl font-bold text-green-800">
                  {new Set(timetableData.map(entry => entry.teacher_id)).size}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-purple-600 font-medium">Rooms Used</p>
                <p className="text-2xl font-bold text-purple-800">
                  {new Set(timetableData.filter(entry => entry.room).map(entry => entry.room)).size}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TimetablePreview;
