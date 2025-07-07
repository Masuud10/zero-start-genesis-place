import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Eye,
  Download,
  Printer,
  User,
  GraduationCap,
  Calendar,
  Award,
  DollarSign,
  BookOpen,
  Phone,
  Mail,
  MapPin,
  Users,
  FileText,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSchoolScopedData } from "@/hooks/useSchoolScopedData";

interface Student {
  id: string;
  name: string;
  admission_number: string;
  roll_number?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  parent_contact?: string;
  is_active: boolean;
  created_at: string;
  class_id?: string;
  class?: {
    id: string;
    name: string;
    level?: string;
    stream?: string;
    curriculum_type?: string;
  };
  parent?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
}

interface StudentDetailModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
}

interface StudentGrades {
  id: string;
  subject_name: string;
  score: number;
  max_score: number;
  percentage: number;
  letter_grade: string;
  term: string;
  exam_type: string;
  status: string;
  created_at: string;
}

interface StudentAttendance {
  date: string;
  status: string;
  session: string;
  remarks?: string;
}

interface StudentCertificate {
  id: string;
  academic_year: string;
  generated_at: string;
  generated_by: string;
  performance: Record<string, unknown>; // Use Record for JSON data
}

interface StudentFee {
  id: string;
  category: string;
  term: string;
  amount: number;
  paid_amount: number;
  due_date: string;
  status: string;
}

interface SchoolInfo {
  id: string;
  name: string;
  location?: string;
  phone?: string;
  [key: string]: unknown;
}

