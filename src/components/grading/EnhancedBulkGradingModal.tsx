import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { EnhancedGradingSheet } from './EnhancedGradingSheet';
import { CBCGradingSheet } from './CBCGradingSheet';
import { IGCSEGradingSheet } from './IGCSEGradingSheet';
import { GradingWorkflowPanel } from './GradingWorkflowPanel';
import { AlertTriangle, FileSpreadsheet, Save, Send, X } from 'lucide-react';

interface EnhancedBulkGradingModalProps {
  open: boolean;
  onClose: () => void;
}

export const EnhancedBulkGradingModal: React.FC<EnhancedBulkGradingModalProps> = ({
  open,
  onClose
}) => {
  const { user } = useAuth();
  const { schoolId } = useSchoolScopedData();
  const { toast } = useToast();

  const [selectedClass, setSelectedClass] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [selectedExamType, setSelectedExamType] = useState('');
  const [curriculumType, setCurriculumType] = useState('standard');
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [grades, setGrades] = useState<Record<string, Record<string, any>>>({});
  const [batchId, setBatchId] = useState<string | null>(null);
  const [batchStatus, setBatchStatus] = useState<string>('draft');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Load classes on component mount
  useEffect(() => {
    if (schoolId && user) {
      loadClasses();
    }
  }, [schoolId, user]);

  // Load students and subjects when class is selected
  useEffect(() => {
    if (selectedClass && schoolId) {
      loadStudentsAndSubjects();
      checkExistingBatch();
    }
  }, [selectedClass, selectedTerm, selectedExamType, schoolId]);

  const loadClasses = async () => {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('school_id', schoolId)
        .order('name');

      if (error) throw error;
      setClasses(data || []);
    } catch (error) {
      console.error('Error loading classes:', error);
      toast({
        title: "Error",
        description: "Failed to load classes",
        variant: "destructive",
      });
    }
  };

  const loadStudentsAndSubjects = async () => {
    setLoading(true);
    try {
      // Load students
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .eq('class_id', selectedClass)
        .eq('school_id', schoolId)
        .eq('is_active', true)
        .order('name');

      if (studentsError) throw studentsError;

      // Load subjects
      const { data: subjectsData, error: subjectsError } = await supabase
        .from('subjects')
        .select('*')
        .eq('class_id', selectedClass)
        .eq('school_id', schoolId)
        .eq('is_active', true)
        .order('name');

      if (subjectsError) throw subjectsError;

      // Get curriculum type from school
      const { data: schoolData, error: schoolError } = await supabase
        .from('schools')
        .select('curriculum_type')
        .eq('id', schoolId)
        .single();

      if (schoolError) throw schoolError;

      setStudents(studentsData || []);
      setSubjects(subjectsData || []);
      setCurriculumType(schoolData?.curriculum_type || 'standard');

    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load students and subjects",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkExistingBatch = async () => {
    if (!selectedClass || !selectedTerm || !selectedExamType) return;

    try {
      const { data, error } = await supabase
        .from('grade_submission_batches')
        .select('*')
        .eq('school_id', schoolId)
        .eq('class_id', selectedClass)
        .eq('term', selectedTerm)
        .eq('exam_type', selectedExamType)
        .eq('submitted_by', user?.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        const batch = data[0];
        setBatchId(batch.id);
        setBatchStatus(batch.status);
        loadExistingGrades(batch.id);
      } else {
        setBatchId(null);
        setBatchStatus('draft');
        setGrades({});
      }
    } catch (error) {
      console.error('Error checking existing batch:', error);
    }
  };

  const loadExistingGrades = async (batchId: string) => {
    try {
      const { data, error } = await supabase
        .from('grades')
        .select('*')
        .eq('submission_batch_id', batchId);

      if (error) throw error;

      const gradesMap: Record<string, Record<string, any>> = {};
      data?.forEach(grade => {
        if (!gradesMap[grade.student_id]) {
          gradesMap[grade.student_id] = {};
        }
        gradesMap[grade.student_id][grade.subject_id] = {
          score: grade.score,
          coursework_score: grade.coursework_score,
          exam_score: grade.exam_score,
          letter_grade: grade.letter_grade,
          competency_level: grade.competency_level,
          strand_scores: grade.strand_scores,
          isAbsent: grade.score === null && grade.comments?.includes('absent'),
          comments: grade.comments
        };
      });

      setGrades(gradesMap);
    } catch (error) {
      console.error('Error loading existing grades:', error);
    }
  };

  const handleGradeChange = (studentId: string, subjectId: string, value: any) => {
    setGrades(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [subjectId]: value
      }
    }));
  };

  const saveDraft = async () => {
    setSaving(true);
    try {
      let currentBatchId = batchId;

      // Create batch if it doesn't exist
      if (!currentBatchId) {
        const { data: newBatch, error: batchError } = await supabase
          .from('grade_submission_batches')
          .insert({
            school_id: schoolId,
            class_id: selectedClass,
            term: selectedTerm,
            exam_type: selectedExamType,
            curriculum_type: curriculumType,
            batch_name: `${selectedClass}_${selectedTerm}_${selectedExamType}`,
            academic_year: new Date().getFullYear().toString(),
            submitted_by: user?.id,
            total_students: students.length,
            status: 'draft'
          })
          .select()
          .single();

        if (batchError) throw batchError;
        currentBatchId = newBatch.id;
        setBatchId(currentBatchId);
      }

      // Prepare grades for upsert
      const gradesToUpsert = [];
      for (const studentId in grades) {
        for (const subjectId in grades[studentId]) {
          const grade = grades[studentId][subjectId];
          if (grade && (grade.score !== undefined || grade.coursework_score !== undefined || grade.exam_score !== undefined)) {
            gradesToUpsert.push({
              school_id: schoolId,
              student_id: studentId,
              subject_id: subjectId,
              class_id: selectedClass,
              term: selectedTerm,
              exam_type: selectedExamType,
              curriculum_type: curriculumType,
              score: grade.score,
              coursework_score: grade.coursework_score,
              exam_score: grade.exam_score,
              letter_grade: grade.letter_grade,
              competency_level: grade.competency_level,
              strand_scores: grade.strand_scores,
              comments: grade.isAbsent ? 'Student was absent' : grade.comments,
              submitted_by: user?.id,
              submission_batch_id: currentBatchId,
              approval_workflow_stage: 'draft',
              status: 'draft'
            });
          }
        }
      }

      if (gradesToUpsert.length > 0) {
        const { error } = await supabase
          .from('grades')
          .upsert(gradesToUpsert, {
            onConflict: 'school_id,student_id,subject_id,class_id,term,exam_type'
          });

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Draft saved successfully",
      });

    } catch (error) {
      console.error('Error saving draft:', error);
      toast({
        title: "Error",
        description: "Failed to save draft",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const submitForApproval = async () => {
    setSubmitting(true);
    try {
      // First save as draft
      await saveDraft();

      // Update batch status to submitted
      if (batchId) {
        const { error } = await supabase
          .from('grade_submission_batches')
          .update({
            status: 'submitted',
            submitted_at: new Date().toISOString()
          })
          .eq('id', batchId);

        if (error) throw error;

        // Update all grades in batch to submitted status
        const { error: gradesError } = await supabase
          .from('grades')
          .update({
            approval_workflow_stage: 'submitted',
            status: 'submitted'
          })
          .eq('submission_batch_id', batchId);

        if (gradesError) throw gradesError;

        setBatchStatus('submitted');

        toast({
          title: "Success",
          description: "Grades submitted for principal approval",
        });

        onClose();
      }

    } catch (error) {
      console.error('Error submitting grades:', error);
      toast({
        title: "Error",
        description: "Failed to submit grades for approval",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const canEdit = batchStatus === 'draft' || batchStatus === 'rejected';
  const hasGrades = Object.keys(grades).length > 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              <DialogTitle>Enhanced Grade Sheet</DialogTitle>
              <Badge variant={batchStatus === 'draft' ? 'secondary' : 
                           batchStatus === 'submitted' ? 'default' : 
                           batchStatus === 'approved' ? 'default' : 'destructive'}>
                {batchStatus}
              </Badge>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Selection Controls */}
          <div className="flex gap-4 mt-4">
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map(cls => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedTerm} onValueChange={setSelectedTerm}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Term" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Term 1">Term 1</SelectItem>
                <SelectItem value="Term 2">Term 2</SelectItem>
                <SelectItem value="Term 3">Term 3</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedExamType} onValueChange={setSelectedExamType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Exam Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Opener">Opener</SelectItem>
                <SelectItem value="Mid Term">Mid Term</SelectItem>
                <SelectItem value="End Term">End Term</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {!selectedClass || !selectedTerm || !selectedExamType ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center text-gray-500">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
                <p>Please select class, term, and exam type to continue</p>
              </div>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <Tabs defaultValue="grading" className="h-full">
              <TabsList className="mx-6 mt-4">
                <TabsTrigger value="grading">Grade Entry</TabsTrigger>
                <TabsTrigger value="workflow">Workflow Status</TabsTrigger>
              </TabsList>
              
              <TabsContent value="grading" className="h-full mt-4 px-6">
                {curriculumType === 'cbc' ? (
                  <CBCGradingSheet
                    students={students}
                    subjects={subjects}
                    grades={grades}
                    onGradeChange={handleGradeChange}
                    isReadOnly={!canEdit}
                    selectedClass={selectedClass}
                    selectedTerm={selectedTerm}
                    selectedExamType={selectedExamType}
                  />
                ) : curriculumType === 'igcse' ? (
                  <IGCSEGradingSheet
                    students={students}
                    subjects={subjects}
                    grades={grades}
                    onGradeChange={handleGradeChange}
                    isReadOnly={!canEdit}
                    selectedClass={selectedClass}
                    selectedTerm={selectedTerm}
                    selectedExamType={selectedExamType}
                  />
                ) : (
                  <EnhancedGradingSheet
                    students={students}
                    subjects={subjects}
                    grades={grades}
                    onGradeChange={handleGradeChange}
                    curriculumType={curriculumType}
                    isReadOnly={!canEdit}
                    selectedClass={selectedClass}
                    selectedTerm={selectedTerm}
                    selectedExamType={selectedExamType}
                  />
                )}
              </TabsContent>
              
              <TabsContent value="workflow" className="h-full mt-4 px-6">
                <GradingWorkflowPanel
                  batchId={batchId}
                  batchStatus={batchStatus}
                  selectedClass={selectedClass}
                  selectedTerm={selectedTerm}
                  selectedExamType={selectedExamType}
                />
              </TabsContent>
            </Tabs>
          )}
        </div>

        {/* Footer Actions */}
        {selectedClass && selectedTerm && selectedExamType && !loading && canEdit && (
          <div className="border-t p-6">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {hasGrades ? `${Object.keys(grades).length} students with grades entered` : 'No grades entered yet'}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={saveDraft}
                  disabled={saving || !hasGrades}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Draft'}
                </Button>
                <Button
                  onClick={submitForApproval}
                  disabled={submitting || !hasGrades}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {submitting ? 'Submitting...' : 'Submit for Approval'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
