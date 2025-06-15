
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, GraduationCap, BookOpen, School } from 'lucide-react';

interface PrincipalStatsCardsProps {
  stats: {
    totalStudents: number;
    totalTeachers: number;
    totalSubjects: number;
    totalClasses: number;
  };
}

const PrincipalStatsCards: React.FC<PrincipalStatsCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Users className="h-4 w-4" />
            Total Students
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{stats.totalStudents}</div>
          <p className="text-xs text-muted-foreground">
            {stats.totalStudents === 0 ? "No students enrolled" : "Enrolled students"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Total Teachers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats.totalTeachers}</div>
          <p className="text-xs text-muted-foreground">
            {stats.totalTeachers === 0 ? "No teachers assigned" : "Teaching staff"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Total Subjects
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">{stats.totalSubjects}</div>
          <p className="text-xs text-muted-foreground">
            {stats.totalSubjects === 0 ? "No subjects created" : "Available subjects"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <School className="h-4 w-4" />
            Total Classes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">{stats.totalClasses}</div>
          <p className="text-xs text-muted-foreground">
            {stats.totalClasses === 0 ? "No classes created" : "Active classes"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrincipalStatsCards;
