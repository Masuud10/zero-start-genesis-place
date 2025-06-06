
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserRole } from '@/types';

interface GradesModalProps {
  onClose: () => void;
  userRole?: UserRole;
}

const GradesModal = ({ onClose, userRole }: GradesModalProps) => {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');

  const mockStudents = [
    { id: 1, name: 'John Doe', admNo: 'ADM001', currentGrade: 85 },
    { id: 2, name: 'Jane Smith', admNo: 'ADM002', currentGrade: 92 },
    { id: 3, name: 'Mike Johnson', admNo: 'ADM003', currentGrade: 78 },
    { id: 4, name: 'Sarah Wilson', admNo: 'ADM004', currentGrade: 88 },
  ];

  const mockChildGrades = [
    { subject: 'Mathematics', grade: 'A', score: 85, term: 'Term 1', position: 3 },
    { subject: 'English', grade: 'B+', score: 78, term: 'Term 1', position: 5 },
    { subject: 'Science', grade: 'A-', score: 82, term: 'Term 1', position: 4 },
    { subject: 'History', grade: 'A', score: 88, term: 'Term 1', position: 2 },
  ];

  const handleSubmitGrades = () => {
    // Handle grade submission logic
    console.log('Grades submitted for:', selectedClass, selectedSubject, selectedTerm);
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {userRole === 'parent' ? "Child's Grades" : 'Manage Grades'}
          </DialogTitle>
          <DialogDescription>
            {userRole === 'parent' 
              ? "View your child's academic performance and grades"
              : "Submit and manage student grades for your classes"
            }
          </DialogDescription>
        </DialogHeader>

        {userRole === 'parent' ? (
          <div className="space-y-4">
            <div className="grid gap-4">
              {mockChildGrades.map((grade, index) => (
                <Card key={index} className="border border-border">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{grade.subject}</h3>
                        <p className="text-sm text-muted-foreground">{grade.term}</p>
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          Grade: {grade.grade}
                        </Badge>
                        <Badge variant="outline">
                          Score: {grade.score}%
                        </Badge>
                        <Badge variant="outline">
                          Position: {grade.position}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Selection Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Class</label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grade-1a">Grade 1A</SelectItem>
                    <SelectItem value="grade-1b">Grade 1B</SelectItem>
                    <SelectItem value="grade-2a">Grade 2A</SelectItem>
                    <SelectItem value="grade-3a">Grade 3A</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Subject</label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mathematics">Mathematics</SelectItem>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="science">Science</SelectItem>
                    <SelectItem value="history">History</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Term</label>
                <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select term" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="term-1">Term 1</SelectItem>
                    <SelectItem value="term-2">Term 2</SelectItem>
                    <SelectItem value="term-3">Term 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Students List */}
            {selectedClass && selectedSubject && selectedTerm && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Students in {selectedClass} - {selectedSubject}</h3>
                <div className="space-y-2">
                  {mockStudents.map((student) => (
                    <Card key={student.id} className="border border-border">
                      <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex-1">
                            <p className="font-medium">{student.name}</p>
                            <p className="text-sm text-muted-foreground">Adm No: {student.admNo}</p>
                          </div>
                          <div className="w-full sm:w-32">
                            <Input 
                              type="number" 
                              placeholder="Enter grade"
                              defaultValue={student.currentGrade}
                              min="0" 
                              max="100"
                              className="text-center"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button 
                onClick={handleSubmitGrades}
                disabled={!selectedClass || !selectedSubject || !selectedTerm}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Submit Grades
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default GradesModal;
