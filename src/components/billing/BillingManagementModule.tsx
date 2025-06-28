
import React, { useState } from 'react';
import { useBillingRecords, useBillingStats } from '@/hooks/useBillingManagement';
import BillingStatsCards from './BillingStatsCards';
import SchoolBillingList from './SchoolBillingList';
import SchoolBillingDetails from './SchoolBillingDetails';
import BillingLoadingFallback from './BillingLoadingFallback';
import BillingEmptyState from './BillingEmptyState';
import BillingErrorBoundary from './BillingErrorBoundary';

const BillingManagementModule: React.FC = () => {
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | undefined>();
  
  // Fetch billing data to check if the feature is working
  const { 
    data: billingRecords, 
    isLoading: recordsLoading, 
    error: recordsError,
    refetch: refetchRecords
  } = useBillingRecords();
  
  const { 
    data: billingStats, 
    isLoading: statsLoading, 
    error: statsError,
    refetch: refetchStats
  } = useBillingStats();

  const isLoading = recordsLoading || statsLoading;
  const error = recordsError?.message || statsError?.message || null;

  const handleSelectSchool = (schoolId: string) => {
    setSelectedSchoolId(schoolId);
  };

  const handleBackToList = () => {
    setSelectedSchoolId(undefined);
  };

  const handleRetry = () => {
    console.log('🔄 BillingManagementModule: Retrying data fetch');
    refetchRecords();
    refetchStats();
  };

  const handleCreateRecords = () => {
    console.log('📝 BillingManagementModule: Create billing records clicked');
    // TODO: Implement create billing records logic
  };

  // Show loading fallback if needed
  if (isLoading) {
    return (
      <BillingLoadingFallback
        isLoading={isLoading}
        error={error}
        onRetry={handleRetry}
        title="Billing Management"
        timeout={30000} // 30 second timeout
      />
    );
  }

  // Show error fallback if there's an error
  if (error) {
    return (
      <BillingLoadingFallback
        isLoading={false}
        error={error}
        onRetry={handleRetry}
        title="Billing Management"
      />
    );
  }

  // Check if we have no billing records
  const hasNoBillingRecords = !billingRecords || billingRecords.length === 0;

  return (
    <BillingErrorBoundary>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Billing Management</h2>
          <p className="text-muted-foreground">
            Manage setup fees and subscription fees for all schools
          </p>
        </div>

        {/* Always show stats cards if we have stats data */}
        {billingStats && <BillingStatsCards />}

        {/* Show empty state if no billing records exist */}
        {hasNoBillingRecords ? (
          <BillingEmptyState
            title="No Billing Records Found"
            description="There are no billing records in the system yet. This could mean the database is empty, or there might be permission issues. Try refreshing or creating some billing records."
            showCreateButton={true}
            onCreateClick={handleCreateRecords}
            onRefreshClick={handleRetry}
            isRefreshing={isLoading}
          />
        ) : selectedSchoolId ? (
          <SchoolBillingDetails 
            schoolId={selectedSchoolId} 
            onBack={handleBackToList}
          />
        ) : (
          <SchoolBillingList 
            onSelectSchool={handleSelectSchool}
            selectedSchoolId={selectedSchoolId}
          />
        )}
      </div>
    </BillingErrorBoundary>
  );
};

export default BillingManagementModule;
