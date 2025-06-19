
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { useOptimizedGradeQuery } from '@/hooks/useOptimizedGradeQuery';
import BulkGradingModal from '@/components/grading/BulkGradingModal';
import GradesModal from '@/components/modals/GradesModal';
import { FileSpreadsheet, Plus, CheckCircle, Clock } from 'lucide-react';

const TeacherGradesManager: React.FC = () => {
  const { user } = useAuth();
  const { schoolId } = useSchoolScopedData();
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showGradesModal, setShowGradesModal] = useState(false);

  const { data: grades, isLoading } = useOptimizedGradeQuery({
    enabled: !!user?.id && !!schoolId
  });

  const pendingGrades = grades?.filter(grade => grade.status === 'draft') || [];
  const submittedGrades = grades?.filter(grade => grade.status === 'submitted') || [];
  const approvedGrades = grades?.filter(grade => grade.status === 'approved') || [];

  return (
    <Card>
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
              onClick={() => setShowGradesModal(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Grade
            </Button>
            <Button 
              size="sm"
              onClick={() => setShowBulkModal(true)}
            >
              <FileSpreadsheet className="h-4 w-4 mr-1" />
              Bulk Entry
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4">Loading grades...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="text-sm font-medium">Draft Grades</p>
                <p className="text-2xl font-bold text-orange-600">{pendingGrades.length}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="text-sm font-medium">Submitted for Approval</p>
                <p className="text-2xl font-bold text-blue-600">{submittedGrades.length}</p>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Pending
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="text-sm font-medium">Approved Grades</p>
                <p className="text-2xl font-bold text-green-600">{approvedGrades.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>
        )}
      </CardContent>

      {showBulkModal && (
        <BulkGradingModal 
          open={showBulkModal}
          onClose={() => setShowBulkModal(false)}
          classList={[]}
          subjectList={[]}
        />
      )}

      {showGradesModal && (
        <GradesModal 
          onClose={() => setShowGradesModal(false)} 
          userRole={user?.role || 'teacher'} 
        />
      )}
    </Card>
  );
};

export default TeacherGradesManager;
