import React from "react";
import RoleBasedReportGenerator from "@/components/dashboard/reports/RoleBasedReportGenerator";

const TeacherReportsModule: React.FC = () => {
  return (
    <div className="space-y-6">
      <RoleBasedReportGenerator userRole="teacher" />
    </div>
  );
};

export default TeacherReportsModule;
