
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import GradesForm from '../GradesForm';
import CBCGradesForm from '../CBCGradesForm';

interface GradeFormFieldsProps {
  curriculumType: string;
  classes: any[];
  selectedClass: string;
  setSelectedClass: (value: string) => void;
  subjects: any[];
  selectedSubject: string;
  setSelectedSubject: (value: string) => void;
  students: any[];
  selectedStudent: string;
  setSelectedStudent: (value: string) => void;
  selectedTerm: string;
  setSelectedTerm: (value: string) => void;
  selectedExamType: string;
  setSelectedExamType: (value: string) => void;
  score: string;
  setScore: (value: string) => void;
  maxScore: string;
  setMaxScore: (value: string) => void;
  cbcLevel: string;
  setCbcLevel: (value: string) => void;
  canInput: boolean;
  isPrincipal: boolean;
  canOverride: boolean;
}

const GradeFormFields: React.FC<GradeFormFieldsProps> = ({
  curriculumType,
  classes,
  selectedClass,
  setSelectedClass,
  subjects,
  selectedSubject,
  setSelectedSubject,
  students,
  selectedStudent,
  setSelectedStudent,
  selectedTerm,
  setSelectedTerm,
  selectedExamType,
  setSelectedExamType,
  score,
  setScore,
  maxScore,
  setMaxScore,
  cbcLevel,
  setCbcLevel,
  canInput,
  isPrincipal,
  canOverride
}) => {
  const isCBC = curriculumType.toUpperCase() === 'CBC';

  return (
    <>
      {isCBC ? (
        <CBCGradesForm
          classes={classes}
          selectedClass={selectedClass}
          setSelectedClass={setSelectedClass}
          subjects={subjects}
          selectedSubject={selectedSubject}
          setSelectedSubject={setSelectedSubject}
          students={students}
          selectedStudent={selectedStudent}
          setSelectedStudent={setSelectedStudent}
          selectedTerm={selectedTerm}
          setSelectedTerm={setSelectedTerm}
          selectedExamType={selectedExamType}
          setSelectedExamType={setSelectedExamType}
          cbcLevel={cbcLevel}
          setCbcLevel={setCbcLevel}
          canInput={canInput}
        />
      ) : (
        <GradesForm
          classes={classes}
          selectedClass={selectedClass}
          setSelectedClass={setSelectedClass}
          subjects={subjects}
          selectedSubject={selectedSubject}
          setSelectedSubject={setSelectedSubject}
          students={students}
          selectedStudent={selectedStudent}
          setSelectedStudent={setSelectedStudent}
          selectedTerm={selectedTerm}
          setSelectedTerm={setSelectedTerm}
          selectedExamType={selectedExamType}
          setSelectedExamType={setSelectedExamType}
          score={score}
          setScore={setScore}
          maxScore={maxScore}
          setMaxScore={setMaxScore}
          canInput={canInput}
          isPrincipal={isPrincipal}
          canOverride={canOverride}
        />
      )}
    </>
  );
};

export default GradeFormFields;
