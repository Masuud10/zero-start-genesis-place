
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { Clock, CheckCircle, XCircle, AlertCircle, FileText, User, Calendar } from 'lucide-react';

interface GradingWorkflowPanelProps {
  batchId: string | null;
  batchStatus: string;
  selectedClass: string;
  selectedTerm: string;
  selectedExamType: string;
}

interface BatchInfo {
  id: string;
  batch_name: string;
  total_students: number;
  grades_entered: number;
  status: string;
  submitted_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  principal_notes?: string;
  created_at: string;
}

interface ApprovalHistory {
  id: string;
  action: string;
  approver_role: string;
  notes: string;
  created_at: string;
  profiles: {
    name: string;
  } | null;
}

export const GradingWorkflowPanel: React.FC<GradingWorkflowPanelProps> = ({
  batchId,
  batchStatus,
  selectedClass,
  selectedTerm,
  selectedExamType
}) => {
  const { schoolId } = useSchoolScopedData();
  const [batchInfo, setBatchInfo] = useState<BatchInfo | null>(null);
  const [approvalHistory, setApprovalHistory] = useState<ApprovalHistory[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (batchId) {
      loadBatchInfo();
      loadApprovalHistory();
    }
  }, [batchId]);

  const loadBatchInfo = async () => {
    if (!batchId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('grade_submission_batches')
        .select(`
          *,
          reviewed_by_profile:profiles!grade_submission_batches_reviewed_by_fkey(name)
        `)
        .eq('id', batchId)
        .single();

      if (error) throw error;
      setBatchInfo(data);
    } catch (error) {
      console.error('Error loading batch info:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadApprovalHistory = async () => {
    if (!batchId) return;

    try {
      const { data, error } = await supabase
        .from('grade_approvals')
        .select(`
          *,
          profiles(name)
        `)
        .eq('batch_id', batchId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Process the data to handle potential null profiles with proper null safety
      const processedData = (data || []).map(approval => ({
        ...approval,
        profiles: approval.profiles && typeof approval.profiles === 'object' && 'name' in approval.profiles 
          ? approval.profiles as { name: string }
          : null
      })) as ApprovalHistory[];
      
      setApprovalHistory(processedData);
    } catch (error) {
      console.error('Error loading approval history:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'submitted':
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'released':
        return <FileText className="h-4 w-4 text-purple-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'released':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressPercentage = () => {
    if (!batchInfo) return 0;
    return batchInfo.total_students > 0 ? (batchInfo.grades_entered / batchInfo.total_students) * 100 : 0;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (!batchId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-gray-500">
          <FileText className="h-12 w-12 mx-auto mb-4" />
          <p>No grade submission batch found</p>
          <p className="text-sm">Create grades first to see workflow status</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Batch Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon(batchStatus)}
            Grade Submission Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {batchInfo && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Current Status:</span>
                <Badge className={getStatusColor(batchInfo.status)}>
                  {batchInfo.status.toUpperCase()}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Grades Entered:</span>
                  <span>{batchInfo.grades_entered} of {batchInfo.total_students} students</span>
                </div>
                <Progress value={getProgressPercentage()} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Created:</span>
                  <p className="text-gray-600">{formatDate(batchInfo.created_at)}</p>
                </div>
                {batchInfo.submitted_at && (
                  <div>
                    <span className="font-medium">Submitted:</span>
                    <p className="text-gray-600">{formatDate(batchInfo.submitted_at)}</p>
                  </div>
                )}
                {batchInfo.reviewed_at && (
                  <div>
                    <span className="font-medium">Reviewed:</span>
                    <p className="text-gray-600">{formatDate(batchInfo.reviewed_at)}</p>
                  </div>
                )}
                {batchInfo.reviewed_by && (
                  <div>
                    <span className="font-medium">Reviewed By:</span>
                    <p className="text-gray-600">{(batchInfo as any).reviewed_by_profile?.name || 'Unknown'}</p>
                  </div>
                )}
              </div>

              {batchInfo.principal_notes && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-sm">Principal Notes:</span>
                  <p className="text-sm text-gray-700 mt-1">{batchInfo.principal_notes}</p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Workflow Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Workflow Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className={`flex items-center gap-3 p-3 rounded-lg ${
              ['draft', 'submitted', 'approved', 'rejected', 'released'].includes(batchStatus) ? 'bg-green-50' : 'bg-gray-50'
            }`}>
              <CheckCircle className={`h-5 w-5 ${
                ['draft', 'submitted', 'approved', 'rejected', 'released'].includes(batchStatus) ? 'text-green-500' : 'text-gray-400'
              }`} />
              <div>
                <p className="font-medium">1. Grade Entry</p>
                <p className="text-sm text-gray-600">Teacher enters grades for students</p>
              </div>
            </div>

            <div className={`flex items-center gap-3 p-3 rounded-lg ${
              ['submitted', 'approved', 'rejected', 'released'].includes(batchStatus) ? 'bg-green-50' : 
              batchStatus === 'draft' ? 'bg-yellow-50' : 'bg-gray-50'
            }`}>
              {['submitted', 'approved', 'rejected', 'released'].includes(batchStatus) ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : batchStatus === 'draft' ? (
                <Clock className="h-5 w-5 text-yellow-500" />
              ) : (
                <Clock className="h-5 w-5 text-gray-400" />
              )}
              <div>
                <p className="font-medium">2. Submission</p>
                <p className="text-sm text-gray-600">Teacher submits grades for review</p>
              </div>
            </div>

            <div className={`flex items-center gap-3 p-3 rounded-lg ${
              ['approved', 'released'].includes(batchStatus) ? 'bg-green-50' : 
              batchStatus === 'submitted' ? 'bg-blue-50' :
              batchStatus === 'rejected' ? 'bg-red-50' : 'bg-gray-50'
            }`}>
              {['approved', 'released'].includes(batchStatus) ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : batchStatus === 'submitted' ? (
                <AlertCircle className="h-5 w-5 text-blue-500" />
              ) : batchStatus === 'rejected' ? (
                <XCircle className="h-5 w-5 text-red-500" />
              ) : (
                <Clock className="h-5 w-5 text-gray-400" />
              )}
              <div>
                <p className="font-medium">3. Principal Review</p>
                <p className="text-sm text-gray-600">Principal reviews and approves/rejects grades</p>
              </div>
            </div>

            <div className={`flex items-center gap-3 p-3 rounded-lg ${
              batchStatus === 'released' ? 'bg-green-50' : 
              batchStatus === 'approved' ? 'bg-purple-50' : 'bg-gray-50'
            }`}>
              {batchStatus === 'released' ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : batchStatus === 'approved' ? (
                <FileText className="h-5 w-5 text-purple-500" />
              ) : (
                <Clock className="h-5 w-5 text-gray-400" />
              )}
              <div>
                <p className="font-medium">4. Release to Parents</p>
                <p className="text-sm text-gray-600">Grades are made available to parents</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Approval History */}
      {approvalHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Approval History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {approvalHistory.map((approval) => (
                <div key={approval.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="mt-1">
                    {approval.action === 'approve' ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : approval.action === 'reject' ? (
                      <XCircle className="h-4 w-4 text-red-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-blue-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">
                        {approval.profiles?.name || 'Unknown User'}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {approval.approver_role}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {approval.action.toUpperCase()}
                      </span>
                    </div>
                    {approval.notes && (
                      <p className="text-sm text-gray-600 mb-1">{approval.notes}</p>
                    )}
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      {formatDate(approval.created_at)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
