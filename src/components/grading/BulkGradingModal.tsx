import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { useCurrentAcademicInfo } from '@/hooks/useCurrentAcademicInfo';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Save, Send, X } from 'lucide-react';

interface BulkGradingModalProps {
  onClose: () => void;
}

const BulkGradingModal: React.FC<BulkGradingModalProps> = ({ onClose }) => {
  const { schoolId } = useSchoolScopedData();
  const { academicInfo } = useCurrentAcademicInfo(schoolId);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [examType, setExamType] = useState('');
  const [maxScore, setMaxScore] = useState(100);
  const [grades, setGrades] = useState<Record<string, { score: number; isAbsent: boolean }>>({});

  // Fetch classes with proper school isolation
  const { data: classes, isLoading: loadingClasses } = useQuery({
    queryKey: ['classes', schoolId],
    queryFn: async () => {
      if (!schoolId) return [];
      const { data, error } = await supabase
        .from('classes')
        .select('id, name')
        .eq('school_id', schoolId)
        .order('name');
      
      if (error) throw new Error(error.message);
      return data || [];
    },
    enabled: !!schoolId,
  });

  // Fetch subjects for selected class with proper school isolation
  const { data: subjects, isLoading: loadingSubjects } = useQuery({
    queryKey: ['subjects', schoolId, selectedClass],
    queryFn: async () => {
      if (!schoolId) return [];
      
      let query = supabase
        .from('subjects')
        .select('id, name, code')
        .eq('school_id', schoolId);
      
      // If a class is selected, filter subjects by class or show all subjects
      if (selectedClass) {
        query = query.or(`class_id.eq.${selectedClass},class_id.is.null`);
      }
      
      const { data, error } = await query.order('name');
      
      if (error) throw new Error(error.message);
      return data || [];
    },
    enabled: !!schoolId,
  });

  // Fetch students for selected class with proper school isolation
  const { data: students, isLoading: loadingStudents } = useQuery({
    queryKey: ['students', schoolId, selectedClass],
    queryFn: async () => {
      if (!schoolId || !selectedClass) return [];
      
      // First get students directly from the class
      const { data: classStudents, error: classError } = await supabase
        .from('students')
        .select('id, name, admission_number')
        .eq('school_id', schoolId)
        .eq('class_id', selectedClass)
        .eq('is_active', true)
        .order('name');

      if (classError) {
        console.error('Error fetching students from class:', classError);
        // Fallback: try student_classes table
        const { data: studentClassData, error: scError } = await supabase
          .from('student_classes')
          .select(`
            students!inner(id, name, admission_number)
          `)
          .eq('school_id', schoolId)
          .eq('class_id', selectedClass)
          .eq('is_active', true);

        if (scError) throw new Error(scError.message);
        
        return studentClassData?.map(sc => sc.students).filter(Boolean) || [];
      }
      
      return classStudents || [];
    },
    enabled: !!schoolId && !!selectedClass,
  });

  // Save grades mutation
  const saveGrades = useMutation({
    mutationFn: async () => {
      if (!schoolId || !selectedClass || !selectedSubject || !academicInfo.term || !academicInfo.year) {
        throw new Error('Missing required information');
      }

      const gradesToSave = Object.entries(grades)
        .filter(([_, grade]) => !grade.isAbsent && grade.score !== undefined)
        .map(([studentId, grade]) => ({
          student_id: studentId,
          class_id: selectedClass,
          subject_id: selectedSubject,
          school_id: schoolId,
          score: grade.score,
          max_score: maxScore,
          term: academicInfo.term,
          exam_type: examType || 'CONTINUOUS_ASSESSMENT',
          status: 'draft',
          submitted_by: null, // Will be set by RLS
          submitted_at: new Date().toISOString(),
        }));

      if (gradesToSave.length === 0) {
        throw new Error('No grades to save');
      }

      const { error } = await supabase
        .from('grades')
        .upsert(gradesToSave, {
          onConflict: 'student_id,subject_id,class_id,term,exam_type',
          ignoreDuplicates: false
        });

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Grades saved successfully." });
      queryClient.invalidateQueries({ queryKey: ['grades'] });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: 'destructive' });
    }
  });

  const handleScoreChange = (studentId: string, score: string) => {
    const numScore = parseFloat(score);
    if (!isNaN(numScore) && numScore >= 0 && numScore <= maxScore) {
      setGrades(prev => ({
        ...prev,
        [studentId]: { ...prev[studentId], score: numScore, isAbsent: false }
      }));
    }
  };

  const handleAbsentToggle = (studentId: string) => {
    setGrades(prev => ({
      ...prev,
      [studentId]: { 
        ...prev[studentId], 
        isAbsent: !prev[studentId]?.isAbsent,
        score: prev[studentId]?.isAbsent ? 0 : undefined
      }
    }));
  };

  const canSave = selectedClass && selectedSubject && students && students.length > 0 && Object.keys(grades).length > 0;

  if (!schoolId) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
          </DialogHeader>
          <p>No school assignment found. Please contact your administrator.</p>
          <Button onClick={onClose}>Close</Button>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Bulk Grade Entry
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <Label htmlFor="class">Class</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent>
                  {classes?.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {loadingClasses && <p className="text-xs text-blue-600 mt-1">Loading classes...</p>}
            </div>

            <div>
              <Label htmlFor="subject">Subject</Label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject} disabled={!selectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects?.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name} ({subject.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {loadingSubjects && <p className="text-xs text-blue-600 mt-1">Loading subjects...</p>}
            </div>

            <div>
              <Label htmlFor="examType">Exam Type</Label>
              <Select value={examType} onValueChange={setExamType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Exam Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OPENER">Opener Exam</SelectItem>
                  <SelectItem value="MID_TERM">Mid Term Exam</SelectItem>
                  <SelectItem value="END_TERM">End Term Exam</SelectItem>
                  <SelectItem value="CONTINUOUS_ASSESSMENT">Continuous Assessment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="maxScore">Max Score</Label>
              <Input
                id="maxScore"
                type="number"
                value={maxScore}
                onChange={(e) => setMaxScore(parseInt(e.target.value) || 100)}
                min="1"
                max="1000"
              />
            </div>
          </div>

          {/* Current Academic Info */}
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Badge variant="outline">Term: {academicInfo.term || 'Not Set'}</Badge>
            <Badge variant="outline">Year: {academicInfo.year || 'Not Set'}</Badge>
          </div>

          {/* Students Table */}
          {selectedClass && selectedSubject ? (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Admission Number</TableHead>
                    <TableHead>Score (out of {maxScore})</TableHead>
                    <TableHead>Absent</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingStudents ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-2">Loading students...</p>
                      </TableCell>
                    </TableRow>
                  ) : students && students.length > 0 ? (
                    students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell>{student.admission_number}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            max={maxScore}
                            value={grades[student.id]?.score || ''}
                            onChange={(e) => handleScoreChange(student.id, e.target.value)}
                            disabled={grades[student.id]?.isAbsent}
                            className="w-20"
                            placeholder="0"
                          />
                        </TableCell>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={grades[student.id]?.isAbsent || false}
                            onChange={() => handleAbsentToggle(student.id)}
                            className="h-4 w-4"
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        <p className="text-muted-foreground">
                          {selectedClass 
                            ? "No students found for the selected class. Please check class setup and student assignments."
                            : "Please select a class to view students."
                          }
                        </p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="border rounded-lg p-8 text-center">
              <p className="text-muted-foreground">
                Please select both a class and subject to view students and enter grades.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={() => saveGrades.mutate()} 
              disabled={!canSave || saveGrades.isPending}
            >
              <Save className="h-4 w-4 mr-2" />
              {saveGrades.isPending ? 'Saving...' : 'Save Grades'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BulkGradingModal;
