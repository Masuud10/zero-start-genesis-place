
import React from 'react';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Shield, Send, CheckCircle, Lock, AlertTriangle } from 'lucide-react';

interface BulkGradingHeaderProps {
  isTeacher: boolean;
  isPrincipal: boolean;
  existingGradesStatus: string;
  isReadOnly: boolean;
}

const BulkGradingHeader: React.FC<BulkGradingHeaderProps> = ({
  isTeacher,
  isPrincipal,
  existingGradesStatus,
  isReadOnly
}) => {
  const getStatusBadge = () => {
    switch (existingGradesStatus) {
      case 'submitted':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600"><Send className="h-3 w-3 mr-1" />Submitted for Approval</Badge>;
      case 'approved':
        return <Badge variant="outline" className="text-green-600 border-green-600"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'released':
        return <Badge variant="outline" className="text-purple-600 border-purple-600"><Lock className="h-3 w-3 mr-1" />Released</Badge>;
      case 'draft':
        return <Badge variant="outline" className="text-blue-600 border-blue-600">Draft</Badge>;
      default:
        return null;
    }
  };

  return (
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2">
        <Shield className="h-5 w-5" />
        {isTeacher ? 'Grade Entry & Submission' : 'Grade Management'}
        {getStatusBadge()}
      </DialogTitle>
      <DialogDescription>
        {isTeacher 
          ? 'Enter grades for your subjects. Grades will be submitted for principal approval.'
          : 'Manage grades for all subjects. You can approve and release results.'
        }
        {isReadOnly && (
          <div className="flex items-center gap-2 mt-2 text-orange-600">
            <AlertTriangle className="h-4 w-4" />
            <span className="font-medium">Read-only mode - grades cannot be modified</span>
          </div>
        )}
      </DialogDescription>
    </DialogHeader>
  );
};

export default BulkGradingHeader;
