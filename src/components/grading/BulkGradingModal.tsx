
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
import { Loader2, Send, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';

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
    if (isReadOnly) return;
    
    setGrades(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [subjectId]: { ...(prev[studentId]?.[subjectId] || {}), ...value },
      },
    }));
  };

  const canProceed = selectedClass && selectedTerm && selectedExamType;
  const hasData = Array.isArray(students) && students.length > 0 && Array.isArray(subjects) && subjects.length > 0;

  console.log('Render state:', { 
    canProceed, 
    hasData, 
    studentsLength: students?.length || 0, 
    subjectsLength: subjects?.length || 0,
    loading,
    initialLoading 
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
            <span className="ml-2">Loading...</span>
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
                  <AlertDescription>
                    Please select a class, term, and exam type to load the grading interface.
                  </AlertDescription>
                </Alert>
              </div>
            )}
            
            {canProceed && !loading && hasData && (
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
            )}

            {canProceed && !loading && !hasData && (
              <div className="flex-grow flex items-center justify-center">
                <Alert variant="default" className="max-w-lg">
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

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          {canProceed && hasData && !isReadOnly && (
            <Button 
              onClick={() => handleSubmit(grades)} 
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkGradingModal;
