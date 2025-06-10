import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, TrendingUp, Users, FileText, Award } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import BulkGradingTable from '@/components/grading/BulkGradingTable';
import GradeOverrideRequest from '@/components/grading/GradeOverrideRequest';

const GradesModule = () => {
  const { user } = useAuth();
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedTerm, setSelectedTerm] = useState('term1');
  const [showOverrideRequest, setShowOverrideRequest] = useState(false);

  const gradeStats = {
    totalStudents: 1247,
    graded: 1180,
    pending: 67,
    averageGrade: 78.5
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

  const terms = [
    { id: 'term1', name: 'Term 1' },
    { id: 'term2', name: 'Term 2' },
    { id: 'term3', name: 'Term 3' },
  ];

  // Mock grading session data with all required properties
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
    students: [
      {
        studentId: '1',
        name: 'John Doe',
        admissionNumber: 'ADM001',
        rollNumber: 'R001',
        currentScore: undefined,
        percentage: undefined,
        position: undefined,
        isAbsent: false
      },
      {
        studentId: '2',
        name: 'Jane Smith',
        admissionNumber: 'ADM002',
        rollNumber: 'R002',
        currentScore: undefined,
        percentage: undefined,
        position: undefined,
        isAbsent: false
      },
      {
        studentId: '3',
        name: 'Mike Johnson',
        admissionNumber: 'ADM003',
        rollNumber: 'R003',
        currentScore: undefined,
        percentage: undefined,
        position: undefined,
        isAbsent: false
      }
    ]
  };

  // Mock grade for override request with all required properties
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
    isReleased: false,
    isImmutable: true,
    percentage: 85.0,
    position: 1
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Grades Management
        </h1>
        <p className="text-muted-foreground">Manage and track student academic performance</p>
      </div>

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
            <CardTitle className="text-sm font-medium">Graded</CardTitle>
            <Award className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{gradeStats.graded}</div>
            <p className="text-xs text-muted-foreground">Completed assessments</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <FileText className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{gradeStats.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting grades</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{gradeStats.averageGrade}%</div>
            <p className="text-xs text-muted-foreground">Class average</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>Grade Management</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Select term" />
                </SelectTrigger>
                <SelectContent>
                  {terms.map((term) => (
                    <SelectItem key={term.id} value={term.id}>{term.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  );
};

export default GradesModule;
