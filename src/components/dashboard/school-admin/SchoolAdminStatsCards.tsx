
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, GraduationCap, BookOpen, School } from 'lucide-react';

interface SchoolAdminStatsCardsProps {
  stats: {
    totalStudents: number;
    totalTeachers: number;
    totalSubjects: number;
    totalClasses: number;
  };
  loading: boolean;
}

const SchoolAdminStatsCards: React.FC<SchoolAdminStatsCardsProps> = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-16 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Students',
      value: stats.totalStudents,
      icon: GraduationCap,
      color: 'from-blue-500 to-blue-600',
      textColor: 'text-blue-100'
    },
    {
      title: 'Total Teachers',
      value: stats.totalTeachers,
      icon: Users,
      color: 'from-green-500 to-green-600',
      textColor: 'text-green-100'
    },
    {
      title: 'Total Subjects',
      value: stats.totalSubjects,
      icon: BookOpen,
      color: 'from-purple-500 to-purple-600',
      textColor: 'text-purple-100'
    },
    {
      title: 'Total Classes',
      value: stats.totalClasses,
      icon: School,
      color: 'from-orange-500 to-orange-600',
      textColor: 'text-orange-100'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className={`bg-gradient-to-r ${card.color} text-white`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={card.textColor}>{card.title}</p>
                  <p className="text-3xl font-bold">{card.value}</p>
                </div>
                <Icon className={`h-8 w-8 ${card.textColor.replace('100', '200')}`} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default SchoolAdminStatsCards;
