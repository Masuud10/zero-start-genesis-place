import React from "react";
import PrincipalStatsCards from "../PrincipalStatsCards";
import { PrincipalStats } from "@/hooks/usePrincipalDashboardData";

interface PrincipalStatsSectionProps {
  stats: PrincipalStats;
  loading: boolean;
  error: string | null;
  loadingTimeout?: boolean;
  onRetry?: () => void;
}

const PrincipalStatsSection: React.FC<PrincipalStatsSectionProps> = ({
  stats,
  loading,
  error,
  loadingTimeout = false,
  onRetry,
}) => {
  return (
    <section>
      <PrincipalStatsCards
        stats={stats}
        loading={loading}
        error={error}
        loadingTimeout={loadingTimeout}
        onRetry={onRetry}
      />
    </section>
  );
};

export default PrincipalStatsSection;
