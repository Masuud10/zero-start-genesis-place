import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, XCircle, Send, Eye, Clock, AlertTriangle, FileText, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import BulkGradingModal from './BulkGradingModal';

interface GradeSubmission {
  id: string;
  class_name: string;
  subject_name: string;
  teacher_name: string;
  term: string;
  exam_type: string;
  submitted_at: string;
  status: string;
  grades_count: number;
  grade_ids: string[];
  average_score?: number;
  highest_score?: number;
  lowest_score?: number;
}

const GradeApprovalDashboard = () => {
  const { user } = useAuth();
  const { schoolId } = useSchoolScopedData();
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<GradeSubmission[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<string | null>(null);
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);

  useEffect(() => {
    if (user?.role === 'principal' && schoolId) {
      fetchSubmissions();
    }
  }, [user, schoolId]);

  const fetchSubmissions = async () => {
    if (!schoolId) return;
    
    setLoading(true);
    try {
      console.log('Fetching grade submissions for school:', schoolId);
      
      // Use explicit joins to avoid ambiguous relationships
      const { data: gradesData, error: gradesError } = await supabase
        .from('grades')
        .select(`
          id,
          class_id,
          subject_id,
          term,
          exam_type,
          submitted_at,
          status,
          submitted_by,
          score
        `)
        .eq('school_id', schoolId)
        .in('status', ['submitted', 'approved', 'released'])
        .not('submitted_at', 'is', null)
        .order('submitted_at', { ascending: false });

      if (gradesError) throw gradesError;

      if (!gradesData || gradesData.length === 0) {
        setSubmissions([]);
        setLoading(false);
        return;
      }

      // Fetch related data separately to avoid join ambiguity
      const classIds = [...new Set(gradesData.map(g => g.class_id))];
      const subjectIds = [...new Set(gradesData.map(g => g.subject_id))];
      const teacherIds = [...new Set(gradesData.map(g => g.submitted_by).filter(Boolean))];

      const [classesRes, subjectsRes, teachersRes] = await Promise.all([
        supabase
          .from('classes')
          .select('id, name')
          .in('id', classIds),
        supabase
          .from('subjects') 
          .select('id, name')
          .in('id', subjectIds),
        supabase
          .from('profiles')
          .select('id, name')
          .in('id', teacherIds)
      ]);

      if (classesRes.error) throw classesRes.error;
      if (subjectsRes.error) throw subjectsRes.error;
      if (teachersRes.error) throw teachersRes.error;

      // Create lookup maps
      const classesMap = new Map(classesRes.data?.map(c => [c.id, c.name]) || []);
      const subjectsMap = new Map(subjectsRes.data?.map(s => [s.id, s.name]) || []);
      const teachersMap = new Map(teachersRes.data?.map(t => [t.id, t.name]) || []);

      // Group grades by submission (class + subject + term + exam_type + submitted_by)
      const grouped: Record<string, GradeSubmission> = {};
      
      gradesData.forEach((grade: any) => {
        const key = `${grade.class_id}-${grade.subject_id}-${grade.term}-${grade.exam_type}-${grade.submitted_by}`;
        
        if (!grouped[key]) {
          grouped[key] = {
            id: key,
            class_name: classesMap.get(grade.class_id) || 'Unknown Class',
            subject_name: subjectsMap.get(grade.subject_id) || 'Unknown Subject',
            teacher_name: teachersMap.get(grade.submitted_by) || 'Unknown Teacher',
            term: grade.term,
            exam_type: grade.exam_type,
            submitted_at: grade.submitted_at,
            status: grade.status,
            grades_count: 0,
            grade_ids: [],
            average_score: 0,
            highest_score: 0,
            lowest_score: 100
          };
        }
        
        grouped[key].grades_count++;
        grouped[key].grade_ids.push(grade.id);
        
        // Calculate statistics
        if (grade.score) {
          const currentAvg = grouped[key].average_score || 0;
          const currentCount = grouped[key].grades_count;
          grouped[key].average_score = ((currentAvg * (currentCount - 1)) + grade.score) / currentCount;
          grouped[key].highest_score = Math.max(grouped[key].highest_score || 0, grade.score);
          grouped[key].lowest_score = Math.min(grouped[key].lowest_score || 100, grade.score);
        }
      });

      // Round averages
      Object.values(grouped).forEach(submission => {
        if (submission.average_score) {
          submission.average_score = Math.round(submission.average_score * 10) / 10;
        }
      });

      const submissionsList = Object.values(grouped);
      console.log('Processed submissions:', submissionsList.length);
      
      setSubmissions(submissionsList);
    } catch (error: any) {
      console.error('Error fetching submissions:', error);
      toast({
        title: "Error",
        description: "Failed to load grade submissions: " + (error.message || 'Unknown error'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (submissionId: string) => {
    const submission = submissions.find(s => s.id === submissionId);
    if (!submission) return;

    setSelectedSubmission(submissionId);
    try {
      const { error } = await supabase.rpc('update_grade_status', {
        grade_ids: submission.grade_ids,
        new_status: 'approved',
        user_id: user?.id
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Grades for ${submission.class_name} - ${submission.subject_name} approved successfully`,
      });
      
      fetchSubmissions();
    } catch (error: any) {
      console.error('Error approving grades:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to approve grades",
        variant: "destructive"
      });
    } finally {
      setSelectedSubmission(null);
    }
  };

  const handleRelease = async (submissionId: string) => {
    const submission = submissions.find(s => s.id === submissionId);
    if (!submission) return;

    setSelectedSubmission(submissionId);
    try {
      const { error } = await supabase.rpc('update_grade_status', {
        grade_ids: submission.grade_ids,
        new_status: 'released',
        user_id: user?.id
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Results for ${submission.class_name} - ${submission.subject_name} released to parents successfully`,
      });
      
      fetchSubmissions();
    } catch (error: any) {
      console.error('Error releasing results:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to release results",
        variant: "destructive"
      });
    } finally {
      setSelectedSubmission(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
        return (
          <Badge variant="outline" className="text-yellow-600 border-yellow-600">
            <Clock className="h-3 w-3 mr-1" />
            Pending Review
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="outline" className="text-green-600 border-green-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        );
      case 'released':
        return (
          <Badge variant="outline" className="text-purple-600 border-purple-600">
            <Send className="h-3 w-3 mr-1" />
            Released
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getExamTypeDisplay = (examType: string) => {
    const typeMap: Record<string, string> = {
      'OPENER': 'Opener',
      'MID_TERM': 'Mid Term',
      'END_TERM': 'End Term',
      'ASSIGNMENT': 'Assignment',
      'TEST': 'Test',
      'PROJECT': 'Project'
    };
    return typeMap[examType] || examType;
  };

  if (user?.role !== 'principal') {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-orange-500" />
          <p className="text-muted-foreground">Grade approval is only available to principals.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Grade Approval Dashboard
            <Badge variant="secondary" className="ml-auto">
              {submissions.length} Submissions
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              <p>Loading submissions...</p>
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No grade submissions pending review</p>
              <p className="text-sm">Teachers haven't submitted any grades for approval yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-yellow-500" />
                    <div>
                      <div className="font-semibold">
                        {submissions.filter(s => s.status === 'submitted').length}
                      </div>
                      <div className="text-sm text-muted-foreground">Pending Review</div>
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <div className="font-semibold">
                        {submissions.filter(s => s.status === 'approved').length}
                      </div>
                      <div className="text-sm text-muted-foreground">Approved</div>
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-2">
                    <Send className="h-5 w-5 text-purple-500" />
                    <div>
                      <div className="font-semibold">
                        {submissions.filter(s => s.status === 'released').length}
                      </div>
                      <div className="text-sm text-muted-foreground">Released</div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Submissions Table */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Class & Subject</TableHead>
                      <TableHead>Teacher</TableHead>
                      <TableHead>Term/Exam</TableHead>
                      <TableHead>Statistics</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.map((submission) => (
                      <TableRow key={submission.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{submission.class_name}</div>
                            <div className="text-sm text-muted-foreground">{submission.subject_name}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            {submission.teacher_name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">{submission.term}</div>
                            <div className="text-muted-foreground">{getExamTypeDisplay(submission.exam_type)}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm space-y-1">
                            <div><strong>{submission.grades_count}</strong> grades</div>
                            {submission.average_score && (
                              <>
                                <div>Avg: <strong>{submission.average_score}%</strong></div>
                                <div className="text-xs text-muted-foreground">
                                  Range: {submission.lowest_score}% - {submission.highest_score}%
                                </div>
                              </>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(submission.submitted_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{getStatusBadge(submission.status)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {submission.status === 'submitted' && (
                              <Button
                                size="sm"
                                onClick={() => handleApprove(submission.id)}
                                disabled={selectedSubmission === submission.id}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                            )}
                            {submission.status === 'approved' && (
                              <Button
                                size="sm"
                                onClick={() => handleRelease(submission.id)}
                                disabled={selectedSubmission === submission.id}
                                className="bg-purple-600 hover:bg-purple-700"
                              >
                                <Send className="h-4 w-4 mr-1" />
                                Release
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setOverrideModalOpen(true)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Override
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Grade Override Modal */}
      {overrideModalOpen && (
        <BulkGradingModal 
          open={overrideModalOpen}
          onClose={() => setOverrideModalOpen(false)}
          classList={[]}
          subjectList={[]}
        />
      )}
    </>
  );
};

export default GradeApprovalDashboard;
