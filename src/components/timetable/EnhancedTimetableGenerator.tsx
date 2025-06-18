import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { supabase } from '@/integrations/supabase/client';
import { usePrincipalEntityLists } from '@/hooks/usePrincipalEntityLists';
import { Sparkles, Download, Send, Calendar, Clock, Users, BookOpen, Building2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TimeSlot {
  start: string;
  end: string;
  period: number;
}

interface TimetableEntry {
  day: string;
  timeSlot: TimeSlot;
  subject: string;
  teacher: string;
  room: string;
}

interface TimetableResponse {
  success?: boolean;
  message?: string;
  error?: string;
}

const EnhancedTimetableGenerator = () => {
  const { toast } = useToast();
  const { schoolId } = useSchoolScopedData();
  const { classList, subjectList, teacherList } = usePrincipalEntityLists(0);
  
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [generatedTimetable, setGeneratedTimetable] = useState<TimetableEntry[]>([]);

  const timeSlots: TimeSlot[] = [
    { start: '08:00', end: '08:40', period: 1 },
    { start: '08:40', end: '09:20', period: 2 },
    { start: '09:20', end: '10:00', period: 3 },
    { start: '10:00', end: '10:20', period: 0 }, // Break
    { start: '10:20', end: '11:00', period: 4 },
    { start: '11:00', end: '11:40', period: 5 },
    { start: '11:40', end: '12:20', period: 6 },
    { start: '12:20', end: '13:00', period: 0 }, // Lunch
    { start: '13:00', end: '13:40', period: 7 },
    { start: '13:40', end: '14:20', period: 8 },
  ];

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const handleAutoGenerate = async () => {
    if (!selectedClass || !schoolId) {
      toast({
        title: "Error",
        description: "Please select a class first",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.rpc('generate_timetable', {
        p_school_id: schoolId,
        p_class_id: selectedClass,
        p_created_by: (await supabase.auth.getUser()).data.user?.id
      });

      if (error) throw error;

      // Handle the response properly with type assertion
      const response = data as TimetableResponse;
      
      if (response?.error) {
        throw new Error(response.error);
      }

      // Fetch the generated timetable
      const { data: timetableData, error: fetchError } = await supabase
        .from('timetables')
        .select(`
          day_of_week,
          start_time,
          end_time,
          room,
          subjects (name),
          profiles (name)
        `)
        .eq('class_id', selectedClass)
        .eq('school_id', schoolId)
        .order('day_of_week')
        .order('start_time');

      if (fetchError) throw fetchError;

      const formattedTimetable: TimetableEntry[] = timetableData?.map((entry: any) => ({
        day: entry.day_of_week,
        timeSlot: {
          start: entry.start_time,
          end: entry.end_time,
          period: 1
        },
        subject: entry.subjects?.name || 'Unknown Subject',
        teacher: entry.profiles?.name || 'Unknown Teacher',
        room: entry.room || 'TBA'
      })) || [];

      setGeneratedTimetable(formattedTimetable);

      toast({
        title: "Success",
        description: "Timetable generated successfully using AI optimization!",
      });

    } catch (error: any) {
      console.error('Error generating timetable:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate timetable",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendToTeachers = async () => {
    if (!selectedClass || !schoolId) return;

    setIsSending(true);
    try {
      const { error } = await supabase
        .from('timetables')
        .update({ is_published: true })
        .eq('class_id', selectedClass)
        .eq('school_id', schoolId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Timetable has been published and sent to teachers' dashboards!",
      });

    } catch (error: any) {
      console.error('Error sending timetable:', error);
      toast({
        title: "Error",
        description: "Failed to send timetable to teachers",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  const exportToPDF = () => {
    toast({
      title: "Export",
      description: "PDF export feature coming soon!",
    });
  };

  const exportToCSV = () => {
    if (generatedTimetable.length === 0) {
      toast({
        title: "Error",
        description: "No timetable data to export",
        variant: "destructive"
      });
      return;
    }

    const csvContent = [
      ['Day', 'Time', 'Subject', 'Teacher', 'Room'],
      ...generatedTimetable.map(entry => [
        entry.day,
        `${entry.timeSlot.start} - ${entry.timeSlot.end}`,
        entry.subject,
        entry.teacher,
        entry.room
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timetable-${selectedClass}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <Card className="shadow-lg border-0 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-2xl">
            <Sparkles className="h-7 w-7" />
            AI-Powered Timetable Generator
          </CardTitle>
          <p className="text-blue-100">
            Automatically generate optimized timetables with conflict detection and teacher availability
          </p>
        </CardHeader>
      </Card>

      {/* Configuration Section */}
      <Card className="shadow-lg border-0 rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Timetable Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Class Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Select Class</label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-full border-gray-300 focus:border-blue-500 rounded-xl">
                  <SelectValue placeholder="Choose class" />
                </SelectTrigger>
                <SelectContent>
                  {classList.map((classItem) => (
                    <SelectItem key={classItem.id} value={classItem.id}>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {classItem.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Stats Cards */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Available Subjects</label>
              <div className="flex items-center gap-2 p-3 bg-green-50 rounded-xl border border-green-200">
                <BookOpen className="h-4 w-4 text-green-600" />
                <span className="font-bold text-green-700">
                  {subjectList.filter(s => s.class_id === selectedClass).length}
                </span>
                <span className="text-sm text-green-600">subjects</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Available Teachers</label>
              <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-xl border border-purple-200">
                <Users className="h-4 w-4 text-purple-600" />
                <span className="font-bold text-purple-700">{teacherList.length}</span>
                <span className="text-sm text-purple-600">teachers</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Time Periods</label>
              <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-xl border border-orange-200">
                <Clock className="h-4 w-4 text-orange-600" />
                <span className="font-bold text-orange-700">8</span>
                <span className="text-sm text-orange-600">periods/day</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            <Button 
              onClick={handleAutoGenerate}
              disabled={!selectedClass || isGenerating}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl px-6 py-3 shadow-lg"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Auto Generate with AI
                </>
              )}
            </Button>

            {generatedTimetable.length > 0 && (
              <>
                <Button 
                  onClick={handleSendToTeachers}
                  disabled={isSending}
                  className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-6 py-3 shadow-lg"
                >
                  {isSending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send to Teachers
                    </>
                  )}
                </Button>

                <Button 
                  onClick={exportToCSV}
                  variant="outline"
                  className="border-gray-300 hover:bg-gray-50 rounded-xl px-6 py-3"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>

                <Button 
                  onClick={exportToPDF}
                  variant="outline"
                  className="border-gray-300 hover:bg-gray-50 rounded-xl px-6 py-3"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Generated Timetable Display */}
      {generatedTimetable.length > 0 && (
        <Card className="shadow-lg border-0 rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-green-600" />
              Generated Timetable
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                AI Optimized
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="grid grid-cols-6 gap-2 min-w-full">
                {/* Header */}
                <div className="font-bold text-center p-3 bg-gray-100 rounded-lg">Time</div>
                {days.map(day => (
                  <div key={day} className="font-bold text-center p-3 bg-gray-100 rounded-lg">
                    {day}
                  </div>
                ))}

                {/* Time slots */}
                {timeSlots.filter(slot => slot.period !== 0).map((slot, index) => (
                  <React.Fragment key={index}>
                    <div className="text-sm text-center p-3 bg-blue-50 rounded-lg font-medium">
                      {slot.start} - {slot.end}
                    </div>
                    {days.map(day => {
                      const entry = generatedTimetable.find(
                        e => e.day.toLowerCase() === day.toLowerCase() && 
                             e.timeSlot.start === slot.start
                      );
                      return (
                        <div key={`${day}-${slot.start}`} className="text-xs p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                          {entry ? (
                            <div className="space-y-1">
                              <div className="font-medium text-blue-600">{entry.subject}</div>
                              <div className="text-gray-600">{entry.teacher}</div>
                              <div className="text-gray-500">{entry.room}</div>
                            </div>
                          ) : (
                            <div className="text-gray-400 text-center">-</div>
                          )}
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedTimetableGenerator;
