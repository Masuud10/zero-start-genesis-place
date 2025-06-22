
import React from 'react';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CurriculumType } from '@/hooks/useSchoolCurriculum';

interface BulkGradingHeaderProps {
  isTeacher: boolean;
  isPrincipal: boolean;
  existingGradesStatus: string;
  isReadOnly: boolean;
  curriculumType?: CurriculumType;
}

const BulkGradingHeader: React.FC<BulkGradingHeaderProps> = ({
  isTeacher,
  isPrincipal,
  existingGradesStatus,
  isReadOnly,
  curriculumType = 'standard'
}) => {
  const getCurriculumBadgeColor = (curriculum: CurriculumType) => {
    switch (curriculum) {
      case 'cbc':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'igcse':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getCurriculumLabel = (curriculum: CurriculumType) => {
    switch (curriculum) {
      case 'cbc':
        return 'CBC Curriculum';
      case 'igcse':
        return 'IGCSE Curriculum';
      default:
        return 'Standard Curriculum';
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-3">
          <GraduationCap className="h-6 w-6 text-blue-600" />
          <span>Bulk Grade Management</span>
          <Badge className={`text-xs font-medium ${getCurriculumBadgeColor(curriculumType)}`}>
            {getCurriculumLabel(curriculumType)}
          </Badge>
        </DialogTitle>
      </DialogHeader>

      {/* Role and Status Information */}
      <div className="px-6 pb-4">
        {isTeacher && (
          <Alert className="border-blue-200 bg-blue-50">
            <Clock className="h-4 w-4" />
            <AlertDescription className="text-blue-800">
              <strong>Teacher Mode:</strong> Your grades will be submitted for principal approval once completed.
              {curriculumType === 'cbc' && " Using CBC competency-based assessment."}
              {curriculumType === 'igcse' && " Using IGCSE grade boundaries and standards."}
            </AlertDescription>
          </Alert>
        )}

        {isPrincipal && !isReadOnly && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="text-green-800">
              <strong>Principal Mode:</strong> You can directly save and approve grades.
              {curriculumType === 'cbc' && " CBC curriculum grading system active."}
              {curriculumType === 'igcse' && " IGCSE curriculum grading system active."}
            </AlertDescription>
          </Alert>
        )}

        {isReadOnly && (
          <Alert variant="destructive" className="border-orange-200 bg-orange-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-orange-800">
              <strong>Read-Only Mode:</strong> These grades have been submitted and cannot be modified.
              Status: {existingGradesStatus}
            </AlertDescription>
          </Alert>
        )}
      </div>
    </>
  );
};

export default BulkGradingHeader;
