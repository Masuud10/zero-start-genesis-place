
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Smartphone } from 'lucide-react';
import { format } from 'date-fns';

interface MpesaTransactionsSectionProps {
  transactions: any[];
}

const MpesaTransactionsSection: React.FC<MpesaTransactionsSectionProps> = ({
  transactions
}) => {
  const recentMpesaTransactions = transactions
    .filter(t => t.transaction_status === 'Success')
    .slice(0, 5);

  if (recentMpesaTransactions.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5 text-green-600" />
          Recent M-PESA Payments
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {recentMpesaTransactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Smartphone className="h-4 w-4 text-green-600" />
                <div>
                  <div className="font-medium">{transaction.student?.name || 'N/A'}</div>
                  <div className="text-sm text-gray-500">
                    {transaction.mpesa_receipt_number} • {transaction.phone_number}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-green-600">
                  KES {transaction.amount_paid.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">
                  {format(new Date(transaction.transaction_date), 'MMM dd, HH:mm')}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MpesaTransactionsSection;
