
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, Archive, AlertTriangle } from 'lucide-react';

interface AnnouncementStatusBadgeProps {
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isArchived?: boolean;
  isGlobal?: boolean;
  autoArchiveDate?: string;
}

const AnnouncementStatusBadge: React.FC<AnnouncementStatusBadgeProps> = ({
  priority,
  isArchived = false,
  isGlobal = false,
  autoArchiveDate
}) => {
  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return {
          color: 'bg-red-500 hover:bg-red-600',
          icon: AlertTriangle,
          label: 'Urgent'
        };
      case 'high':
        return {
          color: 'bg-orange-500 hover:bg-orange-600',
          icon: AlertTriangle,
          label: 'High'
        };
      case 'medium':
        return {
          color: 'bg-yellow-500 hover:bg-yellow-600',
          icon: Clock,
          label: 'Medium'
        };
      case 'low':
        return {
          color: 'bg-green-500 hover:bg-green-600',
          icon: CheckCircle,
          label: 'Low'
        };
      default:
        return {
          color: 'bg-gray-500 hover:bg-gray-600',
          icon: Clock,
          label: 'Medium'
        };
    }
  };

  const config = getPriorityConfig(priority);
  const Icon = config.icon;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Badge className={`${config.color} text-white border-0 text-xs`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
      
      {isGlobal && (
        <Badge variant="outline" className="text-xs border-blue-500 text-blue-700">
          Global
        </Badge>
      )}
      
      {isArchived && (
        <Badge variant="secondary" className="text-xs">
          <Archive className="w-3 h-3 mr-1" />
          Archived
        </Badge>
      )}
      
      {autoArchiveDate && !isArchived && (
        <Badge variant="outline" className="text-xs text-orange-600 border-orange-300">
          <Clock className="w-3 h-3 mr-1" />
          Auto-archive {new Date(autoArchiveDate).toLocaleDateString()}
        </Badge>
      )}
    </div>
  );
};

export default AnnouncementStatusBadge;
