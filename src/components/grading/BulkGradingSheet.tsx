
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
  if (students.length === 0 || subjects.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center text-muted-foreground">
          <p className="text-lg font-medium">No data available</p>
          <p className="text-sm">Please ensure the class has students and subjects assigned.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
            <TableRow>
              <TableHead className="min-w-[200px] sticky left-0 bg-background z-20 border-r-2 border-border">
                <div className="font-semibold">Student Name</div>
                <div className="text-xs text-muted-foreground">Admission No.</div>
              </TableHead>
              {subjects.map((subject) => (
                <TableHead key={subject.id} className="min-w-[120px] text-center">
                  <div className="font-semibold">{subject.name}</div>
                  <div className="text-xs text-muted-foreground">{subject.code || ''}</div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student, index) => (
              <TableRow key={student.id} className={index % 2 === 0 ? 'bg-muted/30' : 'bg-background'}>
                <TableCell className="sticky left-0 bg-inherit z-10 border-r-2 border-border">
                  <div className="min-w-[180px]">
                    <div className="font-medium text-sm">{student.name}</div>
                    <div className="text-xs text-muted-foreground">{student.admission_number}</div>
                  </div>
                </TableCell>
                {subjects.map((subject) => (
                  <TableCell key={subject.id} className="p-2">
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
      
      <div className="border-t bg-muted/30 px-4 py-2 text-xs text-muted-foreground">
        <div className="flex justify-between items-center">
          <span>{students.length} students × {subjects.length} subjects</span>
          <span>Enter scores and press Tab or Enter to move to the next cell</span>
        </div>
      </div>
    </div>
  );
};

export default BulkGradingSheet;
