import React, { ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useUIEnhancement } from "@/contexts/UIEnhancementContext";
import {
  EnhancedCard,
  StatCard,
  MetricCard,
  ProgressCard,
} from "@/components/ui/EnhancedCard";
import { LucideIcon } from "lucide-react";

interface QuickAction {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
}

interface StatCard {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: string;
}

interface TabContent {
  value: string;
  label: string;
  content: ReactNode;
}

interface UnifiedDashboardLayoutProps {
  role: string;
  roleIcon: LucideIcon;
  roleLabel: string;
  quickActions: QuickAction[];
  statsCards: StatCard[];
  tabs: TabContent[];
  children?: ReactNode;
}

const UnifiedDashboardLayout: React.FC<UnifiedDashboardLayoutProps> = ({
  role,
  roleIcon: RoleIcon,
  roleLabel,
  quickActions,
  statsCards,
  tabs,
  children,
}) => {
  const { getRoleColors, getLoadingAnimation } = useUIEnhancement();
  const roleColors = getRoleColors(role);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const formatDate = () => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header with Greeting */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div
                className={`p-3 rounded-lg ${roleColors.gradient} text-white`}
              >
                <RoleIcon className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {getGreeting()}, {/* user?.name || "User" */}!
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  Welcome to your {roleLabel} dashboard • {formatDate()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge
                variant="outline"
                className="bg-green-50 text-green-700 border-green-200"
              >
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                System Online
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || "outline"}
                onClick={action.onClick}
                className="h-auto p-4 flex flex-col items-center space-y-2 hover:shadow-md transition-shadow"
              >
                <action.icon className="h-5 w-5" />
                <span className="text-sm font-medium">{action.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Overview
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsCards.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <StatCard
                  key={index}
                  title={stat.title}
                  value={stat.value}
                  subtitle={stat.description}
                  icon={<IconComponent className="h-5 w-5" />}
                  trend={stat.trend}
                />
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
          <Tabs defaultValue={tabs[0]?.value || "overview"} className="w-full">
            <div className="border-b border-slate-200 dark:border-slate-700">
              <div className="px-6">
                <TabsList className="grid w-full grid-cols-auto-fit">
                  {tabs.map((tab) => (
                    <TabsTrigger key={tab.value} value={tab.value}>
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
            </div>
            {tabs.map((tab) => (
              <TabsContent key={tab.value} value={tab.value} className="p-6">
                {tab.content}
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Additional Children Content */}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </div>
  );
};

export default UnifiedDashboardLayout;
