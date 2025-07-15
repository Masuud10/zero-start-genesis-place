import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, XCircle, FileText } from 'lucide-react';

interface ExpenseStatusBadgeProps {
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected';
  className?: string;
}

const ExpenseStatusBadge: React.FC<ExpenseStatusBadgeProps> = ({ status, className }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'draft':
        return {
          label: 'Draft',
          variant: 'secondary' as const,
          icon: FileText,
          className: 'text-gray-600 border-gray-600',
        };
      case 'pending_approval':
        return {
          label: 'Pending Approval',
          variant: 'outline' as const,
          icon: Clock,
          className: 'text-orange-600 border-orange-600',
        };
      case 'approved':
        return {
          label: 'Approved',
          variant: 'outline' as const,
          icon: CheckCircle,
          className: 'text-green-600 border-green-600',
        };
      case 'rejected':
        return {
          label: 'Rejected',
          variant: 'outline' as const,
          icon: XCircle,
          className: 'text-red-600 border-red-600',
        };
      default:
        return {
          label: 'Unknown',
          variant: 'outline' as const,
          icon: FileText,
          className: 'text-gray-600 border-gray-600',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Badge 
      variant={config.variant} 
      className={`${config.className} ${className || ''}`}
    >
      <Icon className="h-3 w-3 mr-1" />
      {config.label}
    </Badge>
  );
};

export default ExpenseStatusBadge;