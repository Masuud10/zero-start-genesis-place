
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Eye, Send, TrendingUp, Archive, AlertTriangle, Target, Globe } from 'lucide-react';
import { EnhancedAnnouncement } from '@/hooks/useEnhancedAnnouncements';

interface AnnouncementMetricsProps {
  announcements: EnhancedAnnouncement[];
}

const AnnouncementMetrics: React.FC<AnnouncementMetricsProps> = ({ announcements }) => {
  const activeAnnouncements = announcements.filter(a => !a.is_archived);
  const archivedAnnouncements = announcements.filter(a => a.is_archived);
  const urgentAnnouncements = announcements.filter(a => a.priority === 'urgent' && !a.is_archived);
  const globalAnnouncements = announcements.filter(a => a.is_global && !a.is_archived);
  
  const totalRecipients = announcements.reduce((sum, a) => sum + a.total_recipients, 0);
  const totalReads = announcements.reduce((sum, a) => sum + a.read_count, 0);
  const averageReadRate = totalRecipients > 0 ? Math.round((totalReads / totalRecipients) * 100) : 0;

  const metrics = [
    {
      title: "Active Communications",
      value: activeAnnouncements.length,
      description: "Currently live",
      icon: Send,
      gradient: "from-blue-500 to-blue-600",
      bgGradient: "from-blue-50 to-blue-100",
      change: "+12%",
      trend: "up" as const
    },
    {
      title: "Total Recipients",
      value: totalRecipients.toLocaleString(),
      description: "Across all announcements",
      icon: Users,
      gradient: "from-emerald-500 to-emerald-600",
      bgGradient: "from-emerald-50 to-emerald-100",
      change: "+25%",
      trend: "up" as const
    },
    {
      title: "Total Engagement",
      value: totalReads.toLocaleString(),
      description: "Messages opened",
      icon: Eye,
      gradient: "from-purple-500 to-purple-600",
      bgGradient: "from-purple-50 to-purple-100",
      change: "+18%",
      trend: "up" as const
    },
    {
      title: "Read Rate",
      value: `${averageReadRate}%`,
      description: "Average engagement",
      icon: TrendingUp,
      gradient: "from-orange-500 to-orange-600",
      bgGradient: "from-orange-50 to-orange-100",
      change: "+5%",
      trend: "up" as const
    },
    {
      title: "Global Broadcasts",
      value: globalAnnouncements.length,
      description: "System-wide messages",
      icon: Globe,
      gradient: "from-indigo-500 to-indigo-600",
      bgGradient: "from-indigo-50 to-indigo-100",
      change: "+3%",
      trend: "up" as const
    },
    {
      title: "Urgent Active",
      value: urgentAnnouncements.length,
      description: "Require immediate attention",
      icon: AlertTriangle,
      gradient: "from-red-500 to-red-600",
      bgGradient: "from-red-50 to-red-100",
      change: "-2%",
      trend: urgentAnnouncements.length > 0 ? "up" : "down" as const
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {metrics.map((metric, index) => (
        <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm overflow-hidden relative transform hover:-translate-y-1">
          <div className={`absolute inset-0 bg-gradient-to-br ${metric.bgGradient} opacity-40`}></div>
          <CardContent className="p-4 relative">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2.5 rounded-xl bg-gradient-to-r ${metric.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <metric.icon className="h-4 w-4 text-white" />
              </div>
              <div className="flex items-center space-x-1 text-xs">
                <TrendingUp className={`h-3 w-3 ${
                  metric.trend === 'up' ? 'text-emerald-500' : 
                  metric.trend === 'down' ? 'text-red-500' : 
                  'text-gray-500'
                } ${metric.trend === 'up' ? 'transform rotate-0' : 'transform rotate-180'}`} />
                <span className={`font-medium ${
                  metric.trend === 'up' ? 'text-emerald-600' : 
                  metric.trend === 'down' ? 'text-red-600' : 
                  'text-gray-600'
                }`}>
                  {metric.change}
                </span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">{metric.title}</p>
              <p className="text-2xl font-bold text-gray-900 group-hover:scale-105 transition-transform duration-300">{metric.value}</p>
              <p className="text-xs text-gray-500">{metric.description}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AnnouncementMetrics;
