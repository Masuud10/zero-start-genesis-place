
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { GradingSession } from '@/types/grading';

interface BulkGradingTableProps {
  session: GradingSession;
  onSave: (grades: { studentId: string; score: number; isAbsent: boolean }[]) => void;
  onSubmit: () => void;
  isSubmitted?: boolean;
}

const BulkGradingTable: React.FC<BulkGradingTableProps> = ({
  session,
  onSave,
  onSubmit,
  isSubmitted = false
}) => {
  const [grades, setGrades] = useState<Record<string, { score: number; isAbsent: boolean }>>({});

  const handleScoreChange = (studentId: string, score: string) => {
    const numericScore = parseFloat(score) || 0;
    setGrades(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        score: numericScore,
        isAbsent: false
      }
    }));
  };

  const handleAbsentChange = (studentId: string, isAbsent: boolean) => {
    setGrades(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        score: isAbsent ? 0 : prev[studentId]?.score || 0,
        isAbsent
      }
    }));
  };

  const handleSave = () => {
    const gradesArray = Object.entries(grades).map(([studentId, grade]) => ({
      studentId,
      score: grade.score,
      isAbsent: grade.isAbsent
    }));
    onSave(gradesArray);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Grade Entry - {session.examType}</CardTitle>
        <div className="text-sm text-muted-foreground">
          Term: {session.term} | Max Score: {session.maxScore}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-12 gap-4 font-medium text-sm border-b pb-2">
            <div className="col-span-1">Roll</div>
            <div className="col-span-4">Name</div>
            <div className="col-span-2">Admission</div>
            <div className="col-span-2">Score</div>
            <div className="col-span-2">Percentage</div>
            <div className="col-span-1">Absent</div>
          </div>
          
          {session.students.map((student) => {
            const studentGrade = grades[student.studentId] || { score: student.currentScore || 0, isAbsent: student.isAbsent || false };
            const percentage = studentGrade.isAbsent ? 0 : (studentGrade.score / session.maxScore) * 100;
            
            return (
              <div key={student.studentId} className="grid grid-cols-12 gap-4 items-center py-2 border-b">
                <div className="col-span-1 text-sm">{student.rollNumber}</div>
                <div className="col-span-4 text-sm font-medium">{student.name}</div>
                <div className="col-span-2 text-sm">{student.admissionNumber}</div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    min="0"
                    max={session.maxScore}
                    value={studentGrade.isAbsent ? '' : studentGrade.score}
                    onChange={(e) => handleScoreChange(student.studentId, e.target.value)}
                    disabled={studentGrade.isAbsent || isSubmitted}
                    className="w-full"
                  />
                </div>
                <div className="col-span-2">
                  <Badge variant={percentage >= 70 ? 'default' : percentage >= 50 ? 'secondary' : 'destructive'}>
                    {percentage.toFixed(1)}%
                  </Badge>
                </div>
                <div className="col-span-1">
                  <Checkbox
                    checked={studentGrade.isAbsent}
                    onCheckedChange={(checked) => handleAbsentChange(student.studentId, checked as boolean)}
                    disabled={isSubmitted}
                  />
                </div>
              </div>
            );
          })}
        </div>
        
        {!isSubmitted && (
          <div className="flex justify-end gap-2 mt-6">
            <Button onClick={handleSave} variant="outline">
              Save Draft
            </Button>
            <Button onClick={onSubmit}>
              Submit Grades
            </Button>
          </div>
        )}
        
        {isSubmitted && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="text-green-800 font-medium">Grades Submitted</div>
            <div className="text-green-700 text-sm">These grades have been submitted and are read-only.</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BulkGradingTable;
