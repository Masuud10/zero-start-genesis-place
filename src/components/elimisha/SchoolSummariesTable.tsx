
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Building2, BarChart3, AlertCircle } from 'lucide-react';

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
                <div className="flex items-center justify-between mb-4">
                  <Skeleton className="h-6 w-48" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-8 gap-4">
                  {[...Array(8)].map((_, j) => (
                    <div key={j} className="text-center">
                      <Skeleton className="h-8 w-full mb-1" />
                      <Skeleton className="h-3 w-full" />
                    </div>
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
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {searchTerm ? (
                <>
                  No schools found matching "<strong>{searchTerm}</strong>". 
                  Try adjusting your search criteria or clearing the filters.
                </>
              ) : (
                'No schools available to display. This could be due to access restrictions or no schools being configured in the system.'
              )}
            </AlertDescription>
          </Alert>
          <div className="text-center py-8">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Schools Found</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              {searchTerm 
                ? 'Try modifying your search term or remove filters to see more results.' 
                : 'Contact your system administrator if you expect to see schools here.'
              }
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getPerformanceColor = (value: number, type: 'grade' | 'attendance' | 'pass') => {
    const thresholds = {
      grade: { good: 80, fair: 70 },
      attendance: { good: 90, fair: 80 },
      pass: { good: 85, fair: 75 }
    };
    
    const threshold = thresholds[type];
    if (value >= threshold.good) return 'text-green-600';
    if (value >= threshold.fair) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Detailed School Performance Summary
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Comprehensive analytics per school - individual student data is protected under privacy policies
        </p>
        {searchTerm && (
          <Alert className="mt-2">
            <AlertDescription>
              Showing results for: "<strong>{searchTerm}</strong>" ({summaries.length} school{summaries.length !== 1 ? 's' : ''} found)
            </AlertDescription>
          </Alert>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {summaries.map((school) => (
            <div key={school.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{school.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    School ID: {school.id.substring(0, 8)}...
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    {school.totalStudents} students
                  </Badge>
                  <Badge variant="outline">{school.totalClasses} classes</Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-8 gap-4">
                <div className="text-center">
                  <div className={`text-2xl font-bold ${getPerformanceColor(school.averageGrade, 'grade')}`}>
                    {school.averageGrade.toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground">Avg Grade</p>
                </div>
                
                <div className="text-center">
                  <div className={`text-2xl font-bold ${getPerformanceColor(school.attendanceRate, 'attendance')}`}>
                    {school.attendanceRate.toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground">Attendance</p>
                </div>
                
                <div className="text-center">
                  <div className={`text-2xl font-bold ${getPerformanceColor(school.passRate, 'pass')}`}>
                    {school.passRate.toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground">Pass Rate</p>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-500">
                    {school.presentStudents.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">Present Today</p>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-500">
                    {school.absentStudents.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">Absent Today</p>
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
                    {school.totalStudents.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">Total Students</p>
                </div>
              </div>

              {/* Quick insights */}
              <div className="mt-3 pt-3 border-t">
                <div className="flex flex-wrap gap-2 text-xs">
                  {school.averageGrade >= 80 && (
                    <Badge variant="secondary" className="text-green-700 bg-green-50">
                      High Performance
                    </Badge>
                  )}
                  {school.attendanceRate >= 95 && (
                    <Badge variant="secondary" className="text-blue-700 bg-blue-50">
                      Excellent Attendance
                    </Badge>
                  )}
                  {school.passRate >= 90 && (
                    <Badge variant="secondary" className="text-purple-700 bg-purple-50">
                      High Pass Rate
                    </Badge>
                  )}
                  {school.averageGrade < 70 && (
                    <Badge variant="secondary" className="text-red-700 bg-red-50">
                      Needs Attention
                    </Badge>
                  )}
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
