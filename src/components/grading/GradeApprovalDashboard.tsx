
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { supabase } from '@/integrations/supabase/client';
import { Award, CheckCircle, XCircle, Send, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface GradeSubmission {
  id: string;
  class_name: string;
  subject_name: string;
  teacher_name: string;
  term: string;
  exam_type: string;
  total_students: number;
  grades_entered: number;
  submitted_at: string;
  status: string;
}

const GradeApprovalDashboard = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { schoolId } = useSchoolScopedData();
  
  const [submissions, setSubmissions] = useState<GradeSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchSubmissions = async () => {
    if (!schoolId) {
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching grade submissions for school:', schoolId);
      
      const { data, error } = await supabase
        .from('grades')
        .select(`
          id,
          term,
          exam_type,
          submitted_at,
          status,
          subject_id,
          class_id,
          submitted_by,
          subjects!inner(name),
          classes!inner(name),
          profiles!grades_submitted_by_fkey(name)
        `)
        .eq('school_id', schoolId)
        .in('status', ['submitted', 'approved'])
        .not('submitted_at', 'is', null)
        .order('submitted_at', { ascending: false });

      if (error) {
        console.error('Error fetching grade submissions:', error);
        throw error;
      }

      console.log('Raw grade submissions data:', data);

      // Group by submission batch (class + subject + term + exam_type + teacher)
      const grouped = data?.reduce((acc: any, grade: any) => {
        const key = `${grade.classes?.name || 'Unknown'}-${grade.subjects?.name || 'Unknown'}-${grade.term}-${grade.exam_type}-${grade.profiles?.name || 'Unknown'}`;
        
        if (!acc[key]) {
          acc[key] = {
            id: grade.id,
            class_name: grade.classes?.name || 'Unknown Class',
            subject_name: grade.subjects?.name || 'Unknown Subject',
            teacher_name: grade.profiles?.name || 'Unknown Teacher',
            term: grade.term || 'Unknown Term',
            exam_type: grade.exam_type || 'Unknown Exam',
            submitted_at: grade.submitted_at,
            status: grade.status,
            total_students: 0,
            grades_entered: 0
          };
        }
        
        acc[key].grades_entered++;
        return acc;
      }, {});

      const submissionsList = Object.values(grouped || {}) as GradeSubmission[];
      console.log('Processed submissions:', submissionsList);
      setSubmissions(submissionsList);
    } catch (error: any) {
      console.error('Error fetching submissions:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to load grade submissions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (submissionId: string) => {
    setProcessing(submissionId);
    try {
      const { error } = await supabase
        .from('grades')
        .update({ 
          status: 'approved',
          approved_by_principal: true,
          approved_by: user?.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', submissionId);

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
      setProcessing(null);
    }
  };

  const handleReject = async (submissionId: string) => {
    setProcessing(submissionId);
    try {
      const { error } = await supabase
        .from('grades')
        .update({ 
          status: 'rejected',
          approved_by_principal: false
        })
        .eq('id', submissionId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Grades rejected and returned to teacher",
      });

      fetchSubmissions();
    } catch (error: any) {
      console.error('Error rejecting grades:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to reject grades",
        variant: "destructive"
      });
    } finally {
      setProcessing(null);
    }
  };

  const handleRelease = async (submissionId: string) => {
    setProcessing(submissionId);
    try {
      const { error } = await supabase
        .from('grades')
        .update({ 
          status: 'released',
          released_to_parents: true,
          released_by: user?.id,
          released_at: new Date().toISOString()
        })
        .eq('id', submissionId)
        .eq('approved_by_principal', true);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Grades released to parents successfully",
      });

      fetchSubmissions();
    } catch (error: any) {
      console.error('Error releasing grades:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to release grades",
        variant: "destructive"
      });
    } finally {
      setProcessing(null);
    }
  };

  useEffect(() => {
    if (schoolId) {
      fetchSubmissions();
    }
  }, [schoolId]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending Review</Badge>;
      case 'approved':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Rejected</Badge>;
      case 'released':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Released</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <Card className="border border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
            <span className="ml-2">Loading grade submissions...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          Grade Approval Dashboard
        </CardTitle>
        <p className="text-gray-600 text-sm">Review and approve teacher grade submissions</p>
      </CardHeader>
      <CardContent>
        {submissions.length === 0 ? (
          <div className="text-center py-8">
            <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No grade submissions pending approval</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Class</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Term</TableHead>
                  <TableHead>Exam Type</TableHead>
                  <TableHead>Grades</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell className="font-medium">{submission.class_name}</TableCell>
                    <TableCell>{submission.subject_name}</TableCell>
                    <TableCell>{submission.teacher_name}</TableCell>
                    <TableCell>{submission.term}</TableCell>
                    <TableCell>{submission.exam_type}</TableCell>
                    <TableCell>{submission.grades_entered} students</TableCell>
                    <TableCell>
                      {new Date(submission.submitted_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{getStatusBadge(submission.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={processing === submission.id}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        {submission.status === 'submitted' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleApprove(submission.id)}
                              disabled={processing === submission.id}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReject(submission.id)}
                              disabled={processing === submission.id}
                              className="text-red-600 border-red-600 hover:bg-red-50"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        
                        {submission.status === 'approved' && (
                          <Button
                            size="sm"
                            onClick={() => handleRelease(submission.id)}
                            disabled={processing === submission.id}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        )}
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
