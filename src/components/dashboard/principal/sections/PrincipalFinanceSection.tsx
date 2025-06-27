
import React from 'react';
import FinancialOverviewReadOnly from '../../shared/FinancialOverviewReadOnly';

const PrincipalFinanceSection: React.FC = () => {
  return (
    <section>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Financial Summary</h2>
      <div className="bg-white rounded-lg border shadow-sm">
        <FinancialOverviewReadOnly />
      </div>
    </section>
  );
};

export default PrincipalFinanceSection;
