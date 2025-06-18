import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, BookOpen, Shuffle, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { useAuth } from '@/contexts/AuthContext';

interface Class {
  id: string;
  name: string;
}

interface Subject {
  id: string;
  name: string;
  code: string;
  teacher_id?: string;
  school_id: string;
}

interface Teacher {
  id: string;
  name: string;
}

interface TimetableSlot {
  day: string;
  period: number;
  startTime: string;
  endTime: string;
  subjectId: string;
  teacherId: string;
  room?: string;
}

const TimetableGenerator = () => {
  const { schoolId } = useSchoolScopedData();
  const { user } = useAuth();
  const { toast } = useToast();

  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [timetable, setTimetable] = useState<TimetableSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const timeSlots = [
    { period: 1, startTime: '08:00', endTime: '08:40' },
    { period: 2, startTime: '08:40', endTime: '09:20' },
    { period: 3, startTime: '09:20', endTime: '10:00' },
    { period: 4, startTime: '10:20', endTime: '11:00' }, // Break at 10:00-10:20
    { period: 5, startTime: '11:00', endTime: '11:40' },
    { period: 6, startTime: '11:40', endTime: '12:20' },
    { period: 7, startTime: '13:20', endTime: '14:00' }, // Lunch at 12:20-13:20
    { period: 8, startTime: '14:00', endTime: '14:40' },
  ];

  useEffect(() => {
    if (schoolId) {
      fetchData();
    }
  }, [schoolId]);

  useEffect(() => {
    if (selectedClassId) {
      fetchExistingTimetable();
    }
  }, [selectedClassId]);

  const fetchData = async () => {
    if (!schoolId) return;

    setLoading(true);
    try {
      console.log('Fetching timetable data for school:', schoolId);

      // Fetch classes
      const { data: classesData, error: classesError } = await supabase
        .from('classes')
        .select('id, name')
        .eq('school_id', schoolId)
        .order('name');

      if (classesError) {
        console.error('Classes fetch error:', classesError);
        throw classesError;
      }

      // Fetch subjects - now with proper school_id filtering enforced by RLS
      const { data: subjectsData, error: subjectsError } = await supabase
        .from('subjects')
        .select('id, name, code, teacher_id, school_id')
        .eq('school_id', schoolId)
        .order('name');

      if (subjectsError) {
        console.error('Subjects fetch error:', subjectsError);
        throw subjectsError;
      }

      // Fetch teachers
      const { data: teachersData, error: teachersError } = await supabase
        .from('profiles')
        .select('id, name')
        .eq('school_id', schoolId)
        .eq('role', 'teacher')
        .order('name');

      if (teachersError) {
        console.error('Teachers fetch error:', teachersError);
        throw teachersError;
      }

      console.log('Fetched data:', {
        classes: classesData?.length || 0,
        subjects: subjectsData?.length || 0,
        teachers: teachersData?.length || 0
      });

      setClasses(classesData || []);
      setSubjects(subjectsData || []);
      setTeachers(teachersData || []);

      if (!subjectsData || subjectsData.length === 0) {
        toast({
          title: "No Subjects Found",
          description: "Please create subjects first before generating timetables.",
          variant: "destructive"
        });
      }

    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load data: " + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchExistingTimetable = async () => {
    if (!selectedClassId || !schoolId) return;

    try {
      const { data, error } = await supabase
        .from('timetables')
        .select('*')
        .eq('class_id', selectedClassId)
        .eq('school_id', schoolId);

      if (error) throw error;

      if (data && data.length > 0) {
        const slots = data.map(item => ({
          day: item.day_of_week,
          period: timeSlots.findIndex(slot => slot.startTime === item.start_time) + 1,
          startTime: item.start_time,
          endTime: item.end_time,
          subjectId: item.subject_id,
          teacherId: item.teacher_id,
          room: item.room
        }));
        setTimetable(slots);
      } else {
        setTimetable([]);
      }

    } catch (error: any) {
      console.error('Error fetching timetable:', error);
    }
  };

  const generateTimetable = async () => {
    if (!selectedClassId) {
      toast({
        title: "Error",
        description: "Please select a class first",
        variant: "destructive"
      });
      return;
    }

    if (subjects.length === 0) {
      toast({
        title: "Error",
        description: "No subjects found for this school. Please create subjects first.",
        variant: "destructive"
      });
      return;
    }

    setGenerating(true);
    try {
      const newTimetable: TimetableSlot[] = [];
      const subjectDistribution = distributeSubjects(subjects);

      days.forEach((day, dayIndex) => {
        timeSlots.forEach((slot, slotIndex) => {
          // Skip lunch and break periods
          if (slot.period === 4 && slotIndex === 3) return; // Break
          if (slot.period === 7 && slotIndex === 6) return; // Lunch

          const subjectIndex = (dayIndex * timeSlots.length + slotIndex) % subjectDistribution.length;
          const subject = subjectDistribution[subjectIndex];

          newTimetable.push({
            day: day.toLowerCase(),
            period: slot.period,
            startTime: slot.startTime,
            endTime: slot.endTime,
            subjectId: subject.id,
            teacherId: subject.teacher_id || '',
            room: `Room ${Math.floor(Math.random() * 20) + 1}`
          });
        });
      });

      setTimetable(newTimetable);
      toast({
        title: "Success",
        description: "Timetable generated successfully",
      });

    } catch (error: any) {
      console.error('Error generating timetable:', error);
      toast({
        title: "Error",
        description: "Failed to generate timetable",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  const distributeSubjects = (subjects: Subject[]) => {
    // Create a distribution where core subjects appear more frequently
    const coreSubjects = ['Mathematics', 'English', 'Science', 'Kiswahili'];
    const distribution: Subject[] = [];

    subjects.forEach(subject => {
      const isCore = coreSubjects.some(core => 
        subject.name.toLowerCase().includes(core.toLowerCase())
      );
      
      // Core subjects appear 3 times, others appear once
      const frequency = isCore ? 3 : 1;
      for (let i = 0; i < frequency; i++) {
        distribution.push(subject);
      }
    });

    // Shuffle the distribution for randomness
    return distribution.sort(() => Math.random() - 0.5);
  };

  const saveTimetable = async () => {
    if (!selectedClassId || !schoolId || timetable.length === 0) {
      toast({
        title: "Error",
        description: "No timetable to save",
        variant: "destructive"
      });
      return;
    }

    if (!user?.id) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      // Delete existing timetable for this class
      await supabase
        .from('timetables')
        .delete()
        .eq('class_id', selectedClassId)
        .eq('school_id', schoolId);

      // Insert new timetable with the required created_by_principal_id field
      const timetableData = timetable.map(slot => ({
        school_id: schoolId,
        class_id: selectedClassId,
        subject_id: slot.subjectId,
        teacher_id: slot.teacherId,
        day_of_week: slot.day,
        start_time: slot.startTime,
        end_time: slot.endTime,
        room: slot.room,
        created_by_principal_id: user.id, // Add the required field
        is_published: true
      }));

      const { error } = await supabase
        .from('timetables')
        .insert(timetableData);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Timetable saved successfully",
      });

    } catch (error: any) {
      console.error('Error saving timetable:', error);
      toast({
        title: "Error",
        description: "Failed to save timetable: " + error.message,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const getSubjectName = (subjectId: string) => {
    return subjects.find(s => s.id === subjectId)?.name || 'Unknown';
  };

  const getTeacherName = (teacherId: string) => {
    return teachers.find(t => t.id === teacherId)?.name || 'Unassigned';
  };

  const getTimetableSlot = (day: string, period: number) => {
    return timetable.find(slot => 
      slot.day === day.toLowerCase() && slot.period === period
    );
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
        Loading...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Timetable Generator
          </h3>
          <p className="text-sm text-muted-foreground">
            Generate and manage class timetables
          </p>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Generate Timetable</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium">Select Class</label>
              <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={generateTimetable}
              disabled={!selectedClassId || generating || subjects.length === 0}
            >
              {generating ? (
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
              ) : (
                <Shuffle className="h-4 w-4 mr-2" />
              )}
              Generate
            </Button>
            <Button
              onClick={saveTimetable}
              disabled={!selectedClassId || timetable.length === 0 || saving}
              variant="outline"
            >
              {saving ? (
                <div className="animate-spin h-4 w-4 border-2 border-gray-600 border-t-transparent rounded-full mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save
            </Button>
          </div>
          
          {subjects.length === 0 && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                <strong>No subjects found.</strong> Please create subjects first before generating timetables.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timetable Display */}
      {selectedClassId && (
        <Card>
          <CardHeader>
            <CardTitle>
              Timetable for {classes.find(c => c.id === selectedClassId)?.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Time</TableHead>
                    {days.map(day => (
                      <TableHead key={day} className="text-center min-w-[150px]">
                        {day}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {timeSlots.map((slot) => (
                    <TableRow key={slot.period}>
                      <TableCell className="font-medium">
                        <div className="text-sm">
                          <div>{slot.startTime}</div>
                          <div className="text-xs text-muted-foreground">{slot.endTime}</div>
                        </div>
                      </TableCell>
                      {days.map(day => {
                        const timetableSlot = getTimetableSlot(day, slot.period);
                        
                        if (!timetableSlot) {
                          return (
                            <TableCell key={day} className="text-center text-muted-foreground">
                              -
                            </TableCell>
                          );
                        }

                        return (
                          <TableCell key={day} className="text-center">
                            <div className="space-y-1">
                              <Badge variant="secondary" className="text-xs">
                                {getSubjectName(timetableSlot.subjectId)}
                              </Badge>
                              <div className="text-xs text-muted-foreground">
                                {getTeacherName(timetableSlot.teacherId)}
                              </div>
                              {timetableSlot.room && (
                                <div className="text-xs text-muted-foreground">
                                  {timetableSlot.room}
                                </div>
                              )}
                            </div>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TimetableGenerator;
