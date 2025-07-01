
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CBCGradeSelector from './CBCGradeSelector';

type Option = { id: string; name: string };

interface CBCGradesFormProps {
  classes: Option[];
  selectedClass: string;
  setSelectedClass: (v: string) => void;
  subjects: Option[];
  selectedSubject: string;
  setSelectedSubject: (v: string) => void;
  students: Option[];
  selectedStudent: string;
  setSelectedStudent: (v: string) => void;
  selectedTerm: string;
  setSelectedTerm: (v: string) => void;
  selectedExamType: string;
  setSelectedExamType: (v: string) => void;
  cbcLevel: string;
  setCbcLevel: (v: string) => void;
  canInput: boolean;
}

const CBCGradesForm: React.FC<CBCGradesFormProps> = ({
  classes, selectedClass, setSelectedClass,
  subjects, selectedSubject, setSelectedSubject,
  students, selectedStudent, setSelectedStudent,
  selectedTerm, setSelectedTerm,
  selectedExamType, setSelectedExamType,
  cbcLevel, setCbcLevel,
  canInput
}) => {
  return (
    <div className="space-y-4">
      {/* Class Selection */}
      <div className="space-y-2">
        <Label htmlFor="class">Class</Label>
        <Select value={selectedClass} onValueChange={setSelectedClass} disabled={!canInput}>
          <SelectTrigger>
            <SelectValue placeholder="Select a class" />
          </SelectTrigger>
          <SelectContent>
            {classes.map((cls) => (
              <SelectItem key={cls.id} value={cls.id}>
                {cls.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Subject Selection */}
      <div className="space-y-2">
        <Label htmlFor="subject">Subject</Label>
        <Select value={selectedSubject} onValueChange={setSelectedSubject} disabled={!canInput}>
          <SelectTrigger>
            <SelectValue placeholder="Select a subject" />
          </SelectTrigger>
          <SelectContent>
            {subjects.map((subject) => (
              <SelectItem key={subject.id} value={subject.id}>
                {subject.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Student Selection */}
      <div className="space-y-2">
        <Label htmlFor="student">Student</Label>
        <Select value={selectedStudent} onValueChange={setSelectedStudent} disabled={!canInput}>
          <SelectTrigger>
            <SelectValue placeholder="Select a student" />
          </SelectTrigger>
          <SelectContent>
            {students.map((student) => (
              <SelectItem key={student.id} value={student.id}>
                {student.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Term Selection */}
      <div className="space-y-2">
        <Label htmlFor="term">Term</Label>
        <Select value={selectedTerm} onValueChange={setSelectedTerm} disabled={!canInput}>
          <SelectTrigger>
            <SelectValue placeholder="Select a term" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Term 1</SelectItem>
            <SelectItem value="2">Term 2</SelectItem>
            <SelectItem value="3">Term 3</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Exam Type Selection */}
      <div className="space-y-2">
        <Label htmlFor="examType">Assessment Type</Label>
        <Select value={selectedExamType} onValueChange={setSelectedExamType} disabled={!canInput}>
          <SelectTrigger>
            <SelectValue placeholder="Select assessment type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="formative">Formative Assessment</SelectItem>
            <SelectItem value="summative">Summative Assessment</SelectItem>
            <SelectItem value="project">Project Assessment</SelectItem>
            <SelectItem value="observation">Observation Assessment</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* CBC Performance Level */}
      <div className="space-y-2">
        <Label htmlFor="cbcLevel">CBC Performance Level</Label>
        <CBCGradeSelector
          value={cbcLevel}
          onChange={setCbcLevel}
          disabled={!canInput}
        />
      </div>
    </div>
  );
};

export default CBCGradesForm;
