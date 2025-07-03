import React from "react";
import RoleBasedReportGenerator from "@/components/dashboard/reports/RoleBasedReportGenerator";

const SystemReportsModule: React.FC = () => {
  return (
    <div className="space-y-6">
      <RoleBasedReportGenerator userRole="edufam_admin" />
    </div>
  );
};

export default SystemReportsModule;
