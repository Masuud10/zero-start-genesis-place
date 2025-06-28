
import React, { useState } from 'react';
import BillingStatsCards from './BillingStatsCards';
import SchoolBillingList from './SchoolBillingList';
import SchoolBillingDetails from './SchoolBillingDetails';

const BillingManagementModule: React.FC = () => {
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | undefined>();

  const handleSelectSchool = (schoolId: string) => {
    setSelectedSchoolId(schoolId);
  };

  const handleBackToList = () => {
    setSelectedSchoolId(undefined);
  };

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
