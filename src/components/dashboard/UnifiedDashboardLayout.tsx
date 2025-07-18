import React from "react";
import { useAdminAuthContext } from "@/components/auth/AdminAuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Users,
  Settings,
  Activity,
  Headphones,
  DollarSign,
  Code,
  Megaphone,
  Calendar,
  Bell,
  Clock,
  TrendingUp,
  Shield,
  Database,
  FileText,
  Mail,
  Phone,
  MapPin,
  Crown,
  Building2,
} from "lucide-react";

interface UnifiedDashboardLayoutProps {
  children?: React.ReactNode;
  role: string;
  title: string;
  description: string;
  tabs?: {
    id: string;
    label: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    content: React.ReactNode;
  }[];
  stats?: {
    label: string;
    value: string | number;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    description?: string;
    color?: string;
  }[];
  quickActions?: {
    label: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    onClick: () => void;
    variant?: "default" | "outline" | "secondary";
  }[];
}

const UnifiedDashboardLayout: React.FC<UnifiedDashboardLayoutProps> = ({
  children,
  role,
  title,
  description,
  tabs = [],
  stats = [],
  quickActions = [],
}) => {
  const { adminUser } = useAdminAuthContext();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState(
    tabs.length > 0 ? tabs[0].id : ""
  );

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "super_admin":
        return <Crown className="h-5 w-5 text-yellow-600" />;
      case "edufam_admin":
        return <Building2 className="h-5 w-5 text-blue-600" />;
      case "support_hr":
        return <Headphones className="h-5 w-5 text-purple-600" />;
      case "software_engineer":
        return <Code className="h-5 w-5 text-green-600" />;
      case "sales_marketing":
        return <Megaphone className="h-5 w-5 text-orange-600" />;
      case "finance":
        return <DollarSign className="h-5 w-5 text-emerald-600" />;
      default:
        return <Users className="h-5 w-5 text-gray-600" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "super_admin":
        return "Super Admin";
      case "edufam_admin":
        return "EduFam Admin";
      case "support_hr":
        return "Support & HR";
      case "software_engineer":
        return "Software Engineer";
      case "sales_marketing":
        return "Sales & Marketing";
      case "finance":
        return "Finance Officer";
      default:
        return role.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
    }
  };

  const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours();
    let greeting = "Good morning";

    if (hours >= 12 && hours < 17) {
      greeting = "Good afternoon";
    } else if (hours >= 17) {
      greeting = "Good evening";
    }

    return greeting;
  };

  return (
    <div className="space-y-6">
      {/* Greeting Container */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white rounded-lg shadow-sm">
                {getRoleIcon(role)}
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  {getCurrentTime()}, {adminUser?.name || "Admin"}! 👋
                </CardTitle>
                <CardTitle className="text-lg font-medium text-gray-700 mt-1">
                  {title}
                </CardTitle>
                <p className="text-gray-600 mt-2">{description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge
                variant="outline"
                className="flex items-center gap-2 px-3 py-1"
              >
                {getRoleIcon(role)}
                <span className="font-medium">{getRoleLabel(role)}</span>
              </Badge>
              <div className="text-right text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Quick Actions */}
      {quickActions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant || "outline"}
                  onClick={action.onClick}
                  className="flex items-center gap-2"
                >
                  <action.icon className="h-4 w-4" />
                  {action.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      {stats.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.label}
                </CardTitle>
                <stat.icon
                  className={`h-4 w-4 text-muted-foreground ${
                    stat.color || ""
                  }`}
                />
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold ${
                    stat.color || "text-gray-900"
                  }`}
                >
                  {stat.value}
                </div>
                {stat.description && (
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Main Content */}
      {tabs.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-auto-fit h-12">
                {tabs.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="flex items-center gap-2 text-sm"
                  >
                    <tab.icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              {tabs.map((tab) => (
                <TabsContent key={tab.id} value={tab.id} className="p-6">
                  {tab.content}
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6">{children}</CardContent>
        </Card>
      )}
    </div>
  );
};

export default UnifiedDashboardLayout;
