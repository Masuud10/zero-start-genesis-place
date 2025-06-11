
import React from 'react';

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: string;
  color: string;
  onClick: () => void;
}

const QuickActionCard: React.FC<QuickActionCardProps> = ({
  title,
  description,
  icon,
  color,
  onClick
}) => {
  return (
    <button 
      onClick={onClick}
      className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-accent hover:shadow-md transition-all duration-200 text-left w-full group"
    >
      <div className={`w-10 h-10 bg-gradient-to-r ${color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
        <span className="text-white text-sm">{icon}</span>
      </div>
      <div className="flex-1">
        <p className="font-medium text-base">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </button>
  );
};

export default QuickActionCard;
