
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Award, 
  Download, 
  Eye, 
  Filter, 
  School, 
  Users, 
  Calendar,
  FileText,
  Search,
  RefreshCw
} from 'lucide-react';

const EduFamCertificateManagement = () => {
  const [schoolFilter, setSchoolFilter] = useState('');
  const [academicYearFilter, setAcademicYearFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch certificates with school and student information
  const { data: certificates, isLoading, refetch } = useQuery({
    queryKey: ['edufam-certificates', schoolFilter, academicYearFilter, searchTerm],
    queryFn: async () => {
      console.log('🏆 Fetching EduFam certificates');
      
      let query = supabase
        .from('certificates')
        .select(`
          *,
          student:students(
            name,
            admission_number,
            roll_number
          ),
          school:schools(
            name,
            location,
            logo_url
          ),
          class:classes(
            name,
            level
          ),
          generated_by:profiles!certificates_generated_by_fkey(
            name,
            email
          )
        `)
        .order('generated_at', { ascending: false });

      if (schoolFilter) {
        query = query.eq('school_id', schoolFilter);
      }

      if (academicYearFilter) {
        query = query.eq('academic_year', academicYearFilter);
      }

      if (searchTerm) {
        query = query.or(`student.name.ilike.%${searchTerm}%,student.admission_number.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query.limit(100);
      
      if (error) {
        console.error('Error fetching certificates:', error);
        throw error;
      }

      console.log('✅ Certificates fetched:', data?.length || 0);
      return data || [];
    }
  });

  // Fetch schools for filter dropdown
  const { data: schools } = useQuery({
    queryKey: ['schools-for-certificates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schools')
        .select('id, name, location')
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  });

  const handleViewCertificate = (certificate: any) => {
    console.log('👁️ Viewing certificate:', certificate.id);
    // Certificate viewing logic would go here
  };

  const handleDownloadCertificate = (certificate: any) => {
    console.log('📥 Downloading certificate:', certificate.id);
    // Certificate download logic would go here
  };

  const getPerformanceSummary = (performance: any) => {
    if (!performance || typeof performance !== 'object') return 'N/A';
    
    if (performance.average_score) {
      return `${performance.average_score.toFixed(1)}% Average`;
    }
    
    if (performance.total_marks && performance.possible_marks) {
      const percentage = (performance.total_marks / performance.possible_marks) * 100;
      return `${percentage.toFixed(1)}%`;
    }
    
    return 'Performance data available';
  };

  const getGradeFromPerformance = (performance: any) => {
    if (!performance || typeof performance !== 'object') return 'N/A';
    
    if (performance.overall_grade) return performance.overall_grade;
    if (performance.grade_letter) return performance.grade_letter;
    
    if (performance.average_score) {
      const score = performance.average_score;
      if (score >= 90) return 'A+';
      if (score >= 80) return 'A';
      if (score >= 70) return 'B+';
      if (score >= 60) return 'B';
      if (score >= 50) return 'C+';
      if (score >= 40) return 'C';
      return 'D';
    }
    
    return 'N/A';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Certificate Management</h2>
          <p className="text-muted-foreground">
            View and manage certificates generated across all schools
          </p>
        </div>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Certificates</p>
                <p className="text-3xl font-bold">{certificates?.length || 0}</p>
              </div>
              <Award className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Schools Involved</p>
                <p className="text-3xl font-bold">
                  {new Set(certificates?.map(c => c.school_id)).size || 0}
                </p>
              </div>
              <School className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-3xl font-bold">
                  {certificates?.filter(c => 
                    new Date(c.generated_at).getMonth() === new Date().getMonth()
                  ).length || 0}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Students</p>
                <p className="text-3xl font-bold">
                  {new Set(certificates?.map(c => c.student_id)).size || 0}
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="schoolFilter">School</Label>
              <Select value={schoolFilter} onValueChange={setSchoolFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All schools" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Schools</SelectItem>
                  {schools?.map((school) => (
                    <SelectItem key={school.id} value={school.id}>
                      {school.name} - {school.location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="academicYear">Academic Year</Label>
              <Select value={academicYearFilter} onValueChange={setAcademicYearFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All years" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Years</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2022">2022</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="search">Search Student</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Student name or admission number"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSchoolFilter('');
                  setAcademicYearFilter('');
                  setSearchTerm('');
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Certificates List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generated Certificates ({certificates?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {certificates && certificates.length > 0 ? (
            <div className="space-y-4">
              {certificates.map((certificate) => (
                <div key={certificate.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <Award className="h-8 w-8 text-yellow-600" />
                        <div>
                          <h3 className="font-semibold">
                            {certificate.student?.name || 'Unknown Student'}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {certificate.student?.admission_number && (
                              <span>Admission: {certificate.student.admission_number} • </span>
                            )}
                            {certificate.school?.name || 'Unknown School'} • 
                            {certificate.class?.name && ` ${certificate.class.name} • `}
                            Academic Year: {certificate.academic_year}
                          </p>
                          <p className="text-sm text-gray-500">
                            Generated: {new Date(certificate.generated_at).toLocaleDateString()} by{' '}
                            {certificate.generated_by?.name || 'Unknown'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <Badge variant="secondary">
                          Grade: {getGradeFromPerformance(certificate.performance)}
                        </Badge>
                        <p className="text-sm text-gray-600 mt-1">
                          {getPerformanceSummary(certificate.performance)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewCertificate(certificate)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleDownloadCertificate(certificate)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No certificates found</h3>
              <p className="text-gray-500">
                {schoolFilter || academicYearFilter || searchTerm 
                  ? 'Try adjusting your filters to see more results.'
                  : 'No certificates have been generated yet.'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EduFamCertificateManagement;
