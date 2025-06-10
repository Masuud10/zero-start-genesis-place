
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, Receipt } from 'lucide-react';

interface FeeStatsCardsProps {
  totalFees: number;
  totalPaid: number;
  totalBalance: number;
  collectionRate: number;
}

const FeeStatsCards: React.FC<FeeStatsCardsProps> = ({
  totalFees,
  totalPaid,
  totalBalance,
  collectionRate
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-blue-600" />
            <div>
              <p className="text-sm text-muted-foreground">Total Fees</p>
              <p className="text-lg font-bold">KES {totalFees.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-green-600" />
            <div>
              <p className="text-sm text-muted-foreground">Collected</p>
              <p className="text-lg font-bold">KES {totalPaid.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-orange-600" />
            <div>
              <p className="text-sm text-muted-foreground">Outstanding</p>
              <p className="text-lg font-bold">KES {totalBalance.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-purple-600" />
            <div>
              <p className="text-sm text-muted-foreground">Collection Rate</p>
              <p className="text-lg font-bold">{collectionRate.toFixed(1)}%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeeStatsCards;
