import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommunicationBannerProps {
  title: string;
  message: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
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
      case 'critical':
        return 'bg-red-500 border-red-600 text-white';
      case 'high':
        return 'bg-yellow-400 border-yellow-500 text-gray-900';
      case 'medium':
        return 'bg-cyan-100 border-cyan-200 text-cyan-900';
      case 'low':
        return 'bg-gray-100 border-gray-200 text-gray-800';
      default:
        return 'bg-gray-100 border-gray-200 text-gray-800';
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