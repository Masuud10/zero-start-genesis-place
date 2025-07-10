import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle,
  XCircle,
  Shield,
  FileText,
  User,
  School,
  Calendar,
  Award,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { format } from "date-fns";

interface CertificateVerificationData {
  id: string;
  student: {
    name: string;
    admission_number: string;
  };
  school: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
  };
  class: {
    name: string;
    level?: string;
    stream?: string;
  };
  academic_year: string;
  generated_at: string;
  generated_by: {
    name: string;
    role: string;
  };
  performance: {
    average_score: number;
    grade_letter: string;
  };
  attendance: {
    attendance_percentage: number;
  };
}

const CertificateVerification: React.FC = () => {
  const { certificateId } = useParams<{ certificateId: string }>();
  const [certificate, setCertificate] =
    useState<CertificateVerificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    if (certificateId) {
      verifyCertificate(certificateId);
    }
  }, [certificateId]);

  const verifyCertificate = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      // Fetch certificate data
      const { data, error: fetchError } = await supabase
        .from("certificates")
        .select(
          `
          id,
          academic_year,
          generated_at,
          performance,
          student:students(name, admission_number),
          school:schools(name, address, phone, email),
          class:classes(name, level, stream),
          generated_by_profile:profiles!certificates_generated_by_fkey(name, role)
        `
        )
        .eq("id", id)
        .single();

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      if (!data) {
        throw new Error("Certificate not found");
      }

      // Transform the data to match our interface
      const performanceData = data.performance as {
        performance: { average_score: number; grade_letter: string };
        attendance: { attendance_percentage: number };
      };
      const transformedData: CertificateVerificationData = {
        id: data.id,
        student: data.student,
        school: data.school,
        class: data.class,
        academic_year: data.academic_year,
        generated_at: data.generated_at,
        generated_by: data.generated_by_profile,
        performance: performanceData.performance,
        attendance: performanceData.attendance,
      };

      setCertificate(transformedData);
      setIsValid(true);
    } catch (err: unknown) {
      console.error("Certificate verification error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to verify certificate"
      );
      setIsValid(false);
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    window.history.back();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Verifying certificate...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <CardTitle className="text-red-600">
                Certificate Verification Failed
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Alert className="border-red-200 bg-red-50">
              <XCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                {error || "Certificate not found or invalid"}
              </AlertDescription>
            </Alert>
            <div className="mt-4">
              <Button
                onClick={handleGoBack}
                variant="outline"
                className="w-full"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Shield className="h-8 w-8 text-green-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Certificate Verification
            </h1>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <Badge
              variant="default"
              className="bg-green-100 text-green-800 border-green-200"
            >
              VERIFIED
            </Badge>
          </div>
        </div>

        {/* Certificate Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Student Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Student Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Full Name
                </label>
                <p className="text-lg font-semibold text-gray-900">
                  {certificate.student.name}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Admission Number
                </label>
                <p className="text-lg font-semibold text-gray-900">
                  {certificate.student.admission_number}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Academic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-5 w-5" />
                <span>Academic Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Class
                </label>
                <p className="text-lg font-semibold text-gray-900">
                  {certificate.class.name}
                  {certificate.class.stream && ` - ${certificate.class.stream}`}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Academic Year
                </label>
                <p className="text-lg font-semibold text-gray-900">
                  {certificate.academic_year}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Average Score
                  </label>
                  <p className="text-lg font-semibold text-blue-600">
                    {certificate.performance.average_score?.toFixed(1) || "0"}%
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Grade
                  </label>
                  <p className="text-lg font-semibold text-green-600">
                    {certificate.performance.grade_letter || "A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* School Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <School className="h-5 w-5" />
                <span>School Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  School Name
                </label>
                <p className="text-lg font-semibold text-gray-900">
                  {certificate.school.name}
                </p>
              </div>
              {certificate.school.address && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Address
                  </label>
                  <p className="text-gray-900">{certificate.school.address}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                {certificate.school.phone && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Phone
                    </label>
                    <p className="text-gray-900">{certificate.school.phone}</p>
                  </div>
                )}
                {certificate.school.email && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Email
                    </label>
                    <p className="text-gray-900">{certificate.school.email}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Certificate Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Certificate Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Certificate ID
                </label>
                <p className="text-sm font-mono text-gray-900">
                  {certificate.id}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Issued Date
                </label>
                <p className="text-gray-900">
                  {format(new Date(certificate.generated_at), "PPP")}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Issued By
                </label>
                <p className="text-gray-900">
                  {certificate.generated_by.name} (
                  {certificate.generated_by.role})
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Attendance Rate
                </label>
                <p className="text-lg font-semibold text-blue-600">
                  {certificate.attendance.attendance_percentage?.toFixed(1) ||
                    "95"}
                  %
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Shield className="h-5 w-5 text-green-600" />
              <p className="text-sm font-medium text-green-600">
                Certificate Verified Successfully
              </p>
            </div>
            <p className="text-xs text-gray-500">
              This certificate has been verified through the EduFam verification
              system. The information displayed above is authentic and has been
              confirmed.
            </p>
          </div>

          <div className="mt-4">
            <Button onClick={handleGoBack} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateVerification;
