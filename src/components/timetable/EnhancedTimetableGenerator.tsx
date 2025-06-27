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
import { Calendar, Clock, Users, BookOpen, Loader2, Plus, Trash2, Download, Send, Eye, AlertTriangle, CheckCircle, Save, Wand2 } from 'lucide-react';
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
  const [isGenerating, setIsGenerating] = useState(false);

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

  // Get classes for the school
  const { data: classes = [] } = useQuery({
    queryKey: ['classes', schoolId],
    queryFn: async () => {
      if (!schoolId) return [];
      const { data, error } = await supabase
        .from('classes')
        .select('id, name, level, stream, capacity')
        .eq('school_id', schoolId)
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!schoolId
  });

  // Get subjects for selected class with teacher assignments
  const { data: subjects = [] } = useQuery({
    queryKey: ['class-subjects', selectedClass, schoolId],
    queryFn: async () => {
      if (!selectedClass || !schoolId) return [];
      
      const { data, error } = await supabase
        .from('subject_teacher_assignments')
        .select(`
          id,
          subject_id,
          teacher_id,
          subjects!inner(id, name, code),
          profiles!subject_teacher_assignments_teacher_id_fkey(id, name, email)
        `)
        .eq('class_id', selectedClass)
        .eq('school_id', schoolId)
        .eq('is_active', true);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedClass && !!schoolId
  });

  // Get all teachers for the school
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
          id, subject_id, teacher_id, day_of_week, start_time, end_time, room, is_published,
          subjects(id, name, code),
          profiles!timetables_teacher_id_fkey(id, name, email)
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

  // Check for conflicts in timetable entries
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
    if (entry.room && entry.room.trim() !== '') {
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

  // Smart auto-generate timetable with improved conflict resolution
  const handleAutoGenerate = async () => {
    if (!subjects.length) {
      toast({
        title: "No Subjects Available",
        description: "Please ensure subjects are assigned to teachers for this class first.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const entries: TimetableEntry[] = [];
      const usedSlots = new Set<string>();
      const teacherSchedule = new Map<string, Set<string>>();
      const roomSchedule = new Map<string, Set<string>>();
      
      // Create balanced distribution with improved logic
      let currentDay = 0;
      let currentPeriod = 0;
      const maxPeriodsPerDay = 8;
      const availableRooms = Array.from({ length: 20 }, (_, i) => `Room ${i + 1}`);
      
      // Sort subjects by priority (core subjects first)
      const sortedSubjects = [...subjects].sort((a, b) => {
        const aIsMath = a.subjects?.name?.toLowerCase().includes('math') ? 1 : 0;
        const bIsMath = b.subjects?.name?.toLowerCase().includes('math') ? 1 : 0;
        const aIsEnglish = a.subjects?.name?.toLowerCase().includes('english') ? 1 : 0;
        const bIsEnglish = b.subjects?.name?.toLowerCase().includes('english') ? 1 : 0;
        return (bIsMath + bIsEnglish) - (aIsMath + aIsEnglish);
      });

      sortedSubjects.forEach((subjectAssignment, subjectIndex) => {
        let placed = false;
        let attempts = 0;
        
        while (!placed && attempts < 100) {
          const dayOfWeek = DAYS_OF_WEEK[currentDay % DAYS_OF_WEEK.length].value;
          const startTime = TIME_SLOTS[currentPeriod];
          const endTime = TIME_SLOTS[currentPeriod + 1];
          
          if (!endTime) {
            currentDay++;
            currentPeriod = 0;
            attempts++;
            continue;
          }
          
          // Skip break times
          if (startTime === '10:40' || startTime === '12:40') {
            currentPeriod++;
            attempts++;
            continue;
          }
          
          const slotKey = `${dayOfWeek}-${startTime}`;
          const teacherSlotKey = `${subjectAssignment.teacher_id}-${dayOfWeek}-${startTime}`;
          
          // Check if slot is available and teacher is free
          if (!usedSlots.has(slotKey) && !teacherSchedule.get(subjectAssignment.teacher_id)?.has(`${dayOfWeek}-${startTime}`)) {
            // Find available room
            let assignedRoom = '';
            for (const room of availableRooms) {
              const roomSlotKey = `${room}-${dayOfWeek}-${startTime}`;
              if (!roomSchedule.get(room)?.has(`${dayOfWeek}-${startTime}`)) {
                assignedRoom = room;
                break;
              }
            }
            
            entries.push({
              subject_id: subjectAssignment.subject_id,
              teacher_id: subjectAssignment.teacher_id,
              day_of_week: dayOfWeek,
              start_time: startTime,
              end_time: endTime,
              room: assignedRoom || `Room ${subjectIndex + 1}`
            });
            
            usedSlots.add(slotKey);
            
            // Track teacher's schedule
            if (!teacherSchedule.has(subjectAssignment.teacher_id)) {
              teacherSchedule.set(subjectAssignment.teacher_id, new Set());
            }
            teacherSchedule.get(subjectAssignment.teacher_id)?.add(`${dayOfWeek}-${startTime}`);
            
            // Track room schedule
            if (assignedRoom) {
              if (!roomSchedule.has(assignedRoom)) {
                roomSchedule.set(assignedRoom, new Set());
              }
              roomSchedule.get(assignedRoom)?.add(`${dayOfWeek}-${startTime}`);
            }
            
            placed = true;
          }
          
          currentPeriod++;
          if (currentPeriod >= maxPeriodsPerDay - 1) {
            currentDay++;
            currentPeriod = 0;
          }
          
          attempts++;
        }
        
        if (!placed) {
          console.warn(`Could not place subject: ${subjectAssignment.subjects?.name}`);
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
        title: "Timetable Generated Successfully",
        description: `Generated ${entries.length} timetable entries with advanced conflict resolution.`,
      });
      
    } catch (error) {
      console.error('Error generating timetable:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate timetable. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
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
        title: "Timetable Saved Successfully",
        description: "Timetable has been saved and published. Teachers can now view their schedules.",
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

  // Enhanced send timetable to teachers mutation
  const sendToTeachersMutation = useMutation({
    mutationFn: async () => {
      if (!selectedClass || !schoolId) throw new Error('Missing class or school data');
      
      // Get unique teacher IDs from current timetable
      const teacherIds = [...new Set(existingTimetable.map(entry => entry.teacher_id))];
      
      if (teacherIds.length === 0) {
        throw new Error('No teachers assigned to this timetable');
      }
      
      // Create notifications for teachers
      const notifications = teacherIds.map(teacherId => ({
        school_id: schoolId,
        title: 'New Timetable Available',
        content: `Your timetable for ${classes.find(c => c.id === selectedClass)?.name} - ${currentTerm} has been updated. Please check your dashboard to view your schedule.`,
        target_audience: 'teacher',
        created_by: currentUser?.id,
        is_global: false,
        priority: 'high',
        auto_archive_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // Archive after 7 days
      }));

      const { error } = await supabase
        .from('announcements')
        .insert(notifications);

      if (error) throw error;
      
      return { teacherIds, classId: selectedClass, notificationCount: notifications.length };
    },
    onSuccess: (data) => {
      toast({
        title: "Timetable Distributed Successfully",
        description: `Timetable has been sent to ${data.teacherIds.length} teacher(s). They will receive notifications on their dashboard.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Distribution Failed",
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
    
    // Auto-calculate end time when start time changes
    if (field === 'start_time') {
      const startIndex = TIME_SLOTS.indexOf(value);
      if (startIndex !== -1 && startIndex < TIME_SLOTS.length - 1) {
        updatedEntries[index].end_time = TIME_SLOTS[startIndex + 1];
      }
    }
    
    setTimetableEntries(updatedEntries);

    // Check conflicts for this entry
    const conflict = checkConflicts(updatedEntries[index], index);
    setConflicts(prev => ({ ...prev, [index]: conflict }));
  };

  const removeTimetableEntry = (index: number) => {
    const updatedEntries = timetableEntries.filter((_, i) => i !== index);
    setTimetableEntries(updatedEntries);
    
    // Remove conflict for this index and reindex remaining conflicts
    const newConflicts: { [key: number]: ConflictCheck } = {};
    updatedEntries.forEach((entry, newIndex) => {
      newConflicts[newIndex] = checkConflicts(entry, newIndex);
    });
    setConflicts(newConflicts);
  };

  const handleSave = () => {
    if (!timetableEntries.length) {
      toast({
        title: "No Entries to Save",
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
        title: "Incomplete Entries",
        description: "Please fill in all required fields for all entries.",
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
      
      // Check conflicts for existing entries
      const newConflicts: { [key: number]: ConflictCheck } = {};
      entries.forEach((entry, index) => {
        newConflicts[index] = checkConflicts(entry, index);
      });
      setConflicts(newConflicts);
    } else {
      setTimetableEntries([]);
      setConflicts({});
    }
  }, [existingTimetable]);

  const selectedClassData = classes.find(c => c.id === selectedClass);
  const hasConflicts = Object.values(conflicts).some(c => c.hasConflict);
  const totalEntries = timetableEntries.length;
  const validEntries = timetableEntries.filter(entry => 
    entry.subject_id && entry.teacher_id && entry.day_of_week && entry.start_time && entry.end_time
  ).length;

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
              <Label htmlFor="term">Academic Term</Label>
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

          {/* Progress Indicator */}
          {selectedClass && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-800">Timetable Progress</span>
                <span className="text-sm text-blue-600">{validEntries}/{totalEntries} entries complete</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: totalEntries > 0 ? `${(validEntries / totalEntries) * 100}%` : '0%' }}
                ></div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {selectedClass && (
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={handleAutoGenerate} 
                disabled={isGenerating}
                className="bg-green-600 hover:bg-green-700"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Smart Generate
                  </>
                )}
              </Button>
              <Button onClick={addTimetableEntry} variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add Manual Entry
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
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {sendToTeachersMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="mr-2 h-4 w-4" />
                    )}
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

          {/* Subject Availability Info */}
          {selectedClass && subjects.length === 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                No subjects found for this class. Please assign subjects and teachers to this class first.
              </AlertDescription>
            </Alert>
          )}

          {/* Conflict Alert */}
          {hasConflicts && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Scheduling Conflicts Detected!</strong> Please resolve all conflicts before saving the timetable.
              </AlertDescription>
            </Alert>
          )}

          {/* Timetable Entries Table */}
          {selectedClass && timetableEntries.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Timetable Entries</span>
                  <div className="flex items-center gap-2">
                    {hasConflicts ? (
                      <div className="flex items-center gap-1 text-red-600">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-sm">Conflicts</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm">No Conflicts</span>
                      </div>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Subject</TableHead>
                        <TableHead>Teacher</TableHead>
                        <TableHead>Day</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Room</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {timetableEntries.map((entry, index) => (
                        <TableRow 
                          key={index}
                          className={conflicts[index]?.hasConflict ? 'bg-red-50 border-red-200' : ''}
                        >
                          <TableCell>
                            <Select 
                              value={entry.subject_id} 
                              onValueChange={(value) => updateTimetableEntry(index, 'subject_id', value)}
                            >
                              <SelectTrigger className="w-36">
                                <SelectValue placeholder="Select Subject" />
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
                              <SelectTrigger className="w-36">
                                <SelectValue placeholder="Select Teacher" />
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
                              <SelectTrigger className="w-32">
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
                            <div className="flex items-center gap-1">
                              <Select 
                                value={entry.start_time} 
                                onValueChange={(value) => updateTimetableEntry(index, 'start_time', value)}
                              >
                                <SelectTrigger className="w-20">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {TIME_SLOTS.slice(0, -1).map((time) => (
                                    <SelectItem key={time} value={time}>
                                      {time}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <span className="text-xs text-gray-500">-</span>
                              <span className="text-xs font-mono">{entry.end_time}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Input
                              value={entry.room || ''}
                              onChange={(e) => updateTimetableEntry(index, 'room', e.target.value)}
                              placeholder="Room"
                              className="w-24"
                            />
                          </TableCell>
                          <TableCell>
                            {conflicts[index]?.hasConflict ? (
                              <div className="flex flex-col">
                                <span className="text-red-600 text-xs font-medium">
                                  {conflicts[index].conflictType === 'teacher' ? 'Teacher Conflict' : 'Room Conflict'}
                                </span>
                                <span className="text-red-500 text-xs">
                                  {conflicts[index].conflictDetails}
                                </span>
                              </div>
                            ) : (
                              <span className="text-green-600 text-xs font-medium flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" />
                                Valid
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeTimetableEntry(index)}
                              className="text-red-600 hover:text-red-700"
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
                className="bg-green-600 hover:bg-green-700"
              >
                {saveTimetableMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
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
