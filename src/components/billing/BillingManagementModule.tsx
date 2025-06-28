
import React, { useState } from 'react';
import { useBillingRecords, useBillingStats } from '@/hooks/useBillingManagement';
import BillingStatsCards from './BillingStatsCards';
import SchoolBillingList from './SchoolBillingList';
import SchoolBillingDetails from './SchoolBillingDetails';
import BillingLoadingFallback from './BillingLoadingFallback';

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

  // Show loading/error fallback if needed
  if (isLoading || error) {
    return (
      <BillingLoadingFallback
        isLoading={isLoading}
        error={error}
        onRetry={handleRetry}
        title="Billing Management"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Billing Management</h2>
        <p className="text-muted-foreground">
          Manage setup fees and subscription fees for all schools
        </p>
      </div>

      <BillingStatsCards />

      {selectedSchoolId ? (
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
  );
};

export default BillingManagementModule;
