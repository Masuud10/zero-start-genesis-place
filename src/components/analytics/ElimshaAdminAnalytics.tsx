
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  GraduationCap, 
  Users, 
  TrendingUp, 
  BookOpen,
  UserCheck,
  UserX,
  BarChart3,
  Filter,
  Search,
  RefreshCw
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

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
}

interface ElimshaAdminAnalyticsProps {
  filters: {
    term: string;
  };
}

const ElimshaAdminAnalytics = ({ filters }: ElimshaAdminAnalyticsProps) => {
  const [selectedSchool, setSelectedSchool] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  // Fetch schools for dropdown
  const { data: schools = [], isLoading: schoolsLoading } = useQuery({
    queryKey: ['elimisha-admin-schools'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schools')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch school summaries
  const { data: schoolSummaries = [], isLoading: summariesLoading, refetch } = useQuery({
    queryKey: ['elimisha-admin-summaries', selectedSchool, filters.term],
    queryFn: async () => {
      try {
        // Mock data for demonstration - in real implementation, this would be calculated from actual data
        const mockSummaries: SchoolSummary[] = [
          {
            id: '1',
            name: 'Greenwood Primary School',
            totalStudents: 450,
            averageGrade: 78.5,
            attendanceRate: 94.2,
            presentStudents: 424,
            absentStudents: 26,
            totalSubjects: 8,
            passRate: 87.3
          },
          {
            id: '2',
            name: 'Sunshine Secondary School',
            totalStudents: 680,
            averageGrade: 82.1,
            attendanceRate: 91.7,
            presentStudents: 624,
            absentStudents: 56,
            totalSubjects: 12,
            passRate: 91.2
          },
          {
            id: '3',
            name: 'Valley View Academy',
            totalStudents: 320,
            averageGrade: 75.8,
            attendanceRate: 96.1,
            presentStudents: 307,
            absentStudents: 13,
            totalSubjects: 10,
            passRate: 84.7
          }
        ];

        // Filter by selected school
        if (selectedSchool !== 'all') {
          return mockSummaries.filter(school => school.id === selectedSchool);
        }

        return mockSummaries;
      } catch (error) {
        console.error('Error fetching school summaries:', error);
        toast({
          title: "Error",
          description: "Failed to load school summaries",
          variant: "destructive"
        });
        return [];
      }
    }
  });

  // Filter summaries by search term
  const filteredSummaries = schoolSummaries.filter(school =>
    school.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate overall stats
  const overallStats = React.useMemo(() => {
    const totalStudents = filteredSummaries.reduce((sum, school) => sum + school.totalStudents, 0);
    const totalPresent = filteredSummaries.reduce((sum, school) => sum + school.presentStudents, 0);
    const totalAbsent = filteredSummaries.reduce((sum, school) => sum + school.absentStudents, 0);
    const avgGrade = filteredSummaries.length > 0 
      ? filteredSummaries.reduce((sum, school) => sum + school.averageGrade, 0) / filteredSummaries.length 
      : 0;
    const avgAttendance = filteredSummaries.length > 0 
      ? filteredSummaries.reduce((sum, school) => sum + school.attendanceRate, 0) / filteredSummaries.length 
      : 0;

    return {
      totalSchools: filteredSummaries.length,
      totalStudents,
      averageGrade: avgGrade,
      averageAttendance: avgAttendance,
      totalPresent,
      totalAbsent
    };
  }, [filteredSummaries]);

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Data Refreshed",
      description: "School summaries have been updated"
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">System-Wide Analytics Overview</h2>
          <p className="text-muted-foreground">
            Summarized grading and attendance data across all schools
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={summariesLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${summariesLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">School</label>
              <Select value={selectedSchool} onValueChange={setSelectedSchool}>
                <SelectTrigger>
                  <SelectValue placeholder="Select school..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Schools</SelectItem>
                  {schools.map((school) => (
                    <SelectItem key={school.id} value={school.id}>
                      {school.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Search Schools</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by school name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Academic Term</label>
              <Badge variant="outline" className="w-fit">
                {filters.term || 'Current Term'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Schools</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallStats.totalSchools}</div>
            <p className="text-xs text-muted-foreground">Active schools</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallStats.totalStudents.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all schools</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Grade</CardTitle>
            <GraduationCap className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {overallStats.averageGrade.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Network average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Attendance</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {overallStats.averageAttendance.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Network average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present Today</CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {overallStats.totalPresent.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Students present</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absent Today</CardTitle>
            <UserX className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {overallStats.totalAbsent.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Students absent</p>
          </CardContent>
        </Card>
      </div>

      {/* School Summaries */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            School Performance Summary
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Aggregated data per school - individual student records are not accessible
          </p>
        </CardHeader>
        <CardContent>
          {summariesLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="border rounded-lg p-4">
                  <Skeleton className="h-6 w-48 mb-2" />
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                    {[...Array(6)].map((_, j) => (
                      <Skeleton key={j} className="h-16" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : filteredSummaries.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Schools Found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? 'No schools match your search criteria.' : 'No schools available.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSummaries.map((school) => (
                <div key={school.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">{school.name}</h3>
                    <Badge variant="secondary">{school.totalStudents} students</Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
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
                      <div className="text-2xl font-bold text-orange-600">
                        {school.passRate.toFixed(1)}%
                      </div>
                      <p className="text-xs text-muted-foreground">Pass Rate</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Privacy Notice */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">Data Privacy & Multi-Tenancy</h4>
              <p className="text-blue-800 text-sm">
                As an Elimisha administrator, you can only view summarized data per school. 
                Individual student records, names, and detailed scores are not accessible to maintain 
                data privacy and ensure proper multi-tenant isolation.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ElimshaAdminAnalytics;
