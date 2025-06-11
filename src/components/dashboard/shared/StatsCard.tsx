
import React from 'react';

interface StatsCardProps {
  title: string;
  value: string;
  subtitle?: string;
  change?: string;
  icon: string;
  color: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  change, 
  icon, 
  color 
}) => {
  return (
    <div className="relative overflow-hidden border rounded-lg p-4 hover:shadow-md transition-all duration-200">
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-5`}></div>
      <div className="flex items-center justify-between space-y-0 pb-2">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className="text-xl">{icon}</div>
      </div>
      <div className="text-2xl font-bold text-foreground">{value}</div>
      {subtitle && (
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      )}
      {change && (
        <p className="text-xs text-green-600 font-medium">{change}</p>
      )}
    </div>
  );
};

export default StatsCard;
