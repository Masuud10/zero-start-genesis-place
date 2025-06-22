
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, AlertCircle } from 'lucide-react';

interface FeeManagementSummaryCardsProps {
  totalFees: number;
  totalCollected: number;
  totalOutstanding: number;
  collectionRate: number;
}

const FeeManagementSummaryCards: React.FC<FeeManagementSummaryCardsProps> = ({
  totalFees,
  totalCollected,
  totalOutstanding,
  collectionRate
}) => {
  const formatCurrency = (amount: number) => {
    return `KES ${amount.toLocaleString()}`;
  };

  const formatPercentage = (rate: number) => {
    return `${rate.toFixed(1)}%`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Fees</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalFees)}</div>
          <p className="text-xs text-muted-foreground">
            Total fees assigned to students
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Collected</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{formatCurrency(totalCollected)}</div>
          <p className="text-xs text-muted-foreground">
            Total amount collected
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
          <AlertCircle className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{formatCurrency(totalOutstanding)}</div>
          <p className="text-xs text-muted-foreground">
            Amount still pending
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
          {collectionRate >= 75 ? (
            <TrendingUp className="h-4 w-4 text-green-600" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-600" />
          )}
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${collectionRate >= 75 ? 'text-green-600' : 'text-red-600'}`}>
            {formatPercentage(collectionRate)}
          </div>
          <p className="text-xs text-muted-foreground">
            {collectionRate >= 75 ? 'Good collection rate' : 'Needs improvement'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeeManagementSummaryCards;
