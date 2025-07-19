import React from 'react';
import { Navigate } from 'react-router-dom';
import { useConsolidatedAuth } from '@/hooks/useConsolidatedAuth';
import SuperAdminDashboard from '@/pages/super_admin/SuperAdminDashboard';
import SupportHrDashboard from '@/pages/support_hr/SupportHrDashboard';
import SoftwareEngineerDashboard from '@/pages/software_engineer/SoftwareEngineerDashboard';
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
    return <Navigate to="/auth" replace />;
  }

  // Default to Super Admin dashboard for now
  // You can implement role-based routing here
  return <SuperAdminDashboard />;
};

export default AdminDashboard;