
import React from 'react';

interface ActivityItemProps {
  action: string;
  user?: string;
  time: string;
  type: string;
  amount?: string;
  child?: string;
}

const ActivityItem: React.FC<ActivityItemProps> = ({
  action,
  user,
  time,
  type,
  amount,
  child
}) => {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'grade': return 'bg-blue-500';
      case 'attendance': return 'bg-green-500';
      case 'admin': return 'bg-purple-500';
      case 'student': return 'bg-orange-500';
      case 'income': return 'bg-green-500';
      case 'expense': return 'bg-red-500';
      case 'fee': return 'bg-orange-500';
      case 'announcement': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-accent transition-colors">
      <div className={`w-2 h-2 rounded-full mt-2 ${getTypeColor(type)}`}></div>
      <div className="flex-1">
        <p className="text-sm font-medium">{action}</p>
        <div className="flex items-center justify-between mt-1">
          {user && <p className="text-xs text-muted-foreground">by {user}</p>}
          {child && <p className="text-xs text-muted-foreground">Child: {child}</p>}
          <p className="text-xs text-muted-foreground">{time}</p>
        </div>
        {amount && (
          <p className={`text-xs font-medium mt-1 ${
            type === 'income' ? 'text-green-600' : 'text-red-600'
          }`}>
            {type === 'income' ? '+' : '-'}{amount}
          </p>
        )}
      </div>
    </div>
  );
};

export default ActivityItem;
