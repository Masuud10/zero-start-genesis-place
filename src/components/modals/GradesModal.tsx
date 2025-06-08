
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserRole, GradingSession } from '@/types';
import BulkGradingTable from '../grading/BulkGradingTable';
import GradeOverrideRequest from '../grading/GradeOverrideRequest';
import { useToast } from '@/hooks/use-toast';

interface GradesModalProps {
  onClose: () => void;
  userRole?: UserRole;
}

const GradesModal = ({ onClose, userRole }: GradesModalProps) => {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [selectedExamType, setSelectedExamType] = useState('');
  const [maxScore, setMaxScore] = useState('100');
  const [activeTab, setActiveTab] = useState('bulk-entry');
  const [gradingSession, setGradingSession] = useState<GradingSession | null>(null);
  const [showOverrideRequest, setShowOverrideRequest] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const { toast } = useToast();

  // Mock data
  const mockChildGrades = [
    { 
      id: '1',
      subject: 'Mathematics', 
      grade: 'A', 
      score: 85, 
      maxScore: 100,
      term: 'Term 1', 
      position: 3,
      examType: 'END_TERM',
      isReleased: true,
      isImmutable: true,
      percentage: 85
    },
    { 
      id: '2',
      subject: 'English', 
      grade: 'B+', 
      score: 78, 
      maxScore: 100,
      term: 'Term 1', 
      position: 5,
      examType: 'END_TERM',
      isReleased: true,
      isImmutable: true,
      percentage: 78
    },
  ];

  const mockGradingSessions = [
    {
      id: '1',
      classId: 'grade-1a',
      subjectId: 'mathematics',
      term: 'term-1',
      examType: 'END_TERM' as const,
      maxScore: 100,
      teacherId: 'teacher1',
      createdAt: new Date(),
      isActive: true,
      students: [
        { studentId: '1', name: 'John Doe', admissionNumber: 'ADM001', rollNumber: '1', currentScore: 85, percentage: 85, position: 1 },
        { studentId: '2', name: 'Jane Smith', admissionNumber: 'ADM002', rollNumber: '2', currentScore: 78, percentage: 78, position: 2 },
        { studentId: '3', name: 'Mike Johnson', admissionNumber: 'ADM003', rollNumber: '3' },
        { studentId: '4', name: 'Sarah Wilson', admissionNumber: 'ADM004', rollNumber: '4' },
      ]
    }
  ];

  const startGradingSession = () => {
    if (!selectedClass || !selectedSubject || !selectedTerm || !selectedExamType) {
      toast({
        title: "Missing Information",
        description: "Please select class, subject, term, and exam type to start grading.",
        variant: "destructive",
      });
      return;
    }

    // Create or load grading session
    const session: GradingSession = {
      id: Date.now().toString(),
      classId: selectedClass,
      subjectId: selectedSubject,
      term: selectedTerm,
      examType: selectedExamType as 'CAT' | 'MID_TERM' | 'END_TERM' | 'FINAL',
      maxScore: parseInt(maxScore),
      teacherId: 'current-teacher',
      createdAt: new Date(),
      isActive: true,
      students: mockGradingSessions[0].students // Mock data
    };

    setGradingSession(session);
    setActiveTab('bulk-entry');
  };

  const saveGrades = (grades: { studentId: string; score: number; isAbsent: boolean }[]) => {
    console.log('Saving grades:', grades);
    // Implement save logic
  };

  const submitGrades = () => {
    console.log('Submitting grades for approval');
    toast({
      title: "Grades Submitted",
      description: "Grades have been submitted and are now immutable. They will be reviewed by administration.",
    });
    // Mark session as submitted and immutable
    if (gradingSession) {
      setGradingSession({ ...gradingSession, isActive: false });
    }
  };

  const handleOverrideRequest = (request: { newScore: number; reason: string }) => {
    console.log('Override request:', request);
    // Implement override request logic
  };

  if (userRole === 'parent') {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Child's Academic Grades</DialogTitle>
            <DialogDescription>
              View your child's academic performance and detailed grade reports
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-4">
              {mockChildGrades.map((grade, index) => (
                <Card key={index} className="border border-border">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{grade.subject}</h3>
                        <p className="text-sm text-muted-foreground">
                          {grade.term} • {grade.examType}
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          Grade: {grade.grade}
                        </Badge>
                        <Badge variant="outline">
                          Score: {grade.score}/{grade.maxScore} ({grade.percentage}%)
                        </Badge>
                        <Badge variant="outline">
                          Position: #{grade.position}
                        </Badge>
                        {grade.isReleased && (
                          <Badge className="bg-green-100 text-green-800">
                            Released
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Grade Management System</DialogTitle>
          <DialogDescription>
            Secure grade entry with Excel-like bulk upload and immutable records
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="setup">Setup Session</TabsTrigger>
            <TabsTrigger value="bulk-entry" disabled={!gradingSession}>Bulk Entry</TabsTrigger>
            <TabsTrigger value="history">Grade History</TabsTrigger>
          </TabsList>

          <TabsContent value="setup" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Class *</label>
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
                <label className="block text-sm font-medium mb-2">Subject *</label>
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
                <label className="block text-sm font-medium mb-2">Term *</label>
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

              <div>
                <label className="block text-sm font-medium mb-2">Exam Type *</label>
                <Select value={selectedExamType} onValueChange={setSelectedExamType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select exam type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CAT">CAT</SelectItem>
                    <SelectItem value="MID_TERM">Mid Term</SelectItem>
                    <SelectItem value="END_TERM">End Term</SelectItem>
                    <SelectItem value="FINAL">Final Exam</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Max Score *</label>
                <Select value={maxScore} onValueChange={setMaxScore}>
                  <SelectTrigger>
                    <SelectValue placeholder="Max score" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                    <SelectItem value="150">150</SelectItem>
                    <SelectItem value="200">200</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              onClick={startGradingSession}
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={!selectedClass || !selectedSubject || !selectedTerm || !selectedExamType}
            >
              Start Grading Session
            </Button>
          </TabsContent>

          <TabsContent value="bulk-entry">
            {gradingSession && (
              <BulkGradingTable
                session={gradingSession}
                onSave={saveGrades}
                onSubmit={submitGrades}
                isSubmitted={!gradingSession.isActive}
              />
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Previous Grading Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <p>No previous grading sessions found.</p>
                  <p className="text-sm">Start a new grading session to see history here.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {showOverrideRequest && selectedGrade && (
          <GradeOverrideRequest
            grade={selectedGrade}
            onClose={() => setShowOverrideRequest(false)}
            onSubmit={handleOverrideRequest}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default GradesModal;
