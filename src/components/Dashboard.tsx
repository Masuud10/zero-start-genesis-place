
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import GradesModal from './modals/GradesModal';
import AttendanceModal from './modals/AttendanceModal';
import ResultsModal from './modals/ResultsModal';
import ReportsModal from './modals/ReportsModal';
import FeeCollectionModal from './modals/FeeCollectionModal';
import FinancialReportsModal from './modals/FinancialReportsModal';
import SchoolOwnerDashboard from './dashboard/SchoolOwnerDashboard';
import PrincipalDashboard from './dashboard/PrincipalDashboard';
import TeacherDashboard from './dashboard/TeacherDashboard';
import ParentDashboard from './dashboard/ParentDashboard';
import ElimshaAdminDashboard from './dashboard/ElimshaAdminDashboard';

const Dashboard = () => {
  const { user } = useAuth();
  const [activeModal, setActiveModal] = useState<string | null>(null);

  console.log('📊 Dashboard: Rendering for user', user?.email, 'role:', user?.role);

  const openModal = (modalType: string) => {
    console.log('📊 Dashboard: Opening modal', modalType);
    setActiveModal(modalType);
  };

  const closeModal = () => {
    console.log('📊 Dashboard: Closing modal');
    setActiveModal(null);
  };

  const getRoleBasedDashboard = () => {
    switch (user?.role) {
      case 'school_owner':
        return <SchoolOwnerDashboard onModalOpen={openModal} />;
      case 'principal':
        return <PrincipalDashboard onModalOpen={openModal} />;
      case 'teacher':
        return <TeacherDashboard onModalOpen={openModal} />;
      case 'parent':
        return <ParentDashboard onModalOpen={openModal} />;
      case 'elimisha_admin':
        return <ElimshaAdminDashboard onModalOpen={openModal} />;
      case 'finance_officer':
        return <SchoolOwnerDashboard onModalOpen={openModal} />; // Same as school owner for now
      case 'edufam_admin':
        return <ElimshaAdminDashboard onModalOpen={openModal} />; // Same as elimisha admin for now
      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>
                You don't have permission to view this dashboard.
              </CardDescription>
            </CardHeader>
          </Card>
        );
    }
  };

  if (!user) {
    console.log('📊 Dashboard: No user found, should not render');
    return null;
  }

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome back, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            {user?.role === 'elimisha_admin' 
              ? "System-wide management and monitoring dashboard."
              : user?.role === 'school_owner'
              ? "Monitor your school's financial, academic, and operational performance."
              : user?.role === 'principal'
              ? "Oversee daily operations and academic excellence at your school."
              : user?.role === 'teacher'
              ? "Manage your classes, grades, and student interactions."
              : user?.role === 'parent'
              ? "Stay updated on your child's academic progress and school activities."
              : "Here's what's happening in your school today."
            }
          </p>
        </div>
        <div className="block">
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl shadow-lg">
            <div className="text-xs md:text-sm opacity-90">Today's Date</div>
            <div className="font-semibold text-sm md:text-base">
              {new Date().toLocaleDateString('en-US', { 
                weekday: window.innerWidth < 768 ? 'short' : 'long', 
                year: 'numeric', 
                month: window.innerWidth < 768 ? 'short' : 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </div>
      </div>

      {getRoleBasedDashboard()}

      {/* Modals */}
      {activeModal === 'grades' && <GradesModal onClose={closeModal} userRole={user?.role as any} />}
      {activeModal === 'attendance' && <AttendanceModal onClose={closeModal} userRole={user?.role as any} />}
      {activeModal === 'results' && <ResultsModal onClose={closeModal} />}
      {activeModal === 'reports' && <ReportsModal onClose={closeModal} />}
      {activeModal === 'fee-collection' && <FeeCollectionModal onClose={closeModal} />}
      {activeModal === 'financial-reports' && <FinancialReportsModal onClose={closeModal} />}
    </div>
  );
};

export default Dashboard;
