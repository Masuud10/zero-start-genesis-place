import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { useSchoolScopedData } from "@/hooks/useSchoolScopedData";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Award, Download, Eye, Trash2, AlertTriangle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Alert, AlertDescription } from "@/components/ui/alert";
import CertificateViewer from "./CertificateViewer";
import { CertificatePerformance } from "@/types/certificate";

const CertificatesList = () => {
  const { user } = useAuth();
  const { schoolId } = useSchoolScopedData();
  const { toast } = useToast();
  const [selectedCertificate, setSelectedCertificate] = useState<any>(null);
  const [showViewer, setShowViewer] = useState(false);

  const {
    data: certificates,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["certificates", schoolId, user?.role],
    queryFn: async () => {
      let query = supabase
        .from("certificates")
        .select(
          `
          *,
          student:students(name, admission_number),
          class:classes(name, level, stream),
          generated_by_profile:profiles!certificates_generated_by_fkey(name)
        `
        )
        .order("generated_at", { ascending: false });

      // Access control based on user role
      if (user?.role === "principal") {
        // Principals can see certificates for their school only
        query = query.eq("school_id", schoolId);
      } else if (user?.role === "school_director") {
        // School directors can view certificates for their school only
        query = query.eq("school_id", schoolId);
      } else if (user?.role === "edufam_admin") {
        // EduFam admins can view all certificates across all schools
        // No additional filter needed
      } else {
        // Other roles shouldn't see certificates
        return [];
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
    enabled: !!schoolId || user?.role === "edufam_admin",
  });

  const handleDelete = async (certificateId: string) => {
    // Only principals can delete certificates
    if (user?.role !== "principal") {
      toast({
        title: "Access Denied",
        description: "Only principals can delete certificates.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("certificates")
        .delete()
        .eq("id", certificateId);

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
        variant: "destructive",
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

  // Helper function to safely access performance data
  const getPerformanceData = (
    certificate: any
  ): CertificatePerformance | null => {
    try {
      if (typeof certificate.performance === "string") {
        return JSON.parse(certificate.performance);
      }
      return certificate.performance as CertificatePerformance;
    } catch {
      return null;
    }
  };

  // Helper function to get school name from performance data
  const getSchoolName = (certificate: any): string => {
    const performanceData = getPerformanceData(certificate);
    return performanceData?.school?.name || "Unknown School";
  };

  // Access control check - only allowed roles can view certificates
  if (
    !["principal", "school_director", "edufam_admin"].includes(user?.role || "")
  ) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50 shadow-sm">
          <CardContent className="p-6">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Access denied. You don't have permission to view certificates.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <Card className="shadow-sm border-gray-200">
          <CardContent className="p-6 text-center">
            <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-gray-600">Loading certificates...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="p-6">
        <CardContent className="px-0">
          {!certificates || certificates.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
              <Award className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-medium text-gray-800 mb-2">
                No certificates found
              </h3>
              <p className="text-gray-600">
                {user?.role === "principal"
                  ? "Generate academic certificates for students to get started."
                  : "No certificates have been generated yet."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-medium text-gray-700">
                      Student
                    </TableHead>
                    <TableHead className="font-medium text-gray-700">
                      Class
                    </TableHead>
                    <TableHead className="font-medium text-gray-700">
                      Academic Year
                    </TableHead>
                    {user?.role === "edufam_admin" && (
                      <TableHead className="font-medium text-gray-700">
                        School
                      </TableHead>
                    )}
                    <TableHead className="font-medium text-gray-700">
                      Generated By
                    </TableHead>
                    <TableHead className="font-medium text-gray-700">
                      Generated Date
                    </TableHead>
                    <TableHead className="font-medium text-gray-700">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {certificates.map((certificate) => (
                    <TableRow key={certificate.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">
                            {certificate.student?.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            Adm: {certificate.student?.admission_number}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            {certificate.class?.name}
                          </div>
                          {certificate.class?.stream && (
                            <div className="text-gray-500">
                              {certificate.class.stream}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="border-gray-300 text-gray-700"
                        >
                          {certificate.academic_year}
                        </Badge>
                      </TableCell>
                      {user?.role === "edufam_admin" && (
                        <TableCell>
                          <div className="text-sm text-gray-700">
                            {getSchoolName(certificate)}
                          </div>
                        </TableCell>
                      )}
                      <TableCell>
                        <div className="text-sm text-gray-700">
                          {certificate.generated_by_profile?.name || "Unknown"}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-700">
                        {new Date(certificate.generated_at).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )}
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
                          {user?.role === "principal" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(certificate.id)}
                              className="border-red-300 text-red-700 hover:bg-red-50"
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
      </div>

      {/* Certificate Viewer Modal */}
      {showViewer && selectedCertificate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-auto shadow-xl">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">
                Certificate Preview
              </h2>
              <Button
                variant="outline"
                onClick={() => setShowViewer(false)}
                className="border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Close
              </Button>
            </div>
            <div className="p-4">
              <CertificateViewer certificate={selectedCertificate} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CertificatesList;
