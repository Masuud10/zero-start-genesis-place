
import React from 'react';
import { CheckCircle, XCircle, Eye, Clock } from 'lucide-react';

interface GradeApprovalOverviewCardsProps {
  pendingCount: number;
  approvedCount: number;
  releasedCount: number;
  rejectedCount: number;
}

export const GradeApprovalOverviewCards: React.FC<GradeApprovalOverviewCardsProps> = ({
  pendingCount,
  approvedCount,
  releasedCount,
  rejectedCount
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-orange-800">Pending Approval</p>
            <p className="text-lg font-bold text-orange-600">{pendingCount}</p>
          </div>
          <Clock className="h-5 w-5 text-orange-500" />
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-green-800">Approved</p>
            <p className="text-lg font-bold text-green-600">{approvedCount}</p>
          </div>
          <CheckCircle className="h-5 w-5 text-green-500" />
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-blue-800">Released</p>
            <p className="text-lg font-bold text-blue-600">{releasedCount}</p>
          </div>
          <Eye className="h-5 w-5 text-blue-500" />
        </div>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-red-800">Rejected</p>
            <p className="text-lg font-bold text-red-600">{rejectedCount}</p>
          </div>
          <XCircle className="h-5 w-5 text-red-500" />
        </div>
      </div>
    </div>
  );
};
