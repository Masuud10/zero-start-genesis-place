import React, { useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  HeadphonesIcon,
  Users,
  MessageSquare,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Plus,
  Search,
  Filter,
  Calendar,
  TrendingUp,
  Activity,
  Heart,
  UserCheck,
  FileText,
  Bell,
} from "lucide-react";
import { useDashboard } from "@/contexts/DashboardContext";
import { useUIEnhancement } from "@/contexts/UIEnhancementContext";
import {
  EnhancedCard,
  StatCard,
  MetricCard,
  ProgressCard,
} from "@/components/ui/EnhancedCard";
import { LineChart, BarChart, PieChart } from "@/components/ui/BeautifulCharts";

const SupportHrDashboard = () => {
  const {
    supportTickets,
    loadingSupportTickets,
    errorSupportTickets,
    refreshSupportTickets,
  } = useDashboard();
  const { getRoleColors, getLoadingAnimation } = useUIEnhancement();
  const [activeTab, setActiveTab] = useState("client-relations");
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(
    null
  );

  const roleColors = getRoleColors("support_hr");

  if (loadingSupportTickets) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        {getLoadingAnimation()}
        <span className="ml-2">Loading dashboard...</span>
      </div>
    );
  }

  if (errorSupportTickets) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertDescription>
            Error loading dashboard: {errorSupportTickets}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Calculate ticket statistics
  const ticketStats = {
    total: supportTickets?.length || 0,
    open: supportTickets?.filter((t) => t.status === "open").length || 0,
    inProgress:
      supportTickets?.filter((t) => t.status === "in_progress").length || 0,
    resolved:
      supportTickets?.filter((t) => t.status === "resolved").length || 0,
    urgent: supportTickets?.filter((t) => t.priority === "high").length || 0,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-red-100 text-red-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <HeadphonesIcon className="h-6 w-6 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Support & HR Dashboard
                </h1>
                <p className="text-muted-foreground">
                  Client Relations & Internal HR Management
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="flex items-center space-x-1">
              <Activity className="h-3 w-3" />
              <span>Active Support</span>
            </Badge>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Tickets"
          value={ticketStats.total}
          subtitle="All time"
          icon={<MessageSquare className="h-5 w-5" />}
          role="support_hr"
          variant="gradient"
        />
        <StatCard
          title="Open Tickets"
          value={ticketStats.open}
          subtitle="Need attention"
          icon={<AlertTriangle className="h-5 w-5" />}
          role="support_hr"
          variant="gradient"
        />
        <StatCard
          title="In Progress"
          value={ticketStats.inProgress}
          subtitle="Being worked on"
          icon={<Clock className="h-5 w-5" />}
          role="support_hr"
          variant="gradient"
        />
        <StatCard
          title="Resolved"
          value={ticketStats.resolved}
          subtitle="Completed"
          icon={<CheckCircle className="h-5 w-5" />}
          role="support_hr"
          variant="gradient"
        />
        <StatCard
          title="Urgent"
          value={ticketStats.urgent}
          subtitle="High priority"
          icon={<XCircle className="h-5 w-5" />}
          role="support_hr"
          variant="gradient"
        />
      </div>

      {/* Quick Actions */}
      <EnhancedCard variant="glass" animation="fade" className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-blue-600" />
            <span className="font-semibold">Quick Actions</span>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button
            variant="outline"
            className="h-20 flex flex-col items-center justify-center space-y-2"
          >
            <Plus className="h-6 w-6" />
            <span className="text-sm">New Ticket</span>
          </Button>
          <Button
            variant="outline"
            className="h-20 flex flex-col items-center justify-center space-y-2"
          >
            <UserCheck className="h-6 w-6" />
            <span className="text-sm">Onboard Client</span>
          </Button>
          <Button
            variant="outline"
            className="h-20 flex flex-col items-center justify-center space-y-2"
          >
            <Heart className="h-6 w-6" />
            <span className="text-sm">Health Check</span>
          </Button>
          <Button
            variant="outline"
            className="h-20 flex flex-col items-center justify-center space-y-2"
          >
            <FileText className="h-6 w-6" />
            <span className="text-sm">Generate Report</span>
          </Button>
        </div>
      </EnhancedCard>

      {/* Main Dashboard Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-2 h-12">
          <TabsTrigger
            value="client-relations"
            className="flex items-center gap-2 text-sm"
          >
            <HeadphonesIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Client Relations</span>
          </TabsTrigger>
          <TabsTrigger
            value="internal-hr"
            className="flex items-center gap-2 text-sm"
          >
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Internal HR</span>
          </TabsTrigger>
        </TabsList>

        {/* Client Relations Tab */}
        <TabsContent value="client-relations" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <EnhancedCard variant="elevated" animation="fade" className="p-6">
              <h3 className="font-semibold mb-2 flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Support Tickets
              </h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search tickets..."
                    className="flex-1 px-3 py-2 border rounded-md text-sm"
                  />
                  <Filter className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {supportTickets?.slice(0, 10).map((ticket) => (
                    <div
                      key={ticket.id}
                      className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">
                            {ticket.title}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {ticket.school?.name || "Unknown School"} •{" "}
                            {ticket.submitted_by?.name || "Unknown User"}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            className={`text-xs ${getStatusColor(
                              ticket.status
                            )}`}
                          >
                            {ticket.status.replace("_", " ")}
                          </Badge>
                          <Badge
                            className={`text-xs ${getPriorityColor(
                              ticket.priority
                            )}`}
                          >
                            {ticket.priority}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!supportTickets || supportTickets.length === 0) && (
                    <div className="text-center text-muted-foreground py-8">
                      No support tickets found
                    </div>
                  )}
                </div>
              </div>
            </EnhancedCard>

            <EnhancedCard variant="elevated" animation="fade" className="p-6">
              <h3 className="font-semibold mb-2 flex items-center">
                <Heart className="h-5 w-5 mr-2" />
                School Health Monitoring
              </h3>
              <PieChart
                data={[
                  { label: "Healthy", value: 15, color: "#10b981" },
                  { label: "Warning", value: 8, color: "#f59e0b" },
                  { label: "Critical", value: 3, color: "#ef4444" },
                ]}
                title="School Health Status"
                subtitle="Based on usage, support, and payments"
                height={200}
              />
            </EnhancedCard>
          </div>

          {/* Ticket Analytics */}
          <EnhancedCard variant="elevated" animation="slide" className="p-6">
            <h3 className="font-semibold mb-2 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Ticket Analytics
            </h3>
            <LineChart
              data={[
                { label: "Mon", value: 12 },
                { label: "Tue", value: 19 },
                { label: "Wed", value: 15 },
                { label: "Thu", value: 22 },
                { label: "Fri", value: 18 },
                { label: "Sat", value: 8 },
                { label: "Sun", value: 5 },
              ]}
              title="Weekly Ticket Volume"
              subtitle="New tickets per day"
              height={180}
            />
          </EnhancedCard>
        </TabsContent>

        {/* Internal HR Tab */}
        <TabsContent value="internal-hr" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <EnhancedCard variant="elevated" animation="fade" className="p-6">
              <h3 className="font-semibold mb-2 flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Staff Directory
              </h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search staff..."
                    className="flex-1 px-3 py-2 border rounded-md text-sm"
                  />
                </div>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {/* TODO: Integrate real staff directory data */}
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-sm">John Doe</h4>
                        <p className="text-xs text-muted-foreground">
                          Software Engineer
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        Active
                      </Badge>
                    </div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-sm">Jane Smith</h4>
                        <p className="text-xs text-muted-foreground">
                          Sales Manager
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        Active
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </EnhancedCard>

            <EnhancedCard variant="elevated" animation="fade" className="p-6">
              <h3 className="font-semibold mb-2 flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Leave Management
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Pending Requests</span>
                  <Badge variant="outline">3</Badge>
                </div>
                <div className="space-y-2">
                  {/* TODO: Integrate real leave requests data */}
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-sm">
                          Vacation Request
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          John Doe • Dec 15-20
                        </p>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 px-2"
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 px-2"
                        >
                          Deny
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </EnhancedCard>
          </div>

          {/* HR Analytics */}
          <EnhancedCard variant="elevated" animation="slide" className="p-6">
            <h3 className="font-semibold mb-2 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              HR Analytics
            </h3>
            <BarChart
              data={[
                { label: "Software Engineers", value: 8 },
                { label: "Sales Team", value: 5 },
                { label: "Support Team", value: 4 },
                { label: "Finance Team", value: 3 },
                { label: "Management", value: 2 },
              ]}
              title="Team Distribution"
              subtitle="Staff count by department"
              height={180}
            />
          </EnhancedCard>
        </TabsContent>
      </Tabs>

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Ticket Details</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedTicket(null)}
              >
                Close
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">{selectedTicket.title}</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedTicket.description}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium">Status:</span>
                  <Badge
                    className={`ml-2 ${getStatusColor(selectedTicket.status)}`}
                  >
                    {selectedTicket.status.replace("_", " ")}
                  </Badge>
                </div>
                <div>
                  <span className="text-sm font-medium">Priority:</span>
                  <Badge
                    className={`ml-2 ${getPriorityColor(
                      selectedTicket.priority
                    )}`}
                  >
                    {selectedTicket.priority}
                  </Badge>
                </div>
              </div>
              <div>
                <span className="text-sm font-medium">School:</span>
                <p className="text-sm text-muted-foreground">
                  {selectedTicket.school?.name || "Unknown"}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium">Submitted by:</span>
                <p className="text-sm text-muted-foreground">
                  {selectedTicket.submitted_by?.name || "Unknown"}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium">Created:</span>
                <p className="text-sm text-muted-foreground">
                  {new Date(selectedTicket.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </AdminLayout>
  );
};

export default SupportHrDashboard;
