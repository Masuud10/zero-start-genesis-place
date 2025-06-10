
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, Download, Save, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GradesModalProps {
  onClose: () => void;
  userRole: string;
}

const GradesModal: React.FC<GradesModalProps> = ({ onClose, userRole }) => {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [examType, setExamType] = useState('');
  const [grades, setGrades] = useState([
    { id: 1, name: 'John Doe', admissionNo: 'STU001', score: 85, maxScore: 100, grade: 'B+', position: 2 },
    { id: 2, name: 'Jane Smith', admissionNo: 'STU002', score: 92, maxScore: 100, grade: 'A-', position: 1 },
    { id: 3, name: 'Mike Johnson', admissionNo: 'STU003', score: 78, maxScore: 100, grade: 'B', position: 3 },
  ]);
  const { toast } = useToast();

  const handleSaveGrades = () => {
    toast({
      title: "Grades Saved",
      description: "Student grades have been successfully saved.",
    });
  };

  const handleSubmitGrades = () => {
    toast({
      title: "Grades Submitted",
      description: "Grades have been submitted for approval.",
    });
  };

  const handleApproveGrades = () => {
    toast({
      title: "Grades Approved",
      description: "Grades have been approved and released to students.",
    });
  };

  const handleScoreChange = (id: number, newScore: number) => {
    setGrades(prev => prev.map(grade => 
      grade.id === id 
        ? { 
            ...grade, 
            score: newScore,
            grade: getGradeLetter(newScore),
          }
        : grade
    ));
  };

  const getGradeLetter = (score: number): string => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B+';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C+';
    if (score >= 50) return 'C';
    return 'D';
  };

  const canEdit = ['teacher', 'principal', 'school_owner'].includes(userRole);
  const canApprove = ['principal', 'school_owner'].includes(userRole);
  const canSubmit = userRole === 'teacher';

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Grade Management</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {canEdit && (
            <Card>
              <CardHeader>
                <CardTitle>Grade Entry Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="class">Class</Label>
                    <Select value={selectedClass} onValueChange={setSelectedClass}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="grade8a">Grade 8A</SelectItem>
                        <SelectItem value="grade8b">Grade 8B</SelectItem>
                        <SelectItem value="grade7a">Grade 7A</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mathematics">Mathematics</SelectItem>
                        <SelectItem value="english">English</SelectItem>
                        <SelectItem value="science">Science</SelectItem>
                        <SelectItem value="social">Social Studies</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="examType">Exam Type</Label>
                    <Select value={examType} onValueChange={setExamType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select exam type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cat1">CAT 1</SelectItem>
                        <SelectItem value="cat2">CAT 2</SelectItem>
                        <SelectItem value="midterm">Mid-term</SelectItem>
                        <SelectItem value="endterm">End-term</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Student Grades</span>
                {canEdit && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Upload className="w-4 h-4 mr-2" />
                      Import
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {grades.map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-muted-foreground">{student.admissionNo}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Label>Score:</Label>
                        {canEdit ? (
                          <Input
                            type="number"
                            value={student.score}
                            onChange={(e) => handleScoreChange(student.id, parseInt(e.target.value) || 0)}
                            className="w-20"
                            max={student.maxScore}
                            min={0}
                          />
                        ) : (
                          <span className="font-medium">{student.score}</span>
                        )}
                        <span>/ {student.maxScore}</span>
                      </div>
                      <Badge variant={student.score >= 80 ? 'default' : student.score >= 60 ? 'secondary' : 'destructive'}>
                        {student.grade}
                      </Badge>
                      <div className="text-sm text-muted-foreground">
                        Position: {student.position}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            {canEdit && (
              <Button onClick={handleSaveGrades}>
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </Button>
            )}
            {canSubmit && (
              <Button onClick={handleSubmitGrades}>Submit for Approval</Button>
            )}
            {canApprove && (
              <Button onClick={handleApproveGrades} className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve & Release
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GradesModal;
