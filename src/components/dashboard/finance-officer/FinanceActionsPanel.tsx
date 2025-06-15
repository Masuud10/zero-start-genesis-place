
import React from 'react';
import { Button } from '@/components/ui/button';
import { DollarSign, FileText, CreditCard, BarChart3, Users, Settings } from 'lucide-react';

interface FinanceActionsPanelProps {
  onModalOpen: (modalType: string) => void;
}

const FinanceActionsPanel: React.FC<FinanceActionsPanelProps> = ({ onModalOpen }) => {
  const financeActions = [
    { id: 'fees', label: 'Manage Fees', icon: DollarSign, description: 'Set and track fees' },
    { id: 'payments', label: 'Process Payments', icon: CreditCard, description: 'Handle transactions' },
    { id: 'reports', label: 'Financial Reports', icon: FileText, description: 'Generate reports' },
    { id: 'analytics', label: 'Finance Analytics', icon: BarChart3, description: 'View insights' },
    { id: 'students', label: 'Student Accounts', icon: Users, description: 'Manage accounts' },
    { id: 'settings', label: 'Finance Settings', icon: Settings, description: 'Configure system' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {financeActions.map((action) => (
        <Button
          key={action.id}
          variant="outline"
          className="h-24 flex-col gap-2 p-4"
          onClick={() => onModalOpen(action.id)}
        >
          <action.icon className="h-6 w-6" />
          <div className="text-center">
            <div className="font-medium text-sm">{action.label}</div>
            <div className="text-xs text-muted-foreground">{action.description}</div>
          </div>
        </Button>
      ))}
    </div>
  );
};

export default FinanceActionsPanel;
