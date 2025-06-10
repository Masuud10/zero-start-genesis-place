
import React from 'react';
import ReportExporter from './ReportExporter';
import AlertSystem from './AlertSystem';
import SystemOverviewCards from './SystemOverviewCards';
import NetworkPerformanceChart from './NetworkPerformanceChart';
import TransactionVolumeChart from './TransactionVolumeChart';
import FeatureAdoptionCard from './FeatureAdoptionCard';
import SupportAnalyticsCard from './SupportAnalyticsCard';
import SystemHealthCard from './SystemHealthCard';
import SchoolNetworkDetails from './SchoolNetworkDetails';

interface ElimshaAdminAnalyticsProps {
  filters: {
    term: string;
  };
}

const ElimshaAdminAnalytics = ({ filters }: ElimshaAdminAnalyticsProps) => {
  return (
    <div className="space-y-6">
      {/* Alert System - Priority placement at top */}
      <AlertSystem />

      {/* Report Export */}
      <ReportExporter />

      {/* System Overview */}
      <SystemOverviewCards />

      {/* Network Performance */}
      <NetworkPerformanceChart />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transaction Volume */}
        <TransactionVolumeChart />

        {/* Feature Usage */}
        <FeatureAdoptionCard />
      </div>

      {/* Support Analytics */}
      <SupportAnalyticsCard />

      {/* System Health Monitoring */}
      <SystemHealthCard />

      {/* School Details Table */}
      <SchoolNetworkDetails />
    </div>
  );
};

export default ElimshaAdminAnalytics;
