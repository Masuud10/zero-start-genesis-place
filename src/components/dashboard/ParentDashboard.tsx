
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface ParentDashboardProps {
  onModalOpen: (modalType: string) => void;
}

const ParentDashboard = ({ onModalOpen }: ParentDashboardProps) => {
  const childrenData = [
    {
      name: "Emily Johnson",
      class: "Grade 8A",
      avgGrade: 85,
      attendance: 96,
      recentGrade: "Mathematics: 88%",
      nextFee: "KES 15,000",
      dueDate: "2024-02-15"
    },
    {
      name: "Michael Johnson", 
      class: "Grade 6B",
      avgGrade: 78,
      attendance: 92,
      recentGrade: "English: 82%",
      nextFee: "KES 12,000",
      dueDate: "2024-02-15"
    }
  ];

  const quickStats = [
    {
      title: "Children Enrolled",
      value: "2",
      subtitle: "Both active",
      icon: "👦",
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "Average Performance",
      value: "81.5%",
      subtitle: "+3% this term",
      icon: "📊",
      color: "from-green-500 to-green-600"
    },
    {
      title: "Attendance Rate",
      value: "94%",
      subtitle: "Excellent",
      icon: "📅",
      color: "from-purple-500 to-purple-600"
    },
    {
      title: "Pending Fees",
      value: "KES 27K",
      subtitle: "Due Feb 15",
      icon: "💰",
      color: "from-orange-500 to-orange-600"
    }
  ];

  const quickActions = [
    {
      title: "View Grades",
      description: "Check your children's academic progress",
      icon: "📝",
      color: "from-blue-500 to-blue-600",
      action: () => onModalOpen('grades')
    },
    {
      title: "Attendance Report",
      description: "Monitor daily attendance records",
      icon: "📅",
      color: "from-green-500 to-green-600",
      action: () => onModalOpen('attendance')
    },
    {
      title: "Pay Fees",
      description: "Make school fee payments via M-PESA",
      icon: "💰",
      color: "from-purple-500 to-purple-600",
      action: () => onModalOpen('fee-collection')
    }
  ];

  const recentUpdates = [
    {
      message: "Emily's Mathematics test results published: 88%",
      time: "2 hours ago",
      type: "grade",
      child: "Emily"
    },
    {
      message: "Michael was marked present for all classes today",
      time: "5 hours ago",
      type: "attendance",
      child: "Michael"
    },
    {
      message: "Term 2 fee payment reminder sent",
      time: "1 day ago",
      type: "fee",
      child: "Both"
    },
    {
      message: "Parent-teacher meeting scheduled for Grade 8A",
      time: "2 days ago",
      type: "announcement",
      child: "Emily"
    }
  ];

  const upcomingEvents = [
    {
      event: "Parent-Teacher Meeting (Grade 8A)",
      date: "February 20, 2024",
      time: "2:00 PM",
      child: "Emily"
    },
    {
      event: "Term 2 Fees Due",
      date: "February 15, 2024", 
      time: "End of day",
      child: "Both"
    },
    {
      event: "Sports Day",
      date: "February 28, 2024",
      time: "10:00 AM",
      child: "Both"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>👨‍👩‍👧‍👦</span>
            <span>Family Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {quickStats.map((stat, index) => (
              <div key={index} className="relative overflow-hidden border rounded-lg p-4">
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5`}></div>
                <div className="flex items-center justify-between space-y-0 pb-2">
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <div className="text-xl">{stat.icon}</div>
                </div>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Children Overview */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>👦</span>
            <span>My Children</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {childrenData.map((child, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-medium">{child.name}</h3>
                    <p className="text-sm text-muted-foreground">{child.class}</p>
                  </div>
                  <Badge variant={child.avgGrade >= 80 ? 'default' : child.avgGrade >= 70 ? 'secondary' : 'destructive'}>
                    {child.avgGrade >= 80 ? 'Excellent' : child.avgGrade >= 70 ? 'Good' : 'Needs Attention'}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Average Grade</p>
                    <p className="font-medium text-blue-600">{child.avgGrade}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Attendance</p>
                    <p className="font-medium text-green-600">{child.attendance}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Recent Grade</p>
                    <p className="font-medium">{child.recentGrade}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Next Fee</p>
                    <p className="font-medium text-orange-600">{child.nextFee}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Updates */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>📢</span>
            <span>Recent Updates</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentUpdates.map((update, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-accent transition-colors">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  update.type === 'grade' ? 'bg-blue-500' :
                  update.type === 'attendance' ? 'bg-green-500' :
                  update.type === 'fee' ? 'bg-orange-500' :
                  'bg-purple-500'
                }`}></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{update.message}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-muted-foreground">Child: {update.child}</p>
                    <p className="text-xs text-muted-foreground">{update.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>📅</span>
            <span>Upcoming Events</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {upcomingEvents.map((event, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium text-sm">{event.event}</p>
                  <p className="text-xs text-muted-foreground">For: {event.child}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{event.date}</p>
                  <p className="text-xs text-muted-foreground">{event.time}</p>
                </div>
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
          <div className="grid gap-3 grid-cols-1 md:grid-cols-3">
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

export default ParentDashboard;
