
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { useCertificates } from '@/hooks/useCertificates';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Eye, Download, Trash2, Search, Filter } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import CertificateViewer from './CertificateViewer';
import { Alert, AlertDescription } from '@/components/ui/alert';

const CertificatesList = () => {
  const { user } = useAuth();
  const { schoolId } = useSchoolScopedData();
  const [selectedSchoolId, setSelectedSchoolId] = useState(schoolId || '');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCertificate, setSelectedCertificate] = useState(null);

  const filters = {
    school_id: user?.role === 'edufam_admin' ? selectedSchoolId : schoolId,
    academic_year: selectedAcademicYear,
  };

  const { certificates, isLoading, deleteCertificate, isDeleting } = useCertificates(filters);

  // Get schools for EduFam admin
  const { data: schools } = useQuery({
    queryKey: ['schools'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schools')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      return data;
    },
    enabled: user?.role === 'edufam_admin',
  });

  // Get school data for certificate viewing
  const { data: currentSchool } = useQuery({
    queryKey: ['school', selectedSchoolId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .eq('id', selectedSchoolId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedSchoolId,
  });

  const filteredCertificates = certificates?.filter(cert => {
    if (!searchTerm) return true;
    const studentName = cert.performance.student.name.toLowerCase();
    const admissionNumber = cert.performance.student.admission_number.toLowerCase();
    return studentName.includes(searchTerm.toLowerCase()) || 
           admissionNumber.includes(searchTerm.toLowerCase());
  });

  const canDelete = user?.role === 'edufam_admin';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
            {user?.role === 'edufam_admin' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">School</label>
                <Select value={selectedSchoolId} onValueChange={setSelectedSchoolId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select school" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Schools</SelectItem>
                    {schools?.map(school => (
                      <SelectItem key={school.id} value={school.id}>
                        {school.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Academic Year</label>
              <Select value={selectedAcademicYear} onValueChange={setSelectedAcademicYear}>
                <SelectTrigger>
                  <SelectValue placeholder="All years" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Years</SelectItem>
                  {['2024', '2023', '2022', '2021'].map(year => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Search Student</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Student name or admission number"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Certificates List */}
      <Card>
        <CardHeader>
          <CardTitle>Generated Certificates ({filteredCertificates?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {!filteredCertificates || filteredCertificates.length === 0 ? (
            <Alert>
              <AlertDescription>
                No certificates found. {user?.role === 'principal' ? 'Generate your first certificate using the Certificate Generator.' : 'No certificates have been generated yet.'}
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {filteredCertificates.map(certificate => (
                <div
                  key={certificate.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">{certificate.performance.student.name}</h3>
                      <Badge variant="secondary">
                        {certificate.performance.student.admission_number}
                      </Badge>
                      <Badge variant="outline">
                        {certificate.academic_year}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Generated on {new Date(certificate.generated_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedCertificate(certificate)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>
                            Certificate - {certificate.performance.student.name}
                          </DialogTitle>
                        </DialogHeader>
                        {currentSchool && (
                          <CertificateViewer
                            certificate={certificate}
                            school={currentSchool}
                          />
                        )}
                      </DialogContent>
                    </Dialog>

                    {canDelete && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteCertificate(certificate.id)}
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CertificatesList;
