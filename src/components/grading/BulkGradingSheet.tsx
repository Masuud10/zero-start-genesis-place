
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
  console.log('BulkGradingSheet data:', { 
    studentsCount: students.length, 
    subjectsCount: subjects.length,
    gradesCount: Object.keys(grades).length 
  });

  if (students.length === 0 || subjects.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center text-muted-foreground">
          <p className="text-lg font-medium">No data available</p>
          <p className="text-sm">
            {students.length === 0 && subjects.length === 0
              ? "Please ensure the class has students and subjects assigned."
              : students.length === 0
              ? "No students found for this class."
              : "No subjects found for this class."
            }
          </p>
        </div>
      </div>
    );
  }

  const calculatePercentage = (score: number, maxScore: number = 100) => {
    if (!score || !maxScore) return 0;
    return Math.round((score / maxScore) * 100);
  };

  const getTotalScore = (studentId: string) => {
    let total = 0;
    let maxTotal = 0;
    
    subjects.forEach(subject => {
      const grade = grades[studentId]?.[subject.id];
      if (grade?.score) {
        total += Number(grade.score);
        maxTotal += 100; // Assuming max score of 100 per subject
      }
    });
    
    return { total, maxTotal, percentage: maxTotal > 0 ? Math.round((total / maxTotal) * 100) : 0 };
  };

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
                  <div className="text-xs text-muted-foreground">/ 100</div>
                </TableHead>
              ))}
              <TableHead className="min-w-[120px] text-center bg-blue-50">
                <div className="font-semibold">Total</div>
                <div className="text-xs text-muted-foreground">Score & %</div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student, index) => {
              const totals = getTotalScore(student.id);
              
              return (
                <TableRow key={student.id} className={index % 2 === 0 ? 'bg-muted/30' : 'bg-background'}>
                  <TableCell className="sticky left-0 bg-inherit z-10 border-r-2 border-border">
                    <div className="min-w-[180px]">
                      <div className="font-medium text-sm">{student.name}</div>
                      <div className="text-xs text-muted-foreground">{student.admission_number}</div>
                    </div>
                  </TableCell>
                  {subjects.map((subject) => {
                    const currentGrade = grades[student.id]?.[subject.id] || {};
                    
                    return (
                      <TableCell key={subject.id} className="p-2">
                        <div className="space-y-1">
                          <GradeCell
                            curriculumType={curriculumType}
                            grade={currentGrade}
                            onGradeChange={(value) => {
                              // Auto-calculate percentage when score changes
                              if (value.score !== undefined) {
                                const percentage = calculatePercentage(Number(value.score), 100);
                                value.percentage = percentage;
                              }
                              onGradeChange(student.id, subject.id, value);
                            }}
                          />
                          {currentGrade.score && (
                            <div className="text-xs text-center text-muted-foreground">
                              {calculatePercentage(Number(currentGrade.score), 100)}%
                            </div>
                          )}
                        </div>
                      </TableCell>
                    );
                  })}
                  <TableCell className="p-2 bg-blue-50/50 text-center">
                    <div className="text-sm font-medium">
                      {totals.total > 0 ? `${totals.total}/${totals.maxTotal}` : '-'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {totals.percentage > 0 ? `${totals.percentage}%` : '-'}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      
      <div className="border-t bg-muted/30 px-4 py-2 text-xs text-muted-foreground">
        <div className="flex justify-between items-center">
          <span>{students.length} students × {subjects.length} subjects = {students.length * subjects.length} total grades</span>
          <span>Enter scores and press Tab or Enter to move to the next cell</span>
        </div>
      </div>
    </div>
  );
};

export default BulkGradingSheet;
