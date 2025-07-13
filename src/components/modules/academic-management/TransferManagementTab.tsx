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
import { useToast } from "@/hooks/use-toast";
import { useSchoolScopedData } from "@/hooks/useSchoolScopedData";
import { useClasses } from "@/hooks/useClasses";
import { useStudents } from "@/hooks/useStudents";
import { supabase } from "@/integrations/supabase/client";
import {
  TrendingUp,
  Users,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Loader2,
  RefreshCw,
  FileText,
  Calendar,
  GraduationCap,
  Search,
} from "lucide-react";

interface Student {
  id: string;
  name: string;
  admission_number: string;
  class_id: string;
  is_active: boolean;
  created_at: string;
}

interface TransferData {
  studentId: string;
  currentClassId: string;
  targetClassId: string;
  transferReason: string;
  transferDate: string;
  academicYear: string;
  term: string;
  approvedBy?: string;
  status: "pending" | "approved" | "rejected" | "completed";
}

interface TransferRecord {
  id: string;
  student_id: string;
  from_class_id: string;
  to_class_id: string;
  reason: string;
  transfer_date: string;
  academic_year: string;
  term: string;
  status: string;
  created_at: string;
  students?: { name: string; admission_number: string };
  from_class?: { name: string };
  to_class?: { name: string };
}

