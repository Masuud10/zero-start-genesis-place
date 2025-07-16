import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useCertificates } from "@/hooks/useCertificates";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSchoolScopedData } from "@/hooks/useSchoolScopedData";
import { useAuth } from "@/contexts/AuthContext";
import { Award, Download, Loader2, FileText, Shield } from "lucide-react";
import CertificateViewer from "./CertificateViewer";
import { CertificatePerformance } from "@/types/certificate";

interface CertificateGeneratorProps {
  open?: boolean;
  onClose?: () => void;
  onCertificateGenerated?: () => void;
}

const CertificateGenerator: React.FC<CertificateGeneratorProps> = ({
  open = false,
  onClose,
  onCertificateGenerated,
}) => {
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedAcademicYear, setSelectedAcademicYear] = useState("");
  const [generatedCertificate, setGeneratedCertificate] =
    useState<unknown>(null);
  const [showViewer, setShowViewer] = useState(false);

  const { toast } = useToast();
  const { generateCertificate, loading } = useCertificates();
  const { schoolId } = useSchoolScopedData();
  const { user } = useAuth();

  // Role-based access control
  const allowedRoles = ["principal", "school_director", "edufam_admin"];
  const hasAccess = user?.role && allowedRoles.includes(user.role);

  // Get classes
  const { data: classes = [] } = useQuery({
    queryKey: ["classes", schoolId],
    queryFn: async () => {
      if (!schoolId) return [];
      const { data, error } = await supabase
        .from("classes")
        .select("id, name, level, stream")
        .eq("school_id", schoolId)
        .order("name");

      if (error) throw error;
      return data || [];
    },
    enabled: !!schoolId,
  });

  // Get students for selected class
  const { data: students = [] } = useQuery({
    queryKey: ["students", selectedClass, schoolId],
    queryFn: async () => {
      if (!selectedClass || !schoolId) return [];
      const { data, error } = await supabase
        .from("students")
        .select("id, name, admission_number, roll_number")
        .eq("class_id", selectedClass)
        .eq("school_id", schoolId)
        .order("name");

      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedClass && !!schoolId,
  });

  // Get academic years
  const { data: academicYears = [] } = useQuery({
    queryKey: ["academic-years", schoolId],
    queryFn: async () => {
      if (!schoolId) return [];
      const { data, error } = await supabase
        .from("academic_years")
        .select("year_name")
        .eq("school_id", schoolId)
        .order("year_name", { ascending: false });

      if (error) throw error;
      return (
        data?.map((ay) => ay.year_name) || [new Date().getFullYear().toString()]
      );
    },
    enabled: !!schoolId,
  });

  const handleClose = () => {
    setSelectedClass("");
    setSelectedStudent("");
    setSelectedAcademicYear("");
    setGeneratedCertificate(null);
    setShowViewer(false);
    onClose?.();
  };

  // Check access after all hooks
  if (!hasAccess) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Shield className="h-5 w-5" />
              Access Denied
            </DialogTitle>
            <DialogDescription>
              Only principals, school directors, and EduFam administrators can
              generate certificates.
            </DialogDescription>
          </DialogHeader>
          <div className="text-center py-4">
            <p className="text-sm text-gray-600 mb-4">
              Your current role: <strong>{user?.role || "None"}</strong>
            </p>
            <Button onClick={handleClose} variant="outline">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const handleGenerateCertificate = async () => {
    if (!selectedStudent || !selectedClass || !selectedAcademicYear) {
      toast({
        title: "Missing Information",
        description: "Please select a class, student, and academic year.",
        variant: "destructive",
      });
      return;
    }

    try {
      const certificate = await generateCertificate(
        selectedStudent,
        selectedClass,
        selectedAcademicYear
      );

      if (certificate) {
        setGeneratedCertificate(certificate);
        setShowViewer(true);
        onCertificateGenerated?.();

        toast({
          title: "Certificate Generated",
          description: "Student certificate has been generated successfully.",
        });
      }
    } catch (error) {
      console.error("Certificate generation error:", error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate certificate. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (showViewer && generatedCertificate) {
    return (
      <Dialog open={true} onOpenChange={() => setShowViewer(false)}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Certificate Preview</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <CertificateViewer
              certificate={{
                id: "preview",
                school_id: schoolId || "",
                student_id: selectedStudent,
                class_id: selectedClass,
                academic_year: selectedAcademicYear,
                performance: generatedCertificate as CertificatePerformance,
                generated_by: "",
                generated_at: new Date().toISOString(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              }}
            />
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowViewer(false)}>
                Close
              </Button>
              <Button onClick={handleClose}>Generate Another</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Generate Student Certificate
          </DialogTitle>
          <DialogDescription>
            Create academic certificates for students based on their performance
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Certificate Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="class">Select Class</Label>
                  <Select
                    value={selectedClass}
                    onValueChange={setSelectedClass}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name} {cls.stream && `- ${cls.stream}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="academic-year">Academic Year</Label>
                  <Select
                    value={selectedAcademicYear}
                    onValueChange={setSelectedAcademicYear}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose year" />
                    </SelectTrigger>
                    <SelectContent>
                      {academicYears.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {selectedClass && (
                <div>
                  <Label htmlFor="student">Select Student</Label>
                  <Select
                    value={selectedStudent}
                    onValueChange={setSelectedStudent}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose student" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.name} ({student.admission_number})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          {selectedStudent && selectedClass && selectedAcademicYear && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="text-center">
                  <FileText className="h-12 w-12 mx-auto mb-3 text-green-600" />
                  <h3 className="text-lg font-semibold text-green-800 mb-2">
                    Ready to Generate Certificate
                  </h3>
                  <p className="text-green-700 mb-4">
                    Certificate will be generated for the selected student with
                    their academic performance and attendance data.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              onClick={handleGenerateCertificate}
              disabled={
                !selectedStudent ||
                !selectedClass ||
                !selectedAcademicYear ||
                loading
              }
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Generate Certificate
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CertificateGenerator;
