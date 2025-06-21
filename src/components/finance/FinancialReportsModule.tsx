
import React from 'react';
import FinanceReportsModule from '../modules/FinanceReportsModule';

const FinancialReportsModule: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
          Financial Reports
        </h1>
        <p className="text-muted-foreground">Financial Management Center: Comprehensive school finance overview and management</p>
      </div>
      
      <FinanceReportsModule />
    </div>
  );
};

export default FinancialReportsModule;
