
import React from 'react';
import PrincipalAnalyticsOverview from '../PrincipalAnalyticsOverview';

const PrincipalAnalyticsSection: React.FC = () => {
  return (
    <section>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">School Analytics Overview</h2>
      <div className="bg-white rounded-lg border shadow-sm">
        <PrincipalAnalyticsOverview />
      </div>
    </section>
  );
};

export default PrincipalAnalyticsSection;
