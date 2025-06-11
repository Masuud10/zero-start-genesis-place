
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatsCard from './shared/StatsCard';
import QuickActionCard from './shared/QuickActionCard';
import ActivityItem from './shared/ActivityItem';
import ChildrenOverviewSection from './parent/ChildrenOverviewSection';
import UpcomingEventsSection from './parent/UpcomingEventsSection';

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
              <StatsCard
                key={index}
                title={stat.title}
                value={stat.value}
                subtitle={stat.subtitle}
                icon={stat.icon}
                color={stat.color}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <ChildrenOverviewSection children={childrenData} />

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
              <ActivityItem
                key={index}
                action={update.message}
                time={update.time}
                type={update.type}
                child={update.child}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <UpcomingEventsSection events={upcomingEvents} />

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

export default ParentDashboard;
