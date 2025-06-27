
import React from 'react';
import PrincipalStatsCards from '../PrincipalStatsCards';
import { PrincipalStats } from '@/hooks/usePrincipalDashboardData';

interface PrincipalStatsSectionProps {
  stats: PrincipalStats;
  loading: boolean;
  error: string | null;
}

const PrincipalStatsSection: React.FC<PrincipalStatsSectionProps> = ({
  stats,
  loading,
  error
}) => {
  return (
    <section>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">School Overview</h2>
      <PrincipalStatsCards 
        stats={stats} 
        loading={loading} 
        error={error}
      />
    </section>
  );
};

export default PrincipalStatsSection;
