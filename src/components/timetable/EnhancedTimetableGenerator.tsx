
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, Clock, Users, BookOpen, Shuffle, Save, Trash2, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentAcademicInfo } from '@/hooks/useCurrentAcademicInfo';

interface Class {
  id: string;
  name: string;
}

interface Subject {
  id: string;
  name: string;
  code: string;
  teacher_id?: string;
}

interface Teacher {
  id: string;
  name: string;
}

interface TimetableSlot {
  id?: string;
  day: string;
  period: number;
  startTime: string;
  endTime: string;
  subjectId: string;
  teacherId: string;
  room?: string;
}

interface TimetableConflict {
  type: 'teacher_double_booked' | 'class_double_booked' | 'invalid_time';
  message: string;
  slot: TimetableSlot;
}

const EnhancedTimetableGenerator = () => {
  const { schoolId } = useSchoolScopedData();
  const { user } = useAuth();
  const { academicInfo } = useCurrentAcademicInfo(schoolId);
  const { toast } = useToast();

  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [timetable, setTimetable] = useState<TimetableSlot[]>([]);
  const [conflicts, setConflicts] = useState<TimetableConflict[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimetableSlot | null>(null);

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
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

  // Only principals can manage timetables
  const canManageTimetable = user?.role === 'principal';

  useEffect(() => {
    if (schoolId && canManageTimetable) {
      fetchData();
    }
  }, [schoolId, canManageTimetable]);

  useEffect(() => {
    if (selectedClassId && canManageTimetable) {
      fetchExistingTimetable();
    }
  }, [selectedClassId, canManageTimetable]);

  useEffect(() => {
    validateTimetable();
  }, [timetable]);

  const fetchData = async () => {
    if (!schoolId) return;

    setLoading(true);
    try {
      const [classesRes, subjectsRes, teachersRes] = await Promise.all([
        supabase
          .from('classes')
          .select('id, name')
          .eq('school_id', schoolId)
          .order('name'),
        supabase
          .from('subjects')
          .select('id, name, code, teacher_id')
          .eq('school_id', schoolId)
          .order('name'),
        supabase
          .from('profiles')
          .select('id, name')
          .eq('school_id', schoolId)
          .eq('role', 'teacher')
          .order('name')
      ]);

      if (classesRes.error) throw classesRes.error;
      if (subjectsRes.error) throw subjectsRes.error;
      if (teachersRes.error) throw teachersRes.error;

      setClasses(classesRes.data || []);
      setSubjects(subjectsRes.data || []);
      setTeachers(teachersRes.data || []);

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
        .eq('school_id', schoolId)
        .eq('term', academicInfo.term || '');

      if (error) throw error;

      if (data && data.length > 0) {
        const slots = data.map(item => ({
          id: item.id,
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
      toast({
        title: "Error",
        description: "Failed to load existing timetable: " + error.message,
        variant: "destructive"
      });
    }
  };

  const validateTimetable = () => {
    const newConflicts: TimetableConflict[] = [];
    const teacherSchedule: Map<string, Set<string>> = new Map();
    const classSchedule: Set<string> = new Set();

    timetable.forEach(slot => {
      const slotKey = `${slot.day}-${slot.period}`;
      
      // Check for class double booking
      if (classSchedule.has(slotKey)) {
        newConflicts.push({
          type: 'class_double_booked',
          message: `Class has multiple subjects at ${slot.day} period ${slot.period}`,
          slot
        });
      }
      classSchedule.add(slotKey);

      // Check for teacher double booking
      if (!teacherSchedule.has(slot.teacherId)) {
        teacherSchedule.set(slot.teacherId, new Set());
      }
      const teacherSlots = teacherSchedule.get(slot.teacherId)!;
      if (teacherSlots.has(slotKey)) {
        newConflicts.push({
          type: 'teacher_double_booked',
          message: `Teacher ${getTeacherName(slot.teacherId)} is double booked at ${slot.day} period ${slot.period}`,
          slot
        });
      }
      teacherSlots.add(slotKey);
    });

    setConflicts(newConflicts);
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
        description: "No subjects found for this school",
        variant: "destructive"
      });
      return;
    }

    setGenerating(true);
    try {
      const classSubjects = subjects.filter(s => s.teacher_id); // Only subjects with assigned teachers
      if (classSubjects.length === 0) {
        toast({
          title: "Error",
          description: "No subjects with assigned teachers found",
          variant: "destructive"
        });
        return;
      }

      const newTimetable: TimetableSlot[] = [];
      const subjectDistribution = distributeSubjects(classSubjects);
      let distributionIndex = 0;

      days.forEach((day) => {
        timeSlots.forEach((slot) => {
          if (distributionIndex >= subjectDistribution.length) {
            distributionIndex = 0; // Reset if we run out of subjects
          }

          const subject = subjectDistribution[distributionIndex];
          if (subject && subject.teacher_id) {
            newTimetable.push({
              day: day,
              period: slot.period,
              startTime: slot.startTime,
              endTime: slot.endTime,
              subjectId: subject.id,
              teacherId: subject.teacher_id,
              room: `Room ${Math.floor(Math.random() * 20) + 1}`
            });
          }
          distributionIndex++;
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
        description: "Failed to generate timetable: " + error.message,
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  const distributeSubjects = (subjects: Subject[]) => {
    // Create distribution with core subjects appearing more frequently
    const coreSubjects = ['mathematics', 'english', 'science', 'kiswahili'];
    const distribution: Subject[] = [];

    subjects.forEach(subject => {
      const isCore = coreSubjects.some(core => 
        subject.name.toLowerCase().includes(core)
      );
      
      // Core subjects appear 3 times, others appear once
      const frequency = isCore ? 3 : 1;
      for (let i = 0; i < frequency; i++) {
        distribution.push(subject);
      }
    });

    // Shuffle the distribution
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

    if (conflicts.length > 0) {
      toast({
        title: "Error",
        description: "Please resolve all conflicts before saving",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      // Delete existing timetable for this class and term
      await supabase
        .from('timetables')
        .delete()
        .eq('class_id', selectedClassId)
        .eq('school_id', schoolId)
        .eq('term', academicInfo.term || '');

      // Insert new timetable
      const timetableData = timetable.map(slot => ({
        school_id: schoolId,
        class_id: selectedClassId,
        subject_id: slot.subjectId,
        teacher_id: slot.teacherId,
        day_of_week: slot.day,
        start_time: slot.startTime,
        end_time: slot.endTime,
        room: slot.room,
        created_by_principal_id: user?.id,
        is_published: true,
        term: academicInfo.term || ''
      }));

      const { error } = await supabase
        .from('timetables')
        .insert(timetableData);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Timetable saved successfully",
      });

      // Refresh the timetable
      await fetchExistingTimetable();

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

  const deleteSlot = (day: string, period: number) => {
    setTimetable(prev => prev.filter(slot => !(slot.day === day && slot.period === period)));
  };

  const editSlot = (slot: TimetableSlot) => {
    setEditingSlot(slot);
  };

  const saveEditedSlot = (editedSlot: TimetableSlot) => {
    setTimetable(prev => prev.map(slot => 
      slot.day === editedSlot.day && slot.period === editedSlot.period ? editedSlot : slot
    ));
    setEditingSlot(null);
  };

  const getSubjectName = (subjectId: string) => {
    return subjects.find(s => s.id === subjectId)?.name || 'Unknown';
  };

  const getTeacherName = (teacherId: string) => {
    return teachers.find(t => t.id === teacherId)?.name || 'Unassigned';
  };

  const getTimetableSlot = (day: string, period: number) => {
    return timetable.find(slot => 
      slot.day === day && slot.period === period
    );
  };

  if (!canManageTimetable) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Only principals can manage timetables.</p>
      </div>
    );
  }

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
            Enhanced Timetable Generator
          </h3>
          <p className="text-sm text-muted-foreground">
            Generate and manage class timetables with conflict detection
          </p>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Timetable Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Select Class</Label>
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
              <div>
                <Label>Academic Term</Label>
                <Input value={academicInfo.term || 'Not Set'} disabled />
              </div>
              <div>
                <Label>Academic Year</Label>
                <Input value={academicInfo.year || 'Not Set'} disabled />
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={generateTimetable}
                disabled={!selectedClassId || generating}
              >
                {generating ? (
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                ) : (
                  <Shuffle className="h-4 w-4 mr-2" />
                )}
                Generate Timetable
              </Button>
              <Button
                onClick={saveTimetable}
                disabled={!selectedClassId || timetable.length === 0 || saving || conflicts.length > 0}
                variant="outline"
              >
                {saving ? (
                  <div className="animate-spin h-4 w-4 border-2 border-gray-600 border-t-transparent rounded-full mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Timetable
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conflicts Display */}
      {conflicts.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700">Conflicts Detected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {conflicts.map((conflict, index) => (
                <div key={index} className="text-sm text-red-600">
                  • {conflict.message}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
                      <TableHead key={day} className="text-center min-w-[150px] capitalize">
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
                            <div className="space-y-1 p-2 bg-blue-50 rounded border">
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
                              <div className="flex gap-1 justify-center">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => editSlot(timetableSlot)}
                                  className="h-6 w-6 p-0"
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => deleteSlot(day, slot.period)}
                                  className="h-6 w-6 p-0 text-red-600"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
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

export default EnhancedTimetableGenerator;
