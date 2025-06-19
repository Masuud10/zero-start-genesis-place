
import React from 'react';
import { AuthUser } from '@/types/auth';
import { usePrincipalDashboardData } from '@/hooks/usePrincipalDashboardData';
import PrincipalStatsCards from './principal/PrincipalStatsCards';
import PrincipalActionButtons from './principal/PrincipalActionButtons';
import FinancialOverviewReadOnly from './shared/FinancialOverviewReadOnly';

interface PrincipalDashboardProps {
  user: AuthUser;
  onModalOpen: (modalType: string) => void;
}

const PrincipalDashboard: React.FC<PrincipalDashboardProps> = ({ user, onModalOpen }) => {
  console.log('🎓 PrincipalDashboard: Rendering for principal:', user.email);
  const { stats, loading, error } = usePrincipalDashboardData(0);

  return (
    <div className="space-y-6">
      <PrincipalStatsCards stats={stats} loading={loading} error={error} />
      <FinancialOverviewReadOnly />
      <PrincipalActionButtons onModalOpen={onModalOpen} />
    </div>
  );
};

export default PrincipalDashboard;
