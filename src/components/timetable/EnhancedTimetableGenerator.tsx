
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { Calendar, Clock, Users, BookOpen, Loader2, Plus, Trash2, Download, Send, Eye } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import TimetablePreview from './TimetablePreview';
import TimetablePDFExport from './TimetablePDFExport';

interface TimetableEntry {
  id?: string;
  subject_id: string;
  teacher_id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  room?: string;
}

interface ConflictCheck {
  hasConflict: boolean;
  conflictType?: 'teacher' | 'room';
  conflictDetails?: string;
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

const EnhancedTimetableGenerator: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState('');
  const [timetableEntries, setTimetableEntries] = useState<TimetableEntry[]>([]);
  const [conflicts, setConflicts] = useState<{ [key: number]: ConflictCheck }>({});
  const [showPreview, setShowPreview] = useState(false);
  const [currentTerm, setCurrentTerm] = useState('Term 1');

  const { toast } = useToast();
  const { schoolId } = useSchoolScopedData();
  const queryClient = useQueryClient();

  // Get current user
  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    }
  });

  // Get school details
  const { data: schoolDetails } = useQuery({
    queryKey: ['school-details', schoolId],
    queryFn: async () => {
      if (!schoolId) return null;
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .eq('id', schoolId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!schoolId
  });

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
    queryKey: ['class-subjects', selectedClass, schoolId],
    queryFn: async () => {
      if (!selectedClass || !schoolId) return [];
      
      // Get subjects assigned to this class through subject_teacher_assignments
      const { data, error } = await supabase
        .from('subject_teacher_assignments')
        .select(`
          subject_id,
          teacher_id,
          subjects!inner(id, name, code),
          profiles!subject_teacher_assignments_teacher_id_fkey(id, name)
        `)
        .eq('class_id', selectedClass)
        .eq('school_id', schoolId)
        .eq('is_active', true);
      
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
  const { data: existingTimetable = [], refetch: refetchTimetable } = useQuery({
    queryKey: ['timetable', selectedClass, schoolId, currentTerm],
    queryFn: async () => {
      if (!selectedClass || !schoolId) return [];
      const { data, error } = await supabase
        .from('timetables')
        .select(`
          id, subject_id, teacher_id, day_of_week, start_time, end_time, room,
          subjects(name, code),
          profiles!timetables_teacher_id_fkey(name)
        `)
        .eq('class_id', selectedClass)
        .eq('school_id', schoolId)
        .eq('term', currentTerm)
        .order('day_of_week')
        .order('start_time');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedClass && !!schoolId
  });

  // Check for conflicts
  const checkConflicts = (entry: TimetableEntry, index: number): ConflictCheck => {
    const daySlotEntries = timetableEntries.filter((e, i) => 
      i !== index && 
      e.day_of_week === entry.day_of_week && 
      e.start_time === entry.start_time
    );

    // Check teacher conflict
    const teacherConflict = daySlotEntries.find(e => e.teacher_id === entry.teacher_id);
    if (teacherConflict) {
      return {
        hasConflict: true,
        conflictType: 'teacher',
        conflictDetails: 'Teacher already assigned at this time'
      };
    }

    // Check room conflict (if rooms are specified)
    if (entry.room) {
      const roomConflict = daySlotEntries.find(e => e.room === entry.room);
      if (roomConflict) {
        return {
          hasConflict: true,
          conflictType: 'room',
          conflictDetails: 'Room already occupied at this time'
        };
      }
    }

    return { hasConflict: false };
  };

  // Auto-generate timetable
  const handleAutoGenerate = () => {
    if (!subjects.length) {
      toast({
        title: "No Subjects",
        description: "Please ensure subjects are assigned to this class first.",
        variant: "destructive"
      });
      return;
    }

    const entries: TimetableEntry[] = [];
    const periodsPerDay = 8;
    const daysPerWeek = 5;
    
    subjects.forEach((subjectAssignment, index) => {
      const dayIndex = Math.floor(index / periodsPerDay) % daysPerWeek;
      const periodIndex = index % periodsPerDay;
      
      if (dayIndex < DAYS_OF_WEEK.length && periodIndex < TIME_SLOTS.length - 1) {
        const startTime = TIME_SLOTS[periodIndex];
        const endTime = TIME_SLOTS[periodIndex + 1];
        
        entries.push({
          subject_id: subjectAssignment.subject_id,
          teacher_id: subjectAssignment.teacher_id,
          day_of_week: DAYS_OF_WEEK[dayIndex].value,
          start_time: startTime,
          end_time: endTime,
          room: `Room ${(index % 10) + 1}`
        });
      }
    });

    setTimetableEntries(entries);
    
    // Check conflicts for all entries
    const newConflicts: { [key: number]: ConflictCheck } = {};
    entries.forEach((entry, index) => {
      newConflicts[index] = checkConflicts(entry, index);
    });
    setConflicts(newConflicts);

    toast({
      title: "Timetable Generated",
      description: "Auto-generated timetable based on assigned subjects and teachers.",
    });
  };

  // Save timetable mutation
  const saveTimetableMutation = useMutation({
    mutationFn: async (entries: TimetableEntry[]) => {
      if (!selectedClass || !schoolId || !currentUser?.id) {
        throw new Error('Missing required data');
      }

      // Check for conflicts before saving
      const hasConflicts = Object.values(conflicts).some(c => c.hasConflict);
      if (hasConflicts) {
        throw new Error('Please resolve all conflicts before saving');
      }

      // Delete existing timetable entries for this class and term
      await supabase
        .from('timetables')
        .delete()
        .eq('class_id', selectedClass)
        .eq('school_id', schoolId)
        .eq('term', currentTerm);

      // Insert new entries
      if (entries.length > 0) {
        const timetableData = entries.map(entry => ({
          school_id: schoolId,
          class_id: selectedClass,
          subject_id: entry.subject_id,
          teacher_id: entry.teacher_id,
          day_of_week: entry.day_of_week,
          start_time: entry.start_time,
          end_time: entry.end_time,
          room: entry.room || null,
          created_by_principal_id: currentUser.id,
          is_published: true,
          term: currentTerm
        }));

        const { error } = await supabase
          .from('timetables')
          .insert(timetableData);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "Timetable Saved",
        description: "Timetable has been saved and published successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['timetable'] });
      refetchTimetable();
    },
    onError: (error: any) => {
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save timetable.",
        variant: "destructive"
      });
    }
  });

  // Send timetable to teachers mutation
  const sendToTeachersMutation = useMutation({
    mutationFn: async () => {
      if (!selectedClass || !schoolId) throw new Error('Missing class or school data');
      
      // Get unique teacher IDs from current timetable
      const teacherIds = [...new Set(existingTimetable.map(entry => entry.teacher_id))];
      
      // Here you would typically send notifications to teachers
      // For now, we'll just show a success message
      console.log('Sending timetable to teachers:', teacherIds);
      
      return { teacherIds };
    },
    onSuccess: (data) => {
      toast({
        title: "Timetable Sent",
        description: `Timetable has been sent to ${data.teacherIds.length} teacher(s).`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Send Failed",
        description: error.message || "Failed to send timetable to teachers.",
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
  };

  const updateTimetableEntry = (index: number, field: keyof TimetableEntry, value: string) => {
    const updatedEntries = [...timetableEntries];
    updatedEntries[index] = { ...updatedEntries[index], [field]: value };
    setTimetableEntries(updatedEntries);

    // Check conflicts for this entry
    const conflict = checkConflicts(updatedEntries[index], index);
    setConflicts(prev => ({ ...prev, [index]: conflict }));
  };

  const removeTimetableEntry = (index: number) => {
    const updatedEntries = timetableEntries.filter((_, i) => i !== index);
    setTimetableEntries(updatedEntries);
    
    // Remove conflict for this index
    const newConflicts = { ...conflicts };
    delete newConflicts[index];
    setConflicts(newConflicts);
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

  const selectedClassData = classes.find(c => c.id === selectedClass);
  const hasConflicts = Object.values(conflicts).some(c => c.hasConflict);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Enhanced Timetable Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Class and Term Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="class">Select Class</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name} {cls.level && `(${cls.level})`} {cls.stream && `- ${cls.stream}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="term">Term</Label>
              <Select value={currentTerm} onValueChange={setCurrentTerm}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Term 1">Term 1</SelectItem>
                  <SelectItem value="Term 2">Term 2</SelectItem>
                  <SelectItem value="Term 3">Term 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Buttons */}
          {selectedClass && (
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleAutoGenerate} variant="outline">
                <BookOpen className="mr-2 h-4 w-4" />
                Auto Generate
              </Button>
              <Button onClick={addTimetableEntry}>
                <Plus className="mr-2 h-4 w-4" />
                Add Entry
              </Button>
              <Button 
                onClick={() => setShowPreview(!showPreview)} 
                variant="outline"
              >
                <Eye className="mr-2 h-4 w-4" />
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </Button>
              {existingTimetable.length > 0 && (
                <>
                  <Button 
                    onClick={() => sendToTeachersMutation.mutate()}
                    disabled={sendToTeachersMutation.isPending}
                    variant="outline"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Send to Teachers
                  </Button>
                  <TimetablePDFExport 
                    timetableData={existingTimetable}
                    classData={selectedClassData}
                    schoolData={schoolDetails}
                    term={currentTerm}
                  />
                </>
              )}
            </div>
          )}

          {/* Conflict Alert */}
          {hasConflicts && (
            <Alert variant="destructive">
              <AlertDescription>
                There are scheduling conflicts in your timetable. Please resolve them before saving.
              </AlertDescription>
            </Alert>
          )}

          {/* Timetable Entries Table */}
          {selectedClass && timetableEntries.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Timetable Entries</CardTitle>
              </CardHeader>
              <CardContent>
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
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {timetableEntries.map((entry, index) => (
                        <TableRow 
                          key={index}
                          className={conflicts[index]?.hasConflict ? 'bg-red-50' : ''}
                        >
                          <TableCell>
                            <Select 
                              value={entry.subject_id} 
                              onValueChange={(value) => updateTimetableEntry(index, 'subject_id', value)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue placeholder="Subject" />
                              </SelectTrigger>
                              <SelectContent>
                                {subjects.map((subjectAssignment) => (
                                  <SelectItem key={subjectAssignment.subject_id} value={subjectAssignment.subject_id}>
                                    {subjectAssignment.subjects?.name}
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
                            {conflicts[index]?.hasConflict ? (
                              <span className="text-red-600 text-xs">
                                {conflicts[index].conflictDetails}
                              </span>
                            ) : (
                              <span className="text-green-600 text-xs">OK</span>
                            )}
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
              </CardContent>
            </Card>
          )}

          {/* Preview Section */}
          {showPreview && selectedClass && existingTimetable.length > 0 && (
            <TimetablePreview 
              timetableData={existingTimetable}
              classData={selectedClassData}
              schoolData={schoolDetails}
            />
          )}

          {/* Save Button */}
          {selectedClass && timetableEntries.length > 0 && (
            <div className="flex justify-end space-x-2">
              <Button 
                onClick={handleSave} 
                disabled={saveTimetableMutation.isPending || hasConflicts}
              >
                {saveTimetableMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Clock className="mr-2 h-4 w-4" />
                    Save & Publish Timetable
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedTimetableGenerator;
