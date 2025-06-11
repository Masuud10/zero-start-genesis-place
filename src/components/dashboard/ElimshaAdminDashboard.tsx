
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import SystemOverviewSection from './admin/SystemOverviewSection';
import SystemAlertsSection from './admin/SystemAlertsSection';
import SystemHealthMonitor from './admin/SystemHealthMonitor';
import NetworkAnalytics from './admin/NetworkAnalytics';
import QuickActionCard from './shared/QuickActionCard';

interface ElimshaAdminDashboardProps {
  onModalOpen: (modalType: string) => void;
}

const ElimshaAdminDashboard = ({ onModalOpen }: ElimshaAdminDashboardProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const systemStats = [
    {
      title: "Total Schools",
      value: "247",
      change: "+12 this month",
      icon: "🏫",
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "Active Users",
      value: "15,847",
      change: "+1,234 this month",
      icon: "👥",
      color: "from-green-500 to-green-600"
    },
    {
      title: "System Uptime",
      value: "99.9%",
      change: "Above SLA",
      icon: "⚡",
      color: "from-purple-500 to-purple-600"
    },
    {
      title: "Monthly Revenue",
      value: "KES 45.2M",
      change: "+18% growth",
      icon: "💰",
      color: "from-orange-500 to-orange-600"
    }
  ];

  const systemAlerts = [
    {
      type: "High Priority",
      message: "Server performance degradation detected in US-East region",
      time: "5 minutes ago",
      severity: "high" as const
    },
    {
      type: "Security",
      message: "Multiple failed login attempts from IP 192.168.1.100",
      time: "15 minutes ago", 
      severity: "medium" as const
    },
    {
      type: "Billing",
      message: "Payment failed for Greenwood Primary School",
      time: "1 hour ago",
      severity: "medium" as const
    },
    {
      type: "Feature",
      message: "New analytics module deployed successfully",
      time: "2 hours ago",
      severity: "low" as const
    }
  ];

  const handleCreateSchool = () => {
    setIsLoading(true);
    toast({
      title: "Create School",
      description: "Opening school creation wizard...",
    });
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "School Creation",
        description: "This feature will allow creating new schools in the network.",
      });
    }, 1500);
  };

  const handleUserManagement = () => {
    toast({
      title: "User Management",
      description: "Redirecting to user management panel...",
    });
  };

  const handleSystemHealth = () => {
    toast({
      title: "System Health",
      description: "Checking all system components...",
    });
  };

  const handleBillingManagement = () => {
    onModalOpen('financial-reports');
  };

  const handleSupportTickets = () => {
    toast({
      title: "Support Tickets",
      description: "Opening support management dashboard...",
    });
  };

  const quickActions = [
    {
      title: "Create New School",
      description: "Add a new school to the network",
      icon: "🏫",
      color: "from-blue-500 to-blue-600",
      action: handleCreateSchool
    },
    {
      title: "Manage Users",
      description: "Create and manage system users",
      icon: "👥",
      color: "from-green-500 to-green-600",
      action: handleUserManagement
    },
    {
      title: "System Analytics",
      description: "View comprehensive system reports",
      icon: "📊",
      color: "from-purple-500 to-purple-600",
      action: () => onModalOpen('reports')
    },
    {
      title: "Support Tickets",
      description: "Manage customer support requests",
      icon: "🎧",
      color: "from-orange-500 to-orange-600",
      action: handleSupportTickets
    },
    {
      title: "Billing Management",
      description: "Monitor payments and subscriptions",
      icon: "💳",
      color: "from-red-500 to-red-600",
      action: handleBillingManagement
    },
    {
      title: "System Health",
      description: "Monitor server and service status",
      icon: "⚡",
      color: "from-teal-500 to-teal-600",
      action: handleSystemHealth
    }
  ];

  return (
    <div className="space-y-6">
      <SystemOverviewSection stats={systemStats} />
      <NetworkAnalytics />
      <SystemHealthMonitor />
      <SystemAlertsSection alerts={systemAlerts} />

      {/* Admin Actions */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>⚡</span>
            <span>Administrative Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {quickActions.map((action, index) => (
              <QuickActionCard
                key={index}
                title={action.title}
                description={action.description}
                icon={action.icon}
                color={action.color}
                onClick={action.action}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Generate Reports Section */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>📊</span>
            <span>System Reports</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            <Button 
              variant="outline" 
              className="h-20 flex flex-col gap-2"
              onClick={() => {
                toast({
                  title: "Network Report",
                  description: "Generating comprehensive network analysis...",
                });
              }}
              disabled={isLoading}
            >
              <span className="text-xl">🌐</span>
              Network Report
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col gap-2"
              onClick={() => {
                toast({
                  title: "Financial Report",
                  description: "Generating financial summary report...",
                });
              }}
              disabled={isLoading}
            >
              <span className="text-xl">💰</span>
              Financial Report
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col gap-2"
              onClick={() => {
                toast({
                  title: "Performance Report",
                  description: "Generating system performance metrics...",
                });
              }}
              disabled={isLoading}
            >
              <span className="text-xl">📈</span>
              Performance Report
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col gap-2"
              onClick={() => {
                toast({
                  title: "User Analytics",
                  description: "Generating user behavior analysis...",
                });
              }}
              disabled={isLoading}
            >
              <span className="text-xl">👤</span>
              User Analytics
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ElimshaAdminDashboard;
