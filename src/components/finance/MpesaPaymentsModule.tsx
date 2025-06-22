
import React from 'react';
import MpesaTransactionsPanel from './MpesaTransactionsPanel';
import MpesaCredentialsDialog from './MpesaCredentialsDialog';

const MpesaPaymentsModule: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            MPESA Payments
          </h1>
          <p className="text-muted-foreground">Manage MPESA transactions and configure payment settings</p>
        </div>
        <MpesaCredentialsDialog />
      </div>
      
      <MpesaTransactionsPanel />
    </div>
  );
};

export default MpesaPaymentsModule;
