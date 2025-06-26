
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { Calendar, Clock, Users, BookOpen, Loader2, Plus, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface TimetableGeneratorProps {
  open?: boolean;
  onClose?: () => void;
  onTimetableGenerated?: () => void;
}

interface TimetableEntry {
  id?: string;
  subject_id: string;
  teacher_id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  room?: string;
}

const DAYS_OF_WEEK = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' }
];

const TIME_SLOTS = [
  '08:00', '08:40', '09:20', '10:00', '10:40', '11:20', '12:00', '12:40', 
  '13:20', '14:00', '14:40', '15:20', '16:00', '16:40'
];

const TimetableGenerator: React.FC<TimetableGeneratorProps> = ({
  open = false,
  onClose,
  onTimetableGenerated
}) => {
  const [selectedClass, setSelectedClass] = useState('');
  const [timetableEntries, setTimetableEntries] = useState<TimetableEntry[]>([]);
  const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null);

  const { toast } = useToast();
  const { schoolId } = useSchoolScopedData();
  const queryClient = useQueryClient();

  // Get classes
  const { data: classes = [] } = useQuery({
    queryKey: ['classes', schoolId],
    queryFn: async () => {
      if (!schoolId) return [];
      const { data, error } = await supabase
        .from('classes')
        .select('id, name, level, stream')
        .eq('school_id', schoolId)
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!schoolId
  });

  // Get subjects for selected class
  const { data: subjects = [] } = useQuery({
    queryKey: ['subjects', selectedClass, schoolId],
    queryFn: async () => {
      if (!selectedClass || !schoolId) return [];
      const { data, error } = await supabase
        .from('subjects')
        .select('id, name, code, teacher_id, profiles!subjects_teacher_id_fkey(name)')
        .eq('class_id', selectedClass)
        .eq('school_id', schoolId)
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedClass && !!schoolId
  });

  // Get teachers
  const { data: teachers = [] } = useQuery({
    queryKey: ['teachers', schoolId],
    queryFn: async () => {
      if (!schoolId) return [];
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email')
        .eq('school_id', schoolId)
        .eq('role', 'teacher')
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!schoolId
  });

  // Get existing timetable
  const { data: existingTimetable = [] } = useQuery({
    queryKey: ['timetable', selectedClass, schoolId],
    queryFn: async () => {
      if (!selectedClass || !schoolId) return [];
      const { data, error } = await supabase
        .from('timetables')
        .select(`
          id, subject_id, teacher_id, day_of_week, start_time, end_time, room,
          subjects(name),
          profiles!timetables_teacher_id_fkey(name)
        `)
        .eq('class_id', selectedClass)
        .eq('school_id', schoolId)
        .order('day_of_week')
        .order('start_time');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedClass && !!schoolId
  });

  // Save timetable mutation
  const saveTimetableMutation = useMutation({
    mutationFn: async (entries: TimetableEntry[]) => {
      if (!selectedClass || !schoolId) throw new Error('Missing class or school');

      // Delete existing timetable entries
      await supabase
        .from('timetables')
        .delete()
        .eq('class_id', selectedClass)
        .eq('school_id', schoolId);

      // Insert new entries
      const timetableData = entries.map(entry => ({
        school_id: schoolId,
        class_id: selectedClass,
        subject_id: entry.subject_id,
        teacher_id: entry.teacher_id,
        day_of_week: entry.day_of_week,
        start_time: entry.start_time,
        end_time: entry.end_time,
        room: entry.room || null,
        is_published: true
      }));

      const { error } = await supabase
        .from('timetables')
        .insert(timetableData);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Timetable Saved",
        description: "Timetable has been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['timetable'] });
      onTimetableGenerated?.();
    },
    onError: (error: any) => {
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save timetable.",
        variant: "destructive"
      });
    }
  });

  const addTimetableEntry = () => {
    const newEntry: TimetableEntry = {
      subject_id: '',
      teacher_id: '',
      day_of_week: 'monday',
      start_time: '08:00',
      end_time: '08:40',
      room: ''
    };
    setTimetableEntries([...timetableEntries, newEntry]);
    setEditingEntry(newEntry);
  };

  const updateTimetableEntry = (index: number, field: keyof TimetableEntry, value: string) => {
    const updatedEntries = [...timetableEntries];
    updatedEntries[index] = { ...updatedEntries[index], [field]: value };
    setTimetableEntries(updatedEntries);
  };

  const removeTimetableEntry = (index: number) => {
    const updatedEntries = timetableEntries.filter((_, i) => i !== index);
    setTimetableEntries(updatedEntries);
  };

  const handleAutoGenerate = () => {
    if (!subjects.length) {
      toast({
        title: "No Subjects",
        description: "Please add subjects to the class first.",
        variant: "destructive"
      });
      return;
    }

    const newEntries: TimetableEntry[] = [];
    let dayIndex = 0;
    let timeIndex = 0;

    subjects.forEach((subject, index) => {
      if (timeIndex >= TIME_SLOTS.length - 1) {
        dayIndex++;
        timeIndex = 0;
      }

      if (dayIndex >= DAYS_OF_WEEK.length) {
        dayIndex = 0;
      }

      const startTime = TIME_SLOTS[timeIndex];
      const endTime = TIME_SLOTS[timeIndex + 1];

      newEntries.push({
        subject_id: subject.id,
        teacher_id: subject.teacher_id || (teachers[0]?.id || ''),
        day_of_week: DAYS_OF_WEEK[dayIndex].value,
        start_time: startTime,
        end_time: endTime,
        room: `Room ${index + 1}`
      });

      timeIndex++;
    });

    setTimetableEntries(newEntries);
    toast({
      title: "Timetable Generated",
      description: "Auto-generated timetable based on subjects.",
    });
  };

  const handleSave = () => {
    if (!timetableEntries.length) {
      toast({
        title: "No Entries",
        description: "Please add timetable entries first.",
        variant: "destructive"
      });
      return;
    }

    // Validate entries
    const invalidEntries = timetableEntries.filter(entry => 
      !entry.subject_id || !entry.teacher_id || !entry.day_of_week || !entry.start_time || !entry.end_time
    );

    if (invalidEntries.length > 0) {
      toast({
        title: "Invalid Entries",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    saveTimetableMutation.mutate(timetableEntries);
  };

  const handleClose = () => {
    setSelectedClass('');
    setTimetableEntries([]);
    setEditingEntry(null);
    onClose?.();
  };

  // Load existing timetable when class is selected
  React.useEffect(() => {
    if (existingTimetable.length > 0) {
      const entries = existingTimetable.map(item => ({
        id: item.id,
        subject_id: item.subject_id,
        teacher_id: item.teacher_id,
        day_of_week: item.day_of_week,
        start_time: item.start_time,
        end_time: item.end_time,
        room: item.room || ''
      }));
      setTimetableEntries(entries);
    } else {
      setTimetableEntries([]);
    }
  }, [existingTimetable]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Timetable Generator
          </DialogTitle>
          <DialogDescription>
            Create and manage class timetables for teachers and students
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Class Selection</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="class">Select Class</Label>
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name} {cls.stream && `- ${cls.stream}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedClass && (
                  <div className="flex items-end gap-2">
                    <Button onClick={handleAutoGenerate} variant="outline">
                      <BookOpen className="mr-2 h-4 w-4" />
                      Auto Generate
                    </Button>
                    <Button onClick={addTimetableEntry}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Entry
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {selectedClass && (
            <Card>
              <CardHeader>
                <CardTitle>Timetable Entries</CardTitle>
              </CardHeader>
              <CardContent>
                {timetableEntries.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No timetable entries yet. Click "Add Entry" or "Auto Generate" to start.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Subject</TableHead>
                          <TableHead>Teacher</TableHead>
                          <TableHead>Day</TableHead>
                          <TableHead>Start Time</TableHead>
                          <TableHead>End Time</TableHead>
                          <TableHead>Room</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {timetableEntries.map((entry, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Select 
                                value={entry.subject_id} 
                                onValueChange={(value) => updateTimetableEntry(index, 'subject_id', value)}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue placeholder="Subject" />
                                </SelectTrigger>
                                <SelectContent>
                                  {subjects.map((subject) => (
                                    <SelectItem key={subject.id} value={subject.id}>
                                      {subject.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Select 
                                value={entry.teacher_id} 
                                onValueChange={(value) => updateTimetableEntry(index, 'teacher_id', value)}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue placeholder="Teacher" />
                                </SelectTrigger>
                                <SelectContent>
                                  {teachers.map((teacher) => (
                                    <SelectItem key={teacher.id} value={teacher.id}>
                                      {teacher.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Select 
                                value={entry.day_of_week} 
                                onValueChange={(value) => updateTimetableEntry(index, 'day_of_week', value)}
                              >
                                <SelectTrigger className="w-28">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {DAYS_OF_WEEK.map((day) => (
                                    <SelectItem key={day.value} value={day.value}>
                                      {day.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Select 
                                value={entry.start_time} 
                                onValueChange={(value) => updateTimetableEntry(index, 'start_time', value)}
                              >
                                <SelectTrigger className="w-20">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {TIME_SLOTS.map((time) => (
                                    <SelectItem key={time} value={time}>
                                      {time}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Select 
                                value={entry.end_time} 
                                onValueChange={(value) => updateTimetableEntry(index, 'end_time', value)}
                              >
                                <SelectTrigger className="w-20">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {TIME_SLOTS.map((time) => (
                                    <SelectItem key={time} value={time}>
                                      {time}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Input
                                value={entry.room || ''}
                                onChange={(e) => updateTimetableEntry(index, 'room', e.target.value)}
                                placeholder="Room"
                                className="w-20"
                              />
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeTimetableEntry(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            {selectedClass && timetableEntries.length > 0 && (
              <Button 
                onClick={handleSave} 
                disabled={saveTimetableMutation.isPending}
              >
                {saveTimetableMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Clock className="mr-2 h-4 w-4" />
                    Save Timetable
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TimetableGenerator;
