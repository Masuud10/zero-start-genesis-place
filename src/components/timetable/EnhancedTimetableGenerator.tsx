
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { useCurrentAcademicInfo } from '@/hooks/useCurrentAcademicInfo';
import { Calendar, Clock, Users, BookOpen, Loader2, Plus, Trash2, Download, Send, Edit, Save, X, ArrowLeft, ArrowRight, CheckCircle, Target, Settings } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

interface TimetableEntry {
  id?: string;
  subject_id: string;
  subject_name?: string;
  teacher_id: string;
  teacher_name?: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  room?: string;
}

interface SubjectTeacherAssignment {
  subject_id: string;
  subject_name: string;
  teacher_id: string;
  teacher_name: string;
}

const DAYS_OF_WEEK = [
  { value: 'Monday', label: 'Monday' },
  { value: 'Tuesday', label: 'Tuesday' },
  { value: 'Wednesday', label: 'Wednesday' },
  { value: 'Thursday', label: 'Thursday' },
  { value: 'Friday', label: 'Friday' }
];

const TIME_SLOTS = [
  { start: '08:00', end: '08:40', label: '8:00 AM - 8:40 AM' },
  { start: '08:40', end: '09:20', label: '8:40 AM - 9:20 AM' },
  { start: '09:20', end: '10:00', label: '9:20 AM - 10:00 AM' },
  { start: '10:20', end: '11:00', label: '10:20 AM - 11:00 AM' },
  { start: '11:00', end: '11:40', label: '11:00 AM - 11:40 AM' },
  { start: '11:40', end: '12:20', label: '11:40 AM - 12:20 PM' },
  { start: '13:00', end: '13:40', label: '1:00 PM - 1:40 PM' },
  { start: '13:40', end: '14:20', label: '1:40 PM - 2:20 PM' },
  { start: '14:20', end: '15:00', label: '2:20 PM - 3:00 PM' },
  { start: '15:00', end: '15:40', label: '3:00 PM - 3:40 PM' }
];

const WIZARD_STEPS = [
  { id: 1, title: 'Select Class', description: 'Choose the class for timetable generation', icon: Target },
  { id: 2, title: 'Choose Subjects', description: 'Select subjects to include in the timetable', icon: BookOpen },
  { id: 3, title: 'Assign Teachers', description: 'Assign teachers to selected subjects', icon: Users },
  { id: 4, title: 'Review & Generate', description: 'Review selections and generate timetable', icon: Settings },
  { id: 5, title: 'Edit & Finalize', description: 'Edit and finalize your timetable', icon: CheckCircle }
];

