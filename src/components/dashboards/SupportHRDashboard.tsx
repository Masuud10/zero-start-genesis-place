import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAdminAuthContext } from "@/components/auth/AdminAuthProvider";
import UnifiedDashboardLayout from "@/components/dashboard/UnifiedDashboardLayout";
import {
  Users,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertTriangle,
  Activity,
  Headphones,
  FileText,
  Calendar,
  Phone,
  Mail,
  Settings,
  TrendingUp,
  Building2,
  UserCheck,
  Bell,
  ActivitySquare,
} from "lucide-react";

// Import new Support HR features
import ClientOnboardingChecklistsPage from "@/components/dashboard/support-hr/ClientOnboardingChecklistsPage";
import SchoolHealthScoreWidget from "@/components/dashboard/support-hr/SchoolHealthScoreWidget";

const SupportHrDashboard: React.FC = () => {
  const { adminUser } = useAdminAuthContext();

  const handleQuickAction = (action: string) => {
    console.log(`Quick action: ${action}`);
    // Implement quick actions here
  };

  const stats = [
    {
      label: "Active Tickets",
      value: "23",
      icon: MessageSquare,
      description: "Open support requests",
      color: "text-blue-600",
    },
    {
      label: "Response Time",
      value: "2.4h",
      icon: Clock,
      description: "Average response",
      color: "text-green-600",
    },
    {
      label: "Satisfaction",
      value: "4.8/5",
      icon: CheckCircle,
      description: "Customer rating",
      color: "text-purple-600",
    },
    {
      label: "Schools Supported",
      value: "156",
      icon: Building2,
      description: "Active schools",
      color: "text-emerald-600",
    },
  ];

  const quickActions = [
    {
      label: "New Ticket",
      icon: MessageSquare,
      onClick: () => handleQuickAction("new_ticket"),
      variant: "default" as const,
    },
    {
      label: "Schedule Call",
      icon: Phone,
      onClick: () => handleQuickAction("schedule_call"),
      variant: "outline" as const,
    },
    {
      label: "Send Update",
      icon: Mail,
      onClick: () => handleQuickAction("send_update"),
      variant: "outline" as const,
    },
    {
      label: "View Reports",
      icon: FileText,
      onClick: () => handleQuickAction("view_reports"),
      variant: "outline" as const,
    },
  ];

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      icon: Activity,
      content: (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Support Tickets
                </CardTitle>
                <CardDescription>
                  Recent support requests and their status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium">System Integration Issue</p>
                        <p className="text-sm text-gray-600">
                          Acme School District • 2 hours ago
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-blue-600">
                      High Priority
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium">User Training Request</p>
                        <p className="text-sm text-gray-600">
                          Bright Future Academy • 1 day ago
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-green-600">
                      In Progress
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-yellow-600" />
                      <div>
                        <p className="font-medium">Feature Request</p>
                        <p className="text-sm text-gray-600">
                          Learning Center Plus • 2 days ago
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-yellow-600">
                      Pending
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance Metrics
                </CardTitle>
                <CardDescription>
                  Support team performance indicators
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Response Time</span>
                      <span className="text-sm text-gray-600">2.4 hours</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        Resolution Rate
                      </span>
                      <span className="text-sm text-gray-600">94.2%</span>
                    </div>
                    <Progress value={94.2} className="h-2" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        Customer Satisfaction
                      </span>
                      <span className="text-sm text-gray-600">4.8/5</span>
                    </div>
                    <Progress value={96} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Upcoming Activities
                </CardTitle>
                <CardDescription>
                  Scheduled support activities and events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <Phone className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium">
                        Support Call - Acme School
                      </p>
                      <p className="text-xs text-gray-600">
                        Tomorrow 10:00 AM • System integration
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <Users className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm font-medium">Training Session</p>
                      <p className="text-xs text-gray-600">
                        Next week • Bright Future Academy
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <FileText className="h-4 w-4 text-purple-600" />
                    <div>
                      <p className="text-sm font-medium">
                        Documentation Review
                      </p>
                      <p className="text-xs text-gray-600">
                        This Friday • User guides update
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activities
                </CardTitle>
                <CardDescription>
                  Latest support team activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">
                      Ticket resolved: System integration issue
                    </span>
                    <span className="text-xs text-gray-500 ml-auto">
                      1h ago
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">
                      Support call completed: User training
                    </span>
                    <span className="text-xs text-gray-500 ml-auto">
                      3h ago
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm">
                      New ticket created: Feature request
                    </span>
                    <span className="text-xs text-gray-500 ml-auto">
                      5h ago
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-sm">
                      Follow-up email sent: Learning Center
                    </span>
                    <span className="text-xs text-gray-500 ml-auto">
                      1d ago
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ),
    },
    {
      id: "onboarding",
      label: "Client Onboarding",
      icon: UserCheck,
      content: <ClientOnboardingChecklistsPage />,
    },
    {
      id: "school-health",
      label: "School Health",
      icon: ActivitySquare,
      content: <SchoolHealthScoreWidget />,
    },
    {
      id: "announcements",
      label: "Internal Announcements",
      icon: Bell,
      content: (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Internal Announcements
              </CardTitle>
              <CardDescription>
                Company-wide announcements and updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="default"
                      className="bg-green-100 text-green-800"
                    >
                      New
                    </Badge>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">
                      Welcome to the New Academic Trips Feature!
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      We are excited to announce the launch of our Academic
                      Trips management system. This feature will help schools
                      organize educational trips more efficiently.
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Posted 2 days ago by Admin Team
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className="bg-blue-100 text-blue-800"
                    >
                      Update
                    </Badge>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">
                      System Maintenance Scheduled
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Planned maintenance window this weekend. All systems will
                      be updated with the latest security patches and
                      performance improvements.
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Posted 1 week ago by Tech Team
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="bg-purple-100 text-purple-800"
                    >
                      Event
                    </Badge>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">Team Building Event</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Join us for our monthly team building event. This month
                      we'll be focusing on improving our support processes and
                      sharing best practices.
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Posted 2 weeks ago by HR Team
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ),
    },
  ];

  return (
    <UnifiedDashboardLayout
      role="support_hr"
      title="Support & HR Dashboard"
      description="Manage support tickets, client onboarding, and internal communications."
      stats={stats}
      quickActions={quickActions}
      tabs={tabs}
    />
  );
};

export default SupportHrDashboard;
