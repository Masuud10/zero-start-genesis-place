import React from "react";
import RoleBasedReportGenerator from "@/components/dashboard/reports/RoleBasedReportGenerator";

const PrincipalReportsModule: React.FC = () => {
  return (
    <div className="space-y-6">
      <RoleBasedReportGenerator userRole="principal" />
    </div>
  );
};

export default PrincipalReportsModule;