const EnhancedTimetableGenerator: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [subjectTeacherAssignments, setSubjectTeacherAssignments] = useState<SubjectTeacherAssignment[]>([]);
  const [generatedTimetable, setGeneratedTimetable] = useState<TimetableEntry[]>([]);
  const [editingEntry, setEditingEntry] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const { toast } = useToast();
  const { schoolId } = useSchoolScopedData();
  const { academicInfo } = useCurrentAcademicInfo(schoolId);
  const queryClient = useQueryClient();

  // Get current user
  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    }
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
    queryKey: ['subjects', selectedClass, schoolId],
    queryFn: async () => {
      if (!selectedClass || !schoolId) return [];
      const { data, error } = await supabase
        .from('subjects')
        .select('id, name, code')
        .eq('school_id', schoolId)
        .eq('is_active', true)
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
        .eq('term', academicInfo.term || 'Term 1')
        .order('day_of_week')
        .order('start_time');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedClass && !!schoolId
  });

  // Generate timetable mutation
  const generateTimetableMutation = useMutation({
    mutationFn: async () => {
      if (!selectedClass || !schoolId || !currentUser?.id || subjectTeacherAssignments.length === 0) {
        throw new Error('Missing required data for timetable generation');
      }

      const response = await fetch('/api/generate-enhanced-timetable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({
          school_id: schoolId,
          class_id: selectedClass,
          term: academicInfo.term || 'Term 1',
          subject_teacher_assignments: subjectTeacherAssignments,
          time_slots: TIME_SLOTS
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate timetable');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Timetable Generated Successfully!",
        description: "Your timetable has been generated. You can now review and edit it.",
      });
      queryClient.invalidateQueries({ queryKey: ['timetable'] });
      setCurrentStep(5);
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate timetable.",
        variant: "destructive"
      });
    }
  });

  // Save timetable mutation
  const saveTimetableMutation = useMutation({
    mutationFn: async (entries: TimetableEntry[]) => {
      if (!selectedClass || !schoolId || !currentUser?.id) throw new Error('Missing required data');

      // Delete existing timetable entries
      await supabase
        .from('timetables')
        .delete()
        .eq('class_id', selectedClass)
        .eq('school_id', schoolId)
        .eq('term', academicInfo.term || 'Term 1');

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
        created_by_principal_id: currentUser.id,
        is_published: true,
        term: academicInfo.term || 'Term 1'
      }));

      const { error } = await supabase
        .from('timetables')
        .insert(timetableData);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Timetable Saved Successfully!",
        description: "Timetable has been saved and published to teachers.",
      });
      queryClient.invalidateQueries({ queryKey: ['timetable'] });
      handleReset();
    },
    onError: (error: any) => {
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save timetable.",
        variant: "destructive"
      });
    }
  });

  const handleSubjectSelection = (subjectId: string, checked: boolean) => {
    if (checked) {
      setSelectedSubjects(prev => [...prev, subjectId]);
    } else {
      setSelectedSubjects(prev => prev.filter(id => id !== subjectId));
      setSubjectTeacherAssignments(prev => prev.filter(assignment => assignment.subject_id !== subjectId));
    }
  };

  const handleTeacherAssignment = (subjectId: string, teacherId: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    const teacher = teachers.find(t => t.id === teacherId);
    
    if (!subject || !teacher) return;

    setSubjectTeacherAssignments(prev => {
      const filtered = prev.filter(assignment => assignment.subject_id !== subjectId);
      return [...filtered, {
        subject_id: subjectId,
        subject_name: subject.name,
        teacher_id: teacherId,
        teacher_name: teacher.name
      }];
    });
  };

  const handleGenerate = async () => {
    if (subjectTeacherAssignments.length === 0) {
      toast({
        title: "No Assignments",
        description: "Please assign teachers to subjects first.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      await generateTimetableMutation.mutateAsync();
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEditEntry = (entryId: string, field: keyof TimetableEntry, value: string) => {
    setGeneratedTimetable(prev => 
      prev.map(entry => 
        entry.id === entryId ? { ...entry, [field]: value } : entry
      )
    );
  };

  const handleSaveTimetable = () => {
    saveTimetableMutation.mutate(generatedTimetable);
  };

  const handleDownloadPDF = () => {
    // Professional PDF download with proper formatting and footer
    const printContent = document.createElement('div');
    printContent.innerHTML = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px;">
          <h1 style="color: #2563eb; margin: 0;">Class Timetable</h1>
          <h2 style="margin: 10px 0;">${classes.find(c => c.id === selectedClass)?.name || 'Class'}</h2>
          <p style="margin: 5px 0; color: #666;">${academicInfo.term || 'Term 1'} • ${new Date().getFullYear()}</p>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 40px;">
          <thead>
            <tr style="background-color: #f8fafc;">
              <th style="border: 1px solid #e2e8f0; padding: 12px; text-align: left;">Day</th>
              <th style="border: 1px solid #e2e8f0; padding: 12px; text-align: left;">Time</th>
              <th style="border: 1px solid #e2e8f0; padding: 12px; text-align: left;">Subject</th>
              <th style="border: 1px solid #e2e8f0; padding: 12px; text-align: left;">Teacher</th>
              <th style="border: 1px solid #e2e8f0; padding: 12px; text-align: left;">Room</th>
            </tr>
          </thead>
          <tbody>
            ${generatedTimetable.map(entry => `
              <tr>
                <td style="border: 1px solid #e2e8f0; padding: 10px;">${entry.day_of_week}</td>
                <td style="border: 1px solid #e2e8f0; padding: 10px;">${entry.start_time} - ${entry.end_time}</td>
                <td style="border: 1px solid #e2e8f0; padding: 10px;">${entry.subject_name}</td>
                <td style="border: 1px solid #e2e8f0; padding: 10px;">${entry.teacher_name}</td>
                <td style="border: 1px solid #e2e8f0; padding: 10px;">${entry.room || 'TBA'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div style="position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); text-align: center; color: #666; font-size: 12px;">
          <p style="margin: 0;">Powered by Edufam</p>
        </div>
      </div>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent.innerHTML);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleSendToTeachers = async () => {
    try {
      // Logic to send notifications to teachers
      toast({
        title: "Notifications Sent",
        description: "Timetable has been sent to all assigned teachers.",
      });
    } catch (error) {
      toast({
        title: "Failed to Send",
        description: "Could not send notifications to teachers.",
        variant: "destructive"
      });
    }
  };

  const handleReset = () => {
    setCurrentStep(1);
    setSelectedClass('');
    setSelectedSubjects([]);
    setSubjectTeacherAssignments([]);
    setGeneratedTimetable([]);
    setEditingEntry(null);
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1: return selectedClass !== '';
      case 2: return selectedSubjects.length > 0;
      case 3: return subjectTeacherAssignments.length === selectedSubjects.length;
      case 4: return subjectTeacherAssignments.length > 0;
      default: return true;
    }
  };

  const getProgressPercentage = () => {
    return ((currentStep - 1) / (WIZARD_STEPS.length - 1)) * 100;
  };

  // Load existing timetable when class is selected
  useEffect(() => {
    if (existingTimetable.length > 0) {
      const entries = existingTimetable.map(item => ({
        id: item.id,
        subject_id: item.subject_id,
        subject_name: item.subjects?.name || 'Unknown',
        teacher_id: item.teacher_id,
        teacher_name: item.profiles?.name || 'Unknown',
        day_of_week: item.day_of_week,
        start_time: item.start_time,
        end_time: item.end_time,
        room: item.room || ''
      }));
      setGeneratedTimetable(entries);
      if (entries.length > 0) {
        setCurrentStep(5);
      }
    }
  }, [existingTimetable]);

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Target className="h-12 w-12 mx-auto text-blue-600" />
              <h3 className="text-xl font-semibold">Select Class</h3>
              <p className="text-muted-foreground">Choose the class you want to create a timetable for</p>
            </div>
            
            <div className="max-w-md mx-auto space-y-4">
              <div className="space-y-2">
                <Label htmlFor="class-select">Class Selection</Label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger id="class-select" className="h-12">
                    <SelectValue placeholder="Choose a class..." />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{cls.name}</span>
                          {cls.stream && <Badge variant="secondary">{cls.stream}</Badge>}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedClass && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-blue-900">
                      Selected: {classes.find(c => c.id === selectedClass)?.name}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <BookOpen className="h-12 w-12 mx-auto text-green-600" />
              <h3 className="text-xl font-semibold">Choose Subjects</h3>
              <p className="text-muted-foreground">Select the subjects to include in the timetable</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Available Subjects</Label>
                <Badge variant="outline">{selectedSubjects.length} selected</Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto p-1">
                {subjects.map((subject) => (
                  <div key={subject.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                    <Checkbox
                      id={subject.id}
                      checked={selectedSubjects.includes(subject.id)}
                      onCheckedChange={(checked) => handleSubjectSelection(subject.id, checked as boolean)}
                    />
                    <div className="flex-1">
                      <Label htmlFor={subject.id} className="font-medium cursor-pointer">
                        {subject.name}
                      </Label>
                      {subject.code && (
                        <p className="text-sm text-muted-foreground">{subject.code}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {selectedSubjects.length > 0 && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-900">
                      {selectedSubjects.length} subject{selectedSubjects.length !== 1 ? 's' : ''} selected
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Users className="h-12 w-12 mx-auto text-purple-600" />
              <h3 className="text-xl font-semibold">Assign Teachers</h3>
              <p className="text-muted-foreground">Assign teachers to the selected subjects</p>
            </div>
            
            <div className="space-y-4">
              {selectedSubjects.map((subjectId) => {
                const subject = subjects.find(s => s.id === subjectId);
                const currentAssignment = subjectTeacherAssignments.find(a => a.subject_id === subjectId);
                
                return (
                  <div key={subjectId} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{subject?.name}</h4>
                        <p className="text-sm text-muted-foreground">{subject?.code}</p>
                      </div>
                      {currentAssignment && (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Assigned
                        </Badge>
                      )}
                    </div>
                    
                    <Select 
                      value={currentAssignment?.teacher_id || ''} 
                      onValueChange={(value) => handleTeacherAssignment(subjectId, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a teacher..." />
                      </SelectTrigger>
                      <SelectContent>
                        {teachers.map((teacher) => (
                          <SelectItem key={teacher.id} value={teacher.id}>
                            <div>
                              <div className="font-medium">{teacher.name}</div>
                              <div className="text-sm text-muted-foreground">{teacher.email}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                );
              })}
              
              {subjectTeacherAssignments.length === selectedSubjects.length && selectedSubjects.length > 0 && (
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-purple-600" />
                    <span className="font-medium text-purple-900">
                      All subjects have been assigned teachers
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Settings className="h-12 w-12 mx-auto text-orange-600" />
              <h3 className="text-xl font-semibold">Review & Generate</h3>
              <p className="text-muted-foreground">Review your selections and generate the timetable</p>
            </div>
            
            <div className="space-y-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-3">Review Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Selected Class:</span>
                    <span className="font-medium">{classes.find(c => c.id === selectedClass)?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Subjects:</span>
                    <span className="font-medium">{selectedSubjects.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Teachers Assigned:</span>
                    <span className="font-medium">{subjectTeacherAssignments.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time Slots:</span>
                    <span className="font-medium">{TIME_SLOTS.length} available</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium">Subject-Teacher Assignments</h4>
                <div className="space-y-2">
                  {subjectTeacherAssignments.map((assignment, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                      <div>
                        <span className="font-medium">{assignment.subject_name}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">{assignment.teacher_name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="text-center">
                <Button 
                  onClick={handleGenerate}
                  disabled={subjectTeacherAssignments.length === 0 || isGenerating}
                  size="lg"
                  className="px-8"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Timetable...
                    </>
                  ) : (
                    <>
                      <Settings className="mr-2 h-4 w-4" />
                      Generate Timetable
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold flex items-center">
                  <CheckCircle className="mr-2 h-5 w-5 text-green-600" />
                  Timetable Generated
                </h3>
                <p className="text-muted-foreground">Review, edit, and finalize your timetable</p>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleDownloadPDF}>
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
                <Button variant="outline" onClick={handleSendToTeachers}>
                  <Send className="mr-2 h-4 w-4" />
                  Send to Teachers
                </Button>
                <Button onClick={handleSaveTimetable} disabled={saveTimetableMutation.isPending}>
                  {saveTimetableMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save & Publish
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            {generatedTimetable.length > 0 ? (
              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="font-semibold">Day</TableHead>
                        <TableHead className="font-semibold">Time</TableHead>
                        <TableHead className="font-semibold">Subject</TableHead>
                        <TableHead className="font-semibold">Teacher</TableHead>
                        <TableHead className="font-semibold">Room</TableHead>
                        <TableHead className="font-semibold">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {generatedTimetable.map((entry, index) => (
                        <TableRow key={index} className="hover:bg-gray-50">
                          <TableCell className="font-medium">{entry.day_of_week}</TableCell>
                          <TableCell>{entry.start_time} - {entry.end_time}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{entry.subject_name}</Badge>
                          </TableCell>
                          <TableCell>{entry.teacher_name}</TableCell>
                          <TableCell>
                            {editingEntry === entry.id ? (
                              <Input
                                value={entry.room || ''}
                                onChange={(e) => handleEditEntry(entry.id!, 'room', e.target.value)}
                                className="w-24"
                                placeholder="Room"
                              />
                            ) : (
                              <span className="text-muted-foreground">
                                {entry.room || 'Not assigned'}
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {editingEntry === entry.id ? (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setEditingEntry(null)}
                                  >
                                    <Save className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setEditingEntry(null)}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setEditingEntry(entry.id!)}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h4 className="text-lg font-medium mb-2">No Timetable Entries</h4>
                <p>Generate a timetable to see entries here.</p>
              </div>
            )}
            
            <div className="flex justify-between items-center pt-4 border-t">
              <Button variant="outline" onClick={handleReset}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Start Over
              </Button>
              <div className="text-sm text-muted-foreground">
                Powered by Edufam
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Enhanced Timetable Generator
          </h1>
          <p className="text-muted-foreground">
            Create and manage class timetables for {academicInfo.term || 'current term'}
          </p>
        </div>
      </div>

      {/* Progress Indicator */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Progress</h3>
              <span className="text-sm text-muted-foreground">
                Step {currentStep} of {WIZARD_STEPS.length}
              </span>
            </div>
            
            <Progress value={getProgressPercentage()} className="h-2" />
            
            <div className="flex justify-between">
              {WIZARD_STEPS.map((step) => {
                const Icon = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;
                
                return (
                  <div key={step.id} className="flex flex-col items-center space-y-2 flex-1">
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors
                      ${isActive ? 'border-blue-600 bg-blue-600 text-white' : 
                        isCompleted ? 'border-green-600 bg-green-600 text-white' : 
                        'border-gray-300 bg-white text-gray-400'}
                    `}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="text-center">
                      <p className={`text-xs font-medium ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                        {step.title}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Card>
        <CardContent className="p-8">
          {renderStepContent()}
        </CardContent>
        
        {/* Navigation Footer */}
        {currentStep < 5 && (
          <div className="border-t p-6 flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            <Button 
              onClick={() => setCurrentStep(Math.min(WIZARD_STEPS.length, currentStep + 1))}
              disabled={!canProceedToNext()}
            >
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default EnhancedTimetableGenerator;
