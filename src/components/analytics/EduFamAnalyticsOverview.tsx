
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  School, 
  GraduationCap, 
  DollarSign, 
  TrendingUp, 
  Activity,
  BarChart3,
  RefreshCw,
  Eye,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEduFamSystemAnalytics } from '@/hooks/useEduFamSystemAnalytics';
import SystemAnalyticsChartsSection from './sections/SystemAnalyticsChartsSection';

interface EduFamAnalyticsOverviewProps {
  onAnalyticsAction?: (action: string) => void;
}

const EduFamAnalyticsOverview: React.FC<EduFamAnalyticsOverviewProps> = ({ 
  onAnalyticsAction 
}) => {
  const { data: systemAnalytics, isLoading, error, refetch } = useEduFamSystemAnalytics();

  const handleRefresh = () => {
    console.log('🔄 EduFamAnalyticsOverview: Refreshing analytics data');
    refetch();
  };

  const handleViewDetailed = () => {
    console.log('👁️ EduFamAnalyticsOverview: View detailed analytics');
    onAnalyticsAction?.('view-detailed-analytics');
  };

  const handleExportData = () => {
    console.log('📤 EduFamAnalyticsOverview: Export analytics data');
    onAnalyticsAction?.('export-analytics');
  };

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <BarChart3 className="h-5 w-5 animate-pulse" />
              EduFam System Analytics
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white p-4 rounded-lg shadow-sm animate-pulse">
                <div className="h-12 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    console.error('❌ EduFamAnalyticsOverview: Error loading analytics:', error);
    return (
      <Card className="bg-gradient-to-r from-red-50 to-pink-50 border-red-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-red-900">
              <BarChart3 className="h-5 w-5" />
              EduFam System Analytics
            </CardTitle>
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-1" />
              Retry
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-red-700">Failed to load system analytics. Please try again.</p>
        </CardContent>
      </Card>
    );
  }

  console.log('📊 EduFamAnalyticsOverview: Rendering with analytics data:', systemAnalytics ? 'Available' : 'Not Available');

  const analytics = systemAnalytics || {
    schools: { total_schools: 0, active_schools: 0 },
    users: { total_users: 0, active_users: 0 },
    grades: { total_grades: 0, average_grade: 0 },
    finance: { total_collected: 0, outstanding_amount: 0 },
    attendance: { average_attendance_rate: 0 },
    system: { uptime_percentage: 99.9 }
  };

  const statsCards = [
    {
      title: 'Active Schools',
      value: analytics.schools.active_schools.toLocaleString(),
      total: `${analytics.schools.total_schools.toLocaleString()} Total`,
      icon: School,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-900'
    },
    {
      title: 'System Users',
      value: analytics.users.active_users.toLocaleString(),
      total: `${analytics.users.total_users.toLocaleString()} Total`,
      icon: Users,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-900'
    },
    {
      title: 'Academic Performance',
      value: `${analytics.grades.average_grade.toFixed(1)}%`,
      total: `${analytics.grades.total_grades.toLocaleString()} Grades`,
      icon: GraduationCap,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-900'
    },
    {
      title: 'Revenue Collected',
      value: `KES ${(analytics.finance.total_collected / 1000000).toFixed(1)}M`,
      total: `${(analytics.finance.outstanding_amount / 1000000).toFixed(1)}M Outstanding`,
      icon: DollarSign,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-900'
    },
    {
      title: 'Attendance Rate',
      value: `${analytics.attendance.average_attendance_rate.toFixed(1)}%`,
      total: 'Network Average',
      icon: TrendingUp,
      color: 'bg-cyan-500',
      bgColor: 'bg-cyan-50',
      textColor: 'text-cyan-900'
    },
    {
      title: 'System Uptime',
      value: `${analytics.system.uptime_percentage.toFixed(1)}%`,
      total: 'Last 30 Days',
      icon: Activity,
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-900'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Overview Cards */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <BarChart3 className="h-5 w-5" />
              EduFam System Analytics Overview
            </CardTitle>
            <div className="flex gap-2">
              <Button onClick={handleViewDetailed} variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-1" />
                View Details
              </Button>
              <Button onClick={handleExportData} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
              <Button onClick={handleRefresh} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {statsCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div 
                  key={index} 
                  className={`${stat.bgColor} p-4 rounded-lg shadow-sm border cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-105`}
                  onClick={handleViewDetailed}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 rounded-full ${stat.color}`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div className={`text-2xl font-bold ${stat.textColor} mb-1`}>
                    {stat.value}
                  </div>
                  <div className="text-xs text-gray-600 mb-1">{stat.title}</div>
                  <div className="text-xs text-gray-500">{stat.total}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Comprehensive Charts Section */}
      <SystemAnalyticsChartsSection />
    </div>
  );
};

export default EduFamAnalyticsOverview;
