
import React, { useState } from 'react';
import { AuthUser } from '@/types/auth';
import { usePrincipalDashboardData } from '@/hooks/usePrincipalDashboardData';
import PrincipalStatsCards from './principal/PrincipalStatsCards';
import PrincipalActionButtons from './principal/PrincipalActionButtons';
import PrincipalGradesManager from './principal/PrincipalGradesManager';
import FinancialOverviewReadOnly from './shared/FinancialOverviewReadOnly';
import AddSubjectModal from '@/components/modals/AddSubjectModal';
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
      
      {/* Main Content - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <PrincipalGradesManager />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <FinancialOverviewReadOnly />
        </div>
      </div>

      {/* Action Buttons - Full Width */}
      <PrincipalActionButtons onModalOpen={handleModalOpen} />
      
      {/* Add Subject Modal */}
      <AddSubjectModal
        open={activeModal === 'add-subject'}
        onClose={handleModalClose}
        onSubjectCreated={handleSubjectCreated}
      />

      {/* Certificate Generator Modal */}
      {activeModal === 'generate-certificate' && (
        <CertificateGenerator
          open={activeModal === 'generate-certificate'}
          onClose={handleModalClose}
          onCertificateGenerated={handleCertificateGenerated}
        />
      )}
    </div>
  );
};

export default PrincipalDashboard;
