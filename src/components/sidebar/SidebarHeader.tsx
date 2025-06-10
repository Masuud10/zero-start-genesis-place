
import React from 'react';
import { SidebarHeader as ShadcnSidebarHeader } from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';

const SidebarHeader = () => {
  const { user } = useAuth();

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'school_owner':
        return 'School Owner';
      case 'principal':
        return 'Principal';
      case 'teacher':
        return 'Teacher';
      case 'parent':
        return 'Parent';
      case 'finance_officer':
        return 'Finance Officer';
      case 'edufam_admin':
        return 'EduFam Admin';
      case 'elimisha_admin':
        return 'Elimisha Admin';
      default:
        return role;
    }
  };

  return (
    <ShadcnSidebarHeader className="border-b px-6 py-4">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
          <span className="text-white font-bold text-lg">🎓</span>
        </div>
        <div>
          <h2 className="font-bold text-xl text-foreground">Elimisha</h2>
          <p className="text-sm text-muted-foreground">{getRoleDisplay(user?.role || '')}</p>
        </div>
      </div>
    </ShadcnSidebarHeader>
  );
};

export default SidebarHeader;
