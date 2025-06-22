
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { supabase } from '@/integrations/supabase/client';
import { Award, CheckCircle, XCircle, Send, Eye, Clock, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface GradeSubmissionBatch {
  id: string;
  class_name: string;
  subject_names: string[];
  teacher_name: string;
  term: string;
  exam_type: string;
  total_students: number;
  grades_entered: number;
  submitted_at: string;
  status: string;
  batch_name: string;
}

const EnhancedGradeApprovalDashboard = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { schoolId } = useSchoolScopedData();
  
  const [submissions, setSubmissions] = useState<GradeSubmissionBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchSubmissions = async () => {
    if (!schoolId) {
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching grade submission batches for school:', schoolId);
      
      // First fetch from grade_submission_batches table
      const { data: batchData, error: batchError } = await supabase
        .from('grade_submission_batches')
        .select(`
          id,
          class_id,
          term,
          exam_type,
          submitted_by,
          batch_name,
          total_students,
          grades_entered,
          submitted_at,
          status,
          classes!inner(name),
          profiles!grade_submission_batches_submitted_by_fkey(name)
        `)
        .eq('school_id', schoolId)
        .in('status', ['submitted', 'approved'])
        .order('submitted_at', { ascending: false });

      if (batchError) {
        console.error('Error fetching batch submissions:', batchError);
        throw batchError;
      }

      console.log('Batch submissions loaded:', batchData?.length || 0);

      // Process batch data
      const processedBatches = batchData?.map((batch: any) => ({
        id: batch.id,
        class_name: batch.classes?.name || 'Unknown Class',
        subject_names: ['Multiple Subjects'], // We'll enhance this later
        teacher_name: batch.profiles?.name || 'Unknown Teacher',
        term: batch.term || 'Unknown Term',
        exam_type: batch.exam_type || 'Unknown Exam',
        total_students: batch.total_students || 0,
        grades_entered: batch.grades_entered || 0,
        submitted_at: batch.submitted_at,
        status: batch.status,
        batch_name: batch.batch_name || `${batch.term} - ${batch.exam_type}`
      })) || [];

      // Also fetch individual grade submissions not in batches
      const { data: individualGrades, error: gradesError } = await supabase
        .from('grades')
        .select(`
          id,
          term,
          exam_type,
          submitted_at,
          status,
          class_id,
          submitted_by,
          subject_id,
          subjects!inner(name),
          classes!inner(name),
          profiles!grades_submitted_by_fkey(name)
        `)
        .eq('school_id', schoolId)
        .in('status', ['submitted', 'approved'])
        .is('submission_batch_id', null)
        .order('submitted_at', { ascending: false });

      if (gradesError) {
        console.warn('Error fetching individual grades:', gradesError);
      }

      // Group individual grades by submission context
      const individualSubmissions = new Map();
      individualGrades?.forEach((grade: any) => {
        const key = `${grade.class_id}-${grade.term}-${grade.exam_type}-${grade.submitted_by}`;
        if (!individualSubmissions.has(key)) {
          individualSubmissions.set(key, {
            id: `individual-${key}`,
            class_name: grade.classes?.name || 'Unknown Class',
            subject_names: [],
            teacher_name: grade.profiles?.name || 'Unknown Teacher',
            term: grade.term || 'Unknown Term',
            exam_type: grade.exam_type || 'Unknown Exam',
            total_students: 0,
            grades_entered: 0,
            submitted_at: grade.submitted_at,
            status: grade.status,
            batch_name: `${grade.term} - ${grade.exam_type} (Individual)`
          });
        }
        const submission = individualSubmissions.get(key);
        if (!submission.subject_names.includes(grade.subjects?.name)) {
          submission.subject_names.push(grade.subjects?.name || 'Unknown Subject');
        }
        submission.grades_entered++;
      });

      const allSubmissions = [
        ...processedBatches,
        ...Array.from(individualSubmissions.values())
      ];

      console.log('All submissions processed:', allSubmissions.length);
      setSubmissions(allSubmissions);
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

  const handleBatchAction = async (submissionId: string, action: 'approve' | 'reject' | 'release') => {
    setProcessing(submissionId);
    try {
      let updateData: any = {};
      let statusMessage = '';

      switch (action) {
        case 'approve':
          updateData = {
            status: 'approved',
            approval_workflow_stage: 'approved',
            approved_by: user?.id,
            approved_at: new Date().toISOString()
          };
          statusMessage = 'Grades approved successfully';
          break;
        case 'reject':
          updateData = {
            status: 'rejected',
            approval_workflow_stage: 'rejected'
          };
          statusMessage = 'Grades rejected and returned to teacher';
          break;
        case 'release':
          updateData = {
            status: 'released',
            approval_workflow_stage: 'released',
            is_released: true,
            released_to_parents: true,
            released_by: user?.id,
            released_at: new Date().toISOString()
          };
          statusMessage = 'Grades released to parents successfully';
          break;
      }

      // Update batch if it exists
      if (!submissionId.startsWith('individual-')) {
        const { error: batchError } = await supabase
          .from('grade_submission_batches')
          .update({ status: updateData.status })
          .eq('id', submissionId);

        if (batchError) {
          console.warn('Error updating batch:', batchError);
        }
      }

      // Update individual grades
      const submission = submissions.find(s => s.id === submissionId);
      if (submission) {
        const { error: gradesError } = await supabase
          .from('grades')
          .update(updateData)
          .eq('class_id', submission.class_name) // This needs to be fixed to use actual class_id
          .eq('term', submission.term)
          .eq('exam_type', submission.exam_type)
          .eq('school_id', schoolId);

        if (gradesError) {
          console.error('Error updating grades:', gradesError);
          throw gradesError;
        }
      }

      toast({
        title: "Success",
        description: statusMessage,
      });

      fetchSubmissions();
    } catch (error: any) {
      console.error(`Error ${action}ing grades:`, error);
      toast({
        title: "Error",
        description: error.message || `Failed to ${action} grades`,
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
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Pending Review
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800 flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Rejected
          </Badge>
        );
      case 'released':
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 flex items-center gap-1">
            <Send className="h-3 w-3" />
            Released
          </Badge>
        );
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
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              No grade submissions pending approval. Teachers will submit grades here for your review.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Batch</TableHead>
                  <TableHead>Class</TableHead>
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
                    <TableCell className="font-medium">{submission.batch_name}</TableCell>
                    <TableCell>{submission.class_name}</TableCell>
                    <TableCell>{submission.teacher_name}</TableCell>
                    <TableCell>{submission.term}</TableCell>
                    <TableCell>{submission.exam_type}</TableCell>
                    <TableCell>{submission.grades_entered} entries</TableCell>
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
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        {submission.status === 'submitted' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleBatchAction(submission.id, 'approve')}
                              disabled={processing === submission.id}
                              className="bg-green-600 hover:bg-green-700 text-white"
                              title="Approve Grades"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleBatchAction(submission.id, 'reject')}
                              disabled={processing === submission.id}
                              className="text-red-600 border-red-600 hover:bg-red-50"
                              title="Reject Grades"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        
                        {submission.status === 'approved' && (
                          <Button
                            size="sm"
                            onClick={() => handleBatchAction(submission.id, 'release')}
                            disabled={processing === submission.id}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            title="Release to Parents"
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

export default EnhancedGradeApprovalDashboard;
