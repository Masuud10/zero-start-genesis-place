
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
    <div className="space-y-6">
      {/* Stats Overview */}
      <PrincipalStatsCards stats={stats} loading={loading} error={error} />
      
      {/* Main Content - Three Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Grade Management */}
        <div className="lg:col-span-1">
          <PrincipalGradesManager />
        </div>

        {/* Right Column - Financial Overview */}
        <div className="lg:col-span-2">
          <FinancialOverviewReadOnly />
        </div>
      </div>

      {/* Action Buttons - Full Width */}
      <PrincipalActionButtons onModalOpen={handleModalOpen} />

      {/* Certificates Section - Full Width */}
      <CertificatesList />
      
      {/* Add Subject Modal */}
      <AddSubjectModal
        open={activeModal === 'add-subject'}
        onClose={handleModalClose}
        onSubjectCreated={handleSubjectCreated}
      />

      {/* Subject Assignment Modal */}
      <SubjectAssignmentModal
        open={activeModal === 'assign-subject'}
        onClose={handleModalClose}
        onAssignmentCreated={handleAssignmentCreated}
      />

      {/* Certificate Generator Modal */}
      <CertificateGenerator
        open={activeModal === 'generate-certificate'}
        onClose={handleModalClose}
        onCertificateGenerated={handleCertificateGenerated}
      />
    </div>
  );
};

export default PrincipalDashboard;
