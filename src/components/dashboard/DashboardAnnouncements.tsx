
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Bell, AlertCircle } from 'lucide-react';
import { useEnhancedAnnouncements } from '@/hooks/useEnhancedAnnouncements';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

const DashboardAnnouncements = () => {
  const { user } = useAuth();
  const { announcements, markAsRead } = useEnhancedAnnouncements({
    is_archived: false
  });
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  // Only show for non-admin users (admins manage announcements in the communication center)
  if (!user || ['edufam_admin', 'elimisha_admin'].includes(user.role)) {
    return null;
  }

  // Filter announcements that are:
  // 1. Global announcements from EduFam admin
  // 2. Target this user's role
  // 3. Not dismissed
  // 4. Not archived
  const relevantAnnouncements = announcements.filter(announcement => 
    announcement.is_global &&
    announcement.target_audience.includes(user.role) &&
    !announcement.is_archived &&
    !dismissedIds.includes(announcement.id)
  );

  const handleDismiss = async (announcementId: string) => {
    // Mark as read and dismiss locally
    await markAsRead(announcementId);
    setDismissedIds(prev => [...prev, announcementId]);
  };

  if (relevantAnnouncements.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 mb-6">
      {relevantAnnouncements.map(announcement => (
        <Card 
          key={announcement.id}
          className="border-l-4 border-l-blue-500 bg-gradient-to-r from-yellow-50 via-green-50 to-blue-50 shadow-md"
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="mt-1">
                  {announcement.priority === 'urgent' ? (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  ) : (
                    <Bell className="w-5 h-5 text-blue-500" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {announcement.title}
                    </h3>
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                      EduFam Admin
                    </span>
                    {announcement.priority === 'urgent' && (
                      <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                        Urgent
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-2 leading-relaxed">
                    {announcement.content}
                  </p>
                  
                  <div className="flex items-center text-xs text-gray-500">
                    <span>
                      {format(new Date(announcement.created_at), 'MMM dd, yyyy HH:mm')}
                    </span>
                    {announcement.expiry_date && (
                      <span className="ml-4">
                        Expires: {format(new Date(announcement.expiry_date), 'MMM dd, yyyy')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
                onClick={() => handleDismiss(announcement.id)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardAnnouncements;
