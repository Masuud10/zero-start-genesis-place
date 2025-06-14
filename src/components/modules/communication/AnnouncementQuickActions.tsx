
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  AlertTriangle, 
  Archive, 
  TrendingUp, 
  RefreshCw,
  Filter,
  Download
} from 'lucide-react';

interface AnnouncementQuickActionsProps {
  totalAnnouncements: number;
  urgentCount: number;
  archivedCount: number;
  averageEngagement: number;
  onRefresh: () => void;
  onExport?: () => void;
  onBulkArchive?: () => void;
}

const AnnouncementQuickActions: React.FC<AnnouncementQuickActionsProps> = ({
  totalAnnouncements,
  urgentCount,
  archivedCount,
  averageEngagement,
  onRefresh,
  onExport,
  onBulkArchive
}) => {
  const quickStats = [
    {
      label: 'Total Active',
      value: totalAnnouncements,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      label: 'Urgent',
      value: urgentCount,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      label: 'Archived',
      value: archivedCount,
      icon: Archive,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50'
    },
    {
      label: 'Avg. Engagement',
      value: `${averageEngagement}%`,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    }
  ];

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Quick Actions</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            {onExport && (
              <Button variant="outline" size="sm" onClick={onExport}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            )}
            {onBulkArchive && (
              <Button variant="outline" size="sm" onClick={onBulkArchive}>
                <Archive className="w-4 h-4 mr-2" />
                Bulk Archive
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div 
                key={index}
                className={`${stat.bgColor} rounded-lg p-3 text-center transition-all hover:shadow-sm`}
              >
                <Icon className={`w-5 h-5 ${stat.color} mx-auto mb-1`} />
                <div className={`text-lg font-bold ${stat.color}`}>
                  {stat.value}
                </div>
                <div className="text-xs text-gray-600">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default AnnouncementQuickActions;
