
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { useOptimizedGradeQuery } from '@/hooks/useOptimizedGradeQuery';
import BulkGradingModal from '@/components/grading/BulkGradingModal';
import GradesModal from '@/components/modals/GradesModal';
import { FileSpreadsheet, Plus, CheckCircle, Clock, AlertTriangle, Users, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const TeacherGradesManager: React.FC = () => {
  const { user } = useAuth();
  const { schoolId } = useSchoolScopedData();
  const { toast } = useToast();
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showGradesModal, setShowGradesModal] = useState(false);

  const { data: grades, isLoading, refetch } = useOptimizedGradeQuery({
    enabled: !!user?.id && !!schoolId
  });

  const pendingGrades = grades?.filter(grade => grade.status === 'draft') || [];
  const submittedGrades = grades?.filter(grade => grade.status === 'submitted') || [];
  const approvedGrades = grades?.filter(grade => grade.status === 'approved') || [];
  const rejectedGrades = grades?.filter(grade => grade.status === 'rejected') || [];

  const handleBulkGrading = () => {
    console.log('Opening bulk grading modal for teacher');
    setShowBulkModal(true);
  };

  const handleSingleGrade = () => {
    console.log('Opening single grade modal for teacher');
    setShowGradesModal(true);
  };

  const handleModalClose = () => {
    setShowBulkModal(false);
    setShowGradesModal(false);
    // Refresh grades data
    refetch();
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Grade Management
          </CardTitle>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={handleSingleGrade}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              Single Grade
            </Button>
            <Button 
              size="sm"
              onClick={handleBulkGrading}
              className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Grade Sheet
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading grades...</p>
          </div>
        ) : (
          <>
            {/* Status Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center justify-between p-3 border rounded-lg bg-orange-25 border-orange-200">
                <div>
                  <p className="text-sm font-medium text-orange-800">Draft Grades</p>
                  <p className="text-2xl font-bold text-orange-600">{pendingGrades.length}</p>
                  <p className="text-xs text-orange-600">Need submission</p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg bg-blue-25 border-blue-200">
                <div>
                  <p className="text-sm font-medium text-blue-800">Submitted</p>
                  <p className="text-2xl font-bold text-blue-600">{submittedGrades.length}</p>
                  <p className="text-xs text-blue-600">Awaiting approval</p>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  Pending
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg bg-green-25 border-green-200">
                <div>
                  <p className="text-sm font-medium text-green-800">Approved</p>
                  <p className="text-2xl font-bold text-green-600">{approvedGrades.length}</p>
                  <p className="text-xs text-green-600">Principal approved</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>

              {rejectedGrades.length > 0 && (
                <div className="flex items-center justify-between p-3 border rounded-lg bg-red-25 border-red-200">
                  <div>
                    <p className="text-sm font-medium text-red-800">Rejected</p>
                    <p className="text-2xl font-bold text-red-600">{rejectedGrades.length}</p>
                    <p className="text-xs text-red-600">Need revision</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">Grading Tools</h4>
                <Badge variant="outline" className="text-xs">
                  Teacher Dashboard
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                <Button 
                  variant="default" 
                  className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={handleBulkGrading}
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Open Grade Sheet (Recommended)
                  <Badge variant="secondary" className="ml-auto bg-blue-100 text-blue-800">
                    Bulk Entry
                  </Badge>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handleSingleGrade}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Single Grade
                  <Badge variant="secondary" className="ml-auto">
                    Individual
                  </Badge>
                </Button>
              </div>
            </div>

            {/* Teacher Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h5 className="font-medium text-blue-900 mb-1">How to Enter Grades</h5>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Use <strong>Grade Sheet</strong> for entering multiple student grades at once</li>
                    <li>• Students are listed in rows, subjects in columns</li>
                    <li>• Mark students as absent if they missed the exam</li>
                    <li>• Grades are automatically calculated and positioned</li>
                    <li>• Submit grades to principal for approval</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Status Messages */}
            {pendingGrades.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm text-yellow-800">
                    You have {pendingGrades.length} draft grades ready for submission.
                  </span>
                </div>
              </div>
            )}

            {submittedGrades.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-800">
                    {submittedGrades.length} grades submitted and awaiting principal approval.
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>

      {/* Modals */}
      {showBulkModal && (
        <BulkGradingModal 
          open={showBulkModal}
          onClose={handleModalClose}
          classList={[]}
          subjectList={[]}
        />
      )}

      {showGradesModal && (
        <GradesModal 
          onClose={handleModalClose} 
          userRole={user?.role || 'teacher'} 
        />
      )}
    </Card>
  );
};

export default TeacherGradesManager;
