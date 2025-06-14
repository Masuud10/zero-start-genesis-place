
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Building2, BarChart3 } from 'lucide-react';

interface SchoolSummary {
  id: string;
  name: string;
  totalStudents: number;
  averageGrade: number;
  attendanceRate: number;
  presentStudents: number;
  absentStudents: number;
  totalSubjects: number;
  passRate: number;
  totalClasses: number;
}

interface SchoolSummariesTableProps {
  summaries: SchoolSummary[];
  isLoading: boolean;
  searchTerm: string;
}

const SchoolSummariesTable: React.FC<SchoolSummariesTableProps> = ({
  summaries,
  isLoading,
  searchTerm
}) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Detailed School Performance Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border rounded-lg p-4">
                <Skeleton className="h-6 w-48 mb-2" />
                <div className="grid grid-cols-2 md:grid-cols-8 gap-4">
                  {[...Array(8)].map((_, j) => (
                    <Skeleton key={j} className="h-16" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (summaries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Detailed School Performance Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Schools Found</h3>
            <p className="text-muted-foreground">
              {searchTerm ? 'No schools match your search criteria.' : 'No schools available.'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Detailed School Performance Summary
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Comprehensive analytics per school - individual student data is protected
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {summaries.map((school) => (
            <div key={school.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{school.name}</h3>
                <div className="flex gap-2">
                  <Badge variant="secondary">{school.totalStudents} students</Badge>
                  <Badge variant="outline">{school.totalClasses} classes</Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-8 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {school.averageGrade.toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground">Avg Grade</p>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {school.attendanceRate.toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground">Attendance</p>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {school.passRate.toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground">Pass Rate</p>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-500">
                    {school.presentStudents}
                  </div>
                  <p className="text-xs text-muted-foreground">Present</p>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-500">
                    {school.absentStudents}
                  </div>
                  <p className="text-xs text-muted-foreground">Absent</p>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {school.totalSubjects}
                  </div>
                  <p className="text-xs text-muted-foreground">Subjects</p>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600">
                    {school.totalClasses}
                  </div>
                  <p className="text-xs text-muted-foreground">Classes</p>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-cyan-600">
                    {school.totalStudents}
                  </div>
                  <p className="text-xs text-muted-foreground">Students</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SchoolSummariesTable;
