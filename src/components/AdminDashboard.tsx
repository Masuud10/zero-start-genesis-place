import React from 'react';
import { Navigate } from 'react-router-dom';
import { useConsolidatedAuth } from '@/hooks/useConsolidatedAuth';
import SuperAdminDashboard from '@/pages/super_admin/SuperAdminDashboard';
import SupportHrDashboard from '@/pages/support_hr/SupportHrDashboard';
import SoftwareEngineerDashboard from '@/pages/software_engineer/SoftwareEngineerDashboard';
import SalesMarketingDashboard from '@/pages/sales_marketing/SalesMarketingDashboard';
import FinanceDashboard from '@/pages/finance/FinanceDashboard';
import { Loader2 } from 'lucide-react';

const AdminDashboard = () => {
  const { user, isLoading } = useConsolidatedAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Role-based dashboard routing
  const getDashboardForRole = () => {
    switch (user.role) {
      case 'super_admin':
      case 'edufam_admin':
        return <SuperAdminDashboard />;
      case 'support_hr':
        return <SupportHrDashboard />;
      case 'software_engineer':
        return <SoftwareEngineerDashboard />;
      case 'sales_marketing':
        return <SalesMarketingDashboard />;
      case 'finance':
        return <FinanceDashboard />;
      default:
        // If role is not recognized, redirect to login for security
        return <Navigate to="/login" replace />;
    }
  };

  return getDashboardForRole();
};

export default AdminDashboard;