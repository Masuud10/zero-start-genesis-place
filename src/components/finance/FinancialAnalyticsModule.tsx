
import React from 'react';
import EnhancedFinanceAnalytics from '@/components/analytics/finance/EnhancedFinanceAnalytics';

const FinancialAnalyticsModule: React.FC = () => {
  const filters = { term: 'current', class: 'all' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Financial Analytics
          </h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive financial insights and fee collection analysis.
          </p>
        </div>
      </div>
      
      <EnhancedFinanceAnalytics filters={filters} />
    </div>
  );
};

export default FinancialAnalyticsModule;
