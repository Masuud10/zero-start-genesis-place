import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommunicationBannerProps {
  title: string;
  message: string;
  priority?: 'low' | 'medium' | 'high';
  onDismiss: () => void;
}

const CommunicationBanner: React.FC<CommunicationBannerProps> = ({ 
  title, 
  message, 
  priority = 'medium',
  onDismiss 
}) => {
  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-50 border-red-200 text-red-900';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200 text-yellow-900';
      case 'low':
        return 'bg-blue-50 border-blue-200 text-blue-900';
      default:
        return 'bg-yellow-50 border-yellow-200 text-yellow-900';
    }
  };

  return (
    <div className={cn(
      "relative w-full border rounded-lg p-4 mb-4 shadow-sm",
      getPriorityStyles(priority)
    )}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm mb-1">{title}</h4>
          <p className="text-sm opacity-90 break-words">{message}</p>
        </div>
        <button
          onClick={onDismiss}
          className="flex-shrink-0 p-1 rounded-md hover:bg-black/10 transition-colors"
          aria-label="Dismiss communication"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default CommunicationBanner;