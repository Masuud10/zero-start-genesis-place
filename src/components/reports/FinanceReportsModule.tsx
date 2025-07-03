import React from "react";
import RoleBasedReportGenerator from "@/components/dashboard/reports/RoleBasedReportGenerator";

const FinanceReportsModule: React.FC = () => {
  return (
    <div className="space-y-6">
      <RoleBasedReportGenerator userRole="finance_officer" />
    </div>
  );
};

export default FinanceReportsModule;
