
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import IGCSESubjectPicker from './IGCSESubjectPicker';
import IGCSEGradeSelector from './IGCSEGradeSelector';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface IGCSEGradesFormProps {
  classes: any[];
  selectedClass: string;
  setSelectedClass: (v: string) => void;
  subjects: any[];
  selectedSubject: string;
  setSelectedSubject: (v: string) => void;
  useCustomSubject: boolean;
  setUseCustomSubject: (b: boolean) => void;
  freeformSubject: string;
  setFreeformSubject: (v: string) => void;
  students: any[];
  selectedStudent: string;
  setSelectedStudent: (v: string) => void;
  gradeChoice: string;
  setGradeChoice: (v: string) => void;
  customGrade: string;
  setCustomGrade: (v: string) => void;
  IGCSE_LETTER_GRADES: string[];
}

const IGCSEGradesForm: React.FC<IGCSEGradesFormProps> = ({
  classes, selectedClass, setSelectedClass,
  subjects, selectedSubject, setSelectedSubject,
  useCustomSubject, setUseCustomSubject,
  freeformSubject, setFreeformSubject,
  students, selectedStudent, setSelectedStudent,
  gradeChoice, setGradeChoice,
  customGrade, setCustomGrade,
  IGCSE_LETTER_GRADES,
}) => {
  return (
    <div className="py-3">
      <Alert variant="default" className="mb-3">
        <AlertTriangle className="h-4 w-4 mr-1 text-amber-500 inline" />
        <AlertDescription>
          <b>IGCSE Grading</b>: Enter letter grade or custom grade for selected subject.
        </AlertDescription>
      </Alert>
      <div className="grid gap-4 py-2">
        {/* Class select */}
        <div className="grid grid-cols-4 items-center gap-2">
          <Label htmlFor="igcse-class" className="text-right">Class</Label>
          <Select onValueChange={setSelectedClass} value={selectedClass}>
            <SelectTrigger id="igcse-class" className="col-span-3">
              <SelectValue placeholder="Select Class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map(cls => (
                <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {/* Subject select or custom */}
        <div className="grid grid-cols-4 items-center gap-2">
          <Label htmlFor="subject" className="text-right">Subject</Label>
          <IGCSESubjectPicker
            useCustomSubject={useCustomSubject}
            setUseCustomSubject={setUseCustomSubject}
            selectedSubject={selectedSubject}
            setSelectedSubject={setSelectedSubject}
            freeformSubject={freeformSubject}
            setFreeformSubject={setFreeformSubject}
            subjects={subjects}
            selectedClass={selectedClass}
          />
        </div>
        {/* Student select */}
        <div className="grid grid-cols-4 items-center gap-2">
          <Label htmlFor="student" className="text-right">Student</Label>
          <Select onValueChange={setSelectedStudent} disabled={!selectedClass} value={selectedStudent}>
            <SelectTrigger id="student" className="col-span-3">
              <SelectValue placeholder="Select Student" />
            </SelectTrigger>
            <SelectContent>
              {students.map(stu => (
                <SelectItem key={stu.id} value={stu.id}>{stu.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {/* Grade selector */}
        <IGCSEGradeSelector
          gradeChoice={gradeChoice}
          setGradeChoice={setGradeChoice}
          customGrade={customGrade}
          setCustomGrade={setCustomGrade}
          IGCSE_LETTER_GRADES={IGCSE_LETTER_GRADES}
        />
      </div>
    </div>
  );
};

export default IGCSEGradesForm;

