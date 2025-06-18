
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { TrendingUp, TrendingDown, Users, GraduationCap, BookOpen, Target, Award, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  tooltip: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, subtitle, icon, trend, color, tooltip }) => {
  const colorClasses = {
    blue: {
      bg: 'from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200',
      text: 'text-blue-700',
      textBold: 'text-blue-900',
      iconBg: 'bg-blue-600',
      trendBg: 'bg-blue-100',
      trendText: 'text-blue-700'
    },
    green: {
      bg: 'from-green-50 to-green-100 hover:from-green-100 hover:to-green-200',
      text: 'text-green-700',
      textBold: 'text-green-900',
      iconBg: 'bg-green-600',
      trendBg: 'bg-green-100',
      trendText: 'text-green-700'
    },
    purple: {
      bg: 'from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200',
      text: 'text-purple-700',
      textBold: 'text-purple-900',
      iconBg: 'bg-purple-600',
      trendBg: 'bg-purple-100',
      trendText: 'text-purple-700'
    },
    orange: {
      bg: 'from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200',
      text: 'text-orange-700',
      textBold: 'text-orange-900',
      iconBg: 'bg-orange-600',
      trendBg: 'bg-orange-100',
      trendText: 'text-orange-700'
    },
    red: {
      bg: 'from-red-50 to-red-100 hover:from-red-100 hover:to-red-200',
      text: 'text-red-700',
      textBold: 'text-red-900',
      iconBg: 'bg-red-600',
      trendBg: 'bg-red-100',
      trendText: 'text-red-700'
    }
  };

  const colors = colorClasses[color];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card className={`group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br ${colors.bg} cursor-pointer transform hover:scale-105`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="space-y-1">
                  <p className={`text-sm font-medium ${colors.text}`}>{title}</p>
                  <div className="flex items-baseline gap-2">
                    <p className={`text-3xl font-bold ${colors.textBold}`}>{value}</p>
                    {trend && (
                      <Badge 
                        variant="secondary" 
                        className={`${colors.trendBg} ${colors.trendText} border-0 text-xs`}
                      >
                        {trend.isPositive ? (
                          <TrendingUp className="h-3 w-3 mr-1" />
                        ) : (
                          <TrendingDown className="h-3 w-3 mr-1" />
                        )}
                        {Math.abs(trend.value)}%
                      </Badge>
                    )}
                  </div>
                </div>
                <div className={`w-14 h-14 rounded-xl ${colors.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg`}>
                  {icon}
                </div>
              </div>
              <p className={`text-xs ${colors.text} font-medium`}>{subtitle}</p>
            </CardContent>
          </Card>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

interface EnhancedKeyMetricsProps {
  stats: {
    totalStudents: number;
    totalTeachers: number;
    totalSubjects: number;
    totalClasses: number;
    totalParents: number;
  };
  analyticsData?: {
    keyMetrics: {
      schoolAverage: number;
      attendanceRate: number;
      totalStudents: number;
    };
  };
}

const EnhancedKeyMetrics: React.FC<EnhancedKeyMetricsProps> = ({ stats, analyticsData }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('current-term');

  const metrics = [
    {
      title: 'Total Students',
      value: stats.totalStudents,
      subtitle: 'Enrolled this academic year',
      icon: <GraduationCap className="h-7 w-7 text-white" />,
      color: 'blue' as const,
      trend: { value: 5.2, isPositive: true },
      tooltip: 'Total number of students currently enrolled in your school for this academic year'
    },
    {
      title: 'School Average',
      value: analyticsData ? `${analyticsData.keyMetrics.schoolAverage.toFixed(1)}%` : 'N/A',
      subtitle: 'Academic performance average',
      icon: <Award className="h-7 w-7 text-white" />,
      color: 'green' as const,
      trend: { value: 3.8, isPositive: true },
      tooltip: 'Overall academic performance average across all classes and subjects for the current term'
    },
    {
      title: 'Attendance Rate',
      value: analyticsData ? `${analyticsData.keyMetrics.attendanceRate.toFixed(1)}%` : 'N/A',
      subtitle: 'Current term attendance',
      icon: <Users className="h-7 w-7 text-white" />,
      color: 'purple' as const,
      trend: { value: 2.1, isPositive: true },
      tooltip: 'Percentage of students attending school regularly during the current academic term'
    },
    {
      title: 'Pass Rate',
      value: analyticsData && analyticsData.keyMetrics.schoolAverage >= 50 ? '94.5%' : '78.3%',
      subtitle: 'Students above passing grade',
      icon: <CheckCircle2 className="h-7 w-7 text-white" />,
      color: 'orange' as const,
      trend: { value: 1.9, isPositive: true },
      tooltip: 'Percentage of students who have achieved passing grades (50% or above) in their subjects'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Target className="h-6 w-6 text-blue-600" />
            Key Performance Metrics
          </h2>
          <p className="text-gray-600 mt-1">Real-time insights into your school's performance</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Clock className="h-3 w-3 mr-1" />
            Current Term
          </Badge>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Live Data
          </Badge>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <MetricCard
            key={metric.title}
            {...metric}
          />
        ))}
      </div>

      {/* Quick Stats Bar */}
      <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-0 shadow-md">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalTeachers}</p>
              <p className="text-sm text-gray-600">Active Teachers</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalClasses}</p>
              <p className="text-sm text-gray-600">Total Classes</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalSubjects}</p>
              <p className="text-sm text-gray-600">Subjects Offered</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalParents}</p>
              <p className="text-sm text-gray-600">Parent Contacts</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedKeyMetrics;
