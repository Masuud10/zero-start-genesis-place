import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/contexts/AuthContext';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Award, Download, Eye, Trash2, AlertTriangle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Alert, AlertDescription } from '@/components/ui/alert';
import CertificateViewer from './CertificateViewer';

const CertificatesList = () => {
  const { user } = useAuth();
  const { schoolId } = useSchoolScopedData();
  const { toast } = useToast();
  const [selectedCertificate, setSelectedCertificate] = useState<any>(null);
  const [showViewer, setShowViewer] = useState(false);

  const { data: certificates, isLoading, refetch } = useQuery({
    queryKey: ['certificates', schoolId],
    queryFn: async () => {
      let query = supabase
        .from('certificates')
        .select(`
          *,
          student:students(name, admission_number),
          class:classes(name, level, stream),
          generated_by_profile:profiles!certificates_generated_by_fkey(name)
        `)
        .order('generated_at', { ascending: false });

      // Access control based on user role
      if (user?.role === 'principal') {
        query = query.eq('school_id', schoolId);
      } else if (user?.role === 'school_owner') {
        query = query.eq('school_id', schoolId);
      } else if (user?.role !== 'edufam_admin') {
        // Other roles shouldn't see certificates
        return [];
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!schoolId || user?.role === 'edufam_admin'
  });

  const handleDelete = async (certificateId: string) => {
    if (user?.role !== 'principal' && user?.role !== 'edufam_admin') {
      toast({
        title: "Access Denied",
        description: "You don't have permission to delete certificates.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('certificates')
        .delete()
        .eq('id', certificateId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Certificate deleted successfully",
      });
      
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete certificate",
        variant: "destructive"
      });
    }
  };

  const handleView = (certificate: any) => {
    setSelectedCertificate(certificate);
    setShowViewer(true);
  };

  const handleDownload = (certificate: any) => {
    // This would trigger the PDF download from CertificateViewer
    handleView(certificate);
  };

  // Access control check
  if (user?.role !== 'principal' && user?.role !== 'school_owner' && user?.role !== 'edufam_admin') {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Access denied. You don't have permission to view certificates.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p>Loading certificates...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Generated Certificates
            <Badge variant="secondary" className="ml-auto">
              {certificates?.length || 0} Total
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!certificates || certificates.length === 0 ? (
            <div className="text-center py-12">
              <Award className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-medium text-gray-800 mb-2">No certificates generated yet</h3>
              <p className="text-gray-600">Generate academic certificates for students to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Academic Year</TableHead>
                    <TableHead>Generated By</TableHead>
                    <TableHead>Generated Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {certificates.map((certificate) => (
                    <TableRow key={certificate.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{certificate.student?.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Adm: {certificate.student?.admission_number}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{certificate.class?.name}</div>
                          {certificate.class?.stream && (
                            <div className="text-muted-foreground">{certificate.class.stream}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{certificate.academic_year}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {certificate.generated_by_profile?.name || 'Unknown'}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
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
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownload(certificate)}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            PDF
                          </Button>
                          {(user?.role === 'principal' || user?.role === 'edufam_admin') && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(certificate.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          )}
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

      {/* Certificate Viewer Modal */}
      {showViewer && selectedCertificate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">Certificate Preview</h2>
              <Button variant="outline" onClick={() => setShowViewer(false)}>
                Close
              </Button>
            </div>
            <div className="p-4">
              <CertificateViewer 
                certificate={selectedCertificate}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CertificatesList;
