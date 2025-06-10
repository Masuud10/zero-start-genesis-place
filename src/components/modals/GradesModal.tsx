
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';

interface GradesModalProps {
  onClose: () => void;
  userRole: string;
}

const GradesModal: React.FC<GradesModalProps> = ({ onClose, userRole }) => {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [grade, setGrade] = useState('');

  const mockClasses = ['Grade 1A', 'Grade 1B', 'Grade 2A', 'Grade 2B'];
  const mockSubjects = ['Mathematics', 'English', 'Science', 'Social Studies'];
  const mockStudents = ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson'];
  const mockGrades = [
    { student: 'John Doe', subject: 'Mathematics', grade: '85%', term: 'Term 1' },
    { student: 'Jane Smith', subject: 'Mathematics', grade: '92%', term: 'Term 1' },
    { student: 'Mike Johnson', subject: 'English', grade: '78%', term: 'Term 1' },
  ];

  const handleSubmitGrade = () => {
    if (!selectedClass || !selectedSubject || !selectedStudent || !grade) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Success",
      description: "Grade submitted successfully",
    });
    
    onClose();
  };

  const isTeacher = userRole === 'teacher';
  const isParent = userRole === 'parent';

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isTeacher ? 'Submit Grades' : isParent ? "View Child's Grades" : 'Grade Management'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {isTeacher && (
            <Card>
              <CardHeader>
                <CardTitle>Submit New Grade</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="class">Class</Label>
                    <Select value={selectedClass} onValueChange={setSelectedClass}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockClasses.map(cls => (
                          <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                        ))}
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
                        {mockSubjects.map(subject => (
                          <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="student">Student</Label>
                    <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select student" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockStudents.map(student => (
                          <SelectItem key={student} value={student}>{student}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="grade">Grade (%)</Label>
                    <Input
                      id="grade"
                      type="number"
                      placeholder="Enter grade"
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      min="0"
                      max="100"
                    />
                  </div>
                </div>
                <Button onClick={handleSubmitGrade} className="w-full">
                  Submit Grade
                </Button>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Recent Grades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {mockGrades.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{item.student}</p>
                      <p className="text-sm text-muted-foreground">{item.subject} - {item.term}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{item.grade}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GradesModal;
