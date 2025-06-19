
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import BulkGradingControls from './BulkGradingControls';
import BulkGradingSheet from './BulkGradingSheet';
import BulkGradingHeader from './BulkGradingHeader';
import { useBulkGradingPermissions } from './BulkGradingPermissions';
import { useBulkGradingDataLoader } from './BulkGradingDataLoader';
import { useBulkGradingSubmissionHandler } from './BulkGradingSubmissionHandler';
import { Loader2, Send, CheckCircle, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import { useToast } from '@/hooks/use-toast';

interface BulkGradingModalProps {
  open: boolean;
  onClose: () => void;
  classList: any[];
  subjectList: any[];
}

type GradeValue = {
  score?: number | null;
  letter_grade?: string | null;
  cbc_performance_level?: string | null;
  percentage?: number | null;
};

const BulkGradingModal: React.FC<BulkGradingModalProps> = ({ open, onClose, classList, subjectList }) => {
  const { user } = useAuth();
  const { schoolId } = useSchoolScopedData();
  const { toast } = useToast();

  const [selectedClass, setSelectedClass] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [selectedExamType, setSelectedExamType] = useState('');
  const [existingGradesStatus, setExistingGradesStatus] = useState<string>('');
  const [isReadOnly, setIsReadOnly] = useState(false);

  const curriculumType = 'standard'; // Default to standard for now
  const isTeacher = user?.role === 'teacher';
  const isPrincipal = user?.role === 'principal';

  // Permission management
  const { updatePermissions } = useBulkGradingPermissions({
    existingGradesStatus,
    isPrincipal,
    setIsReadOnly,
    setExistingGradesStatus
  });

  // Data loading
  const {
    classes,
    academicTerms,
    subjects,
    students,
    grades,
    setGrades,
    loading,
    initialLoading
  } = useBulkGradingDataLoader({
    schoolId: schoolId || '',
    selectedClass,
    selectedTerm,
    selectedExamType,
    userId: user?.id,
    isTeacher,
    updatePermissions
  });

  // Submission handling
  const { handleSubmit, submitting } = useBulkGradingSubmissionHandler({
    schoolId: schoolId || '',
    selectedClass,
    selectedTerm,
    selectedExamType,
    userId: user?.id,
    isTeacher,
    onClose
  });

  // Auto-select current term when terms are loaded
  React.useEffect(() => {
    if (academicTerms.length > 0 && !selectedTerm) {
      const currentTerm = academicTerms.find(term => term.is_current) || academicTerms[0];
      setSelectedTerm(currentTerm.term_name);
    }
  }, [academicTerms, selectedTerm]);

  const handleGradeChange = (studentId: string, subjectId: string, value: GradeValue) => {
    if (isReadOnly) {
      toast({
        title: "Read Only Mode",
        description: "These grades have been submitted and cannot be modified.",
        variant: "destructive"
      });
      return;
    }
    
    setGrades(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [subjectId]: { ...(prev[studentId]?.[subjectId] || {}), ...value },
      },
    }));
  };

  const handleGradeSubmission = async () => {
    try {
      await handleSubmit(grades);
      toast({
        title: "Grades Submitted Successfully",
        description: isTeacher 
          ? "Your grades have been submitted for principal approval." 
          : "Grades have been saved successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit grades. Please try again.",
        variant: "destructive"
      });
    }
  };

  const canProceed = selectedClass && selectedTerm && selectedExamType;
  const hasData = Array.isArray(students) && students.length > 0 && Array.isArray(subjects) && subjects.length > 0;

  // Count grades entered
  const gradesEntered = React.useMemo(() => {
    let count = 0;
    Object.values(grades).forEach(studentGrades => {
      Object.values(studentGrades).forEach(grade => {
        if (grade.score && grade.score > 0) count++;
      });
    });
    return count;
  }, [grades]);

  const totalPossibleGrades = students.length * subjects.length;

  console.log('Render state:', { 
    canProceed, 
    hasData, 
    studentsLength: students?.length || 0, 
    subjectsLength: subjects?.length || 0,
    loading,
    initialLoading,
    gradesEntered,
    totalPossibleGrades
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[98vw] h-[98vh] flex flex-col">
        <BulkGradingHeader
          isTeacher={isTeacher}
          isPrincipal={isPrincipal}
          existingGradesStatus={existingGradesStatus}
          isReadOnly={isReadOnly}
        />
        
        {initialLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading grading interface...</span>
          </div>
        ) : (
          <>
            <BulkGradingControls
              classes={classes}
              academicTerms={academicTerms}
              selectedClass={selectedClass}
              onClassChange={setSelectedClass}
              selectedTerm={selectedTerm}
              onTermChange={setSelectedTerm}
              selectedExamType={selectedExamType}
              onExamTypeChange={setSelectedExamType}
            />

            {loading && !initialLoading && (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading class data...</span>
              </div>
            )}

            {!canProceed && !initialLoading && (
              <div className="flex-grow flex items-center justify-center">
                <Alert className="max-w-md">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Please select a class, term, and exam type to load the grading interface.
                  </AlertDescription>
                </Alert>
              </div>
            )}
            
            {canProceed && !loading && hasData && (
              <>
                {/* Progress Indicator */}
                <div className="px-4 py-2 bg-blue-50 border-b">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-blue-700 font-medium">
                      Progress: {gradesEntered} of {totalPossibleGrades} grades entered
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${totalPossibleGrades > 0 ? (gradesEntered / totalPossibleGrades) * 100 : 0}%` }}
                        ></div>
                      </div>
                      <span className="text-blue-600 font-semibold">
                        {totalPossibleGrades > 0 ? Math.round((gradesEntered / totalPossibleGrades) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex-grow overflow-hidden">
                  <BulkGradingSheet
                    students={students}
                    subjects={subjects}
                    grades={grades}
                    onGradeChange={handleGradeChange}
                    curriculumType={curriculumType}
                    isReadOnly={isReadOnly}
                    selectedClass={selectedClass}
                    selectedTerm={selectedTerm}
                    selectedExamType={selectedExamType}
                  />
                </div>
              </>
            )}

            {canProceed && !loading && !hasData && (
              <div className="flex-grow flex items-center justify-center">
                <Alert variant="default" className="max-w-lg">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {(!students || students.length === 0) && (!subjects || subjects.length === 0)
                      ? "No students or subjects found for the selected class. Please ensure the class has students enrolled and subjects assigned."
                      : (!students || students.length === 0)
                      ? "No students found for the selected class. Please ensure students are enrolled in this class."
                      : isTeacher
                      ? "No subjects found that you are assigned to teach for this class. Please contact your principal to assign you to subjects for this class."
                      : "No subjects found for the selected class. Please ensure subjects are properly assigned to this class."
                    }
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </>
        )}

        <DialogFooter className="border-t pt-4 bg-gray-50">
          <div className="flex items-center justify-between w-full">
            <div className="text-sm text-gray-600">
              {canProceed && hasData && (
                <>
                  {isReadOnly ? (
                    <span className="text-orange-600 font-medium">✓ Grades submitted - Read only mode</span>
                  ) : (
                    <span>
                      {gradesEntered > 0 ? `${gradesEntered} grades entered` : 'No grades entered yet'}
                    </span>
                  )}
                </>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose} disabled={submitting}>
                Cancel
              </Button>
              {canProceed && hasData && !isReadOnly && gradesEntered > 0 && (
                <Button 
                  onClick={handleGradeSubmission} 
                  disabled={submitting}
                  className={isTeacher ? "bg-blue-600 hover:bg-blue-700" : ""}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                      {isTeacher ? 'Submitting for Approval...' : 'Saving...'}
                    </>
                  ) : (
                    <>
                      {isTeacher ? (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Submit for Principal Approval
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Save Grades
                        </>
                      )}
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkGradingModal;
