import React from "react";
import RoleBasedReportGenerator from "@/components/dashboard/reports/RoleBasedReportGenerator";

const ParentReportsModule: React.FC = () => {
  return (
    <div className="space-y-6">
      <RoleBasedReportGenerator userRole="parent" />
    </div>
  );
};

export default ParentReportsModule;
