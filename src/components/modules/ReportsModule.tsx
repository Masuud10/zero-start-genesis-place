
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ReportsGenerator from '@/components/reports/ReportsGenerator';
import EduFamReportGeneration from '@/components/reports/EduFamReportGeneration';
import TeacherReportsModule from '@/components/reports/TeacherReportsModule';
import RoleGuard from '@/components/common/RoleGuard';

const ReportsModule = () => {
  const { user } = useAuth();

  // For EduFam admins, show company-level reports
  if (user?.role === 'edufam_admin') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
            EduFam Company Reports
          </h1>
          <p className="text-muted-foreground">
            Generate comprehensive company-level reports and analytics.
          </p>
        </div>
        
        <EduFamReportGeneration />
      </div>
    );
  }

  // For teachers, show limited reports module
  if (user?.role === 'teacher') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
            Teacher Reports
          </h1>
          <p className="text-muted-foreground">
            Generate grade and attendance reports for your classes.
          </p>
        </div>
        
        <TeacherReportsModule />
      </div>
    );
  }

  // For other roles, show school-level reports
  return (
    <RoleGuard allowedRoles={['principal', 'edufam_admin', 'school_owner', 'finance_officer']} requireSchoolAssignment>
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
