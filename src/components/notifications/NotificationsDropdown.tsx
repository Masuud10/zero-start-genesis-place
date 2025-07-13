
import React, { useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { useAdminCommunications } from '@/hooks/useAdminCommunications';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, MessageSquare, Megaphone, AlertCircle, GraduationCap, CreditCard, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const NotificationsDropdown = () => {
  const { notifications, unreadCount, isLoading, markAsRead } = useNotifications();
  const { communications, dismissCommunication } = useAdminCommunications();
  
  // PHASE 2: State for modal
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // PHASE 2: Combine notifications and communications
  const allItems = [
    ...(notifications || []).map(n => ({ ...n, type: 'notification', source: 'notifications' })),
    ...(communications || []).filter(c => c.is_active).map(c => ({ 
      ...c, 
      type: 'communication', 
      source: 'communications',
      content: c.message,
      created_at: c.created_at,
      priority: c.priority || 'medium'
    }))
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // PHASE 2: Calculate total unread count (notifications + active communications)
  const totalUnreadCount = unreadCount + (communications?.filter(c => c.is_active)?.length || 0);

  const getNotificationIcon = (type: string, source?: string) => {
    if (source === 'communications') {
      return <Megaphone className="h-4 w-4 text-blue-600" />;
    }
    switch (type) {
      case 'announcement':
        return <Megaphone className="h-4 w-4 text-blue-600" />;
      case 'message':
        return <MessageSquare className="h-4 w-4 text-green-600" />;
      case 'grade':
        return <GraduationCap className="h-4 w-4 text-purple-600" />;
      case 'fee':
        return <CreditCard className="h-4 w-4 text-orange-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500';
      case 'medium':
        return 'border-l-yellow-500';
      case 'low':
        return 'border-l-green-500';
      default:
        return 'border-l-gray-300';
    }
  };

  // PHASE 2: Enhanced click handler with modal
  const handleItemClick = (item: any) => {
    if (item.source === 'notifications' && !('read_at' in item ? item.read_at : false)) {
      markAsRead(item.id);
    }
    setSelectedItem(item);
    setModalOpen(true);
  };

  // PHASE 2: Mark communication as read
  const handleCommunicationMarkAsRead = (communicationId: string) => {
    dismissCommunication(communicationId);
    setModalOpen(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {totalUnreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              >
                {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-80 max-h-96 overflow-y-auto bg-white border shadow-lg" align="end">
          <DropdownMenuLabel className="flex items-center justify-between">
            <span>Notifications</span>
            {totalUnreadCount > 0 && (
              <Badge variant="secondary">{totalUnreadCount} new</Badge>
            )}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {isLoading ? (
            <div className="p-4 text-center text-sm text-gray-500">
              Loading notifications...
            </div>
          ) : allItems.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              No notifications yet
            </div>
          ) : (
            allItems.slice(0, 10).map((item) => (
              <DropdownMenuItem
                key={`${item.source}-${item.id}`}
                className={`flex flex-col items-start p-3 cursor-pointer border-l-4 ${getPriorityColor(item.priority)} ${
                  (item.source === 'communications' || !('read_at' in item) || !item.read_at) ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50'
                }`}
                onClick={() => handleItemClick(item)}
              >
                <div className="flex items-start gap-3 w-full">
                  {getNotificationIcon(item.type, item.source)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm truncate">
                        {item.title}
                      </p>
                      {(item.source === 'communications' || !('read_at' in item) || !item.read_at) && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {item.content}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-gray-400">
                        {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                      </p>
                      <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                </div>
              </DropdownMenuItem>
            ))
          )}
          
          {allItems.length > 10 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-center text-sm text-blue-600 hover:text-blue-800">
                View all notifications
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* PHASE 2: Full Message Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedItem && getNotificationIcon(selectedItem.type, selectedItem.source)}
              {selectedItem?.title}
            </DialogTitle>
            <DialogDescription className="text-left">
              {selectedItem?.source === 'communications' ? 'Admin Communication' : 'System Notification'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-gray-700">
              {selectedItem?.content}
            </div>
            {selectedItem?.priority && (
              <Badge 
                variant={selectedItem.priority === 'high' ? 'destructive' : 'secondary'}
                className="w-fit"
              >
                {selectedItem.priority} priority
              </Badge>
            )}
            <div className="text-xs text-gray-500">
              {selectedItem && formatDistanceToNow(new Date(selectedItem.created_at), { addSuffix: true })}
            </div>
            {selectedItem?.source === 'communications' && (
              <Button 
                onClick={() => handleCommunicationMarkAsRead(selectedItem.id)}
                className="w-full"
              >
                Mark as Read & Dismiss
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NotificationsDropdown;
