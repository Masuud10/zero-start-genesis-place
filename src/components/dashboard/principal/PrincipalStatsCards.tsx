
import React from "react";
import { Users, GraduationCap, BookOpen, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type SchoolStats = {
  totalStudents: number;
  totalTeachers: number;
  totalSubjects: number;
  totalClasses: number;
};

interface PrincipalStatsCardsProps {
  stats: SchoolStats;
}

const statsMeta = [
  {
    title: "Total Students",
    key: "totalStudents",
    description: "Active students in school",
    icon: Users,
    color: "text-blue-600"
  },
  {
    title: "Total Teachers",
    key: "totalTeachers",
    description: "Teaching staff members",
    icon: GraduationCap,
    color: "text-green-600"
  },
  {
    title: "Total Subjects",
    key: "totalSubjects",
    description: "Subjects offered",
    icon: BookOpen,
    color: "text-purple-600"
  },
  {
    title: "Total Classes",
    key: "totalClasses",
    description: "Active class groups",
    icon: TrendingUp,
    color: "text-orange-600"
  }
];

const PrincipalStatsCards: React.FC<PrincipalStatsCardsProps> = ({ stats }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    {statsMeta.map((meta, index) => {
      const Icon = meta.icon;
      return (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{meta.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stats[meta.key as keyof SchoolStats]}</p>
                <p className="text-xs text-gray-500">{meta.description}</p>
              </div>
              <Icon className={`h-8 w-8 ${meta.color}`} />
            </div>
          </CardContent>
        </Card>
      );
    })}
  </div>
);

export default PrincipalStatsCards;
