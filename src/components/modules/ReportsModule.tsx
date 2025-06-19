
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ReportsGenerator from '@/components/reports/ReportsGenerator';
import RoleGuard from '@/components/common/RoleGuard';

const ReportsModule = () => {
  const { user } = use
();

  return (
    <RoleGuard allowedRoles={['principal', 'edufam_admin']} requireSchoolAssignment>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
            Reports Management
          </h1>
          <p className="text-muted-foreground">
            Generate comprehensive academic and administrative reports.
          </p>
        </div>
        
        <ReportsGenerator />
      </div>
    </RoleGuard>
  );
};

export default ReportsModule;
