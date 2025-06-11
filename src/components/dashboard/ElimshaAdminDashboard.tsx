
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import SystemOverviewSection from './admin/SystemOverviewSection';
import SystemAlertsSection from './admin/SystemAlertsSection';
import QuickActionCard from './shared/QuickActionCard';

interface ElimshaAdminDashboardProps {
  onModalOpen: (modalType: string) => void;
}

const ElimshaAdminDashboard = ({ onModalOpen }: ElimshaAdminDashboardProps) => {
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

  const userBreakdown = [
    { role: 'Students', count: 8420, percentage: 53.1 },
    { role: 'Parents', count: 4210, percentage: 26.6 },
    { role: 'Teachers', count: 1847, percentage: 11.6 },
    { role: 'Principals', count: 247, percentage: 1.6 },
    { role: 'School Owners', count: 123, percentage: 0.8 },
    { role: 'Finance Officers', count: 98, percentage: 0.6 },
    { role: 'Admins', count: 12, percentage: 0.1 }
  ];

  const recentSchools = [
    {
      name: "Sunshine Primary School",
      location: "Nairobi",
      students: 340,
      teachers: 15,
      status: "active",
      joinDate: "2024-01-15"
    },
    {
      name: "Green Valley Academy",
      location: "Mombasa", 
      students: 280,
      teachers: 12,
      status: "pending",
      joinDate: "2024-01-20"
    },
    {
      name: "Bright Future School",
      location: "Kisumu",
      students: 450,
      teachers: 18,
      status: "active",
      joinDate: "2024-01-25"
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

  const quickActions = [
    {
      title: "Create New School",
      description: "Add a new school to the network",
      icon: "🏫",
      color: "from-blue-500 to-blue-600",
      action: () => console.log('Create school modal')
    },
    {
      title: "Manage Users",
      description: "Create and manage system users",
      icon: "👥",
      color: "from-green-500 to-green-600",
      action: () => console.log('User management modal')
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
      action: () => console.log('Support tickets modal')
    },
    {
      title: "Billing Management",
      description: "Monitor payments and subscriptions",
      icon: "💳",
      color: "from-red-500 to-red-600",
      action: () => onModalOpen('financial-reports')
    },
    {
      title: "System Health",
      description: "Monitor server and service status",
      icon: "⚡",
      color: "from-teal-500 to-teal-600",
      action: () => console.log('System health modal')
    }
  ];

  return (
    <div className="space-y-6">
      <SystemOverviewSection stats={systemStats} />

      {/* User Breakdown */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>👥</span>
            <span>User Distribution</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {userBreakdown.map((user, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-sm w-20">{user.role}</span>
                  <Progress value={user.percentage} className="w-32 h-2" />
                </div>
                <div className="text-right">
                  <p className="font-medium text-sm">{user.count.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{user.percentage}%</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent School Registrations */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>🏫</span>
            <span>Recent School Registrations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentSchools.map((school, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-all duration-200">
                <div>
                  <h3 className="font-medium">{school.name}</h3>
                  <p className="text-sm text-muted-foreground">{school.location}</p>
                  <p className="text-xs text-muted-foreground">Joined: {school.joinDate}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="text-center">
                      <p className="text-sm font-medium">{school.students}</p>
                      <p className="text-xs text-muted-foreground">Students</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">{school.teachers}</p>
                      <p className="text-xs text-muted-foreground">Teachers</p>
                    </div>
                  </div>
                  <Badge variant={school.status === 'active' ? 'default' : 'secondary'}>
                    {school.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

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
    </div>
  );
};

export default ElimshaAdminDashboard;
