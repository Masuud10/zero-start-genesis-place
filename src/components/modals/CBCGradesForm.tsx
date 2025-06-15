
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
}) => (
  <div className="grid gap-4 py-4">
    {/* Class Select */}
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor="class" className="text-right">Class</Label>
      <Select onValueChange={setSelectedClass} value={selectedClass}>
        <SelectTrigger id="class" className="col-span-3"><SelectValue placeholder="Select Class" /></SelectTrigger>
        <SelectContent>{classes.map((cls) => (<SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>))}</SelectContent>
      </Select>
    </div>
    {/* Subject Select */}
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor="subject" className="text-right">Subject</Label>
      <Select onValueChange={setSelectedSubject} value={selectedSubject} disabled={!selectedClass}>
        <SelectTrigger id="subject" className="col-span-3"><SelectValue placeholder="Select Subject" /></SelectTrigger>
        <SelectContent>{subjects.map((subject) => (<SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>))}</SelectContent>
      </Select>
    </div>
    {/* Student Select */}
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor="student" className="text-right">Student</Label>
      <Select onValueChange={setSelectedStudent} value={selectedStudent} disabled={!selectedClass}>
        <SelectTrigger id="student" className="col-span-3"><SelectValue placeholder="Select Student" /></SelectTrigger>
        <SelectContent>{students.map((student) => (<SelectItem key={student.id} value={student.id}>{student.name}</SelectItem>))}</SelectContent>
      </Select>
    </div>
    {/* Term Select */}
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor="term" className="text-right">Term</Label>
      <Select onValueChange={setSelectedTerm} value={selectedTerm}>
        <SelectTrigger id="term" className="col-span-3"><SelectValue placeholder="Select Term" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="term1">Term 1</SelectItem>
          <SelectItem value="term2">Term 2</SelectItem>
          <SelectItem value="term3">Term 3</SelectItem>
        </SelectContent>
      </Select>
    </div>
    {/* Exam Type (Assessment) */}
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor="examType" className="text-right">Assessment</Label>
      <Select onValueChange={setSelectedExamType} value={selectedExamType}>
        <SelectTrigger id="examType" className="col-span-3"><SelectValue placeholder="Select Assessment Type" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="opener">Opener</SelectItem>
          <SelectItem value="mid_term">Mid Term</SelectItem>
          <SelectItem value="end_term">End Term</SelectItem>
          <SelectItem value="project">Project</SelectItem>
        </SelectContent>
      </Select>
    </div>
    {/* CBC Level Selector */}
    <CBCGradeSelector value={cbcLevel} onChange={setCbcLevel} disabled={!canInput} />
  </div>
);

export default CBCGradesForm;
