
import React from 'react';
import BeautifulReportGeneration from '@/components/dashboard/shared/BeautifulReportGeneration';
import { useAuth } from '@/contexts/AuthContext';

const ReportsModule = () => {
  const { user } = useAuth();
  
  const getUserRole = () => {
    switch (user?.role) {
      case 'principal':
        return 'principal';
      case 'school_owner':
        return 'school_owner';
      case 'finance_officer':
        return 'finance_officer';
      case 'teacher':
        return 'teacher';
      case 'parent':
        return 'parent';
      case 'edufam_admin':
        return 'edufam_admin';
      default:
        return 'teacher';
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Reports Center</h1>
        <p className="text-gray-600 mt-2">
          Generate comprehensive reports for your school's performance and analytics
        </p>
      </div>
      
      <BeautifulReportGeneration userRole={getUserRole()} />
    </div>
  );
};

export default ReportsModule;
