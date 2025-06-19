
import React, { useState } from 'react';
import { AuthUser } from '@/types/auth';
import { usePrincipalDashboardData } from '@/hooks/usePrincipalDashboardData';
import PrincipalStatsCards from './principal/PrincipalStatsCards';
import PrincipalActionButtons from './principal/PrincipalActionButtons';
import FinancialOverviewReadOnly from './shared/FinancialOverviewReadOnly';
import AddSubjectModal from '@/components/modals/AddSubjectModal';

interface PrincipalDashboardProps {
  user: AuthUser;
  onModalOpen: (modalType: string) => void;
}

const PrincipalDashboard: React.FC<PrincipalDashboardProps> = ({ user, onModalOpen }) => {
  console.log('🎓 PrincipalDashboard: Rendering for principal:', user.email);
  const { stats, loading, error } = usePrincipalDashboardData(0);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const handleModalOpen = (modalType: string) => {
    setActiveModal(modalType);
    onModalOpen(modalType);
  };

  const handleModalClose = () => {
    setActiveModal(null);
  };

  const handleSubjectCreated = () => {
    // Refresh dashboard data when subject is created
    console.log('Subject created successfully');
    setActiveModal(null);
  };

  return (
    <div className="space-y-6">
      <PrincipalStatsCards stats={stats} loading={loading} error={error} />
      <FinancialOverviewReadOnly />
      <PrincipalActionButtons onModalOpen={handleModalOpen} />
      
      {/* Add Subject Modal */}
      <AddSubjectModal
        open={activeModal === 'add-subject'}
        onClose={handleModalClose}
        onSubjectCreated={handleSubjectCreated}
      />
    </div>
  );
};

export default PrincipalDashboard;
