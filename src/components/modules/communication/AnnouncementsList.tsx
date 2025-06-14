
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Clock
} from 'lucide-react';
import { EnhancedAnnouncement } from '@/hooks/useEnhancedAnnouncements';
import { format } from 'date-fns';

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
      {announcements.map((announcement) => (
        <Card key={announcement.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <div className={`w-1 h-16 rounded-full ${getPriorityColor(announcement.priority)}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-lg truncate">{announcement.title}</CardTitle>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getPriorityColor(announcement.priority)} text-white border-0`}
                    >
                      {announcement.priority}
                    </Badge>
                    {announcement.is_global && (
                      <Badge variant="outline" className="text-xs">Global</Badge>
                    )}
                    {isArchived && (
                      <Badge variant="secondary" className="text-xs">Archived</Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {announcement.creator_name}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(announcement.created_at), 'MMM dd, yyyy')}
                    </div>
                  </div>

                  {/* Segmentation Info */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
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

                  {/* Tags */}
                  {announcement.tags && announcement.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {announcement.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Metrics */}
                <div className="text-right text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>{announcement.total_recipients} recipients</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-600">
                    <Eye className="w-4 h-4" />
                    <span>{announcement.read_count} reads</span>
                    <span className="text-xs">
                      ({announcement.total_recipients > 0 
                        ? Math.round((announcement.read_count / announcement.total_recipients) * 100)
                        : 0}%)
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm">
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
          
          <CardContent>
            <p className="text-sm mb-4">{announcement.content}</p>
            
            {/* Target Audience */}
            <div className="flex flex-wrap gap-2 mb-4">
              {announcement.target_audience.map(audience => (
                <Badge key={audience} variant="outline" className="text-xs">
                  {audience.replace('_', ' ')}
                </Badge>
              ))}
            </div>

            {/* Delivery Channels */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Delivery:</span>
              {announcement.delivery_channels.map(channel => (
                <Badge key={channel} variant="secondary" className="text-xs">
                  {channel}
                </Badge>
              ))}
            </div>

            {/* Auto Archive Date */}
            {announcement.auto_archive_date && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                <Clock className="w-3 h-3" />
                <span>Auto-archives on {format(new Date(announcement.auto_archive_date), 'MMM dd, yyyy')}</span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AnnouncementsList;
