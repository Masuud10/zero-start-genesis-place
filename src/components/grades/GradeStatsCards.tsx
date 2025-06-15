
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, TrendingUp, BookOpen, GraduationCap } from "lucide-react";

interface GradeStatsCardsProps {
  stats: {
    totalStudents: number;
    averageScore: number;
    topPerformingSubject: string;
    studentsAbove90: number;
  };
  role?: string;
}

const GradeStatsCards: React.FC<GradeStatsCardsProps> = ({ stats, role }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Total Students</CardTitle>
        <Users className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{stats.totalStudents}</div>
        <p className="text-xs text-muted-foreground">
          {role === "edufam_admin" ? "Across all schools" : "Enrolled students"}
        </p>
      </CardContent>
    </Card>
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Average Score</CardTitle>
        <TrendingUp className="h-4 w-4 text-blue-500" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-blue-600">{stats.averageScore}</div>
        <p className="text-xs text-muted-foreground">Overall average</p>
      </CardContent>
    </Card>
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Top Subject</CardTitle>
        <BookOpen className="h-4 w-4 text-green-500" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-green-600">{stats.topPerformingSubject}</div>
        <p className="text-xs text-muted-foreground">By average score</p>
      </CardContent>
    </Card>
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Students Above 90</CardTitle>
        <GraduationCap className="h-4 w-4 text-orange-500" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-orange-600">{stats.studentsAbove90}</div>
        <p className="text-xs text-muted-foreground">Excellence Achievers</p>
      </CardContent>
    </Card>
  </div>
);
export default GradeStatsCards;
