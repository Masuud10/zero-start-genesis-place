
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Download, Save, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { getGradingPermissions, canEditGrade, getGradeStatusColor } from '@/utils/grading-permissions';
import GradeWorkflowManager from '@/components/grading/GradeWorkflowManager';

interface GradesModalProps {
  onClose: () => void;
  userRole: string;
}

const GradesModal: React.FC<GradesModalProps> = ({ onClose, userRole }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [examType, setExamType] = useState('');
  const [grades, setGrades] = useState([
    { 
      id: 1, 
      name: 'John Doe', 
      admissionNo: 'STU001', 
      score: 85, 
      maxScore: 100, 
      grade: 'B+', 
      position: 2,
      status: 'draft' as const,
      submittedBy: user?.id || 'teacher-1',
      canEdit: true
    },
    { 
      id: 2, 
      name: 'Jane Smith', 
      admissionNo: 'STU002', 
      score: 92, 
      maxScore: 100, 
      grade: 'A-', 
      position: 1,
      status: 'draft' as const,
      submittedBy: user?.id || 'teacher-1',
      canEdit: true
    },
    { 
      id: 3, 
      name: 'Mike Johnson', 
      admissionNo: 'STU003', 
      score: 78, 
      maxScore: 100, 
      grade: 'B', 
      position: 3,
      status: 'submitted' as const,
      submittedBy: 'teacher-2',
      canEdit: false
    },
  ]);

  const [submissionStatus, setSubmissionStatus] = useState<'draft' | 'submitted' | 'approved' | 'released'>('draft');
  
  const permissions = getGradingPermissions(userRole as any);

  // Mock submission for workflow demo
  const mockSubmission = {
    id: 'sub-1',
    classId: selectedClass || 'grade8a',
    subjectId: selectedSubject || 'mathematics',
    term: 'term1',
    examType: examType as any || 'MID_TERM',
    teacherId: 'teacher-1',
    submittedAt: new Date(),
    status: submissionStatus,
    grades: [],
    totalStudents: grades.length,
    gradesEntered: grades.filter(g => g.score > 0).length,
    principalNotes: submissionStatus === 'approved' ? 'Grades look good. Ready for release.' : undefined
  };

  const handleSaveGrades = () => {
    if (!permissions.canEditGrades) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to edit grades.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Grades Saved",
      description: "Student grades have been saved as draft.",
    });
  };

  const handleSubmitGrades = () => {
    if (!permissions.canSubmitGrades) {
      toast({
        title: "Access Denied", 
        description: "You don't have permission to submit grades.",
        variant: "destructive",
      });
      return;
    }

    if (userRole === 'teacher') {
      setSubmissionStatus('submitted');
      toast({
        title: "Grades Submitted",
        description: "Grades have been submitted to the Principal for approval.",
      });
    }
  };

  const handleApproveSubmission = (submissionId: string, notes?: string) => {
    setSubmissionStatus('approved');
    // In real implementation, this would update the backend
  };

  const handleRejectSubmission = (submissionId: string, reason: string) => {
    setSubmissionStatus('draft');
    // In real implementation, this would update the backend and notify teacher
  };

  const handleReleaseResults = (submissionId: string) => {
    setSubmissionStatus('released');
    // In real implementation, this would update the backend and notify parents
  };

  const handleReviewSubmission = (submissionId: string) => {
    // Open detailed review modal
    console.log('Opening detailed review for submission:', submissionId);
  };

  const handleScoreChange = (id: number, newScore: number) => {
    const grade = grades.find(g => g.id === id);
    if (!grade || !canEditGrade(grade as any, userRole as any, user?.id || '')) {
      toast({
        title: "Cannot Edit",
        description: "You cannot edit this grade.",
        variant: "destructive",
      });
      return;
    }

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

  // Role-based view restrictions
  if (!permissions.canViewDetailedGrades && !permissions.canViewGradeSummaries) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Access Denied</DialogTitle>
          </DialogHeader>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You don't have permission to view grades. Please contact your administrator.
            </AlertDescription>
          </Alert>
          <Button onClick={onClose} className="mt-4">Close</Button>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Grade Management - {userRole.replace('_', ' ').toUpperCase()}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Permission-based alerts */}
          {userRole === 'teacher' && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You can edit grades for your classes. Submit grades to the Principal for approval before they can be released to parents.
              </AlertDescription>
            </Alert>
          )}

          {userRole === 'principal' && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You can review, approve, and release all grades. Only you can make results visible to parents.
              </AlertDescription>
            </Alert>
          )}

          {['school_owner', 'finance_officer', 'elimisha_admin', 'edufam_admin'].includes(userRole) && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You can view grade summaries and reports but cannot edit individual grades.
              </AlertDescription>
            </Alert>
          )}

          {/* Configuration Section - Only for users who can edit */}
          {(permissions.canCreateGrades || permissions.canEditGrades) && (
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

          {/* Workflow Manager - Only for Principal */}
          {userRole === 'principal' && (
            <GradeWorkflowManager
              submission={mockSubmission}
              onApprove={handleApproveSubmission}
              onReject={handleRejectSubmission}
              onRelease={handleReleaseResults}
              onReview={handleReviewSubmission}
            />
          )}

          {/* Grades Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>
                  {permissions.canViewDetailedGrades ? 'Student Grades' : 'Grade Summary'}
                </span>
                {permissions.canEditGrades && (
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
                      <Badge className={getGradeStatusColor(student.status)}>
                        {student.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Label>Score:</Label>
                        {permissions.canEditGrades && student.canEdit ? (
                          <Input
                            type="number"
                            value={student.score}
                            onChange={(e) => handleScoreChange(student.id, parseInt(e.target.value) || 0)}
                            className="w-20"
                            max={student.maxScore}
                            min={0}
                          />
                        ) : (
                          <span className="font-medium">
                            {permissions.canViewDetailedGrades ? student.score : '***'}
                          </span>
                        )}
                        <span>/ {student.maxScore}</span>
                      </div>
                      {permissions.canViewDetailedGrades && (
                        <>
                          <Badge variant={student.score >= 80 ? 'default' : student.score >= 60 ? 'secondary' : 'destructive'}>
                            {student.grade}
                          </Badge>
                          <div className="text-sm text-muted-foreground">
                            Position: {student.position}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>Close</Button>
            
            {permissions.canEditGrades && (
              <Button onClick={handleSaveGrades}>
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </Button>
            )}
            
            {permissions.canSubmitGrades && submissionStatus === 'draft' && (
              <Button onClick={handleSubmitGrades}>
                <Send className="w-4 h-4 mr-2" />
                Submit for Approval
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GradesModal;
