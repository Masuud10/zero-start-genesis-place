import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, XCircle, Send, Eye, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';

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
}

const GradeApprovalDashboard = () => {
  const { user } = useAuth();
  const { schoolId } = useSchoolScopedData();
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<GradeSubmission[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<string | null>(null);

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
      
      // Get all grades that are submitted or approved for this school
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
          submitted_by
        `)
        .eq('school_id', schoolId)
        .in('status', ['submitted', 'approved'])
        .not('submitted_at', 'is', null)
        .order('submitted_at', { ascending: false });

      if (gradesError) {
        console.error('Error fetching grades:', gradesError);
        throw gradesError;
      }

      console.log('Grades data:', gradesData?.length);

      if (!gradesData || gradesData.length === 0) {
        setSubmissions([]);
        setLoading(false);
        return;
      }

      // Get unique class IDs, subject IDs, and user IDs for additional queries
      const classIds = [...new Set(gradesData.map(g => g.class_id))];
      const subjectIds = [...new Set(gradesData.map(g => g.subject_id))];
      const userIds = [...new Set(gradesData.map(g => g.submitted_by).filter(Boolean))];

      // Fetch class names, subject names, and user names in parallel
      const [classesRes, subjectsRes, usersRes] = await Promise.all([
        supabase.from('classes').select('id, name').in('id', classIds),
        supabase.from('subjects').select('id, name').in('id', subjectIds),
        supabase.from('profiles').select('id, name').in('id', userIds)
      ]);

      // Create lookup objects
      const classLookup = Object.fromEntries((classesRes.data || []).map(c => [c.id, c.name]));
      const subjectLookup = Object.fromEntries((subjectsRes.data || []).map(s => [s.id, s.name]));
      const userLookup = Object.fromEntries((usersRes.data || []).map(u => [u.id, u.name]));

      // Group grades by submission (class + subject + term + exam_type + submitted_by)
      const grouped: Record<string, GradeSubmission> = {};
      
      gradesData.forEach((grade: any) => {
        const key = `${grade.class_id}-${grade.subject_id}-${grade.term}-${grade.exam_type}-${grade.submitted_by}`;
        
        if (!grouped[key]) {
          grouped[key] = {
            id: key,
            class_name: classLookup[grade.class_id] || 'Unknown Class',
            subject_name: subjectLookup[grade.subject_id] || 'Unknown Subject',
            teacher_name: userLookup[grade.submitted_by] || 'Unknown Teacher',
            term: grade.term,
            exam_type: grade.exam_type,
            submitted_at: grade.submitted_at,
            status: grade.status,
            grades_count: 0,
            grade_ids: []
          };
        }
        
        grouped[key].grades_count++;
        grouped[key].grade_ids.push(grade.id);
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
        description: "Grades approved successfully",
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
        description: "Results released to parents successfully",
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
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Pending Review</Badge>;
      case 'approved':
        return <Badge variant="outline" className="text-green-600 border-green-600">Approved</Badge>;
      case 'released':
        return <Badge variant="outline" className="text-purple-600 border-purple-600">Released</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (user?.role !== 'principal') {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Grade approval is only available to principals.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Grade Approval Dashboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
            Loading submissions...
          </div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No grade submissions pending review</p>
            <p className="text-sm">Teachers haven't submitted any grades for approval yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Class</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Term/Exam</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Grades</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell className="font-medium">{submission.class_name}</TableCell>
                    <TableCell>{submission.subject_name}</TableCell>
                    <TableCell>{submission.teacher_name}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{submission.term}</div>
                        <div className="text-muted-foreground">{submission.exam_type}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(submission.submitted_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{getStatusBadge(submission.status)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{submission.grades_count}</Badge>
                    </TableCell>
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
                          onClick={() => {/* View details */}}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GradeApprovalDashboard;
