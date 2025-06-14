
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Eye, Send, TrendingUp, Archive, AlertTriangle } from 'lucide-react';
import { EnhancedAnnouncement } from '@/hooks/useEnhancedAnnouncements';

interface AnnouncementMetricsProps {
  announcements: EnhancedAnnouncement[];
}

const AnnouncementMetrics: React.FC<AnnouncementMetricsProps> = ({ announcements }) => {
  const activeAnnouncements = announcements.filter(a => !a.is_archived);
  const archivedAnnouncements = announcements.filter(a => a.is_archived);
  const urgentAnnouncements = announcements.filter(a => a.priority === 'urgent' && !a.is_archived);
  
  const totalRecipients = announcements.reduce((sum, a) => sum + a.total_recipients, 0);
  const totalReads = announcements.reduce((sum, a) => sum + a.read_count, 0);
  const averageReadRate = totalRecipients > 0 ? Math.round((totalReads / totalRecipients) * 100) : 0;

  const metrics = [
    {
      title: "Active Announcements",
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
      title: "Total Reads",
      value: totalReads.toLocaleString(),
      description: "Messages opened",
      icon: Eye,
      gradient: "from-purple-500 to-purple-600",
      bgGradient: "from-purple-50 to-purple-100",
      change: "+18%",
      trend: "up" as const
    },
    {
      title: "Average Read Rate",
      value: `${averageReadRate}%`,
      description: "Engagement rate",
      icon: TrendingUp,
      gradient: "from-orange-500 to-orange-600",
      bgGradient: "from-orange-50 to-orange-100",
      change: "+5%",
      trend: "up" as const
    },
    {
      title: "Archived",
      value: archivedAnnouncements.length,
      description: "Past announcements",
      icon: Archive,
      gradient: "from-gray-500 to-gray-600",
      bgGradient: "from-gray-50 to-gray-100",
      change: "0%",
      trend: "neutral" as const
    },
    {
      title: "Urgent Active",
      value: urgentAnnouncements.length,
      description: "Require attention",
      icon: AlertTriangle,
      gradient: "from-red-500 to-red-600",
      bgGradient: "from-red-50 to-red-100",
      change: "-2%",
      trend: "down" as const
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {metrics.map((metric, index) => (
        <Card key={index} className="group hover:shadow-md transition-all duration-200 border-0 shadow-sm overflow-hidden relative">
          <div className={`absolute inset-0 bg-gradient-to-br ${metric.bgGradient} opacity-40`}></div>
          <CardContent className="p-4 relative">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg bg-gradient-to-r ${metric.gradient} shadow-sm group-hover:scale-105 transition-transform duration-200`}>
                <metric.icon className="h-4 w-4 text-white" />
              </div>
              <div className="flex items-center space-x-1 text-xs">
                <TrendingUp className={`h-3 w-3 ${
                  metric.trend === 'up' ? 'text-emerald-500' : 
                  metric.trend === 'down' ? 'text-red-500' : 
                  'text-gray-500'
                }`} />
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
              <p className="text-xs font-medium text-gray-600">{metric.title}</p>
              <p className="text-xl font-bold text-gray-900">{metric.value}</p>
              <p className="text-xs text-gray-500">{metric.description}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AnnouncementMetrics;
