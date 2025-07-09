import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useSchoolScopedData } from "@/hooks/useSchoolScopedData";
import { useClasses } from "@/hooks/useClasses";
import { useStudents } from "@/hooks/useStudents";
import { supabase } from "@/integrations/supabase/client";
import {
  Users,
  Search,
  Filter,
  Eye,
  MoreHorizontal,
  Edit,
  FileText,
  Calendar,
  Phone,
  Mail,
  MapPin,
  GraduationCap,
  AlertCircle,
  Loader2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface Student {
  id: string;
  name: string;
  admission_number: string;
  class_id: string;
  school_id: string;
  parent_id?: string;
  roll_number?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  parent_contact?: string;
  is_active: boolean;
  created_at: string;
  classes?: { name: string };
}

interface StudentDetail {
  id: string;
  name: string;
  admission_number: string;
  class_id: string;
  school_id: string;
  parent_id?: string;
  roll_number?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  parent_contact?: string;
  emergency_contact?: string;
  medical_notes?: string;
  previous_school?: string;
  is_active: boolean;
  status?: string;
  created_at: string;
  updated_at?: string;
  classes?: { name: string };
  profiles?: { name: string; email: string };
}

const StudentInformationTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [curriculumFilter, setCurriculumFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedStudent, setSelectedStudent] = useState<StudentDetail | null>(
    null
  );
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [sortField, setSortField] = useState<
    "name" | "admission_number" | "created_at"
  >("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

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

  // Fetch detailed student information
  const fetchStudentDetail = async (studentId: string) => {
    setLoadingDetail(true);
    try {
      const { data, error } = await supabase
        .from("students")
        .select(
          `
          *,
          classes!students_class_id_fkey(name),
          profiles!students_parent_id_fkey(name, email)
        `
        )
        .eq("id", studentId)
        .single();

      if (error) throw error;
      setSelectedStudent(data);
    } catch (error: any) {
      console.error("Error fetching student detail:", error);
      toast({
        title: "Error",
        description: "Failed to fetch student details.",
        variant: "destructive",
      });
    } finally {
      setLoadingDetail(false);
    }
  };

  // Handle student selection for detail view
  const handleViewStudent = (student: Student) => {
    fetchStudentDetail(student.id);
    setDetailModalOpen(true);
  };

  // Handle sorting
  const handleSort = (field: "name" | "admission_number" | "created_at") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Filter and sort students
  const filteredAndSortedStudents = students
    .filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.admission_number
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesClass =
        classFilter === "all" || student.class_id === classFilter;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && student.is_active) ||
        (statusFilter === "inactive" && !student.is_active);

      return matchesSearch && matchesClass && matchesStatus;
    })
    .sort((a, b) => {
      let aValue: string | number = "";
      let bValue: string | number = "";

      switch (sortField) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "admission_number":
          aValue = a.admission_number.toLowerCase();
          bValue = b.admission_number.toLowerCase();
          break;
        case "created_at":
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
      }

      if (sortDirection === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  // Get class name by ID
  const getClassName = (classId: string) => {
    const classItem = classes.find((cls) => cls.id === classId);
    return classItem?.name || "Unknown Class";
  };

  // Student statistics
  const studentStats = {
    total: students.length,
    active: students.filter((s) => s.is_active).length,
    inactive: students.filter((s) => !s.is_active).length,
    newThisMonth: students.filter((s) => {
      const createdDate = new Date(s.created_at);
      const now = new Date();
      return (
        createdDate.getMonth() === now.getMonth() &&
        createdDate.getFullYear() === now.getFullYear()
      );
    }).length,
  };

  const SortIcon = ({
    field,
  }: {
    field: "name" | "admission_number" | "created_at";
  }) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-purple-600" />
            Student Information
          </h2>
          <p className="text-muted-foreground">
            View and manage detailed student records and information
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            retryClasses();
            retryStudents();
          }}
          disabled={classesLoading || studentsLoading}
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${
              classesLoading || studentsLoading ? "animate-spin" : ""
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

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentStats.total}</div>
            <p className="text-xs text-muted-foreground">All registered</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Students
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {studentStats.active}
            </div>
            <p className="text-xs text-muted-foreground">Currently enrolled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Inactive Students
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {studentStats.inactive}
            </div>
            <p className="text-xs text-muted-foreground">
              Not currently enrolled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              New This Month
            </CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {studentStats.newThisMonth}
            </div>
            <p className="text-xs text-muted-foreground">Recently admitted</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name or admission number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="classFilter">Class</Label>
              <Select value={classFilter} onValueChange={setClassFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="curriculumFilter">Curriculum</Label>
              <Select
                value={curriculumFilter}
                onValueChange={setCurriculumFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All curricula" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Curricula</SelectItem>
                  <SelectItem value="CBC">CBC</SelectItem>
                  <SelectItem value="IGCSE">IGCSE</SelectItem>
                  <SelectItem value="Standard">Standard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="statusFilter">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Student Records</span>
            <Badge variant="secondary">
              {filteredAndSortedStudents.length} students
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {studentsLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading students...</span>
            </div>
          ) : filteredAndSortedStudents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm || classFilter !== "all" || statusFilter !== "all"
                ? "No students match the current filters."
                : "No students found."}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("name")}
                        className="h-auto p-0 font-medium"
                      >
                        Name
                        <SortIcon field="name" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("admission_number")}
                        className="h-auto p-0 font-medium"
                      >
                        Admission Number
                        <SortIcon field="admission_number" />
                      </Button>
                    </TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Parent Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("created_at")}
                        className="h-auto p-0 font-medium"
                      >
                        Admission Date
                        <SortIcon field="created_at" />
                      </Button>
                    </TableHead>
                    <TableHead className="w-20">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">
                        {student.name}
                      </TableCell>
                      <TableCell>{student.admission_number}</TableCell>
                      <TableCell>{getClassName(student.class_id)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {student.gender || "Not specified"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {student.parent_contact || "Not provided"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={student.is_active ? "default" : "secondary"}
                        >
                          {student.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(student.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewStudent(student)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" disabled>
                            <MoreHorizontal className="h-4 w-4" />
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

      {/* Student Detail Modal */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Student Profile
            </DialogTitle>
          </DialogHeader>

          {loadingDetail ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading student details...</span>
            </div>
          ) : selectedStudent ? (
            <div className="space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Full Name
                    </Label>
                    <p className="text-lg font-semibold">
                      {selectedStudent.name}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Admission Number
                    </Label>
                    <p className="text-lg font-semibold">
                      {selectedStudent.admission_number}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Class
                    </Label>
                    <p className="text-lg">
                      {selectedStudent.classes?.name || "Not assigned"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Gender
                    </Label>
                    <p className="text-lg capitalize">
                      {selectedStudent.gender || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Date of Birth
                    </Label>
                    <p className="text-lg">
                      {selectedStudent.date_of_birth
                        ? new Date(
                            selectedStudent.date_of_birth
                          ).toLocaleDateString()
                        : "Not provided"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Status
                    </Label>
                    <Badge
                      variant={
                        selectedStudent.is_active ? "default" : "secondary"
                      }
                    >
                      {selectedStudent.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Parent Contact
                    </Label>
                    <p className="text-lg">
                      {selectedStudent.parent_contact || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Emergency Contact
                    </Label>
                    <p className="text-lg">
                      {selectedStudent.emergency_contact || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Address
                    </Label>
                    <p className="text-lg">
                      {selectedStudent.address || "Not provided"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Academic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Academic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Previous School
                    </Label>
                    <p className="text-lg">
                      {selectedStudent.previous_school || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Medical Notes
                    </Label>
                    <p className="text-lg">
                      {selectedStudent.medical_notes || "None"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Admission Date
                    </Label>
                    <p className="text-lg">
                      {new Date(
                        selectedStudent.created_at
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4">
                <Button variant="outline" disabled>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
                <Button variant="outline" disabled>
                  <FileText className="h-4 w-4 mr-2" />
                  Print Profile
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No student details available.
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentInformationTab;
