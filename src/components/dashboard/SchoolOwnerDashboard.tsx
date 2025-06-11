
import React from 'react';
import FinancialStatsSection from './school-owner/FinancialStatsSection';
import AcademicStatsSection from './school-owner/AcademicStatsSection';
import FinancialActivitiesSection from './school-owner/FinancialActivitiesSection';
import QuickActionsSection from './school-owner/QuickActionsSection';

interface SchoolOwnerDashboardProps {
  onModalOpen: (modalType: string) => void;
}

const SchoolOwnerDashboard = ({ onModalOpen }: SchoolOwnerDashboardProps) => {
  const financialStats = [
    {
      title: "Monthly Revenue",
      value: "KES 2.8M",
      change: "+12% from last month",
      icon: "💰",
      color: "from-green-500 to-green-600"
    },
    {
      title: "Fee Collection Rate",
      value: "89.2%",
      change: "+5.1% from last month",
      icon: "📊",
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "Outstanding Fees",
      value: "KES 320K",
      change: "-8% from last month",
      icon: "📋",
      color: "from-orange-500 to-orange-600"
    },
    {
      title: "Operational Costs",
      value: "KES 1.2M",
      change: "+3% from last month",
      icon: "💸",
      color: "from-purple-500 to-purple-600"
    }
  ];

  const academicStats = [
    {
      title: "Average Grade",
      value: "82.4%",
      change: "+3.2% from last month",
      icon: "📝",
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "Students Enrolled",
      value: "1,247",
      change: "+5% from last month",
      icon: "👥",
      color: "from-green-500 to-green-600"
    },
    {
      title: "Attendance Rate",
      value: "94.2%",
      change: "+1.1% from last month",
      icon: "📅",
      color: "from-purple-500 to-purple-600"
    },
    {
      title: "Teacher Efficiency",
      value: "91.5%",
      change: "+2.8% from last month",
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
      type: "income" as const
    },
    {
      action: "Teacher salary payment processed",
      amount: "KES 45,000",
      time: "1 hour ago",
      type: "expense" as const
    },
    {
      action: "Utility bill payment completed",
      amount: "KES 8,500",
      time: "3 hours ago",
      type: "expense" as const
    },
    {
      action: "Stationery purchase for Term 2",
      amount: "KES 12,000",
      time: "5 hours ago",
      type: "expense" as const
    }
  ];

  return (
    <div className="space-y-6">
      <FinancialStatsSection stats={financialStats} />
      <AcademicStatsSection stats={academicStats} />
      <FinancialActivitiesSection activities={recentFinancialActivities} />
      <QuickActionsSection actions={quickActions} />
    </div>
  );
};

export default SchoolOwnerDashboard;
