
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Monitor, Smartphone, Mail, MessageSquare } from 'lucide-react';

interface DeliveryChannelIconsProps {
  channels: string[];
  size?: 'sm' | 'md';
}

const DeliveryChannelIcons: React.FC<DeliveryChannelIconsProps> = ({
  channels,
  size = 'sm'
}) => {
  const getChannelConfig = (channel: string) => {
    switch (channel) {
      case 'web':
        return {
          icon: Monitor,
          label: 'Web',
          color: 'bg-blue-100 text-blue-700 hover:bg-blue-200'
        };
      case 'push':
        return {
          icon: Smartphone,
          label: 'Push',
          color: 'bg-green-100 text-green-700 hover:bg-green-200'
        };
      case 'email':
        return {
          icon: Mail,
          label: 'Email',
          color: 'bg-purple-100 text-purple-700 hover:bg-purple-200'
        };
      case 'sms':
        return {
          icon: MessageSquare,
          label: 'SMS',
          color: 'bg-orange-100 text-orange-700 hover:bg-orange-200'
        };
      default:
        return {
          icon: Monitor,
          label: channel,
          color: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        };
    }
  };

  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';
  const badgeSize = size === 'sm' ? 'text-xs' : 'text-sm';

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {channels.map(channel => {
        const config = getChannelConfig(channel);
        const Icon = config.icon;
        
        return (
          <Badge 
            key={channel} 
            variant="secondary" 
            className={`${config.color} ${badgeSize} border-0`}
          >
            <Icon className={`${iconSize} mr-1`} />
            {config.label}
          </Badge>
        );
      })}
    </div>
  );
};

export default DeliveryChannelIcons;