const TransferManagementTab: React.FC = () => {
  const [transferData, setTransferData] = useState<TransferData>({
    studentId: "",
    currentClassId: "",
    targetClassId: "",
    transferReason: "",
    transferDate: new Date().toISOString().split("T")[0],
    academicYear: new Date().getFullYear().toString(),
    term: "Term 1",
    status: "pending",
  });

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentsInClass, setStudentsInClass] = useState<Student[]>([]);
  const [transferRecords, setTransferRecords] = useState<TransferRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [transferring, setTransferring] = useState(false);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [transferErrors, setTransferErrors] = useState<Record<string, string>>(
    {}
  );

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
      setStudentsInClass([]);
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
          created_at
        `
        )
        .eq("school_id", schoolId)
        .eq("class_id", classId)
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      setStudentsInClass(data || []);
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

  // Fetch transfer records
  const fetchTransferRecords = async () => {
    if (!schoolId) return;

    setLoadingRecords(true);
    try {
      // Simulate transfer records since table doesn't exist
      const transfers: TransferRecord[] = [];
      
      // Get sample data from students table to simulate transfers
      const { data: sampleStudents, error } = await supabase
        .from("students")
        .select("id, name, admission_number, class_id")
        .eq("school_id", schoolId)
        .limit(5);
      
      if (error) throw error;
      
      const data = transfers; // Empty array for now

      if (error) throw error;
      setTransferRecords(data);
    } catch (error: any) {
      console.error("Error fetching transfer records:", error);
      toast({
        title: "Error",
        description: "Failed to fetch transfer records.",
        variant: "destructive",
      });
    } finally {
      setLoadingRecords(false);
    }
  };

  useEffect(() => {
    fetchTransferRecords();
  }, [schoolId]);

  // Handle class selection
  const handleCurrentClassChange = (classId: string) => {
    setTransferData((prev) => ({
      ...prev,
      currentClassId: classId,
      studentId: "", // Reset student selection
    }));
    setSelectedStudent(null);
    fetchStudentsInClass(classId);
  };

  // Handle student selection
  const handleStudentSelection = (student: Student) => {
    setSelectedStudent(student);
    setTransferData((prev) => ({
      ...prev,
      studentId: student.id,
      currentClassId: student.class_id,
    }));
  };

  // Validate transfer data
  const validateTransfer = (): boolean => {
    const errors: Record<string, string> = {};

    if (!transferData.studentId) {
      errors.studentId = "Please select a student";
    }

    if (!transferData.targetClassId) {
      errors.targetClassId = "Target class is required";
    }

    if (transferData.currentClassId === transferData.targetClassId) {
      errors.targetClassId =
        "Target class must be different from current class";
    }

    if (!transferData.transferReason.trim()) {
      errors.transferReason = "Transfer reason is required";
    }

    if (!transferData.transferDate) {
      errors.transferDate = "Transfer date is required";
    }

    if (!transferData.academicYear) {
      errors.academicYear = "Academic year is required";
    }

    if (!transferData.term) {
      errors.term = "Term is required";
    }

    setTransferErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle transfer submission
  const handleTransfer = async () => {
    if (!validateTransfer()) {
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

    setTransferring(true);

    try {
      // Simulate transfer record creation (table doesn't exist)
      toast({
        title: "Info", 
        description: "Transfer functionality is not yet implemented - table missing",
        variant: "destructive",
      });
      return;
      
      const transferRecord = null;
      const transferError = new Error("student_transfers table does not exist");

      if (transferError) throw transferError;

      toast({
        title: "Success",
        description: "Transfer request has been submitted successfully.",
      });

      // Reset form
      setTransferData({
        studentId: "",
        currentClassId: "",
        targetClassId: "",
        transferReason: "",
        transferDate: new Date().toISOString().split("T")[0],
        academicYear: new Date().getFullYear().toString(),
        term: "Term 1",
        status: "pending",
      });

      setSelectedStudent(null);
      setStudentsInClass([]);
      setTransferErrors({});

      // Refresh data
      fetchTransferRecords();
      retryClasses();
      retryStudents();
    } catch (error: any) {
      console.error("Error creating transfer:", error);
      toast({
        title: "Error",
        description:
          error.message ||
          "Failed to create transfer request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setTransferring(false);
    }
  };

  // Handle transfer approval/rejection
  const handleTransferAction = async (
    transferId: string,
    action: "approve" | "reject"
  ) => {
    try {
      const newStatus = action === "approve" ? "approved" : "rejected";

      // Simulate transfer approval (table doesn't exist)
      toast({
        title: "Info",
        description: "Transfer approval not implemented - table missing",
        variant: "destructive",
      });
      return;

      // Error already handled above - remove this line

      if (action === "approve") {
        // Update student's class
        const transfer = transferRecords.find((t) => t.id === transferId);
        if (transfer) {
          const { error: studentUpdateError } = await supabase
            .from("students")
            .update({ class_id: transfer.to_class_id })
            .eq("id", transfer.student_id)
            .eq("school_id", schoolId);

          if (studentUpdateError) throw studentUpdateError;
        }
      }

      toast({
        title: "Success",
        description: `Transfer has been ${action}d successfully.`,
      });

      fetchTransferRecords();
      retryStudents();
    } catch (error: any) {
      console.error(`Error ${action}ing transfer:`, error);
      toast({
        title: "Error",
        description: `Failed to ${action} transfer. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const getClassName = (classId: string) => {
    const classItem = classes.find((cls) => cls.id === classId);
    return classItem?.name || "Unknown Class";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "approved":
        return <Badge variant="default">Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      case "completed":
        return <Badge variant="outline">Completed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredTransferRecords = transferRecords.filter((record) => {
    const matchesSearch =
      record.students?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.students?.admission_number
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || record.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-orange-600" />
            Transfer Management
          </h2>
          <p className="text-muted-foreground">
            Manage student transfers between classes or streams within the
            school
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            retryClasses();
            retryStudents();
            fetchTransferRecords();
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

      {/* Transfer Request Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5" />
            New Transfer Request
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Student Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="currentClass">Current Class</Label>
              <Select
                value={transferData.currentClassId}
                onValueChange={handleCurrentClassChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select current class" />
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

            <div>
              <Label htmlFor="targetClass">Target Class *</Label>
              <Select
                value={transferData.targetClassId}
                onValueChange={(value) =>
                  setTransferData((prev) => ({ ...prev, targetClassId: value }))
                }
              >
                <SelectTrigger
                  className={
                    transferErrors.targetClassId ? "border-red-500" : ""
                  }
                >
                  <SelectValue placeholder="Select target class" />
                </SelectTrigger>
                <SelectContent>
                  {classes
                    .filter((cls) => cls.id !== transferData.currentClassId)
                    .map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {transferErrors.targetClassId && (
                <p className="text-sm text-red-500 mt-1">
                  {transferErrors.targetClassId}
                </p>
              )}
            </div>
          </div>

          {/* Student List */}
          {transferData.currentClassId && (
            <div className="space-y-4">
              <Label>Select Student</Label>
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Loading students...</span>
                </div>
              ) : studentsInClass.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No students found in the selected class.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {studentsInClass.map((student) => (
                    <Card
                      key={student.id}
                      className={`cursor-pointer transition-colors ${
                        selectedStudent?.id === student.id
                          ? "border-blue-500 bg-blue-50"
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
                          </div>
                          {selectedStudent?.id === student.id && (
                            <CheckCircle className="h-5 w-5 text-blue-500" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              {transferErrors.studentId && (
                <p className="text-sm text-red-500">
                  {transferErrors.studentId}
                </p>
              )}
            </div>
          )}

          {/* Transfer Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="transferDate">Transfer Date *</Label>
              <Input
                id="transferDate"
                type="date"
                value={transferData.transferDate}
                onChange={(e) =>
                  setTransferData((prev) => ({
                    ...prev,
                    transferDate: e.target.value,
                  }))
                }
                className={transferErrors.transferDate ? "border-red-500" : ""}
              />
              {transferErrors.transferDate && (
                <p className="text-sm text-red-500 mt-1">
                  {transferErrors.transferDate}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="academicYear">Academic Year *</Label>
              <Select
                value={transferData.academicYear}
                onValueChange={(value) =>
                  setTransferData((prev) => ({ ...prev, academicYear: value }))
                }
              >
                <SelectTrigger
                  className={
                    transferErrors.academicYear ? "border-red-500" : ""
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
              {transferErrors.academicYear && (
                <p className="text-sm text-red-500 mt-1">
                  {transferErrors.academicYear}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="term">Term *</Label>
              <Select
                value={transferData.term}
                onValueChange={(value) =>
                  setTransferData((prev) => ({ ...prev, term: value }))
                }
              >
                <SelectTrigger
                  className={transferErrors.term ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Select term" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Term 1">Term 1</SelectItem>
                  <SelectItem value="Term 2">Term 2</SelectItem>
                  <SelectItem value="Term 3">Term 3</SelectItem>
                </SelectContent>
              </Select>
              {transferErrors.term && (
                <p className="text-sm text-red-500 mt-1">
                  {transferErrors.term}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="transferReason">Transfer Reason *</Label>
            <Textarea
              id="transferReason"
              value={transferData.transferReason}
              onChange={(e) =>
                setTransferData((prev) => ({
                  ...prev,
                  transferReason: e.target.value,
                }))
              }
              placeholder="Please provide a detailed reason for the transfer..."
              rows={3}
              className={transferErrors.transferReason ? "border-red-500" : ""}
            />
            {transferErrors.transferReason && (
              <p className="text-sm text-red-500 mt-1">
                {transferErrors.transferReason}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleTransfer}
              disabled={transferring || !selectedStudent}
              className="min-w-[140px]"
            >
              {transferring ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Submit Transfer
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transfer Records */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Transfer Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <Label htmlFor="searchRecords">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="searchRecords"
                  placeholder="Search by student name or admission number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="statusFilter">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Records Table */}
          {loadingRecords ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading transfer records...</span>
            </div>
          ) : filteredTransferRecords.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm || statusFilter !== "all"
                ? "No transfer records match the current filters."
                : "No transfer records found."}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>From Class</TableHead>
                    <TableHead>To Class</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Transfer Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransferRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{record.students?.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {record.students?.admission_number}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{record.from_class?.name}</TableCell>
                      <TableCell>{record.to_class?.name}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {record.reason}
                      </TableCell>
                      <TableCell>
                        {new Date(record.transfer_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                      <TableCell>
                        {record.status === "pending" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() =>
                                handleTransferAction(record.id, "approve")
                              }
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() =>
                                handleTransferAction(record.id, "reject")
                              }
                            >
                              Reject
                            </Button>
                          </div>
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
    </div>
  );
};

export default TransferManagementTab;
