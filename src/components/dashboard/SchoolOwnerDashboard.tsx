
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface SchoolOwnerDashboardProps {
  onModalOpen: (modalType: string) => void;
}

const SchoolOwnerDashboard = ({ onModalOpen }: SchoolOwnerDashboardProps) => {
  const financialStats = [
    {
      title: "Monthly Revenue",
      value: "KES 2.8M",
      change: "+12%",
      icon: "💰",
      color: "from-green-500 to-green-600"
    },
    {
      title: "Fee Collection Rate",
      value: "89.2%",
      change: "+5.1%",
      icon: "📊",
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "Outstanding Fees",
      value: "KES 320K",
      change: "-8%",
      icon: "📋",
      color: "from-orange-500 to-orange-600"
    },
    {
      title: "Operational Costs",
      value: "KES 1.2M",
      change: "+3%",
      icon: "💸",
      color: "from-purple-500 to-purple-600"
    }
  ];

  const academicStats = [
    {
      title: "Average Grade",
      value: "82.4%",
      change: "+3.2%",
      icon: "📝",
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "Students Enrolled",
      value: "1,247",
      change: "+5%",
      icon: "👥",
      color: "from-green-500 to-green-600"
    },
    {
      title: "Attendance Rate",
      value: "94.2%",
      change: "+1.1%",
      icon: "📅",
      color: "from-purple-500 to-purple-600"
    },
    {
      title: "Teacher Efficiency",
      value: "91.5%",
      change: "+2.8%",
      icon: "👨‍🏫",
      color: "from-orange-500 to-orange-600"
    }
  ];

  const quickActions = [
    {
      title: "Financial Reports",
      description: "Generate comprehensive financial analytics",
      icon: "📊",
      color: "from-green-500 to-green-600",
      action: () => onModalOpen('financial-reports')
    },
    {
      title: "Academic Reports",
      description: "Monitor school academic performance",
      icon: "📝",
      color: "from-blue-500 to-blue-600",
      action: () => onModalOpen('reports')
    },
    {
      title: "Fee Collection",
      description: "Manage student fees and payments",
      icon: "💰",
      color: "from-purple-500 to-purple-600",
      action: () => onModalOpen('fee-collection')
    },
    {
      title: "Release Results",
      description: "Publish academic results to parents",
      icon: "🔓",
      color: "from-orange-500 to-orange-600",
      action: () => onModalOpen('results')
    }
  ];

  const recentFinancialActivities = [
    {
      action: "Fee payment received from John Doe (Class 8A)",
      amount: "KES 15,000",
      time: "2 minutes ago",
      type: "income"
    },
    {
      action: "Teacher salary payment processed",
      amount: "KES 45,000",
      time: "1 hour ago",
      type: "expense"
    },
    {
      action: "Utility bill payment completed",
      amount: "KES 8,500",
      time: "3 hours ago",
      type: "expense"
    },
    {
      action: "Stationery purchase for Term 2",
      amount: "KES 12,000",
      time: "5 hours ago",
      type: "expense"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Financial Performance */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>💰</span>
            <span>Financial Performance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {financialStats.map((stat, index) => (
              <div key={index} className="relative overflow-hidden border rounded-lg p-4">
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5`}></div>
                <div className="flex items-center justify-between space-y-0 pb-2">
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <div className="text-xl">{stat.icon}</div>
                </div>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <p className="text-xs text-green-600 font-medium">{stat.change} from last month</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Academic Performance */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>📚</span>
            <span>Academic Performance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {academicStats.map((stat, index) => (
              <div key={index} className="relative overflow-hidden border rounded-lg p-4">
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5`}></div>
                <div className="flex items-center justify-between space-y-0 pb-2">
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <div className="text-xl">{stat.icon}</div>
                </div>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <p className="text-xs text-green-600 font-medium">{stat.change} from last month</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Financial Activities */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>💸</span>
            <span>Recent Financial Activities</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentFinancialActivities.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === 'income' ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <div>
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
                <Badge variant={activity.type === 'income' ? 'default' : 'destructive'}>
                  {activity.type === 'income' ? '+' : '-'}{activity.amount}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>⚡</span>
            <span>Quick Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
            {quickActions.map((action, index) => (
              <button 
                key={index}
                onClick={action.action}
                className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-accent transition-all duration-200 text-left w-full"
              >
                <div className={`w-10 h-10 bg-gradient-to-r ${action.color} rounded-lg flex items-center justify-center`}>
                  <span className="text-white text-sm">{action.icon}</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-base">{action.title}</p>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SchoolOwnerDashboard;
