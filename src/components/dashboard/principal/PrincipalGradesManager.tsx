
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { useQuery } from '@tanstack/react-query';
import { PrincipalGradeApprovalInterface } from '@/components/grading/PrincipalGradeApprovalInterface';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, Eye, Clock, AlertTriangle, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

const PrincipalGradesManager: React.FC = () => {
  const { user } = useAuth();
  const { schoolId } = useSchoolScopedData();
  const { toast } = useToast();
  const [processing, setProcessing] = useState<string | null>(null);
  const [showApprovalInterface, setShowApprovalInterface] = useState(false);

  // Fetch grades specifically for principal approval with enhanced query
  const { data: grades, isLoading, refetch } = useQuery({
    queryKey: ['principal-grades-approval', user?.id, schoolId],
    queryFn: async () => {
      if (!user?.id || !schoolId) {
        console.log('❌ Missing user ID or school ID for grade fetching');
        return [];
      }

      console.log('🔍 Fetching grades for principal approval:', { schoolId, userId: user.id });

      // Fetch all grades that need principal attention with proper joins
      const { data, error } = await supabase
        .from('grades')
        .select(`
          id,
          student_id,
          subject_id,
          class_id,
          term,
          exam_type,
          score,
          max_score,
          percentage,
          letter_grade,
          status,
          submitted_by,
          submitted_at,
          approved_by,
          approved_at,
          created_at,
          students!inner(name, admission_number),
          subjects!inner(name),
          classes!inner(name),
          profiles!grades_submitted_by_fkey(name)
        `)
        .eq('school_id', schoolId)
        .in('status', ['submitted', 'approved', 'rejected', 'released'])
        .order('submitted_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching grades:', error);
        throw error;
      }

      console.log('✅ Fetched grades for principal:', data?.length || 0);
      return data || [];
    },
    enabled: !!user?.id && !!schoolId && user.role === 'principal',
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });

  const pendingApproval = grades?.filter(grade => grade.status === 'submitted') || [];
  const approvedGrades = grades?.filter(grade => grade.status === 'approved') || [];
  const rejectedGrades = grades?.filter(grade => grade.status === 'rejected') || [];
  const releasedGrades = grades?.filter(grade => grade.status === 'released') || [];

  const handleApproveGrades = async (gradeIds: string[]) => {
    if (!user?.id) return;
    
    setProcessing('approve');
    try {
      console.log('🔄 Approving grades:', gradeIds);
      
      const { data, error } = await supabase.rpc('update_grade_status', {
        grade_ids: gradeIds,
        new_status: 'approved',
        user_id: user.id
      });

      if (error) throw error;

      toast({
        title: "Grades Approved",
        description: `${gradeIds.length} grades have been approved successfully.`,
      });

      refetch();
    } catch (error: any) {
      console.error('❌ Grade approval failed:', error);
      toast({
        title: "Approval Failed",
        description: error.message || "Failed to approve grades.",
        variant: "destructive"
      });
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectGrades = async (gradeIds: string[]) => {
    if (!user?.id) return;
    
    setProcessing('reject');
    try {
      console.log('🔄 Rejecting grades:', gradeIds);
      
      const { error } = await supabase.rpc('update_grade_status', {
        grade_ids: gradeIds,
        new_status: 'rejected',
        user_id: user.id
      });

      if (error) throw error;

      toast({
        title: "Grades Rejected",
        description: `${gradeIds.length} grades have been rejected and sent back to teacher.`,
      });

      refetch();
    } catch (error: any) {
      console.error('❌ Grade rejection failed:', error);
      toast({
        title: "Rejection Failed",
        description: error.message || "Failed to reject grades.",
        variant: "destructive"
      });
    } finally {
      setProcessing(null);
    }
  };

  const handleReleaseGrades = async (gradeIds: string[]) => {
    if (!user?.id) return;
    
    setProcessing('release');
    try {
      console.log('🔄 Releasing grades:', gradeIds);
      
      const { error } = await supabase.rpc('update_grade_status', {
        grade_ids: gradeIds,
        new_status: 'released',
        user_id: user.id
      });

      if (error) throw error;

      toast({
        title: "Grades Released",
        description: `${gradeIds.length} grades have been released to students and parents.`,
      });

      refetch();
    } catch (error: any) {
      console.error('❌ Grade release failed:', error);
      toast({
        title: "Release Failed",
        description: error.message || "Failed to release grades.",
        variant: "destructive"
      });
    } finally {
      setProcessing(null);
    }
  };

  const openApprovalInterface = () => {
    setShowApprovalInterface(true);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Grade Approvals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading grades...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Grade Approvals
          </CardTitle>
          <Button
            size="sm"
            onClick={openApprovalInterface}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Advanced Review
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Status Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-orange-800">Pending Approval</p>
                  <p className="text-lg font-bold text-orange-600">{pendingApproval.length}</p>
                </div>
                <Clock className="h-5 w-5 text-orange-500" />
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-green-800">Approved</p>
                  <p className="text-lg font-bold text-green-600">{approvedGrades.length}</p>
                </div>
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-blue-800">Released</p>
                  <p className="text-lg font-bold text-blue-600">{releasedGrades.length}</p>
                </div>
                <Eye className="h-5 w-5 text-blue-500" />
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-red-800">Rejected</p>
                  <p className="text-lg font-bold text-red-600">{rejectedGrades.length}</p>
                </div>
                <XCircle className="h-5 w-5 text-red-500" />
              </div>
            </div>
          </div>

          {/* Pending Approvals Section */}
          {pendingApproval.length > 0 && (
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                Pending Approvals ({pendingApproval.length})
              </h4>
              
              <Alert className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Teachers have submitted {pendingApproval.length} grades for your review and approval.
                </AlertDescription>
              </Alert>

              {/* Show recent submissions */}
              <div className="mb-4 max-h-40 overflow-y-auto">
                <div className="space-y-2">
                  {pendingApproval.slice(0, 5).map((grade: any) => (
                    <div key={grade.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                      <div>
                        <span className="font-medium">{grade.students?.name}</span>
                        <span className="text-gray-500 ml-2">• {grade.subjects?.name}</span>
                        <span className="text-gray-500 ml-2">• {grade.classes?.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{grade.score}/{grade.max_score}</span>
                        <Badge variant="outline" className="text-xs">
                          {grade.term} {grade.exam_type}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {pendingApproval.length > 5 && (
                    <p className="text-sm text-gray-500 text-center">
                      +{pendingApproval.length - 5} more grades pending...
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleApproveGrades(pendingApproval.map(g => g.id))}
                  disabled={processing === 'approve'}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {processing === 'approve' ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Approving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve All ({pendingApproval.length})
                    </>
                  )}
                </Button>

                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleRejectGrades(pendingApproval.map(g => g.id))}
                  disabled={processing === 'reject'}
                >
                  {processing === 'reject' ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Rejecting...
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject All
                    </>
                  )}
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={openApprovalInterface}
                  className="ml-2"
                >
                  <Settings className="h-4 w-4 mr-1" />
                  Detailed Review
                </Button>
              </div>
            </div>
          )}

          {/* Approved Grades Section */}
          {approvedGrades.length > 0 && (
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Ready for Release ({approvedGrades.length})
              </h4>
              
              <p className="text-sm text-gray-600 mb-3">
                These grades have been approved and are ready to be released to students and parents.
              </p>

              <Button
                size="sm"
                onClick={() => handleReleaseGrades(approvedGrades.map(g => g.id))}
                disabled={processing === 'release'}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {processing === 'release' ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Releasing...
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-1" />
                    Release All Grades ({approvedGrades.length})
                  </>
                )}
              </Button>
            </div>
          )}

          {/* No Pending Actions */}
          {pendingApproval.length === 0 && approvedGrades.length === 0 && (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <h3 className="font-medium text-gray-900">All Caught Up!</h3>
              <p className="text-gray-500">No grades pending approval at this time.</p>
              {grades && grades.length > 0 && (
                <p className="text-sm text-gray-400 mt-2">
                  Total grades managed: {grades.length}
                </p>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={openApprovalInterface}
                className="mt-3"
              >
                <Settings className="h-4 w-4 mr-1" />
                View All Grade Management
              </Button>
            </div>
          )}
        </div>
      </CardContent>

      {/* Advanced Approval Interface Dialog */}
      <Dialog open={showApprovalInterface} onOpenChange={setShowApprovalInterface}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Advanced Grade Review & Approval</DialogTitle>
          </DialogHeader>
          <PrincipalGradeApprovalInterface />
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default PrincipalGradesManager;
