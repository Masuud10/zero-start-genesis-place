
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Award, Download, Eye, Building2, AlertTriangle, RefreshCw, Search, Filter } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const EduFamCertificateManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSchool, setSelectedSchool] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch schools for filter dropdown
  const { data: schools } = useQuery({
    queryKey: ['schools-for-filter'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schools')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
    enabled: user?.role === 'edufam_admin',
  });

  // Fetch certificates with filters
  const { data: certificates, isLoading, error, refetch } = useQuery({
    queryKey: ['edufam-certificates', searchTerm, selectedSchool, selectedYear, currentPage],
    queryFn: async () => {
      console.log('📜 Fetching filtered certificates for EduFam Admin');
      
      let query = supabase
        .from('certificates')
        .select(`
          *,
          student:students(name, admission_number),
          class:classes(name, level, stream),
          school:schools(name, location),
          generated_by_profile:profiles!certificates_generated_by_fkey(name, role)
        `)
        .order('generated_at', { ascending: false });

      // Apply filters
      if (selectedSchool !== 'all') {
        query = query.eq('school_id', selectedSchool);
      }

      if (selectedYear !== 'all') {
        query = query.eq('academic_year', selectedYear);
      }

      if (searchTerm) {
        query = query.or(`
          student.name.ilike.%${searchTerm}%,
          student.admission_number.ilike.%${searchTerm}%,
          school.name.ilike.%${searchTerm}%
        `);
      }

      // Apply pagination
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching certificates:', error);
        throw error;
      }

      console.log('📜 Certificates fetched:', data?.length || 0);
      return { certificates: data || [], totalCount: count || 0 };
    },
    enabled: user?.role === 'edufam_admin',
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Get unique academic years for filter
  const { data: academicYears } = useQuery({
    queryKey: ['academic-years-filter'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('certificates')
        .select('academic_year')
        .order('academic_year', { ascending: false });
      
      if (error) throw error;
      const uniqueYears = [...new Set(data?.map(cert => cert.academic_year) || [])];
      return uniqueYears;
    },
    enabled: user?.role === 'edufam_admin',
  });

  const handleView = (certificate: any) => {
    toast({
      title: "Certificate Viewer",
      description: `Viewing certificate for ${certificate.student?.name}`,
    });
    // TODO: Implement certificate viewer modal
  };

  const handleDownload = (certificate: any) => {
    toast({
      title: "Download Certificate",
      description: `Downloading certificate for ${certificate.student?.name}`,
    });
    // TODO: Implement certificate download functionality
  };

  const handleBulkAction = (action: string) => {
    toast({
      title: "Bulk Action",
      description: `Performing ${action} on selected certificates`,
    });
  };

  // Calculate pagination
  const totalPages = Math.ceil((certificates?.totalCount || 0) / itemsPerPage);

  // Access control check
  if (user?.role !== 'edufam_admin') {
    return (
      <div className="p-6">
        <Alert className="bg-red-50 border-red-200">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-600">Access Denied</AlertTitle>
          <AlertDescription className="text-red-700">
            Only EduFam Admins can access certificate management.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-gray-600">Loading certificates...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert className="bg-red-50 border-red-200">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-600">Error Loading Certificates</AlertTitle>
          <AlertDescription className="text-red-700 mb-4">
            Failed to load certificates data. Please try again.
          </AlertDescription>
          <Button
            onClick={() => refetch()}
            variant="outline"
            className="border-red-300 text-red-700 hover:bg-red-50"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-2xl text-gray-900">
          <Award className="h-6 w-6 text-purple-600" />
          Certificate Management
          <Badge variant="secondary" className="bg-purple-100 text-purple-700">
            {certificates?.totalCount || 0} Total
          </Badge>
        </CardTitle>
        <div className="flex gap-2">
          <Button
            onClick={() => refetch()}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={() => handleBulkAction('export')}
            variant="outline"
            size="sm"
          >
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by student name, admission number, or school..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white"
                />
              </div>
            </div>
            <Select value={selectedSchool} onValueChange={setSelectedSchool}>
              <SelectTrigger className="w-48 bg-white">
                <SelectValue placeholder="Filter by School" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Schools</SelectItem>
                {schools?.map((school) => (
                  <SelectItem key={school.id} value={school.id}>
                    {school.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-48 bg-white">
                <SelectValue placeholder="Filter by Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {academicYears?.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Certificates Table */}
      <Card>
        <CardContent className="p-0">
          {!certificates?.certificates || certificates.certificates.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Award className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-medium text-gray-800 mb-2">No certificates found</h3>
              <p className="text-gray-600">
                {searchTerm || selectedSchool !== 'all' || selectedYear !== 'all'
                  ? 'Try adjusting your filters'
                  : 'No certificates have been generated yet'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-medium text-gray-700">School</TableHead>
                    <TableHead className="font-medium text-gray-700">Student</TableHead>
                    <TableHead className="font-medium text-gray-700">Class</TableHead>
                    <TableHead className="font-medium text-gray-700">Academic Year</TableHead>
                    <TableHead className="font-medium text-gray-700">Generated By</TableHead>
                    <TableHead className="font-medium text-gray-700">Date</TableHead>
                    <TableHead className="font-medium text-gray-700">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {certificates.certificates.map((certificate) => (
                    <TableRow key={certificate.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-gray-400" />
                          <div>
                            <div className="font-medium text-gray-900">
                              {certificate.school?.name || 'Unknown School'}
                            </div>
                            {certificate.school?.location && (
                              <div className="text-sm text-gray-500">
                                {certificate.school.location}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">
                            {certificate.student?.name || 'Unknown Student'}
                          </div>
                          <div className="text-sm text-gray-500">
                            Adm: {certificate.student?.admission_number || 'N/A'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            {certificate.class?.name || 'Unknown Class'}
                          </div>
                          {certificate.class?.stream && (
                            <div className="text-gray-500">{certificate.class.stream}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-purple-300 text-purple-700">
                          {certificate.academic_year}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="text-gray-900">
                            {certificate.generated_by_profile?.name || 'Unknown'}
                          </div>
                          <div className="text-gray-500">
                            {certificate.generated_by_profile?.role || 'N/A'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-700">
                        {new Date(certificate.generated_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleView(certificate)}
                            className="border-gray-300 text-gray-700 hover:bg-gray-50"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownload(certificate)}
                            className="border-purple-300 text-purple-700 hover:bg-purple-50"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            PDF
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-700">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, certificates?.totalCount || 0)} of{' '}
            {certificates?.totalCount || 0} results
          </p>
          <div className="flex gap-2">
            <Button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              variant="outline"
              size="sm"
            >
              Previous
            </Button>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                return (
                  <Button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    className="w-10"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              variant="outline"
              size="sm"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EduFamCertificateManagement;
