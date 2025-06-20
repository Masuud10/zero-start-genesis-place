
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, GraduationCap, BookOpen, School, Loader2, AlertCircle, TrendingUp } from 'lucide-react';

interface PrincipalStatsCardsProps {
  stats: {
    totalStudents: number;
    totalTeachers: number;
    totalSubjects: number;
    totalClasses: number;
    totalParents?: number;
  };
  loading?: boolean;
  error?: string | null;
}

const PrincipalStatsCards: React.FC<PrincipalStatsCardsProps> = ({ stats, loading, error }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse border-gray-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-red-600 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Error Loading Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 text-sm">{error}</p>
        </CardContent>
      </Card>
    );
  }

  const statCards = [
    {
      title: 'Total Students',
      value: stats.totalStudents,
      icon: Users,
      color: 'blue',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-700',
      valueColor: 'text-blue-900',
      iconColor: 'text-blue-600',
      emptyMessage: 'No students enrolled'
    },
    {
      title: 'Total Teachers',
      value: stats.totalTeachers,
      icon: GraduationCap,
      color: 'green',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-700',
      valueColor: 'text-green-900',
      iconColor: 'text-green-600',
      emptyMessage: 'No teachers assigned'
    },
    {
      title: 'Total Subjects',
      value: stats.totalSubjects,
      icon: BookOpen,
      color: 'purple',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-700',
      valueColor: 'text-purple-900',
      iconColor: 'text-purple-600',
      emptyMessage: 'No subjects created'
    },
    {
      title: 'Total Classes',
      value: stats.totalClasses,
      icon: School,
      color: 'orange',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      textColor: 'text-orange-700',
      valueColor: 'text-orange-900',
      iconColor: 'text-orange-600',
      emptyMessage: 'No classes created'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((card) => (
        <Card key={card.title} className={`${card.bgColor} ${card.borderColor} shadow-sm transition-all duration-200 hover:shadow-md`}>
          <CardHeader className="pb-2">
            <CardTitle className={`text-sm font-medium flex items-center gap-2 ${card.textColor}`}>
              <card.icon className={`h-4 w-4 ${card.iconColor}`} />
              {card.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-2xl font-bold ${card.valueColor}`}>
                  {card.value || 0}
                </div>
                <p className={`text-xs ${card.textColor} opacity-80 mt-1`}>
                  {card.value === 0 ? card.emptyMessage : `Active ${card.title.toLowerCase()}`}
                </p>
              </div>
              {card.value > 0 && (
                <TrendingUp className={`h-4 w-4 ${card.iconColor} opacity-60`} />
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PrincipalStatsCards;
