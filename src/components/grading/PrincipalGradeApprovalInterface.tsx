
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { useToast } from '@/hooks/use-toast';
import { 
  CheckCircle, 
  XCircle, 
  Edit3, 
  Eye, 
  Users, 
  FileText,
  AlertTriangle,
  Clock
} from 'lucide-react';

interface GradeSubmission {
  id: string;
  student_name: string;
  admission_number: string;
  subject_name: string;
  score: number;
  max_score: number;
  percentage: number;
  comments: string;
  teacher_name: string;
  status: string;
  batch_id: string;
}

interface SubmissionBatch {
  id: string;
  batch_name: string;
  class_name: string;
  term: string;
  exam_type: string;
  teacher_name: string;
  submitted_at: string;
  total_students: number;
  grades_entered: number;
  status: string;
}

export const PrincipalGradeApprovalInterface: React.FC = () => {
  const { user } = useAuth();
  const { schoolId } = useSchoolScopedData();
  const { toast } = useToast();

  const [batches, setBatches] = useState<SubmissionBatch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<SubmissionBatch | null>(null);
  const [grades, setGrades] = useState<GradeSubmission[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [principalNotes, setPrincipalNotes] = useState('');
  const [overrideMode, setOverrideMode] = useState(false);
  const [gradeOverrides, setGradeOverrides] = useState<Record<string, number>>({});

  useEffect(() => {
    loadSubmissionBatches();
  }, [schoolId]);

  const loadSubmissionBatches = async () => {
    if (!schoolId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('grade_submission_batches')
        .select(`
          *,
          classes(name),
          profiles!grade_submission_batches_submitted_by_fkey(name)
        `)
        .eq('school_id', schoolId)
        .in('status', ['submitted', 'approved', 'rejected'])
        .order('submitted_at', { ascending: false });

      if (error) throw error;

      const processedBatches = data?.map(batch => ({
        id: batch.id,
        batch_name: batch.batch_name,
        class_name: (batch.classes as any)?.name || 'Unknown Class',
        term: batch.term,
        exam_type: batch.exam_type,
        teacher_name: (batch.profiles as any)?.name || 'Unknown Teacher',
        submitted_at: batch.submitted_at,
        total_students: batch.total_students,
        grades_entered: batch.grades_entered,
        status: batch.status
      })) || [];

      setBatches(processedBatches);

    } catch (error) {
      console.error('Error loading submission batches:', error);
      toast({
        title: "Error",
        description: "Failed to load grade submissions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadBatchGrades = async (batch: SubmissionBatch) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('grades')
        .select(`
          *,
          students(name, admission_number),
          subjects(name),
          profiles!grades_submitted_by_fkey(name)
        `)
        .eq('submission_batch_id', batch.id)
        .eq('school_id', schoolId);

      if (error) throw error;

      const processedGrades = data?.map(grade => ({
        id: grade.id,
        student_name: (grade.students as any)?.name || 'Unknown Student',
        admission_number: (grade.students as any)?.admission_number || 'N/A',
        subject_name: (grade.subjects as any)?.name || 'Unknown Subject',
        score: grade.score || 0,
        max_score: grade.max_score || 100,
        percentage: grade.percentage || 0,
        comments: grade.comments || '',
        teacher_name: (grade.profiles as any)?.name || 'Unknown Teacher',
        status: grade.status,
        batch_id: batch.id
      })) || [];

      setGrades(processedGrades);
      setSelectedBatch(batch);

      // Load existing principal notes
      const batchData = await supabase
        .from('grade_submission_batches')
        .select('principal_notes')
        .eq('id', batch.id)
        .single();

      if (batchData.data?.principal_notes) {
        setPrincipalNotes(batchData.data.principal_notes);
      }

    } catch (error) {
      console.error('Error loading batch grades:', error);
      toast({
        title: "Error",
        description: "Failed to load grades for this batch",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBatchAction = async (action: 'approve' | 'reject' | 'release') => {
    if (!selectedBatch || !user?.id) return;

    setProcessing(true);
    try {
      // Update batch status
      const { error: batchError } = await supabase
        .from('grade_submission_batches')
        .update({
          status: action === 'release' ? 'released' : action + 'd',
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          principal_notes: principalNotes
        })
        .eq('id', selectedBatch.id);

      if (batchError) throw batchError;

      // Update individual grades
      const gradeUpdates: any = {
        status: action === 'release' ? 'released' : action + 'd',
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        principal_notes: principalNotes
      };

      if (action === 'approve') {
        gradeUpdates.approved_by = user.id;
        gradeUpdates.approved_at = new Date().toISOString();
      } else if (action === 'release') {
        gradeUpdates.released_by = user.id;
        gradeUpdates.released_at = new Date().toISOString();
        gradeUpdates.is_released = true;
      }

      // Apply overrides if any
      if (overrideMode && Object.keys(gradeOverrides).length > 0) {
        for (const [gradeId, overrideScore] of Object.entries(gradeOverrides)) {
          await supabase
            .from('grades')
            .update({
              ...gradeUpdates,
              score: overrideScore,
              percentage: (overrideScore / grades.find(g => g.id === gradeId)?.max_score || 100) * 100,
              overridden_grade: overrideScore
            })
            .eq('id', gradeId);
        }
      } else {
        const { error: gradesError } = await supabase
          .from('grades')
          .update(gradeUpdates)
          .eq('submission_batch_id', selectedBatch.id);

        if (gradesError) throw gradesError;
      }

      // Log approval action
      await supabase
        .from('grade_approvals')
        .insert({
          batch_id: selectedBatch.id,
          approver_id: user.id,
          approver_role: 'principal',
          action: action,
          notes: principalNotes,
          school_id: schoolId
        });

      toast({
        title: `Grades ${action === 'release' ? 'Released' : action === 'approve' ? 'Approved' : 'Rejected'}`,
        description: `All grades in this batch have been ${action === 'release' ? 'released to parents' : action + 'd'}`,
      });

      // Refresh data
      await loadSubmissionBatches();
      if (action !== 'reject') {
        await loadBatchGrades(selectedBatch);
      } else {
        setSelectedBatch(null);
        setGrades([]);
      }

    } catch (error) {
      console.error(`Error ${action}ing grades:`, error);
      toast({
        title: `${action.charAt(0).toUpperCase() + action.slice(1)} Failed`,
        description: `Failed to ${action} grades`,
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleGradeOverride = (gradeId: string, newScore: number) => {
    setGradeOverrides(prev => ({
      ...prev,
      [gradeId]: newScore
    }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'released':
        return <Eye className="h-4 w-4 text-purple-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
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

  return (
    <div className="space-y-6">
      {/* Submission Batches List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Grade Submission Batches
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : batches.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No grade submissions found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {batches.map(batch => (
                <div
                  key={batch.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedBatch?.id === batch.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => loadBatchGrades(batch)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(batch.status)}
                      <div>
                        <h4 className="font-medium">{batch.batch_name}</h4>
                        <p className="text-sm text-gray-600">
                          {batch.class_name} • {batch.term} {batch.exam_type} • By {batch.teacher_name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {batch.grades_entered}/{batch.total_students}
                      </Badge>
                      <Badge className={getStatusColor(batch.status)}>
                        {batch.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Grade Review Interface */}
      {selectedBatch && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Review Grades: {selectedBatch.batch_name}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOverrideMode(!overrideMode)}
                  className={overrideMode ? 'bg-orange-50 border-orange-200' : ''}
                >
                  <Edit3 className="h-4 w-4 mr-1" />
                  {overrideMode ? 'Exit Override' : 'Override Mode'}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Principal Notes */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Principal Notes & Feedback</label>
              <Textarea
                value={principalNotes}
                onChange={(e) => setPrincipalNotes(e.target.value)}
                placeholder="Add your review notes and feedback for the teacher..."
                rows={3}
              />
            </div>

            {/* Grades Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border border-gray-200 p-3 text-left">Student</th>
                    <th className="border border-gray-200 p-3 text-left">Subject</th>
                    <th className="border border-gray-200 p-3 text-center">Score</th>
                    <th className="border border-gray-200 p-3 text-center">Percentage</th>
                    <th className="border border-gray-200 p-3 text-left">Comments</th>
                    {overrideMode && (
                      <th className="border border-gray-200 p-3 text-center">Override</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {grades.map(grade => (
                    <tr key={grade.id} className="hover:bg-gray-25">
                      <td className="border border-gray-200 p-3">
                        <div>
                          <div className="font-medium">{grade.student_name}</div>
                          <div className="text-sm text-gray-500">{grade.admission_number}</div>
                        </div>
                      </td>
                      <td className="border border-gray-200 p-3">{grade.subject_name}</td>
                      <td className="border border-gray-200 p-3 text-center">
                        <Badge variant="outline">
                          {gradeOverrides[grade.id] ?? grade.score}/{grade.max_score}
                        </Badge>
                      </td>
                      <td className="border border-gray-200 p-3 text-center">
                        {Math.round(((gradeOverrides[grade.id] ?? grade.score) / grade.max_score) * 100)}%
                      </td>
                      <td className="border border-gray-200 p-3 text-sm">{grade.comments}</td>
                      {overrideMode && (
                        <td className="border border-gray-200 p-3">
                          <Input
                            type="number"
                            min="0"
                            max={grade.max_score}
                            step="0.5"
                            value={gradeOverrides[grade.id] ?? grade.score}
                            onChange={(e) => handleGradeOverride(grade.id, parseFloat(e.target.value) || 0)}
                            className="w-20 text-center"
                          />
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              {selectedBatch.status === 'submitted' && (
                <>
                  <Button
                    onClick={() => handleBatchAction('approve')}
                    disabled={processing}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {processing ? 'Processing...' : 'Approve Grades'}
                  </Button>
                  <Button
                    onClick={() => handleBatchAction('reject')}
                    disabled={processing}
                    variant="destructive"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    {processing ? 'Processing...' : 'Reject & Return'}
                  </Button>
                </>
              )}
              {selectedBatch.status === 'approved' && (
                <Button
                  onClick={() => handleBatchAction('release')}
                  disabled={processing}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {processing ? 'Processing...' : 'Release to Parents'}
                </Button>
              )}
            </div>

            {overrideMode && Object.keys(gradeOverrides).length > 0 && (
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    <span className="text-orange-800">
                      {Object.keys(gradeOverrides).length} grade(s) will be overridden
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
