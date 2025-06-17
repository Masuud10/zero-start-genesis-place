
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Settings, RefreshCw, Users } from 'lucide-react';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import TimetableStats from './timetable/TimetableStats';
import TodaySchedule from './timetable/TodaySchedule';

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
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchTimetableData();
  }, [schoolId]);

  const fetchTimetableData = async () => {
    if (!schoolId) return;

    try {
      setLoading(true);

      const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][new Date().getDay()];

      // Fetch timetable statistics
      const [totalRes, publishedRes, todayRes] = await Promise.all([
        supabase
          .from('timetables')
          .select('id', { count: 'exact' })
          .eq('school_id', schoolId),
        supabase
          .from('timetables')
          .select('id', { count: 'exact' })
          .eq('school_id', schoolId)
          .eq('is_published', true),
        supabase
          .from('timetables')
          .select(`
            id,
            start_time,
            end_time,
            room,
            classes!inner(name),
            subjects!inner(name),
            profiles!inner(name)
          `)
          .eq('school_id', schoolId)
          .eq('day_of_week', dayOfWeek)
          .eq('is_published', true)
          .order('start_time')
      ]);

      const totalSchedules = totalRes.count || 0;
      const publishedSchedules = publishedRes.count || 0;
      
      // Check for conflicts (simplified - same teacher, same time)
      const { data: conflictData } = await supabase
        .from('timetables')
        .select('teacher_id, day_of_week, start_time, end_time')
        .eq('school_id', schoolId)
        .eq('is_published', true);

      let conflictsCount = 0;
      if (conflictData) {
        const scheduleMap = new Map();
        conflictData.forEach(schedule => {
          const key = `${schedule.teacher_id}-${schedule.day_of_week}-${schedule.start_time}`;
          if (scheduleMap.has(key)) {
            conflictsCount++;
          }
          scheduleMap.set(key, true);
        });
      }

      const todaySchedule = todayRes.data?.map(schedule => ({
        id: schedule.id,
        className: schedule.classes?.name || 'Unknown Class',
        subjectName: schedule.subjects?.name || 'Unknown Subject',
        teacherName: schedule.profiles?.name || 'Unknown Teacher',
        startTime: schedule.start_time,
        endTime: schedule.end_time,
        room: schedule.room || 'TBA'
      })) || [];

      setTimetableData({
        totalSchedules,
        publishedSchedules,
        conflictsCount,
        todaySchedule
      });

    } catch (error) {
      console.error('Error fetching timetable data:', error);
      toast({
        title: "Error",
        description: "Failed to load timetable data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateTimetable = async () => {
    if (!schoolId) return;

    try {
      setGenerating(true);

      // Get current academic term
      const currentTerm = 'Term 1'; // This should come from academic settings

      // Get classes and subjects
      const [classesRes, subjectsRes] = await Promise.all([
        supabase
          .from('classes')
          .select('id, name')
          .eq('school_id', schoolId),
        supabase
          .from('subjects')
          .select('id, name, teacher_id, class_id')
          .eq('school_id', schoolId)
      ]);

      if (!classesRes.data || !subjectsRes.data) {
        throw new Error('Missing class or subject data');
      }

      // Generate basic weekly schedule
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
      const timeSlots = [
        { start: '08:00', end: '09:00' },
        { start: '09:00', end: '10:00' },
        { start: '10:30', end: '11:30' },
        { start: '11:30', end: '12:30' },
        { start: '14:00', end: '15:00' },
        { start: '15:00', end: '16:00' }
      ];

      const timetableEntries = [];
      
      for (const day of days) {
        let slotIndex = 0;
        for (const subject of subjectsRes.data) {
          if (slotIndex >= timeSlots.length) break;
          
          const timeSlot = timeSlots[slotIndex];
          timetableEntries.push({
            school_id: schoolId,
            class_id: subject.class_id,
            subject_id: subject.id,
            teacher_id: subject.teacher_id,
            day_of_week: day,
            start_time: timeSlot.start,
            end_time: timeSlot.end,
            room: `Room ${slotIndex + 1}`,
            term: currentTerm,
            created_by_principal_id: schoolId,
            is_published: false
          });
          
          slotIndex++;
        }
      }

      // Clear existing unpublished schedules
      await supabase
        .from('timetables')
        .delete()
        .eq('school_id', schoolId)
        .eq('is_published', false);

      // Insert new timetable
      const { error: insertError } = await supabase
        .from('timetables')
        .insert(timetableEntries);

      if (insertError) throw insertError;

      toast({
        title: "Success",
        description: "Timetable generated successfully. Review and publish when ready.",
      });

      fetchTimetableData();

    } catch (error) {
      console.error('Error generating timetable:', error);
      toast({
        title: "Error",
        description: "Failed to generate timetable. Please try again.",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Timetable Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Timetable Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
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
            onClick={generateTimetable}
            disabled={generating}
            className="flex-1"
          >
            {generating ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Settings className="h-4 w-4 mr-2" />
            )}
            {generating ? 'Generating...' : 'Generate Timetable'}
          </Button>
          <Button variant="outline" className="flex-1">
            <Users className="h-4 w-4 mr-2" />
            Manage Schedules
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PrincipalTimetableCard;
