
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import GradeCell from './GradeCell';

interface BulkGradingSheetProps {
  students: any[];
  subjects: any[];
  grades: Record<string, Record<string, any>>;
  onGradeChange: (studentId: string, subjectId: string, grade: any) => void;
  curriculumType: 'cbc' | 'igcse' | 'standard';
}

const BulkGradingSheet: React.FC<BulkGradingSheetProps> = ({
  students,
  subjects,
  grades,
  onGradeChange,
  curriculumType,
}) => {
  return (
    <div className="overflow-auto border rounded-md" style={{ maxHeight: '50vh' }}>
      <Table>
        <TableHeader className="sticky top-0 bg-secondary z-10">
          <TableRow>
            <TableHead className="min-w-[150px] sticky left-0 bg-secondary z-20">Student Name</TableHead>
            <TableHead className="min-w-[120px]">Admission No.</TableHead>
            {subjects.map((subject) => (
              <TableHead key={subject.id} className="min-w-[150px]">{subject.name}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student) => (
            <TableRow key={student.id}>
              <TableCell className="font-medium sticky left-0 bg-background z-10">{student.name}</TableCell>
              <TableCell>{student.admission_number}</TableCell>
              {subjects.map((subject) => (
                <TableCell key={subject.id}>
                  <GradeCell
                    curriculumType={curriculumType}
                    grade={grades[student.id]?.[subject.id] || {}}
                    onGradeChange={(value) => onGradeChange(student.id, subject.id, value)}
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default BulkGradingSheet;
