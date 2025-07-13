import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useSchoolScopedData } from "@/hooks/useSchoolScopedData";
import { useClasses } from "@/hooks/useClasses";
import { useStudents } from "@/hooks/useStudents";
import { supabase } from "@/integrations/supabase/client";
import {
  Archive,
  Users,
  GraduationCap,
  AlertCircle,
  CheckCircle,
  Loader2,
  RefreshCw,
  Search,
  Calendar,
  FileText,
  Eye,
  ArrowRight,
} from "lucide-react";

interface Student {
  id: string;
  name: string;
  admission_number: string;
  class_id: string;
  is_active: boolean;
  created_at: string;
  classes?: { name: string };
}

interface ExitData {
  studentId: string;
  exitReason: "graduated" | "transferred" | "left" | "other";
  exitDate: string;
  academicYear: string;
  term: string;
  additionalNotes: string;
  certificateIssued: boolean;
  recordsTransferred: boolean;
}

interface ExitRecord {
  id: string;
  student_id: string;
  exit_reason: string;
  exit_date: string;
  academic_year: string;
  term: string;
  additional_notes: string;
  certificate_issued: boolean;
  records_transferred: boolean;
  created_at: string;
  students?: { name: string; admission_number: string };
  classes?: { name: string };
}

const ExitManagementTab: React.FC = () => {
  const [activeTab, setActiveTab] = useState("active-students");
  const [exitData, setExitData] = useState<ExitData>({
    studentId: "",
    exitReason: "left",
    exitDate: new Date().toISOString().split("T")[0],
    academicYear: new Date().getFullYear().toString(),
    term: "Term 1",
    additionalNotes: "",
    certificateIssued: false,
    recordsTransferred: false,
  });

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentsInClass, setStudentsInClass] = useState<Student[] | null>(null);
  const [exitRecords, setExitRecords] = useState<ExitRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [reasonFilter, setReasonFilter] = useState("all");
  const [exitErrors, setExitErrors] = useState<Record<string, string>>({});

  const { toast } = useToast();
  const { schoolId } = useSchoolScopedData();
  const {
    classes,
    loading: classesLoading,
    error: classesError,
    retry: retryClasses,
  } = useClasses();
  const {
    students,
    loading: studentsLoading,
    error: studentsError,
    retry: retryStudents,
  } = useStudents();

  // Fetch students in the selected class
  const fetchStudentsInClass = async (classId: string) => {
    if (!classId || !schoolId) {
      setStudentsInClass(null);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("students")
        .select(
          `
          id,
          name,
          admission_number,
          class_id,
          is_active,
          created_at,
          classes(name)
        `
        )
        .eq("school_id", schoolId)
        .eq("class_id", classId)
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      setStudentsInClass((data || []).map((student: any) => ({
        ...student,
        classes: student.classes && typeof student.classes === 'object' && !student.classes.error 
          ? student.classes 
          : { name: "Unknown" }
      })));
    } catch (error: any) {
      console.error("Error fetching students in class:", error);
      toast({
        title: "Error",
        description: "Failed to fetch students in the selected class.",
        variant: "destructive",
      });
      setStudentsInClass([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch exit records
  const fetchExitRecords = async () => {
    if (!schoolId) return;

    setLoadingRecords(true);
    try {
      // Using a simulated exit records structure since student_exits table doesn't exist
      const { data, error } = await supabase
        .from("students")
        .select("*, classes(name)")
        .eq("school_id", schoolId)
        .eq("is_active", false)
        .order("created_at", { ascending: false });

      if (error) throw error;
      // Transform the data to match exit records structure
      const exitRecords = (data || []).map((student: any) => ({
        id: student.id,
        student_id: student.id,
        exit_reason: "Inactive",
        exit_date: student.updated_at,
        academic_year: new Date().getFullYear().toString(),
        term: "Term 1",
        additional_notes: "",
        certificate_issued: false,
        records_transferred: false,
        created_at: student.created_at,
        students: { name: student.name, admission_number: student.admission_number },
        classes: student.classes
      }));
      setExitRecords(exitRecords);
    } catch (error: any) {
      console.error("Error fetching exit records:", error);
      toast({
        title: "Error",
        description: "Failed to fetch exit records.",
        variant: "destructive",
      });
    } finally {
      setLoadingRecords(false);
    }
  };

  useEffect(() => {
    fetchExitRecords();
  }, [schoolId]);

  // Handle class selection
  const handleClassChange = (classId: string) => {
    setSelectedStudent(null);
    setExitData((prev) => ({ ...prev, studentId: "" }));
    fetchStudentsInClass(classId);
  };

  // Handle student selection
  const handleStudentSelection = (student: Student) => {
    setSelectedStudent(student);
    setExitData((prev) => ({ ...prev, studentId: student.id }));
  };

  // Validate exit data
  const validateExit = (): boolean => {
    const errors: Record<string, string> = {};

    if (!exitData.studentId) {
      errors.studentId = "Please select a student";
    }

    if (!exitData.exitReason) {
      errors.exitReason = "Exit reason is required";
    }

    if (!exitData.exitDate) {
      errors.exitDate = "Exit date is required";
    }

    if (!exitData.academicYear) {
      errors.academicYear = "Academic year is required";
    }

    if (!exitData.term) {
      errors.term = "Term is required";
    }

    setExitErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle exit processing
  const handleExit = async () => {
    if (!validateExit()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before proceeding.",
        variant: "destructive",
      });
      return;
    }

    if (!schoolId) {
      toast({
        title: "Error",
        description: "School context not available.",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);

    try {
      // Since student_exits table doesn't exist, just update student status
      // const { data: exitRecord, error: exitError } = await supabase
      //   .from("student_exits")
      //   .insert({
      //     student_id: exitData.studentId,
      //     exit_reason: exitData.exitReason,
      //     exit_date: exitData.exitDate,
      //     academic_year: exitData.academicYear,
      //     term: exitData.term,
      //     additional_notes: exitData.additionalNotes,
      //     certificate_issued: exitData.certificateIssued,
      //     records_transferred: exitData.recordsTransferred,
      //     school_id: schoolId,
      //   })
      //   .select()
      //   .single();

      // if (exitError) throw exitError;

      // Update student status to inactive
      const { error: studentUpdateError } = await supabase
        .from("students")
        .update({
          is_active: false,
          status: "exited",
        })
        .eq("id", exitData.studentId)
        .eq("school_id", schoolId);

      if (studentUpdateError) throw studentUpdateError;

      toast({
        title: "Success",
        description: `Student has been successfully marked as exited.`,
      });

      // Reset form
      setExitData({
        studentId: "",
        exitReason: "left",
        exitDate: new Date().toISOString().split("T")[0],
        academicYear: new Date().getFullYear().toString(),
        term: "Term 1",
        additionalNotes: "",
        certificateIssued: false,
        recordsTransferred: false,
      });

      setSelectedStudent(null);
      setStudentsInClass(null);
      setExitErrors({});

      // Refresh data
      fetchExitRecords();
      retryStudents();
    } catch (error: any) {
      console.error("Error processing exit:", error);
      toast({
        title: "Error",
        description:
          error.message || "Failed to process exit. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const getClassName = (classId: string) => {
    const classItem = classes.find((cls) => cls.id === classId);
    return classItem?.name || "Unknown Class";
  };

  const getReasonBadge = (reason: string) => {
    switch (reason) {
      case "graduated":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Graduated
          </Badge>
        );
      case "transferred":
        return <Badge variant="secondary">Transferred</Badge>;
      case "left":
        return <Badge variant="outline">Left</Badge>;
      case "other":
        return <Badge variant="destructive">Other</Badge>;
      default:
        return <Badge variant="secondary">{reason}</Badge>;
    }
  };

  const filteredExitRecords = exitRecords.filter((record) => {
    const matchesSearch =
      record.students?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.students?.admission_number
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesReason =
      reasonFilter === "all" || record.exit_reason === reasonFilter;

    return matchesSearch && matchesReason;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Archive className="h-6 w-6 text-red-600" />
            Exit Management
          </h2>
          <p className="text-muted-foreground">
            Archive students who leave or graduate, maintaining past records
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            retryClasses();
            retryStudents();
            fetchExitRecords();
          }}
          disabled={classesLoading || studentsLoading || loadingRecords}
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${
              classesLoading || studentsLoading || loadingRecords
                ? "animate-spin"
                : ""
            }`}
          />
          Refresh Data
        </Button>
      </div>

      {/* Error Alerts */}
      {(classesError || studentsError) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {classesError || studentsError}. Please refresh the data.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger
            value="active-students"
            className="flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            Active Students
          </TabsTrigger>
          <TabsTrigger
            value="archived-students"
            className="flex items-center gap-2"
          >
            <Archive className="h-4 w-4" />
            Archived Students
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active-students" className="space-y-6">
          {/* Exit Processing Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRight className="h-5 w-5" />
                Process Student Exit
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Class Selection */}
              <div>
                <Label htmlFor="classSelection">Select Class</Label>
                <Select onValueChange={handleClassChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a class to view students" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Student Selection */}
              {studentsInClass !== null && (
                <div className="space-y-4">
                  <Label>Select Student</Label>
                  {loading ? (
                    <div className="flex items-center justify-center h-32">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span className="ml-2">Loading students...</span>
                    </div>
                  ) : studentsInClass.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No active students found in the selected class.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {studentsInClass.map((student) => (
                        <Card
                          key={student.id}
                          className={`cursor-pointer transition-colors ${
                            selectedStudent?.id === student.id
                              ? "border-red-500 bg-red-50"
                              : "hover:border-gray-300"
                          }`}
                          onClick={() => handleStudentSelection(student)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{student.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {student.admission_number}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {student.classes?.name}
                                </p>
                              </div>
                              {selectedStudent?.id === student.id && (
                                <CheckCircle className="h-5 w-5 text-red-500" />
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                  {exitErrors.studentId && (
                    <p className="text-sm text-red-500">
                      {exitErrors.studentId}
                    </p>
                  )}
                </div>
              )}

              {/* Exit Details */}
              {selectedStudent && (
                <div className="space-y-6 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <Label htmlFor="exitReason">Exit Reason *</Label>
                      <Select
                        value={exitData.exitReason}
                        onValueChange={(value) =>
                          setExitData((prev) => ({
                            ...prev,
                            exitReason: value as any,
                          }))
                        }
                      >
                        <SelectTrigger
                          className={
                            exitErrors.exitReason ? "border-red-500" : ""
                          }
                        >
                          <SelectValue placeholder="Select exit reason" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="graduated">Graduated</SelectItem>
                          <SelectItem value="transferred">
                            Transferred to another school
                          </SelectItem>
                          <SelectItem value="left">Left school</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      {exitErrors.exitReason && (
                        <p className="text-sm text-red-500 mt-1">
                          {exitErrors.exitReason}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="exitDate">Exit Date *</Label>
                      <Input
                        id="exitDate"
                        type="date"
                        value={exitData.exitDate}
                        onChange={(e) =>
                          setExitData((prev) => ({
                            ...prev,
                            exitDate: e.target.value,
                          }))
                        }
                        className={exitErrors.exitDate ? "border-red-500" : ""}
                      />
                      {exitErrors.exitDate && (
                        <p className="text-sm text-red-500 mt-1">
                          {exitErrors.exitDate}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="academicYear">Academic Year *</Label>
                      <Select
                        value={exitData.academicYear}
                        onValueChange={(value) =>
                          setExitData((prev) => ({
                            ...prev,
                            academicYear: value,
                          }))
                        }
                      >
                        <SelectTrigger
                          className={
                            exitErrors.academicYear ? "border-red-500" : ""
                          }
                        >
                          <SelectValue placeholder="Select academic year" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 5 }, (_, i) => {
                            const year = new Date().getFullYear() + i;
                            return (
                              <SelectItem key={year} value={year.toString()}>
                                {year}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      {exitErrors.academicYear && (
                        <p className="text-sm text-red-500 mt-1">
                          {exitErrors.academicYear}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="additionalNotes">Additional Notes</Label>
                    <Textarea
                      id="additionalNotes"
                      value={exitData.additionalNotes}
                      onChange={(e) =>
                        setExitData((prev) => ({
                          ...prev,
                          additionalNotes: e.target.value,
                        }))
                      }
                      placeholder="Any additional information about the exit..."
                      rows={3}
                    />
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="certificateIssued"
                        checked={exitData.certificateIssued}
                        onCheckedChange={(checked) =>
                          setExitData((prev) => ({
                            ...prev,
                            certificateIssued: !!checked,
                          }))
                        }
                      />
                      <Label htmlFor="certificateIssued">
                        Certificate Issued
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="recordsTransferred"
                        checked={exitData.recordsTransferred}
                        onCheckedChange={(checked) =>
                          setExitData((prev) => ({
                            ...prev,
                            recordsTransferred: !!checked,
                          }))
                        }
                      />
                      <Label htmlFor="recordsTransferred">
                        Records Transferred
                      </Label>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end">
                    <Button
                      onClick={handleExit}
                      disabled={processing}
                      variant="destructive"
                      className="min-w-[140px]"
                    >
                      {processing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Archive className="h-4 w-4 mr-2" />
                          Process Exit
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="archived-students" className="space-y-6">
          {/* Archived Students Records */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Archive className="h-5 w-5" />
                Archived Student Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <Label htmlFor="searchArchived">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="searchArchived"
                      placeholder="Search by student name or admission number..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="reasonFilter">Exit Reason</Label>
                  <Select value={reasonFilter} onValueChange={setReasonFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All reasons" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Reasons</SelectItem>
                      <SelectItem value="graduated">Graduated</SelectItem>
                      <SelectItem value="transferred">Transferred</SelectItem>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Records Table */}
              {loadingRecords ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Loading archived records...</span>
                </div>
              ) : filteredExitRecords.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm || reasonFilter !== "all"
                    ? "No archived records match the current filters."
                    : "No archived student records found."}
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Last Class</TableHead>
                        <TableHead>Exit Reason</TableHead>
                        <TableHead>Exit Date</TableHead>
                        <TableHead>Academic Year</TableHead>
                        <TableHead>Certificate</TableHead>
                        <TableHead>Records</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredExitRecords.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {record.students?.name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {record.students?.admission_number}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>{record.classes?.name}</TableCell>
                          <TableCell>
                            {getReasonBadge(record.exit_reason)}
                          </TableCell>
                          <TableCell>
                            {new Date(record.exit_date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{record.academic_year}</TableCell>
                          <TableCell>
                            {record.certificate_issued ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-gray-400" />
                            )}
                          </TableCell>
                          <TableCell>
                            {record.records_transferred ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-gray-400" />
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExitManagementTab;
