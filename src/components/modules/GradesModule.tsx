import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, TrendingUp, Users, FileText, Award, BookOpen, Home, BarChart3 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useClasses } from '@/hooks/useClasses';
import { useSubjects } from '@/hooks/useSubjects';
import { useStudents } from '@/hooks/useStudents';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { DataService } from '@/services/dataService';
import BulkGradingTable from '@/components/grading/BulkGradingTable';
import GradeOverrideRequest from '@/components/grading/GradeOverrideRequest';
import CBCAssessmentForm from '@/components/cbc/CBCAssessmentForm';
import CompetencyProgress from '@/components/cbc/CompetencyProgress';
import LearnerPortfolio from '@/components/cbc/LearnerPortfolio';
import ParentEngagement from '@/components/cbc/ParentEngagement';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/utils/permissions';
import { UserRole } from '@/types/user';
import { PERMISSIONS } from '@/utils/permissions';

const GradesModule = () => {
  const { user } = useAuth();
  const { classes } = useClasses();
  const [selectedClass, setSelectedClass] = useState('all');
  const { subjects } = useSubjects(selectedClass);
  const { students } = useStudents(selectedClass);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedTerm, setSelectedTerm] = useState('term1');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [showOverrideRequest, setShowOverrideRequest] = useState(false);
  const [gradingMode, setGradingMode] = useState<'traditional' | 'cbc'>('cbc');
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const { createSchoolScopedQuery } = useSchoolScopedData();
  const { toast } = useToast();
  const { hasPermission } = usePermissions(user?.role as UserRole, user?.school_id);

  const [gradeStats, setGradeStats] = useState({
    totalStudents: 0,
    assessed: 0,
    pending: 0,
    averageProgress: 0
  });

  const terms = [
    { id: 'term1', name: 'Term 1' },
    { id: 'term2', name: 'Term 2' },
    { id: 'term3', name: 'Term 3' },
  ];

  useEffect(() => {
    if (students.length > 0) {
      fetchGradesData();
    }
  }, [selectedClass, selectedSubject, selectedTerm, students]);

  useEffect(() => {
    calculateStats();
  }, [grades, students]);

  const fetchGradesData = async () => {
    try {
      setLoading(true);
      
      let query = createSchoolScopedQuery('grades', `
        *,
        students:students(name, admission_number),
        subjects:subjects(name, code)
      `);

      if (selectedClass !== 'all') {
        query = query.eq('class_id', selectedClass);
      }

      if (selectedSubject !== 'all') {
        query = query.eq('subject_id', selectedSubject);
      }

      query = query.eq('term', selectedTerm);

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching grades:', error);
        toast({
          title: "Error",
          description: "Failed to fetch grades data",
          variant: "destructive",
        });
        return;
      }

      setGrades(data || []);
    } catch (error) {
      console.error('Error fetching grades:', error);
      toast({
        title: "Error",
        description: "Failed to fetch grades data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const totalStudents = students.length;
    const assessedStudents = new Set(grades.map(g => g.student_id)).size;
    const pending = totalStudents - assessedStudents;
    
    const totalPercentage = grades.reduce((sum, grade) => sum + (grade.percentage || 0), 0);
    const averageProgress = grades.length > 0 ? totalPercentage / grades.length : 0;

    setGradeStats({
      totalStudents,
      assessed: assessedStudents,
      pending,
      averageProgress: Math.round(averageProgress * 10) / 10
    });
  };

  // Create dynamic grading session from real data
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
    students: students.map(student => {
      const existingGrade = grades.find(g => g.student_id === student.id && g.subject_id === selectedSubject);
      return {
        studentId: student.id,
        name: student.name,
        admissionNumber: student.admission_number,
        rollNumber: student.roll_number || `R${student.id.slice(-3)}`,
        currentScore: existingGrade?.score,
        percentage: existingGrade?.percentage,
        position: existingGrade?.position,
        isAbsent: false
      };
    })
  };

  const handleSaveGrades = async (gradeUpdates: { studentId: string; score: number; isAbsent: boolean }[]) => {
    try {
      for (const update of gradeUpdates) {
        if (update.isAbsent) continue;

        const gradeData = {
          student_id: update.studentId,
          subject_id: selectedSubject,
          class_id: selectedClass,
          score: update.score,
          max_score: 100,
          percentage: (update.score / 100) * 100,
          term: selectedTerm,
          exam_type: 'MID_TERM',
          submitted_by: user?.id,
          status: 'draft' as const
        };

        const existingGrade = grades.find(g => 
          g.student_id === update.studentId && 
          g.subject_id === selectedSubject &&
          g.term === selectedTerm
        );

        if (existingGrade) {
          await DataService.updateGrade(existingGrade.id, gradeData);
        } else {
          await DataService.createGrade(gradeData);
        }
      }

      toast({
        title: "Grades Saved",
        description: "Grades have been saved successfully.",
      });

      fetchGradesData(); // Refresh data
    } catch (error) {
      console.error('Error saving grades:', error);
      toast({
        title: "Error",
        description: "Failed to save grades",
        variant: "destructive",
      });
    }
  };

  const handleSubmitGrades = async () => {
    try {
      // Update all draft grades for this class/subject/term to submitted status
      const updatesPromises = grades
        .filter(g => g.class_id === selectedClass && g.subject_id === selectedSubject && g.term === selectedTerm && g.status === 'draft')
        .map(grade => DataService.updateGrade(grade.id, { 
          status: 'submitted' as const,
          submitted_at: new Date().toISOString()
        }));

      await Promise.all(updatesPromises);

      toast({
        title: "Grades Submitted",
        description: "Grades have been submitted for approval.",
      });

      fetchGradesData(); // Refresh data
    } catch (error) {
      console.error('Error submitting grades:', error);
      toast({
        title: "Error",
        description: "Failed to submit grades",
        variant: "destructive",
      });
    }
  };

  const handleOverrideRequest = (request: { newScore: number; reason: string }) => {
    console.log('Override request submitted:', request);
    setShowOverrideRequest(false);
    toast({
      title: "Override Request Submitted",
      description: "Your grade override request has been submitted for review.",
    });
  };

  const handleCBCAssessmentSave = () => {
    console.log('CBC Assessment saved');
    toast({
      title: "Assessment Saved",
      description: "CBC assessment has been saved successfully.",
    });
  };

  const isTeacher = user?.role === 'teacher';
  const isPrincipal = user?.role === 'principal';
  const isParent = user?.role === 'parent';

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const isElimshaAdmin = user?.role === 'elimisha_admin' || user?.role === 'edufam_admin';
  const canEditGrades = hasPermission(PERMISSIONS.EDIT_GRADEBOOK);
  const canSubmitGrades = hasPermission(PERMISSIONS.SUBMIT_GRADES);

  // For Elimisha admins, show only overview and analytics
  if (isElimshaAdmin) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            System-Wide Grades Overview
          </h1>
          <p className="text-muted-foreground">
            System administrator view - summaries and analytics across all schools
          </p>
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
              <p className="text-xs text-muted-foreground">Across all schools</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Assessed Students</CardTitle>
              <Award className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{gradeStats.assessed}</div>
              <p className="text-xs text-muted-foreground">With completed assessments</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Assessments</CardTitle>
              <FileText className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{gradeStats.pending}</div>
              <p className="text-xs text-muted-foreground">Awaiting assessment</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Average</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{gradeStats.averageProgress}%</div>
              <p className="text-xs text-muted-foreground">Network-wide performance</p>
            </CardContent>
          </Card>
        </div>

        {/* Admin-only analytics and summaries */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5" />
              Grades Analytics (Read-Only)
            </CardTitle>
            <CardDescription>
              System-wide grade performance analytics - Elimisha admins have view-only access
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 text-blue-800">
                <FileText className="h-4 w-4" />
                <span className="font-medium">Administrator Access Level</span>
              </div>
              <p className="text-blue-700 text-sm mt-1">
                As an Elimisha administrator, you can view grade summaries and analytics but cannot enter or modify grades. 
                Grade entry is restricted to teachers and grade management to principals.
              </p>
            </div>
            
            {/* Grades summary table - read-only */}
            {grades.length > 0 ? (
              <div className="space-y-4">
                <h4 className="font-medium">Recent Grade Entries (Last 10)</h4>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium">Student</th>
                        <th className="px-4 py-2 text-left text-sm font-medium">Subject</th>
                        <th className="px-4 py-2 text-left text-sm font-medium">Score</th>
                        <th className="px-4 py-2 text-left text-sm font-medium">Status</th>
                        <th className="px-4 py-2 text-left text-sm font-medium">Term</th>
                      </tr>
                    </thead>
                    <tbody>
                      {grades.slice(0, 10).map((grade: any) => (
                        <tr key={grade.id} className="border-t">
                          <td className="px-4 py-2 text-sm">{grade.students?.name || 'N/A'}</td>
                          <td className="px-4 py-2 text-sm">{grade.subjects?.name || 'N/A'}</td>
                          <td className="px-4 py-2 text-sm">{grade.score}/{grade.max_score}</td>
                          <td className="px-4 py-2 text-sm">
                            <Badge variant={grade.status === 'submitted' ? 'default' : 'secondary'}>
                              {grade.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-2 text-sm">{grade.term}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <p className="text-center py-8 text-gray-500">No grade data available</p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Regular interface for other roles
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

      {/* Mode Toggle - only for users who can edit */}
      {canEditGrades && (
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
      )}

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
                <SelectItem value="all">All Classes</SelectItem>
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
                <SelectItem value="all">All Subjects</SelectItem>
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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>
              {canEditGrades ? 'Grade Management' : 'Grade Overview'}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {canEditGrades ? (
            <Tabs defaultValue="enter" className="w-full">
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
                  
                  {showOverrideRequest && grades.length > 0 && (
                    <GradeOverrideRequest 
                      grade={grades[0]}
                      onClose={() => setShowOverrideRequest(false)}
                      onSubmit={handleOverrideRequest}
                    />
                  )}
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-blue-800">
                  <FileText className="h-4 w-4" />
                  <span className="font-medium">View-Only Access</span>
                </div>
                <p className="text-blue-700 text-sm mt-1">
                  You have read-only access to grade information. Contact a teacher or principal to modify grades.
                </p>
              </div>
              
              {/* Read-only grade summary */}
              {/* ... display grades in read-only format ... */}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GradesModule;
