
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, AlertTriangle, Eye, Edit3, MessageSquare, Clock } from 'lucide-react';

interface GradeBatch {
  id: string;
  batch_name: string;
  class_id: string;
  term: string;
  exam_type: string;
  curriculum_type: string;
  status: string;
  total_students: number;
  grades_entered: number;
  submitted_by: string;
  submitted_at: string;
  teacher_name: string;
  class_name: string;
}

interface PrincipalGradeApprovalInterfaceProps {
  onRefresh: () => void;
}

export const PrincipalGradeApprovalInterface: React.FC<PrincipalGradeApprovalInterfaceProps> = ({
  onRefresh
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [pendingBatches, setPendingBatches] = useState<GradeBatch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<GradeBatch | null>(null);
  const [grades, setGrades] = useState<any[]>([]);
  const [principalNotes, setPrincipalNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadPendingBatches();
  }, [user]);

  const loadPendingBatches = async () => {
    if (!user?.school_id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('grade_submission_batches')
        .select(`
          *,
          profiles!grade_submission_batches_submitted_by_fkey(name),
          classes(name)
        `)
        .eq('school_id', user.school_id)
        .eq('status', 'submitted')
        .order('submitted_at', { ascending: false });

      if (error) throw error;

      const processedBatches = (data || []).map(batch => ({
        ...batch,
        teacher_name: (batch as any).profiles?.name || 'Unknown Teacher',
        class_name: (batch as any).classes?.name || 'Unknown Class'
      })) as GradeBatch[];

      setPendingBatches(processedBatches);
    } catch (error) {
      console.error('Error loading pending batches:', error);
      toast({
        title: "Error",
        description: "Failed to load pending grade submissions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadBatchGrades = async (batch: GradeBatch) => {
    setSelectedBatch(batch);
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('grades')
        .select(`
          *,
          students(name, admission_number),
          subjects(name, code)
        `)
        .eq('submission_batch_id', batch.id)
        .order('students(name)');

      if (error) throw error;
      setGrades(data || []);
    } catch (error) {
      console.error('Error loading batch grades:', error);
      toast({
        title: "Error",
        description: "Failed to load grades for review",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBatchAction = async (action: 'approve' | 'reject' | 'release', batchId: string) => {
    if (!user) return;

    setActionLoading(true);
    try {
      // Update batch status
      const newStatus = action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'released';
      
      const { error: batchError } = await supabase
        .from('grade_submission_batches')
        .update({
          status: newStatus,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          principal_notes: principalNotes || null
        })
        .eq('id', batchId);

      if (batchError) throw batchError;

      // Update all grades in the batch
      const gradeUpdate: any = {
        approval_workflow_stage: newStatus,
        status: newStatus
      };

      if (action === 'approve') {
        gradeUpdate.approved_by = user.id;
        gradeUpdate.approved_at = new Date().toISOString();
      } else if (action === 'release') {
        gradeUpdate.released_by = user.id;
        gradeUpdate.released_at = new Date().toISOString();
        gradeUpdate.is_released = true;
        gradeUpdate.released_to_parents = true;
      }

      const { error: gradesError } = await supabase
        .from('grades')
        .update(gradeUpdate)
        .eq('submission_batch_id', batchId);

      if (gradesError) throw gradesError;

      // Log the approval action
      const { error: logError } = await supabase
        .from('grade_approvals')
        .insert({
          batch_id: batchId,
          approver_id: user.id,
          approver_role: 'principal',
          action: action,
          notes: principalNotes || `Grades ${action}d by principal`,
          school_id: user.school_id
        });

      if (logError) throw logError;

      toast({
        title: "Success",
        description: `Grades ${action}d successfully`,
      });

      // Refresh data
      loadPendingBatches();
      setSelectedBatch(null);
      setGrades([]);
      setPrincipalNotes('');
      onRefresh();

    } catch (error) {
      console.error(`Error ${action}ing grades:`, error);
      toast({
        title: "Error",
        description: `Failed to ${action} grades`,
        variant: "destructive"
      });
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'released': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Pending Grade Approvals
            {pendingBatches.length > 0 && (
              <Badge variant="secondary">{pendingBatches.length} pending</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading && !selectedBatch ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : pendingBatches.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No grade submissions pending approval</p>
              <p className="text-sm">All grade submissions are up to date</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingBatches.map((batch) => (
                <div key={batch.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{batch.batch_name}</h4>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>Teacher: {batch.teacher_name}</span>
                        <span>Class: {batch.class_name}</span>
                        <span>Term: {batch.term}</span>
                        <span>Exam: {batch.exam_type}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(batch.status)}>
                        {batch.status.toUpperCase()}
                      </Badge>
                      <Badge variant="outline">
                        {batch.curriculum_type.toUpperCase()}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      <span>{batch.grades_entered} of {batch.total_students} students graded</span>
                      <span className="ml-4">
                        Submitted: {new Date(batch.submitted_at).toLocaleString()}
                      </span>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => loadBatchGrades(batch)}
                      className="flex items-center gap-1"
                    >
                      <Eye className="h-4 w-4" />
                      Review
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Grade Review Modal */}
      {selectedBatch && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit3 className="h-5 w-5" />
              Review: {selectedBatch.batch_name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <>
                {/* Grade Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{grades.length}</div>
                    <div className="text-sm text-gray-600">Total Grades</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {grades.filter(g => g.score >= (g.max_score * 0.5) || g.competency_level === 'ME' || g.competency_level === 'EM').length}
                    </div>
                    <div className="text-sm text-gray-600">Passing</div>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {selectedBatch.curriculum_type === 'cbc' ? 
                        (grades.reduce((sum, g) => sum + (g.overall_rating || 0), 0) / grades.length).toFixed(1) :
                        (grades.reduce((sum, g) => sum + (g.percentage || 0), 0) / grades.length).toFixed(1)
                      }
                    </div>
                    <div className="text-sm text-gray-600">
                      {selectedBatch.curriculum_type === 'cbc' ? 'Avg Rating' : 'Avg %'}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {selectedBatch.curriculum_type.toUpperCase()}
                    </div>
                    <div className="text-sm text-gray-600">Curriculum</div>
                  </div>
                </div>

                {/* Principal Notes */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Principal Notes & Comments
                  </label>
                  <Textarea
                    placeholder="Enter your review comments, feedback for the teacher, or reasons for approval/rejection..."
                    value={principalNotes}
                    onChange={(e) => setPrincipalNotes(e.target.value)}
                    rows={3}
                    className="w-full"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedBatch(null);
                      setGrades([]);
                      setPrincipalNotes('');
                    }}
                  >
                    Cancel
                  </Button>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="destructive"
                      onClick={() => handleBatchAction('reject', selectedBatch.id)}
                      disabled={actionLoading}
                      className="flex items-center gap-1"
                    >
                      <XCircle className="h-4 w-4" />
                      {actionLoading ? 'Processing...' : 'Reject'}
                    </Button>
                    
                    <Button
                      variant="default"
                      onClick={() => handleBatchAction('approve', selectedBatch.id)}
                      disabled={actionLoading}
                      className="flex items-center gap-1 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4" />
                      {actionLoading ? 'Processing...' : 'Approve'}
                    </Button>
                    
                    <Button
                      variant="default"
                      onClick={() => handleBatchAction('release', selectedBatch.id)}
                      disabled={actionLoading}
                      className="flex items-center gap-1 bg-purple-600 hover:bg-purple-700"
                    >
                      <Clock className="h-4 w-4" />
                      {actionLoading ? 'Processing...' : 'Approve & Release'}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
