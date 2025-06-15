
import React from "react";
import { Button } from "@/components/ui/button";
import { DollarSign, Users, FileText, BarChart3, CreditCard } from "lucide-react";

interface FinanceActionsPanelProps {
  onModalOpen: (modalType: string) => void;
}

const financeActions = [
  { id: 'finance', label: 'Fee Management', icon: DollarSign, description: 'Process payments & fees' },
  { id: 'students', label: 'Student Accounts', icon: Users, description: 'View student balances' },
  { id: 'reports', label: 'Financial Reports', icon: FileText, description: 'Generate reports' },
  { id: 'analytics', label: 'Finance Analytics', icon: BarChart3, description: 'Payment insights' },
];

const FinanceActionsPanel: React.FC<FinanceActionsPanelProps> = ({ onModalOpen }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    {financeActions.map((action) => (
      <Button
        key={action.id}
        variant="outline"
        className="h-24 flex-col gap-2 p-4"
        onClick={() => onModalOpen(action.id)}
        data-testid={`finance-action-btn-${action.id}`}
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

export default FinanceActionsPanel;
