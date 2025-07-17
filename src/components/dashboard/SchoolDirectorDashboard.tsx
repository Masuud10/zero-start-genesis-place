import React from "react";
import SchoolOwnerMetricsFetcher from "./school-owner/SchoolOwnerMetricsFetcher";
import SchoolDirectorExpenseApproval from "@/components/finance/SchoolDirectorExpenseApproval";

const SchoolDirectorDashboard = () => {
  console.log('🏫 SchoolDirectorDashboard: Rendering with school director access and functionality');

  return (
    <div className="space-y-6">
      <SchoolOwnerMetricsFetcher />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SchoolDirectorExpenseApproval />
      </div>
    </div>
  );
};

export default SchoolDirectorDashboard;
