
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { GradingSession, GradingStudent } from '@/types';

interface BulkGradingTableProps {
  session: GradingSession;
  onSave: (grades: { studentId: string; score: number; isAbsent: boolean }[]) => void;
  onSubmit: () => void;
  isSubmitted?: boolean;
}

const BulkGradingTable = ({ session, onSave, onSubmit, isSubmitted = false }: BulkGradingTableProps) => {
  const [students, setStudents] = useState<GradingStudent[]>(session.students);
  const [autoCalculate, setAutoCalculate] = useState(true);
  const { toast } = useToast();

  const calculateStats = () => {
    const validScores = students
      .filter(s => !s.isAbsent && s.currentScore !== undefined && s.currentScore !== null)
      .map(s => s.currentScore!);
    
    if (validScores.length === 0) return { average: 0, highest: 0, lowest: 0 };
    
    const average = validScores.reduce((sum, score) => sum + score, 0) / validScores.length;
    const highest = Math.max(...validScores);
    const lowest = Math.min(...validScores);
    
    return { average, highest, lowest };
  };

  const updateScore = (studentId: string, score: string) => {
    const numericScore = score === '' ? undefined : Math.max(0, Math.min(session.maxScore, parseFloat(score) || 0));
    
    setStudents(prev => prev.map(student => {
      if (student.studentId === studentId) {
        const percentage = numericScore ? (numericScore / session.maxScore) * 100 : undefined;
        return {
          ...student,
          currentScore: numericScore,
          percentage,
          isAbsent: false
        };
      }
      return student;
    }));
  };

  const toggleAbsent = (studentId: string, isAbsent: boolean) => {
    setStudents(prev => prev.map(student => {
      if (student.studentId === studentId) {
        return {
          ...student,
          isAbsent,
          currentScore: isAbsent ? undefined : student.currentScore,
          percentage: isAbsent ? undefined : student.percentage
        };
      }
      return student;
    }));
  };

  const calculatePositions = () => {
    const studentsWithScores = students
      .filter(s => !s.isAbsent && s.currentScore !== undefined)
      .sort((a, b) => (b.currentScore || 0) - (a.currentScore || 0));
    
    setStudents(prev => prev.map(student => {
      if (student.isAbsent || student.currentScore === undefined) {
        return { ...student, position: undefined };
      }
      
      const position = studentsWithScores.findIndex(s => s.studentId === student.studentId) + 1;
      return { ...student, position };
    }));
  };

  useEffect(() => {
    if (autoCalculate) {
      calculatePositions();
    }
  }, [students.map(s => s.currentScore).join(','), autoCalculate]);

  const handleSave = () => {
    const grades = students.map(student => ({
      studentId: student.studentId,
      score: student.currentScore || 0,
      isAbsent: student.isAbsent || false
    }));
    
    onSave(grades);
    toast({
      title: "Grades Saved",
      description: "Your progress has been saved as draft.",
    });
  };

  const handleSubmit = () => {
    const incompleteCount = students.filter(s => !s.isAbsent && (s.currentScore === undefined || s.currentScore === null)).length;
    
    if (incompleteCount > 0) {
      toast({
        title: "Incomplete Grades",
        description: `Please enter grades for all ${incompleteCount} remaining students or mark them as absent.`,
        variant: "destructive",
      });
      return;
    }
    
    onSubmit();
  };

  const stats = calculateStats();
  const completedCount = students.filter(s => s.isAbsent || (s.currentScore !== undefined && s.currentScore !== null)).length;
  const totalCount = students.length;

  return (
    <div className="space-y-4">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{completedCount}/{totalCount}</div>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.average.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Class Average</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.highest}</div>
            <p className="text-xs text-muted-foreground">Highest Score</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.lowest || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">Lowest Score</p>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="auto-calculate" 
            checked={autoCalculate}
            onCheckedChange={(checked) => setAutoCalculate(!!checked)}
          />
          <label htmlFor="auto-calculate" className="text-sm font-medium">
            Auto-calculate positions
          </label>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSave} disabled={isSubmitted}>
            Save Draft
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitted} className="bg-blue-600 hover:bg-blue-700">
            Submit Grades
          </Button>
        </div>
      </div>

      {/* Grading Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Grade Entry - Max Score: {session.maxScore}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-border">
              <thead>
                <tr className="bg-muted">
                  <th className="border border-border p-2 text-left">#</th>
                  <th className="border border-border p-2 text-left">Adm No.</th>
                  <th className="border border-border p-2 text-left">Student Name</th>
                  <th className="border border-border p-2 text-center">Score</th>
                  <th className="border border-border p-2 text-center">%</th>
                  <th className="border border-border p-2 text-center">Position</th>
                  <th className="border border-border p-2 text-center">Absent</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, index) => (
                  <tr key={student.studentId} className="hover:bg-muted/50">
                    <td className="border border-border p-2">{index + 1}</td>
                    <td className="border border-border p-2 font-mono text-sm">
                      {student.admissionNumber}
                    </td>
                    <td className="border border-border p-2 font-medium">
                      {student.name}
                    </td>
                    <td className="border border-border p-2">
                      <Input
                        type="number"
                        min="0"
                        max={session.maxScore}
                        value={student.isAbsent ? '' : (student.currentScore || '')}
                        onChange={(e) => updateScore(student.studentId, e.target.value)}
                        disabled={student.isAbsent || isSubmitted}
                        className="w-20 text-center"
                        placeholder="0"
                      />
                    </td>
                    <td className="border border-border p-2 text-center">
                      {student.isAbsent ? (
                        <Badge variant="secondary">ABS</Badge>
                      ) : student.percentage ? (
                        <span className={`font-medium ${
                          student.percentage >= 75 ? 'text-green-600' :
                          student.percentage >= 50 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {student.percentage.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="border border-border p-2 text-center">
                      {student.position ? (
                        <Badge variant="outline">#{student.position}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="border border-border p-2 text-center">
                      <Checkbox
                        checked={student.isAbsent || false}
                        onCheckedChange={(checked) => toggleAbsent(student.studentId, !!checked)}
                        disabled={isSubmitted}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {isSubmitted && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <span className="text-green-600">✓</span>
            <span className="font-medium text-green-800">
              Grades submitted successfully! These grades are now immutable and can only be changed through admin approval.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkGradingTable;
