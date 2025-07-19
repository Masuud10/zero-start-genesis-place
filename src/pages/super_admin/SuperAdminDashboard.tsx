import React, { useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import DashboardOverview from "@/components/dashboard/DashboardOverview";

const SuperAdminDashboard = () => {
  return (
    <AdminLayout>
      <DashboardOverview 
        role="super_admin" 
        greeting="Good morning" 
        userName="Super Admin" 
      />
    </AdminLayout>
  );
};

export default SuperAdminDashboard;
