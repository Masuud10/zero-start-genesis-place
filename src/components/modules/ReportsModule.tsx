
import React from 'react';
import ReportDownloadPanel from '@/components/reports/ReportDownloadPanel';

// ReportsModule: This is shown when a user clicks "Reports" in the sidebar.
// This card provides access to role-appropriate download types.
const ReportsModule = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] w-full p-4">
      <div className="max-w-xl w-full">
        <ReportDownloadPanel />
      </div>
    </div>
  );
};

export default ReportsModule;
