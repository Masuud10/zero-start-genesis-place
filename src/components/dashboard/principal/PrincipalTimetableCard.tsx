
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Users, Settings } from 'lucide-react';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import TimetableStats from './timetable/TimetableStats';
import TodaySchedule from './timetable/TodaySchedule';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import TimetableGenerator from '@/components/timetable/TimetableGenerator';

interface TimetableData {
  totalSchedules: number;
  publishedSchedules: number;
  conflictsCount: number;
  todaySchedule: Array<{
    id: string;
    className: string;
    subjectName: string;
    teacherName: string;
    startTime: string;
    endTime: string;
    room: string;
  }>;
}

const PrincipalTimetableCard = () => {
  const { schoolId } = useSchoolScopedData();
  const { toast } = useToast();
  const [timetableData, setTimetableData] = useState<TimetableData>({
    totalSchedules: 0,
    publishedSchedules: 0,
    conflictsCount: 0,
    todaySchedule: []
  });
  const [loading, setLoading] = useState(true);
  const [showGenerator, setShowGenerator] = useState(false);

  useEffect(() => {
    fetchTimetableData();
  }, [schoolId]);

  const fetchTimetableData = async () => {
    if (!schoolId) return;

    try {
      setLoading(true);

      // Get today's day name
      const today = new Date();
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const todayName = dayNames[today.getDay()];

      // Fetch timetable data
      const { data: timetableRecords, error: timetableError } = await supabase
        .from('timetables')
        .select(`
          id,
          day_of_week,
          start_time,
          end_time,
          room,
          is_published,
          classes!inner(name),
          subjects!inner(name),
          profiles!timetables_teacher_id_fkey(name)
        `)
        .eq('school_id', schoolId);

      if (timetableError) {
        console.error('Error fetching timetables:', timetableError);
        throw timetableError;
      }

      const totalSchedules = timetableRecords?.length || 0;
      const publishedSchedules = timetableRecords?.filter(t => t.is_published).length || 0;

      // Filter today's schedule
      const todaySchedule = (timetableRecords || [])
        .filter(record => record.day_of_week === todayName)
        .map(record => ({
          id: recor<div className="p-6">
        <CardHeader className="px-0 pb-4">
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <Calendar className="h-5 w-5" />
            Timetable Management
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0 space-y-6">
          {loading ? (
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ) : (
            <>
              {/* Timetable Statistics */}
              <TimetableStats 
                totalSchedules={timetableData.totalSchedules}
                publishedSchedules={timetableData.publishedSchedules}
                conflictsCount={timetableData.conflictsCount}
              />

              {/* Today's Schedule */}
              <TodaySchedule schedule={timetableData.todaySchedule} />

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button 
                  onClick={() => setShowGenerator(true)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Manage Timetables
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  View Full Schedule
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </div>

      {/* Timetable Generator Dialog */}
      <Dialog open={showGenerator} onOpenChange={setShowGenerator}>
        <DialogContent className="max-w-6xl h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Timetable Generator</DialogTitle>
          </DialogHeader>
          <TimetableGenerator />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PrincipalTimetableCard;
