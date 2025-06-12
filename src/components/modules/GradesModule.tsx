
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, TrendingUp, Users, FileText, Award, BookOpen, Home } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import BulkGradingTable from '@/components/grading/BulkGradingTable';
import GradeOverrideRequest from '@/components/grading/GradeOverrideRequest';
import CBCAssessmentForm from '@/components/cbc/CBCAssessmentForm';
import CompetencyProgress from '@/components/cbc/CompetencyProgress';
import LearnerPortfolio from '@/components/cbc/LearnerPortfolio';
import ParentEngagement from '@/components/cbc/ParentEngagement';

const GradesModule = () => {
  const { user } = useAuth();
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedTerm, setSelectedTerm] = useState('term1');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [showOverrideRequest, setShowOverrideRequest] = useState(false);
  const [gradingMode, setGradingMode] = useState<'traditional' | 'cbc'>('cbc');

  const gradeStats = {
    totalStudents: 1247,
    assessed: 1180,
    pending: 67,
    averageProgress: 78.5
  };

  const classes = [
    { id: 'all', name: 'All Classes' },
    { id: '8a', name: 'Grade 8A' },
    { id: '8b', name: 'Grade 8B' },
    { id: '7a', name: 'Grade 7A' },
    { id: '7b', name: 'Grade 7B' },
  ];

  const subjects = [
    { id: 'all', name: 'All Subjects' },
    { id: 'math', name: 'Mathematics' },
    { id: 'english', name: 'English' },
    { id: 'science', name: 'Science' },
    { id: 'social', name: 'Social Studies' },
  ];

  const students = [
    { id: '1', name: 'John Doe', admission_number: 'ADM001' },
    { id: '2', name: 'Jane Smith', admission_number: 'ADM002' },
    { id: '3', name: 'Mike Johnson', admission_number: 'ADM003' }
  ];

  const terms = [
    { id: 'term1', name: 'Term 1' },
    { id: 'term2', name: 'Term 2' },
    { id: 'term3', name: 'Term 3' },
  ];

  // Mock grading session data for traditional grading
  const mockGradingSession = {
    id: '1',
    classId: selectedClass,
    subjectId: selectedSubject,
    term: selectedTerm,
    examType: 'MID_TERM' as const,
    maxScore: 100,
    teacherId: user?.id || 'teacher-1',
    createdAt: new Date(),
    isActive: true,
    students: students.map(student => ({
      studentId: student.id,
      name: student.name,
      admissionNumber: student.admission_number,
      rollNumber: `R${student.id.padStart(3, '0')}`,
      currentScore: undefined,
      percentage: undefined,
      position: undefined,
      isAbsent: false
    }))
  };

  const mockGrade = {
    id: '1',
    score: 85,
    maxScore: 100,
    studentId: '1',
    subjectId: 'math',
    classId: selectedClass,
    term: 'term1',
    examType: 'MID_TERM' as const,
    submittedBy: user?.id || 'teacher-1',
    submittedAt: new Date(),
    status: 'draft' as const,
    isImmutable: true,
    percentage: 85.0,
    position: 1,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const handleSaveGrades = (grades: { studentId: string; score: number; isAbsent: boolean }[]) => {
    console.log('Grades saved:', grades);
  };

  const handleSubmitGrades = () => {
    console.log('Grades submitted for approval');
  };

  const handleOverrideRequest = (request: { newScore: number; reason: string }) => {
    console.log('Override request submitted:', request);
    setShowOverrideRequest(false);
  };

  const handleCBCAssessmentSave = () => {
    console.log('CBC Assessment saved');
  };

  const isTeacher = user?.role === 'teacher';
  const isPrincipal = user?.role === 'principal';
  const isParent = user?.role === 'parent';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {gradingMode === 'cbc' ? 'CBC Assessment & Learning Management' : 'Traditional Grades Management'}
        </h1>
        <p className="text-muted-foreground">
          {gradingMode === 'cbc' 
            ? 'Track competency development and holistic learning progress' 
            : 'Manage and track student academic performance'}
        </p>
      </div>

      {/* Mode Toggle */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="font-medium">Assessment Mode:</span>
              <div className="flex gap-2">
                <Button 
                  variant={gradingMode === 'cbc' ? 'default' : 'outline'}
                  onClick={() => setGradingMode('cbc')}
                  className="flex items-center gap-2"
                >
                  <Award className="w-4 h-4" />
                  CBC (Competency-Based)
                </Button>
                <Button 
                  variant={gradingMode === 'traditional' ? 'default' : 'outline'}
                  onClick={() => setGradingMode('traditional')}
                  className="flex items-center gap-2"
                >
                  <GraduationCap className="w-4 h-4" />
                  Traditional Grading
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{gradeStats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">Enrolled students</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {gradingMode === 'cbc' ? 'Assessed' : 'Graded'}
            </CardTitle>
            <Award className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{gradeStats.assessed}</div>
            <p className="text-xs text-muted-foreground">
              {gradingMode === 'cbc' ? 'Competency assessments' : 'Completed assessments'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <FileText className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{gradeStats.pending}</div>
            <p className="text-xs text-muted-foreground">
              {gradingMode === 'cbc' ? 'Awaiting assessment' : 'Awaiting grades'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {gradingMode === 'cbc' ? 'Average Progress' : 'Average Grade'}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{gradeStats.averageProgress}%</div>
            <p className="text-xs text-muted-foreground">
              {gradingMode === 'cbc' ? 'Competency progress' : 'Class average'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters & Selection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger>
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger>
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedTerm} onValueChange={setSelectedTerm}>
              <SelectTrigger>
                <SelectValue placeholder="Select term" />
              </SelectTrigger>
              <SelectContent>
                {terms.map((term) => (
                  <SelectItem key={term.id} value={term.id}>{term.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {(gradingMode === 'cbc') && (
              <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                <SelectTrigger>
                  <SelectValue placeholder="Select student (for portfolio/progress)" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>{student.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle>
            {gradingMode === 'cbc' ? 'CBC Learning Management' : 'Grade Management'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {gradingMode === 'cbc' ? (
            <Tabs defaultValue={isParent ? 'progress' : 'assess'} className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                {!isParent && <TabsTrigger value="assess">Assessment</TabsTrigger>}
                <TabsTrigger value="progress">Progress Tracking</TabsTrigger>
                <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
                <TabsTrigger value="parent">Parent Engagement</TabsTrigger>
                {!isParent && <TabsTrigger value="override">Override Request</TabsTrigger>}
              </TabsList>
              
              {!isParent && (
                <TabsContent value="assess" className="mt-6">
                  <CBCAssessmentForm
                    classId={selectedClass}
                    subjectId={selectedSubject}
                    term={selectedTerm}
                    students={students}
                    onSave={handleCBCAssessmentSave}
                  />
                </TabsContent>
              )}
              
              <TabsContent value="progress" className="mt-6">
                {selectedStudent ? (
                  <CompetencyProgress 
                    studentId={selectedStudent} 
                    editable={isTeacher || isPrincipal}
                  />
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Select a student to view competency progress</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="portfolio" className="mt-6">
                {selectedStudent ? (
                  <LearnerPortfolio 
                    studentId={selectedStudent}
                    canEdit={isParent}
                    canAddFeedback={isTeacher || isPrincipal}
                  />
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Select a student to view their learning portfolio</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="parent" className="mt-6">
                {selectedStudent ? (
                  <ParentEngagement 
                    studentId={selectedStudent}
                    isParent={isParent}
                  />
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Home className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Select a student to view parent engagement records</p>
                  </div>
                )}
              </TabsContent>
              
              {!isParent && (
                <TabsContent value="override" className="mt-6">
                  <div className="space-y-4">
                    <Button onClick={() => setShowOverrideRequest(true)}>
                      Request Assessment Override
                    </Button>
                    
                    {showOverrideRequest && (
                      <GradeOverrideRequest 
                        grade={mockGrade}
                        onClose={() => setShowOverrideRequest(false)}
                        onSubmit={handleOverrideRequest}
                      />
                    )}
                  </div>
                </TabsContent>
              )}
            </Tabs>
          ) : (
            <Tabs defaultValue={user?.role === 'principal' ? 'approve' : 'enter'} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="enter">Enter Grades</TabsTrigger>
                <TabsTrigger value="approve">Approve Grades</TabsTrigger>
                <TabsTrigger value="override">Grade Override</TabsTrigger>
              </TabsList>
              
              <TabsContent value="enter" className="mt-6">
                <BulkGradingTable 
                  session={mockGradingSession}
                  onSave={handleSaveGrades}
                  onSubmit={handleSubmitGrades}
                  isSubmitted={false}
                />
              </TabsContent>
              
              <TabsContent value="approve" className="mt-6">
                <BulkGradingTable 
                  session={mockGradingSession}
                  onSave={handleSaveGrades}
                  onSubmit={handleSubmitGrades}
                  isSubmitted={false}
                />
              </TabsContent>
              
              <TabsContent value="override" className="mt-6">
                <div className="space-y-4">
                  <Button onClick={() => setShowOverrideRequest(true)}>
                    Request Grade Override
                  </Button>
                  
                  {showOverrideRequest && (
                    <GradeOverrideRequest 
                      grade={mockGrade}
                      onClose={() => setShowOverrideRequest(false)}
                      onSubmit={handleOverrideRequest}
                    />
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GradesModule;
