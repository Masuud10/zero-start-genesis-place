
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface KeyMetrics {
  totalCollected: number;
  totalExpenses: number;
  netProfit: number;
  collectionRate: number;
  outstanding: number;
  defaulterCount: number;
  mpesaTransactions: number;
}

interface FinanceKeyMetricsProps {
  keyMetrics: KeyMetrics;
}

const FinanceKeyMetrics: React.FC<FinanceKeyMetricsProps> = ({ keyMetrics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">KES {keyMetrics.totalCollected.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">This term</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">KES {keyMetrics.totalExpenses.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">This term</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${keyMetrics.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            KES {keyMetrics.netProfit.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">Collected - Expenses</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{keyMetrics.collectionRate.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground">Overall</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">KES {keyMetrics.outstanding.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">{keyMetrics.defaulterCount} defaulters</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">MPESA Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">{keyMetrics.mpesaTransactions}</div>
          <p className="text-xs text-muted-foreground">Overall</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinanceKeyMetrics;
