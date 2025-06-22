
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, TrendingUp, AlertCircle, Receipt } from 'lucide-react';

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
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Fees</p>
              <p className="text-2xl font-bold">KES {totalFees.toLocaleString()}</p>
            </div>
            <DollarSign className="h-8 w-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Collected</p>
              <p className="text-2xl font-bold text-green-600">KES {totalCollected.toLocaleString()}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Outstanding</p>
              <p className="text-2xl font-bold text-red-600">KES {totalOutstanding.toLocaleString()}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Collection Rate</p>
              <p className="text-2xl font-bold">{collectionRate.toFixed(1)}%</p>
            </div>
            <Receipt className="h-8 w-8 text-purple-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeeManagementSummaryCards;
