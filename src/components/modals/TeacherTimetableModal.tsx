import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, AlertCircle, Calendar, Clock, MapPin } from 'lucide-react';

interface TeacherTimetableModalProps {
  open: boolean;
  onClose: () => void;
  classId?: string;
  className?: string;
}

const TeacherTimetableModal: React.FC<TeacherTimetableModalProps> = ({
  open,
  onClose,
  classId,
  className
}) => {
  const { user } = useAuth();
  const { schoolId } = useSchoolScopedData();

  const { data: timetable, isLoading, error } = useQuery({
    queryKey: ['teacher-class-timetable', user?.id, schoolId, classId],
    queryFn: async () => {
      if (!user?.id || !schoolId) return [];

      const query = supabase
        .from('timetables')
        .select(`
          id,
          day_of_week,
          start_time,
          end_time,
          room,
          subjects!inner(name, code),
          classes!inner(name)
        `)
        .eq('teacher_id', user.id)
        .eq('school_id', schoolId)
        .eq('is_published', true)
        .order('day_of_week')
        .order('start_time');

      if (classId) {
        query.eq('class_id', classId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching timetable:', error);
        throw error;
      }

      return data || [];
    },
    enabled: open && !!user?.id && !!schoolId,
  });

  const formatTime = (timeString: string) => {
    try {
      const time = new Date(`1970-01-01T${timeString}`);
      return time.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } catch {
      return timeString;
    }
  };

  const groupedByDay = timetable?.reduce((acc, entry) => {
    const day = entry.day_of_week.toLowerCase();
    if (!acc[day]) acc[day] = [];
    acc[day].push(entry);
    return acc;
  }, {} as Record<string, typeof timetable>) || {};

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {classId ? `${className} Timetable` : 'My Complete Timetable'}
          </DialogTitle>
        </DialogHeader>

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              <span className="text-gray-600">Loading timetable...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center py-8 text-red-600">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              <p>Unable to load timetable</p>
            </div>
          </div>
        )}

        {!isLoading && !error && timetable && (
          <div className="space-y-6">
            {timetable.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium">No timetable available</p>
                <p className="text-sm mt-1">
                  {classId ? 'No schedule found for this class.' : 'Your teaching timetable hasn\'t been published yet.'}
                </p>
              </div>
            ) : (
              days.map((day) => {
                const daySchedule = groupedByDay[day] || [];
                if (daySchedule.length === 0) return null;

                return (
                  <div key={day} className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2 border-b">
                      <h3 className="font-semibold text-gray-900 capitalize flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {day}
                        <Badge variant="secondary" className="ml-auto">
                          {daySchedule.length} {daySchedule.length === 1 ? 'Class' : 'Classes'}
                        </Badge>
                      </h3>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Time</TableHead>
                          <TableHead>Subject</TableHead>
                          {!classId && <TableHead>Class</TableHead>}
                          <TableHead>Room</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {daySchedule.map((entry) => (
                          <TableRow key={entry.id}>
                            <TableCell className="font-mono text-sm">
                              {formatTime(entry.start_time)} - {formatTime(entry.end_time)}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{entry.subjects.name}</Badge>
                            </TableCell>
                            {!classId && (
                              <TableCell className="font-medium">
                                {entry.classes.name}
                              </TableCell>
                            )}
                            <TableCell>
                              {entry.room ? (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3 text-gray-500" />
                                  {entry.room}
                                </div>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                );
              })
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TeacherTimetableModal;