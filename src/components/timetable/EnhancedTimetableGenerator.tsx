
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { useCurrentAcademicInfo } from '@/hooks/useCurrentAcademicInfo';
import { usePrincipalEntityLists } from '@/hooks/usePrincipalEntityLists';
import { useEnhancedTimetable } from '@/hooks/useEnhancedTimetable';
import { 
  Calendar, 
  Clock, 
  Users, 
  BookOpen, 
  ChevronRight, 
  ChevronLeft,
  Download,
  Send,
  Edit,
  Save,
  Eye,
  Plus,
  X
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';

interface SubjectTeacherAssignment {
  subject_id: string;
  subject_name: string;
  teacher_id: string;
  teacher_name: string;
}

interface TimeSlot {
  start: string;
  end: string;
}

interface GeneratedTimetableEntry {
  day: string;
  time: string;
  subject: string;
  teacher: string;
  room?: string;
}

const EnhancedTimetableGenerator = () => {
  const { schoolId } = useSchoolScopedData();
  const { academicInfo } = useCurrentAcademicInfo(schoolId);
  const { toast } = useToast();
  const { generateTimetable, isGenerating } = useEnhancedTimetable();
  const [reloadKey, setReloadKey] = useState(0);
  
  const { 
    classList, 
    subjectList, 
    teacherList, 
    isLoading: entitiesLoading 
  } = usePrincipalEntityLists(reloadKey);

  // Wizard steps
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [subjectTeacherAssignments, setSubjectTeacherAssignments] = useState<SubjectTeacherAssignment[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([
    { start: '08:00', end: '08:40' },
    { start: '08:40', end: '09:20' },
    { start: '09:20', end: '10:00' },
    { start: '10:20', end: '11:00' }, // Break 10:00-10:20
    { start: '11:00', end: '11:40' },
    { start: '11:40', end: '12:20' },
    { start: '13:20', end: '14:00' }, // Lunch 12:20-13:20
    { start: '14:00', end: '14:40' },
    { start: '14:40', end: '15:20' }
  ]);
  const [generatedTimetable, setGeneratedTimetable] = useState<GeneratedTimetableEntry[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  const totalSteps = 6;
  const progress = (currentStep / totalSteps) * 100;

  // Step titles
  const stepTitles = [
    'Select Class',
    'Choose Subjects', 
    'Assign Teachers',
    'Set Time Slots',
    'Generate Timetable',
    'Review & Finalize'
  ];

  // Reset form when class changes
  useEffect(() => {
    if (selectedClass) {
      setSelectedSubjects([]);
      setSubjectTeacherAssignments([]);
      setGeneratedTimetable([]);
      setCurrentStep(2);
    }
  }, [selectedClass]);

  // Filter subjects by selected class - Fixed logic to properly filter subjects
  const classSubjects = subjectList.filter(subject => {
    // If no class is selected, return empty array
    if (!selectedClass) return false;
    
    // If subject has a specific class_id, it must match the selected class
    if (subject.class_id) {
      return subject.class_id === selectedClass;
    }
    
    // If subject has no class_id, it's available to all classes
    return true;
  });

  const handleSubjectSelection = (subjectId: string, checked: boolean) => {
    if (checked) {
      setSelectedSubjects([...selectedSubjects, subjectId]);
    } else {
      setSelectedSubjects(selectedSubjects.filter(id => id !== subjectId));
      // Remove from assignments if unchecked
      setSubjectTeacherAssignments(prev => 
        prev.filter(assignment => assignment.subject_id !== subjectId)
      );
    }
  };

  const handleTeacherAssignment = (subjectId: string, teacherId: string) => {
    const subject = subjectList.find(s => s.id === subjectId);
    const teacher = teacherList.find(t => t.id === teacherId);
    
    if (!subject || !teacher) return;

    setSubjectTeacherAssignments(prev => {
      const existing = prev.find(a => a.subject_id === subjectId);
      if (existing) {
        return prev.map(a => 
          a.subject_id === subjectId 
            ? { ...a, teacher_id: teacherId, teacher_name: teacher.name }
            : a
        );
      } else {
        return [...prev, {
          subject_id: subjectId,
          subject_name: subject.name,
          teacher_id: teacherId,
          teacher_name: teacher.name
        }];
      }
    });
  };

  const handleGenerateTimetable = async () => {
    if (!selectedClass || subjectTeacherAssignments.length === 0 || !schoolId) {
      toast({
        title: "Error",
        description: "Please complete all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const result = await generateTimetable.mutateAsync({
        school_id: schoolId,
        class_id: selectedClass,
        term: academicInfo.term || 'Term 1',
        subject_teacher_assignments: subjectTeacherAssignments,
        time_slots: timeSlots
      });

      if (result) {
        // Generate mock timetable for UI display
        const mockTimetable: GeneratedTimetableEntry[] = [];
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        
        days.forEach(day => {
          timeSlots.forEach((slot, index) => {
            const assignment = subjectTeacherAssignments[index % subjectTeacherAssignments.length];
            mockTimetable.push({
              day,
              time: `${slot.start} - ${slot.end}`,
              subject: assignment.subject_name,
              teacher: assignment.teacher_name,
              room: `Room ${(index % 20) + 1}`
            });
          });
        });

        setGeneratedTimetable(mockTimetable);
        setCurrentStep(6);
      }
    } catch (error) {
      console.error('Timetable generation error:', error);
    }
  };

  const handleDownloadPDF = () => {
    // Create a printable version
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const selectedClassName = classList.find(c => c.id === selectedClass)?.name || 'Class';
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Timetable - ${selectedClassName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .school-name { font-size: 24px; font-weight: bold; color: #1e40af; }
            .class-title { font-size: 18px; margin: 10px 0; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
            th { background-color: #f3f4f6; font-weight: bold; }
            .time-slot { background-color: #fef3c7; font-weight: bold; }
            .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #666; }
            .footer-brand { font-weight: bold; color: #1e40af; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="school-name">School Timetable</div>
            <div class="class-title">${selectedClassName} - ${academicInfo.term || 'Term 1'}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Monday</th>
                <th>Tuesday</th>
                <th>Wednesday</th>
                <th>Thursday</th>
                <th>Friday</th>
              </tr>
            </thead>
            <tbody>
              ${timeSlots.map(slot => {
                const slotEntries = generatedTimetable.filter(entry => 
                  entry.time === `${slot.start} - ${slot.end}`
                );
                
                return `
                  <tr>
                    <td class="time-slot">${slot.start} - ${slot.end}</td>
                    ${['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => {
                      const entry = slotEntries.find(e => e.day === day);
                      return `<td>${entry ? `${entry.subject}<br><small>${entry.teacher}</small><br><small>${entry.room || ''}</small>` : '-'}</td>`;
                    }).join('')}
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
          <div class="footer">
            <div class="footer-brand">Powered by Edufam</div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return selectedClass !== '';
      case 2: return selectedSubjects.length > 0;
      case 3: return subjectTeacherAssignments.length === selectedSubjects.length;
      case 4: return timeSlots.length > 0;
      case 5: return true;
      case 6: return generatedTimetable.length > 0;
      default: return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Select Class</h3>
            </div>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a class to generate timetable for" />
              </SelectTrigger>
              <SelectContent>
                {classList.map(classItem => (
                  <SelectItem key={classItem.id} value={classItem.id}>
                    {classItem.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Choose Subjects</h3>
            </div>
            {classSubjects.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No subjects found for this class.</p>
                <p className="text-sm">Please create subjects first in School Management.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                  {classSubjects.map(subject => (
                    <div key={subject.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={subject.id}
                        checked={selectedSubjects.includes(subject.id)}
                        onCheckedChange={(checked) => 
                          handleSubjectSelection(subject.id, checked as boolean)
                        }
                      />
                      <label htmlFor={subject.id} className="text-sm font-medium">
                        {subject.name} ({subject.code})
                      </label>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground">
                    Selected: {selectedSubjects.length} subjects
                  </p>
                </div>
              </>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Assign Teachers</h3>
            </div>
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {selectedSubjects.map(subjectId => {
                const subject = subjectList.find(s => s.id === subjectId);
                const assignment = subjectTeacherAssignments.find(a => a.subject_id === subjectId);
                
                return (
                  <div key={subjectId} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">{subject?.name}</span>
                    <Select
                      value={assignment?.teacher_id || ''}
                      onValueChange={(teacherId) => handleTeacherAssignment(subjectId, teacherId)}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Select teacher" />
                      </SelectTrigger>
                      <SelectContent>
                        {teacherList.map(teacher => (
                          <SelectItem key={teacher.id} value={teacher.id}>
                            {teacher.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Time Slots</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
              {timeSlots.map((slot, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="font-medium">Period {index + 1}</span>
                  <span className="text-sm text-muted-foreground">
                    {slot.start} - {slot.end}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Default time slots are configured. You can customize these later.
            </p>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Generate Timetable</h3>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Summary</h4>
              <div className="space-y-2 text-sm">
                <p><strong>Class:</strong> {classList.find(c => c.id === selectedClass)?.name}</p>
                <p><strong>Subjects:</strong> {selectedSubjects.length}</p>
                <p><strong>Teachers Assigned:</strong> {subjectTeacherAssignments.length}</p>
                <p><strong>Time Slots:</strong> {timeSlots.length} periods per day</p>
              </div>
            </div>
            <Button 
              onClick={handleGenerateTimetable}
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? 'Generating...' : 'Generate Timetable'}
            </Button>
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Review & Finalize</h3>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
                  <Edit className="h-4 w-4 mr-2" />
                  {isEditing ? 'Stop Editing' : 'Edit'}
                </Button>
                <Button onClick={handleDownloadPDF}>
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
            
            {/* Timetable Preview */}
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-blue-50 p-3 text-center">
                <h4 className="font-semibold">
                  {classList.find(c => c.id === selectedClass)?.name} - {academicInfo.term || 'Term 1'}
                </h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="p-2 border text-left">Time</th>
                      <th className="p-2 border text-center">Monday</th>
                      <th className="p-2 border text-center">Tuesday</th>
                      <th className="p-2 border text-center">Wednesday</th>
                      <th className="p-2 border text-center">Thursday</th>
                      <th className="p-2 border text-center">Friday</th>
                    </tr>
                  </thead>
                  <tbody>
                    {timeSlots.map((slot, index) => {
                      const slotEntries = generatedTimetable.filter(entry => 
                        entry.time === `${slot.start} - ${slot.end}`
                      );
                      
                      return (
                        <tr key={index}>
                          <td className="p-2 border bg-yellow-50 font-medium">
                            {slot.start} - {slot.end}
                          </td>
                          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => {
                            const entry = slotEntries.find(e => e.day === day);
                            return (
                              <td key={day} className="p-2 border text-center">
                                {entry ? (
                                  <div className="text-xs">
                                    <div className="font-medium">{entry.subject}</div>
                                    <div className="text-muted-foreground">{entry.teacher}</div>
                                    <div className="text-muted-foreground">{entry.room}</div>
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-center">
              <Button size="lg" className="px-8">
                <Save className="h-4 w-4 mr-2" />
                Publish Timetable
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (entitiesLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading timetable generator...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            Timetable Generator
          </CardTitle>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Step {currentStep} of {totalSteps}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step Indicators */}
          <div className="flex items-center justify-between mt-4">
            {stepTitles.map((title, index) => (
              <div
                key={index}
                className={`flex items-center ${index < stepTitles.length - 1 ? 'flex-1' : ''}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    index + 1 <= currentStep
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {index + 1}
                </div>
                <span className={`ml-2 text-sm ${
                  index + 1 <= currentStep ? 'text-blue-600' : 'text-gray-600'
                }`}>
                  {title}
                </span>
                {index < stepTitles.length - 1 && (
                  <div className="flex-1 h-px bg-gray-200 mx-4" />
                )}
              </div>
            ))}
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="min-h-[400px]">
            {renderStepContent()}
          </div>

          <Separator className="my-6" />

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <Button
              onClick={() => setCurrentStep(Math.min(totalSteps, currentStep + 1))}
              disabled={!canProceed() || currentStep === totalSteps}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedTimetableGenerator;
