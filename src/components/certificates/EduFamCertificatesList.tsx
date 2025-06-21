
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Award, Download, Eye, Building2, AlertTriangle, RefreshCw } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const EduFamCertificatesList = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: certificates, isLoading, error, refetch } = useQuery({
    queryKey: ['edufam-certificates'],
    queryFn: async () => {
      console.log('📜 Fetching all certificates for EduFam Admin');
      
      const { data, error } = await supabase
        .from('certificates')
        .select(`
          *,
          student:students(name, admission_number),
          class:classes(name, level, stream),
          school:schools(name, location),
          generated_by_profile:profiles!certificates_generated_by_fkey(name, role)
        `)
        .order('generated_at', { ascending: false });

      if (error) {
        console.error('Error fetching certificates:', error);
        throw error;
      }

      console.log('📜 Certificates fetched:', data?.length || 0);
      return data || [];
    },
    enabled: user?.role === 'edufam_admin',
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleView = (certificate: any) => {
    toast({
      title: "Certificate Viewer",
      description: "Certificate viewer functionality will be implemented next.",
    });
  };

  const handleDownload = (certificate: any) => {
    toast({
      title: "Download Certificate",
      description: "Certificate download functionality will be implemented next.",
    });
  };

  // Access control check
  if (user?.role !== 'edufam_admin') {
    return (
      <div className="p-6">
        <Alert className="bg-red-50 border-red-200">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-600">Access Denied</AlertTitle>
          <AlertDescription className="text-red-700">
            Only EduFam Admins can view all certificates across the network.
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
    <div className="p-6">
      <CardHeader className="px-0 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <Award className="h-5 w-5" />
            Network Certificates
            <Badge variant="secondary" className="bg-gray-100 text-gray-700">
              {certificates?.length || 0} Total
            </Badge>
          </CardTitle>
          <Button
            onClick={() => refetch()}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          All certificates generated across the EduFam network
        </p>
      </CardHeader>
      
      <CardContent className="px-0">
        {!certificates || certificates.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <Award className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-medium text-gray-800 mb-2">No certificates found</h3>
            <p className="text-gray-600">No certificates have been generated across the network yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
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
                {certificates.map((certificate) => (
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
                      <Badge variant="outline" className="border-gray-300 text-gray-700">
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
                          className="border-blue-300 text-blue-700 hover:bg-blue-50"
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
    </div>
  );
};

export default EduFamCertificatesList;
