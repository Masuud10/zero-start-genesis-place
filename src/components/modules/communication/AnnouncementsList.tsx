
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Calendar, 
  User, 
  Archive, 
  Eye, 
  Users, 
  Bell, 
  MapPin, 
  Building, 
  MoreVertical,
  CheckCircle,
  Clock,
  TrendingUp
} from 'lucide-react';
import { EnhancedAnnouncement } from '@/hooks/useEnhancedAnnouncements';
import { format } from 'date-fns';
import AnnouncementStatusBadge from './AnnouncementStatusBadge';
import DeliveryChannelIcons from './DeliveryChannelIcons';
import TargetAudienceBadges from './TargetAudienceBadges';

interface AnnouncementsListProps {
  announcements: EnhancedAnnouncement[];
  onMarkAsRead: (id: string) => void;
  onArchive: (id: string) => void;
  getPriorityColor: (priority: string) => string;
  isArchived?: boolean;
}

const AnnouncementsList: React.FC<AnnouncementsListProps> = ({
  announcements,
  onMarkAsRead,
  onArchive,
  getPriorityColor,
  isArchived = false
}) => {
  if (announcements.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">
            {isArchived ? 'No Archived Announcements' : 'No Active Announcements'}
          </h3>
          <p className="text-muted-foreground">
            {isArchived 
              ? 'Archived announcements will appear here.' 
              : 'Create your first broadcast announcement to get started.'
            }
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {announcements.map((announcement) => {
        const readRate = announcement.total_recipients > 0 
          ? Math.round((announcement.read_count / announcement.total_recipients) * 100)
          : 0;

        return (
          <Card key={announcement.id} className="hover:shadow-md transition-all duration-300 border-l-4" 
                style={{ borderLeftColor: getPriorityColor(announcement.priority).replace('bg-', '#') }}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0 space-y-3">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-lg truncate">{announcement.title}</CardTitle>
                    <AnnouncementStatusBadge 
                      priority={announcement.priority}
                      isArchived={isArchived}
                      isGlobal={announcement.is_global}
                      autoArchiveDate={announcement.auto_archive_date}
                    />
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {announcement.creator_name || 'Unknown'}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(announcement.created_at), 'MMM dd, yyyy HH:mm')}
                    </div>
                  </div>

                  {/* Location and Type Info */}
                  {(announcement.region || announcement.school_type) && (
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {announcement.region && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {announcement.region}
                        </div>
                      )}
                      {announcement.school_type && (
                        <div className="flex items-center gap-1">
                          <Building className="w-3 h-3" />
                          {announcement.school_type}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Metrics and Actions */}
                <div className="flex items-center gap-4">
                  <div className="text-right text-sm space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>{announcement.total_recipients.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-green-600" />
                      <span className="text-green-600">{announcement.read_count}</span>
                      <span className="text-xs text-muted-foreground">({readRate}%)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className={`w-3 h-3 ${
                        readRate >= 70 ? 'text-green-500' :
                        readRate >= 40 ? 'text-yellow-500' : 'text-red-500'
                      }`} />
                      <span className={`text-xs ${
                        readRate >= 70 ? 'text-green-600' :
                        readRate >= 40 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {readRate >= 70 ? 'High' : readRate >= 40 ? 'Medium' : 'Low'} engagement
                      </span>
                    </div>
                  </div>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48" align="end">
                      <div className="space-y-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => onMarkAsRead(announcement.id)}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Mark as Read
                        </Button>
                        {!isArchived && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start"
                            onClick={() => onArchive(announcement.id)}
                          >
                            <Archive className="w-4 h-4 mr-2" />
                            Archive
                          </Button>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-sm leading-relaxed">{announcement.content}</p>
              
              {/* Target Audience */}
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Target Audience
                </h4>
                <TargetAudienceBadges audiences={announcement.target_audience} />
              </div>

              {/* Delivery Channels */}
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Delivery Channels
                </h4>
                <DeliveryChannelIcons channels={announcement.delivery_channels} />
              </div>

              {/* Tags */}
              {announcement.tags && announcement.tags.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Tags
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {announcement.tags.map(tag => (
                      <span 
                        key={tag} 
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Auto Archive Notice */}
              {announcement.auto_archive_date && !isArchived && (
                <div className="flex items-center gap-2 text-xs text-orange-600 bg-orange-50 p-2 rounded-md">
                  <Clock className="w-3 h-3" />
                  <span>
                    Will auto-archive on {format(new Date(announcement.auto_archive_date), 'MMM dd, yyyy')}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default AnnouncementsList;
