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
  TrendingUp,
  Users,
  Mail,
  Calendar,
  Target,
  Megaphone,
  BarChart3,
  DollarSign,
  MessageSquare,
  Phone,
  MapPin,
  Star,
  Activity,
  Settings,
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  Zap,
  Award,
  Globe,
  Building2,
  UserPlus,
  Mail as MailIcon,
  Phone as PhoneIcon,
  Calendar as CalendarIcon,
  MapPin as MapPinIcon,
} from "lucide-react";

// Import Academic Trips Management
import AcademicTripsManagementPage from "@/components/dashboard/sales-marketing/AcademicTripsManagementPage";
// Import Marketing Modules
import CampaignManagementPage from "@/components/dashboard/sales-marketing/CampaignManagementPage";
import LeadManagementPage from "@/components/dashboard/sales-marketing/LeadManagementPage";
import CRMPage from "@/components/dashboard/sales-marketing/CRMPage";

const SalesMarketingDashboard: React.FC = () => {
  const { adminUser } = useAdminAuthContext();

  const handleQuickAction = (action: string) => {
    console.log(`Quick action: ${action}`);
    // Implement quick actions here
  };

  const stats = [
    {
      label: "Total Leads",
      value: "156",
      icon: Users,
      description: "Active prospects",
      color: "text-blue-600",
    },
    {
      label: "Conversion Rate",
      value: "12.4%",
      icon: Target,
      description: "This month",
      color: "text-green-600",
    },
    {
      label: "Active Campaigns",
      value: "8",
      icon: Mail,
      description: "Running campaigns",
      color: "text-purple-600",
    },
    {
      label: "Revenue",
      value: "$45.2K",
      icon: DollarSign,
      description: "This month",
      color: "text-emerald-600",
    },
  ];

  const quickActions = [
    {
      label: "Create Campaign",
      icon: Megaphone,
      onClick: () => handleQuickAction("create_campaign"),
      variant: "default" as const,
    },
    {
      label: "Add Lead",
      icon: UserPlus,
      onClick: () => handleQuickAction("add_lead"),
      variant: "outline" as const,
    },
    {
      label: "Schedule Event",
      icon: Calendar,
      onClick: () => handleQuickAction("schedule_event"),
      variant: "outline" as const,
    },
    {
      label: "View Analytics",
      icon: BarChart3,
      onClick: () => handleQuickAction("view_analytics"),
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
                  <TrendingUp className="h-5 w-5" />
                  Marketing Performance
                </CardTitle>
                <CardDescription>
                  Key marketing metrics and performance indicators
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium">Email Campaigns</p>
                        <p className="text-sm text-gray-600">
                          3 active campaigns
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-blue-600">
                      Active
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Target className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium">Lead Generation</p>
                        <p className="text-sm text-gray-600">
                          24 new leads this week
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-green-600">
                      Growing
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="font-medium">Events</p>
                        <p className="text-sm text-gray-600">
                          2 upcoming events
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-purple-600">
                      Scheduled
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Sales Metrics
                </CardTitle>
                <CardDescription>
                  Sales performance and conversion tracking
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        Lead Conversion
                      </span>
                      <span className="text-sm text-gray-600">12.4%</span>
                    </div>
                    <Progress value={12.4} className="h-2" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        Sales Pipeline
                      </span>
                      <span className="text-sm text-gray-600">$125K</span>
                    </div>
                    <Progress value={68} className="h-2" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        Customer Acquisition
                      </span>
                      <span className="text-sm text-gray-600">$450</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Recent Activities
                </CardTitle>
                <CardDescription>
                  Latest marketing and sales activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">
                      New lead added: Acme School District
                    </span>
                    <span className="text-xs text-gray-500 ml-auto">
                      2h ago
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">
                      Email campaign sent: Back to School
                    </span>
                    <span className="text-xs text-gray-500 ml-auto">
                      4h ago
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm">
                      Event scheduled: Product Demo
                    </span>
                    <span className="text-xs text-gray-500 ml-auto">
                      1d ago
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-sm">
                      Lead qualified: Bright Future Academy
                    </span>
                    <span className="text-xs text-gray-500 ml-auto">
                      2d ago
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Campaign Performance
                </CardTitle>
                <CardDescription>
                  Performance metrics for all campaigns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">8</p>
                      <p className="text-xs text-gray-600">Active Campaigns</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">24.5K</p>
                      <p className="text-xs text-gray-600">Total Reach</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">3.2%</p>
                      <p className="text-xs text-gray-600">Avg CTR</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-orange-600">
                        $8.4K
                      </p>
                      <p className="text-xs text-gray-600">Total Spent</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ),
    },
    {
      id: "campaigns",
      label: "Campaign Management",
      icon: Megaphone,
      content: <CampaignManagementPage />,
    },
    {
      id: "leads",
      label: "Lead Management",
      icon: Users,
      content: <LeadManagementPage />,
    },
    {
      id: "crm",
      label: "CRM",
      icon: Building2,
      content: <CRMPage />,
    },
    {
      id: "academic-trips",
      label: "Academic Trips",
      icon: MapPinIcon,
      content: <AcademicTripsManagementPage />,
    },
  ];

  return (
    <UnifiedDashboardLayout
      role="sales_marketing"
      title="Sales & Marketing Dashboard"
      description="Track leads, manage campaigns, and monitor sales performance."
      stats={stats}
      quickActions={quickActions}
      tabs={tabs}
    />
  );
};

export default SalesMarketingDashboard;
