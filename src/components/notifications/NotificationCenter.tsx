import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useSchoolScopedData } from "@/hooks/useSchoolScopedData";
import { useToast } from "@/hooks/use-toast";
import {
  NotificationService,
  Notification,
} from "@/services/NotificationService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Bell,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Info,
  Check,
  Trash2,
  Settings,
  Loader2,
  Filter,
  Search,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { format } from "date-fns";

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const { schoolId } = useSchoolScopedData();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [preferencesModalOpen, setPreferencesModalOpen] = useState(false);

  // Fetch notifications
  const {
    data: notificationsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [
      "notifications",
      user?.id,
      page,
      categoryFilter,
      typeFilter,
      unreadOnly,
    ],
    queryFn: async () => {
      if (!user?.id) return { data: [], count: 0 };
      return await NotificationService.getUserNotifications(
        user.id,
        page,
        20,
        unreadOnly
      );
    },
    enabled: !!user?.id && isOpen,
  });

  // Fetch notification preferences
  const { data: preferences } = useQuery({
    queryKey: ["notification-preferences", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const result = await NotificationService.getNotificationPreferences(
        user.id
      );
      return result.data;
    },
    enabled: !!user?.id,
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      return await NotificationService.markAsRead(notificationId);
    },
    onSuccess: () => {
      refetch();
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error: unknown) => {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to mark notification as read",
        variant: "destructive",
      });
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("User not authenticated");
      return await NotificationService.markAllAsRead(user.id);
    },
    onSuccess: () => {
      refetch();
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
    },
    onError: (error: unknown) => {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to mark all notifications as read",
        variant: "destructive",
      });
    },
  });

  // Define a type for notification preferences
  interface NotificationPreferences {
    email_notifications: boolean;
    push_notifications: boolean;
    grade_submissions: boolean;
    grade_approvals: boolean;
    attendance_alerts: boolean;
    exam_reminders: boolean;
    report_generation: boolean;
    system_alerts: boolean;
    [key: string]: boolean;
  }

  // Update preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: async (newPreferences: Partial<NotificationPreferences>) => {
      if (!user?.id) throw new Error("User not authenticated");
      return await NotificationService.updateNotificationPreferences(
        user.id,
        newPreferences
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-preferences"] });
      toast({
        title: "Success",
        description: "Notification preferences updated",
      });
      setPreferencesModalOpen(false);
    },
    onError: (error: unknown) => {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update preferences",
        variant: "destructive",
      });
    },
  });

  // Filter notifications
  const filteredNotifications =
    notificationsData?.data?.filter((notification: Notification) => {
      const matchesCategory =
        categoryFilter === "all" || notification.category === categoryFilter;
      const matchesType =
        typeFilter === "all" || notification.type === typeFilter;
      return matchesCategory && matchesType;
    }) || [];

  // Get notification icon
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  // Get notification badge color
  const getNotificationBadgeColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-100 text-green-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "error":
        return "bg-red-100 text-red-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  // Handle notification click
  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      await markAsReadMutation.mutateAsync(notification.id);
    }

    if (notification.action_url) {
      window.location.href = notification.action_url;
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
            {notificationsData?.data?.filter((n: Notification) => !n.is_read)
              .length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {
                  notificationsData.data.filter((n: Notification) => !n.is_read)
                    .length
                }
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Stay updated with important academic activities and system alerts
          </DialogDescription>
        </DialogHeader>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-4">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="grades">Grades</SelectItem>
              <SelectItem value="attendance">Attendance</SelectItem>
              <SelectItem value="examinations">Examinations</SelectItem>
              <SelectItem value="reports">Reports</SelectItem>
              <SelectItem value="analytics">Analytics</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant={unreadOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setUnreadOnly(!unreadOnly)}
          >
            Unread Only
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setPreferencesModalOpen(true)}
          >
            <Settings className="h-4 w-4" />
          </Button>

          {filteredNotifications.filter((n: Notification) => !n.is_read)
            .length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending}
            >
              {markAllAsReadMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              Mark All Read
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto space-y-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Error loading notifications: {error.message}
              </AlertDescription>
            </Alert>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No notifications found</p>
              <p className="text-sm">
                {categoryFilter !== "all" || typeFilter !== "all" || unreadOnly
                  ? "Try adjusting your filters"
                  : "You're all caught up!"}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification: Notification) => (
              <Card
                key={notification.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  !notification.is_read
                    ? "border-l-4 border-l-blue-500 bg-blue-50/50"
                    : ""
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm">
                          {notification.title}
                        </h4>
                        <Badge
                          className={`text-xs ${getNotificationBadgeColor(
                            notification.type
                          )}`}
                        >
                          {notification.category}
                        </Badge>
                        {!notification.is_read && (
                          <Badge variant="secondary" className="text-xs">
                            New
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          {format(
                            new Date(notification.created_at),
                            "MMM d, yyyy HH:mm"
                          )}
                        </span>
                        {notification.academic_context && (
                          <span className="text-xs">
                            {notification.academic_context.class_id &&
                              "Class • "}
                            {notification.academic_context.subject_id &&
                              "Subject"}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsReadMutation.mutate(notification.id);
                      }}
                      disabled={markAsReadMutation.isPending}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Pagination */}
        {notificationsData && notificationsData.count > 20 && (
          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {Math.ceil(notificationsData.count / 20)}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page >= Math.ceil(notificationsData.count / 20)}
            >
              Next
            </Button>
          </div>
        )}

        {/* Preferences Modal */}
        <Dialog
          open={preferencesModalOpen}
          onOpenChange={setPreferencesModalOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Notification Preferences</DialogTitle>
              <DialogDescription>
                Choose which notifications you want to receive
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {preferences && (
                <>
                  <div className="flex items-center justify-between">
                    <span>Email Notifications</span>
                    <input
                      type="checkbox"
                      checked={preferences.email_notifications}
                      onChange={(e) =>
                        updatePreferencesMutation.mutate({
                          email_notifications: e.target.checked,
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Push Notifications</span>
                    <input
                      type="checkbox"
                      checked={preferences.push_notifications}
                      onChange={(e) =>
                        updatePreferencesMutation.mutate({
                          push_notifications: e.target.checked,
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Grade Submissions</span>
                    <input
                      type="checkbox"
                      checked={preferences.grade_submissions}
                      onChange={(e) =>
                        updatePreferencesMutation.mutate({
                          grade_submissions: e.target.checked,
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Grade Approvals</span>
                    <input
                      type="checkbox"
                      checked={preferences.grade_approvals}
                      onChange={(e) =>
                        updatePreferencesMutation.mutate({
                          grade_approvals: e.target.checked,
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Attendance Alerts</span>
                    <input
                      type="checkbox"
                      checked={preferences.attendance_alerts}
                      onChange={(e) =>
                        updatePreferencesMutation.mutate({
                          attendance_alerts: e.target.checked,
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Exam Reminders</span>
                    <input
                      type="checkbox"
                      checked={preferences.exam_reminders}
                      onChange={(e) =>
                        updatePreferencesMutation.mutate({
                          exam_reminders: e.target.checked,
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Report Generation</span>
                    <input
                      type="checkbox"
                      checked={preferences.report_generation}
                      onChange={(e) =>
                        updatePreferencesMutation.mutate({
                          report_generation: e.target.checked,
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>System Alerts</span>
                    <input
                      type="checkbox"
                      checked={preferences.system_alerts}
                      onChange={(e) =>
                        updatePreferencesMutation.mutate({
                          system_alerts: e.target.checked,
                        })
                      }
                    />
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationCenter;
