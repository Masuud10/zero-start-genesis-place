
import React, { useState } from 'react';
import { AuthUser } from '@/types/auth';
import { usePrincipalDashboardData } from '@/hooks/usePrincipalDashboardData';
import PrincipalStatsCards from './principal/PrincipalStatsCards';
import PrincipalActionButtons from './principal/PrincipalActionButtons';
import PrincipalGradesManager from './principal/PrincipalGradesManager';
import FinancialOverviewReadOnly from './shared/FinancialOverviewReadOnly';
import CertificatesList from '@/components/certificates/CertificatesList';
import AddSubjectModal from '@/components/modals/AddSubjectModal';
import SubjectAssignmentModal from '@/components/modals/SubjectAssignmentModal';
import CertificateGenerator from '@/components/certificates/CertificateGenerator';
import PrincipalTimetableCard from './principal/PrincipalTimetableCard';
import { useToast } from '@/hooks/use-toast';

interface PrincipalDashboardProps {
  user: AuthUser;
  onModalOpen: (modalType: string) => void;
}

const PrincipalDashboard: React.FC<PrincipalDashboardProps> = ({ user, onModalOpen }) => {
  console.log('🎓 PrincipalDashboard: Rendering for principal:', user.email);
  const { stats, loading, error } = usePrincipalDashboardData(0);
  const { toast } = useToast();
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const handleModalOpen = (modalType: string) => {
    console.log('PrincipalDashboard: Opening modal:', modalType);
    setActiveModal(modalType);
    
    // Delegate some modals to parent
    if (['reports', 'studentAdmission', 'teacherAdmission', 'addClass'].includes(modalType)) {
      onModalOpen(modalType);
    }
  };

  const handleModalClose = () => {
    console.log('PrincipalDashboard: Closing modal:', activeModal);
    setActiveModal(null);
  };

  const handleSubjectCreated = () => {
    console.log('Subject created successfully');
    toast({
      title: "Success",
      description: "Subject has been created successfully.",
    });
    setActiveModal(null);
  };

  const handleAssignmentCreated = () => {
    console.log('Assignment created successfully');
    toast({
      title: "Success",
      description: "Teacher assignment has been created successfully.",
    });
    setActiveModal(null);
  };

  const handleCertificateGenerated = () => {
    console.log('Certificate generated successfully');
    toast({
      title: "Success",
      description: "Certificate has been generated successfully.",
    });
    setActiveModal(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Stats Overview - Enhanced with better spacing */}
        <div className="w-full">
          <PrincipalStatsCards stats={stats} loading={loading} error={error} />
        </div>
        
        {/* Main Content Grid - Improved responsive layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column - Management Tools */}
          <div className="xl:col-span-2 space-y-6">
            {/* Quick Actions - Refined card design */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <PrincipalActionButtons onModalOpen={handleModalOpen} />
            </div>
            
            {/* Grade Management - Consistent card styling */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <PrincipalGradesManager />
            </div>
            
            {/* Timetable Management - Improved integration */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <PrincipalTimetableCard />
            </div>
          </div>

          {/* Right Column - Analytics & Financial */}
          <div className="xl:col-span-1 space-y-6">
            {/* Financial Overview - Consistent styling */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <FinancialOverviewReadOnly />
            </div>
          </div>
        </div>

        {/* Bottom Section - Certificates with improved layout */}
        <div className="w-full bg-white rounded-lg border border-gray-200 shadow-sm">
          <CertificatesList />
        </div>
      </div>
      
      {/* Modals - Fixed modal integration */}
      <AddSubjectModal
        open={activeModal === 'add-subject'}
        onClose={handleModalClose}
        onSubjectCreated={handleSubjectCreated}
      />

      <SubjectAssignmentModal
        open={activeModal === 'assign-subject'}
        onClose={handleModalClose}
        onAssignmentCreated={handleAssignmentCreated}
      />

      <CertificateGenerator
        open={activeModal === 'generate-certificate'}
        onClose={handleModalClose}
        onCertificateGenerated={handleCertificateGenerated}
      />
    </div>
  );
};

export default PrincipalDashboard;