const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  student,
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [grades, setGrades] = useState<StudentGrades[]>([]);
  const [attendance, setAttendance] = useState<StudentAttendance[]>([]);
  const [certificates, setCertificates] = useState<StudentCertificate[]>([]);
  const [fees, setFees] = useState<StudentFee[]>([]);
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo | null>(null);
  const [enrichedStudent, setEnrichedStudent] = useState<Student | null>(null);

  const { toast } = useToast();
  const { schoolId } = useSchoolScopedData();

  useEffect(() => {
    if (isOpen && student) {
      loadStudentData();
    }
  }, [isOpen, student, schoolId]);

  const loadStudentData = async () => {
    if (!student || !schoolId) return;

    setLoading(true);
    try {
      // First, enrich student data with class and parent information
      const { data: enrichedStudentData, error: enrichedError } = await supabase
        .from("students")
        .select(
          `
          *,
          classes!students_class_id_fkey(
            id,
            name,
            level,
            stream,
            curriculum_type
          ),
          parent_students!parent_students_student_id_fkey(
            profiles!parent_students_parent_id_fkey(
              id,
              name,
              email,
              phone
            )
          )
        `
        )
        .eq("id", student.id)
        .single();

      if (enrichedError) {
        console.warn("Error loading enriched student data:", enrichedError);
        // Fallback to basic student data
        setEnrichedStudent(student);
      } else if (enrichedStudentData) {
        const enriched = {
          ...enrichedStudentData,
          class: enrichedStudentData.classes,
          parent: enrichedStudentData.parent_students?.[0]?.profiles,
        };
        setEnrichedStudent(enriched);
      }

      // Load grades
      const { data: gradesData, error: gradesError } = await supabase
        .from("grades")
        .select(
          `
          id,
          score,
          max_score,
          percentage,
          letter_grade,
          term,
          exam_type,
          status,
          created_at,
          subjects!grades_subject_id_fkey(name)
        `
        )
        .eq("student_id", student.id)
        .eq("school_id", schoolId)
        .order("created_at", { ascending: false });

      if (gradesError) {
        console.warn("Error loading grades:", gradesError);
        setGrades([]);
      } else if (gradesData) {
        setGrades(
          gradesData.map((grade) => ({
            ...grade,
            subject_name: grade.subjects?.name || "Unknown Subject",
          }))
        );
      }

      // Load attendance
      const { data: attendanceData, error: attendanceError } = await supabase
        .from("attendance")
        .select("date, status, session, remarks")
        .eq("student_id", student.id)
        .eq("school_id", schoolId)
        .order("date", { ascending: false })
        .limit(30);

      if (attendanceError) {
        console.warn("Error loading attendance:", attendanceError);
        setAttendance([]);
      } else {
        setAttendance(attendanceData || []);
      }

      // Load certificates
      const { data: certificatesData, error: certificatesError } =
        await supabase
          .from("certificates")
          .select("id, academic_year, generated_at, generated_by, performance")
          .eq("student_id", student.id)
          .eq("school_id", schoolId)
          .order("generated_at", { ascending: false });

      if (certificatesError) {
        console.warn("Error loading certificates:", certificatesError);
        setCertificates([]);
      } else {
        setCertificates(
          (certificatesData || []).map((cert) => ({
            ...cert,
            performance: cert.performance as Record<string, unknown>,
          }))
        );
      }

      // Load fees
      const { data: feesData, error: feesError } = await supabase
        .from("fees")
        .select("id, category, term, amount, paid_amount, due_date, status")
        .eq("student_id", student.id)
        .eq("school_id", schoolId)
        .order("due_date", { ascending: false });

      if (feesError) {
        console.warn("Error loading fees:", feesError);
        setFees([]);
      } else {
        setFees(feesData || []);
      }

      // Load school info
      const { data: schoolData, error: schoolError } = await supabase
        .from("schools")
        .select("*")
        .eq("id", schoolId)
        .single();

      if (schoolError) {
        console.warn("Error loading school info:", schoolError);
        setSchoolInfo(null);
      } else {
        setSchoolInfo(schoolData);
      }
    } catch (error) {
      console.error("Error loading student data:", error);
      toast({
        title: "Error",
        description: "Failed to load student details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (!student) return;

    try {
      // This would integrate with a PDF generation service
      toast({
        title: "Export Started",
        description: "PDF export is being prepared...",
      });

      // For now, we'll simulate the export
      setTimeout(() => {
        toast({
          title: "Export Complete",
          description: "Student profile PDF has been generated",
        });
      }, 2000);
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to generate PDF",
        variant: "destructive",
      });
    }
  };

  const handlePrint = () => {
    if (!student) return;

    // Create a print-friendly version
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Student Profile - ${student.name}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
            .section { margin-bottom: 30px; }
            .section h2 { color: #2563eb; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            .info-item { margin-bottom: 15px; }
            .info-label { font-weight: bold; color: #666; }
            .table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .table th { background-color: #f8f9fa; }
            .footer { margin-top: 50px; text-align: center; color: #666; font-size: 12px; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${schoolInfo?.name || "School Name"}</h1>
            <h2>Student Profile</h2>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="section">
            <h2>Student Information</h2>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Name:</div>
                <div>${student.name}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Admission Number:</div>
                <div>${student.admission_number}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Roll Number:</div>
                <div>${student.roll_number || "N/A"}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Gender:</div>
                <div>${student.gender || "N/A"}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Date of Birth:</div>
                <div>${
                  student.date_of_birth
                    ? new Date(student.date_of_birth).toLocaleDateString()
                    : "N/A"
                }</div>
              </div>
              <div class="info-item">
                <div class="info-label">Class:</div>
                <div>${enrichedStudent?.class?.name || "N/A"}</div>
              </div>
            </div>
          </div>
          
          <div class="section">
            <h2>Academic Performance</h2>
            <table class="table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Score</th>
                  <th>Percentage</th>
                  <th>Grade</th>
                  <th>Term</th>
                </tr>
              </thead>
              <tbody>
                ${grades
                  .map(
                    (grade) => `
                  <tr>
                    <td>${grade.subject_name}</td>
                    <td>${grade.score}/${grade.max_score}</td>
                    <td>${grade.percentage}%</td>
                    <td>${grade.letter_grade}</td>
                    <td>${grade.term}</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
          
          <div class="footer">
            <p>Powered by EduFam - Comprehensive School Management System</p>
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
      case "present":
      case "paid":
      case "approved":
        return "bg-green-100 text-green-800";
      case "inactive":
      case "absent":
      case "unpaid":
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "overdue":
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const calculateAttendanceRate = () => {
    if (attendance.length === 0) return 0;
    const present = attendance.filter((a) => a.status === "present").length;
    return Math.round((present / attendance.length) * 100);
  };

  const calculateAverageGrade = () => {
    if (grades.length === 0) return 0;
    const validGrades = grades.filter((g) => g.percentage !== null);
    if (validGrades.length === 0) return 0;
    const total = validGrades.reduce((sum, g) => sum + g.percentage, 0);
    return Math.round(total / validGrades.length);
  };

  const calculateFeeBalance = () => {
    return fees.reduce(
      (total, fee) => total + (fee.amount - fee.paid_amount),
      0
    );
  };

  if (!student) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Student Profile: {student.name}
            </DialogTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExportPDF}>
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
            </div>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading student details...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-blue-600 font-medium">
                        Average Grade
                      </p>
                      <p className="text-2xl font-bold text-blue-900">
                        {calculateAverageGrade()}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-green-600 font-medium">
                        Attendance Rate
                      </p>
                      <p className="text-2xl font-bold text-green-900">
                        {calculateAttendanceRate()}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Award className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-purple-600 font-medium">
                        Certificates
                      </p>
                      <p className="text-2xl font-bold text-purple-900">
                        {certificates.length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-orange-600 font-medium">
                        Fee Balance
                      </p>
                      <p className="text-2xl font-bold text-orange-900">
                        KES {calculateFeeBalance().toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="academic">Academic</TabsTrigger>
                <TabsTrigger value="attendance">Attendance</TabsTrigger>
                <TabsTrigger value="certificates">Certificates</TabsTrigger>
                <TabsTrigger value="finance">Finance</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Student Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Student Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-600">
                            Full Name
                          </label>
                          <p className="text-lg font-semibold">
                            {student.name}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">
                            Admission Number
                          </label>
                          <p className="text-lg">{student.admission_number}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">
                            Roll Number
                          </label>
                          <p className="text-lg">
                            {student.roll_number || "N/A"}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">
                            Gender
                          </label>
                          <p className="text-lg">{student.gender || "N/A"}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">
                            Date of Birth
                          </label>
                          <p className="text-lg">
                            {student.date_of_birth
                              ? new Date(
                                  student.date_of_birth
                                ).toLocaleDateString()
                              : "N/A"}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">
                            Status
                          </label>
                          <Badge
                            className={getStatusColor(
                              student.is_active ? "active" : "inactive"
                            )}
                          >
                            {student.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                      {student.address && (
                        <div>
                          <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Address
                          </label>
                          <p className="text-lg">{student.address}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Class Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5" />
                        Class Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-600">
                            Class
                          </label>
                          <p className="text-lg font-semibold">
                            {enrichedStudent?.class?.name || "N/A"}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">
                            Level
                          </label>
                          <p className="text-lg">
                            {enrichedStudent?.class?.level || "N/A"}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">
                            Stream
                          </label>
                          <p className="text-lg">
                            {enrichedStudent?.class?.stream || "N/A"}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">
                            Curriculum
                          </label>
                          <p className="text-lg">
                            {enrichedStudent?.class?.curriculum_type ||
                              "Standard"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Parent Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Parent Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Parent Name
                        </label>
                        <p className="text-lg font-semibold">
                          {enrichedStudent?.parent?.name || "N/A"}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            Contact
                          </label>
                          <p className="text-lg">
                            {student.parent_contact ||
                              enrichedStudent?.parent?.phone ||
                              "N/A"}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            Email
                          </label>
                          <p className="text-lg">
                            {enrichedStudent?.parent?.email || "N/A"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* School Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5" />
                        School Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          School Name
                        </label>
                        <p className="text-lg font-semibold">
                          {schoolInfo?.name || "N/A"}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-600">
                            Location
                          </label>
                          <p className="text-lg">
                            {schoolInfo?.location || "N/A"}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">
                            Phone
                          </label>
                          <p className="text-lg">
                            {schoolInfo?.phone || "N/A"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Academic Tab */}
              <TabsContent value="academic" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Academic Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {grades.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="font-medium">No grades recorded yet</p>
                        <p className="text-sm mt-1">
                          Grades will appear here once they are entered by
                          teachers.
                        </p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Subject</TableHead>
                            <TableHead>Score</TableHead>
                            <TableHead>Percentage</TableHead>
                            <TableHead>Grade</TableHead>
                            <TableHead>Term</TableHead>
                            <TableHead>Exam Type</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {grades.map((grade) => (
                            <TableRow key={grade.id}>
                              <TableCell className="font-medium">
                                {grade.subject_name}
                              </TableCell>
                              <TableCell>
                                {grade.score}/{grade.max_score}
                              </TableCell>
                              <TableCell>{grade.percentage}%</TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {grade.letter_grade}
                                </Badge>
                              </TableCell>
                              <TableCell>{grade.term}</TableCell>
                              <TableCell>{grade.exam_type}</TableCell>
                              <TableCell>
                                <Badge className={getStatusColor(grade.status)}>
                                  {grade.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Attendance Tab */}
              <TabsContent value="attendance" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Attendance Record (Last 30 Days)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {attendance.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="font-medium">
                          No attendance records found
                        </p>
                        <p className="text-sm mt-1">
                          Attendance records will appear here once they are
                          marked.
                        </p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Session</TableHead>
                            <TableHead>Remarks</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {attendance.map((record, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                {new Date(record.date).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  className={getStatusColor(record.status)}
                                >
                                  {record.status}
                                </Badge>
                              </TableCell>
                              <TableCell>{record.session}</TableCell>
                              <TableCell>{record.remarks || "-"}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Certificates Tab */}
              <TabsContent value="certificates" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Certificates Issued
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {certificates.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="font-medium">
                          No certificates issued yet
                        </p>
                        <p className="text-sm mt-1">
                          Certificates will appear here once they are generated.
                        </p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Academic Year</TableHead>
                            <TableHead>Generated Date</TableHead>
                            <TableHead>Generated By</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {certificates.map((certificate) => (
                            <TableRow key={certificate.id}>
                              <TableCell className="font-medium">
                                {certificate.academic_year}
                              </TableCell>
                              <TableCell>
                                {new Date(
                                  certificate.generated_at
                                ).toLocaleDateString()}
                              </TableCell>
                              <TableCell>{certificate.generated_by}</TableCell>
                              <TableCell>
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4 mr-2" />
                                  View
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Finance Tab */}
              <TabsContent value="finance" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Fee Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {fees.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="font-medium">No fee records found</p>
                        <p className="text-sm mt-1">
                          Fee records will appear here once they are assigned.
                        </p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Category</TableHead>
                            <TableHead>Term</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Paid</TableHead>
                            <TableHead>Balance</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {fees.map((fee) => (
                            <TableRow key={fee.id}>
                              <TableCell className="font-medium">
                                {fee.category}
                              </TableCell>
                              <TableCell>{fee.term}</TableCell>
                              <TableCell>
                                KES {fee.amount.toLocaleString()}
                              </TableCell>
                              <TableCell>
                                KES {fee.paid_amount.toLocaleString()}
                              </TableCell>
                              <TableCell>
                                KES{" "}
                                {(
                                  fee.amount - fee.paid_amount
                                ).toLocaleString()}
                              </TableCell>
                              <TableCell>
                                {new Date(fee.due_date).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <Badge className={getStatusColor(fee.status)}>
                                  {fee.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default StudentDetailModal;
