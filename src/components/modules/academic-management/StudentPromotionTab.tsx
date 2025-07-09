import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  ArrowUpDown,
  Users,
  GraduationCap,
  AlertCircle,
  CheckCircle,
  Loader2,
  RefreshCw,
  Filter,
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react";

interface Student {
  id: string;
  name: string;
  admission_number: string;
  class_id: string;
  is_active: boolean;
  created_at: string;
}

interface PromotionData {
  currentClassId: string;
  targetClassId: string;
  academicYear: string;
  term: string;
  selectedStudents: string[];
  filterStream?: string;
  filterCurriculum?: string;
  retainStudents: boolean;
}

const StudentPromotionTab: React.FC = () => {
  const [promotionData, setPromotionData] = useState<PromotionData>({
    currentClassId: "",
    targetClassId: "",
    academicYear: new Date().getFullYear().toString(),
    term: "Term 1",
    selectedStudents: [],
    filterStream: "",
    filterCurriculum: "",
    retainStudents: false,
  });

  const [loading, setLoading] = useState(false);
  const [promoting, setPromoting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [studentsInClass, setStudentsInClass] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [promotionErrors, setPromotionErrors] = useState<
    Record<string, string>
  >({});

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
    } catch (error: unknown) {
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

  // Filter students based on criteria
  useEffect(() => {
    let filtered = studentsInClass;

    if (promotionData.filterStream) {
      // Note: This would need to be implemented based on your class structure
      // For now, we'll filter by class name containing the stream
      const classInfo = classes.find(
        (c) => c.id === promotionData.currentClassId
      );
      if (
        classInfo &&
        classInfo.name
          .toLowerCase()
          .includes(promotionData.filterStream.toLowerCase())
      ) {
        // Keep students in this class
      } else {
        filtered = [];
      }
    }

    if (promotionData.filterCurriculum) {
      // Note: This would need to be implemented based on your class structure
      // For now, we'll keep all students
    }

    setFilteredStudents(filtered);
  }, [
    studentsInClass,
    promotionData.filterStream,
    promotionData.filterCurriculum,
    classes,
  ]);

  // Handle class selection
  const handleCurrentClassChange = (classId: string) => {
    setPromotionData((prev) => ({
      ...prev,
      currentClassId: classId,
      selectedStudents: [], // Reset selected students
    }));
    fetchStudentsInClass(classId);
  };

  // Handle student selection
  const handleStudentSelection = (studentId: string, checked: boolean) => {
    setPromotionData((prev) => ({
      ...prev,
      selectedStudents: checked
        ? [...prev.selectedStudents, studentId]
        : prev.selectedStudents.filter((id) => id !== studentId),
    }));
  };

  // Handle select all/none
  const handleSelectAll = (checked: boolean) => {
    setPromotionData((prev) => ({
      ...prev,
      selectedStudents: checked ? filteredStudents.map((s) => s.id) : [],
    }));
  };

  // Validate promotion data
  const validatePromotion = (): boolean => {
    const errors: Record<string, string> = {};

    if (!promotionData.currentClassId) {
      errors.currentClassId = "Current class is required";
    }

    if (!promotionData.targetClassId) {
      errors.targetClassId = "Target class is required";
    }

    if (promotionData.currentClassId === promotionData.targetClassId) {
      errors.targetClassId =
        "Target class must be different from current class";
    }

    if (promotionData.selectedStudents.length === 0) {
      errors.selectedStudents = "Please select at least one student to promote";
    }

    if (!promotionData.academicYear) {
      errors.academicYear = "Academic year is required";
    }

    if (!promotionData.term) {
      errors.term = "Term is required";
    }

    setPromotionErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle promotion submission
  const handlePromotion = async () => {
    if (!validatePromotion()) {
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

    setPromoting(true);

    try {
      let promotedCount = 0;
      const errors: string[] = [];

      // Process each selected student
      for (const studentId of promotionData.selectedStudents) {
        try {
          // Update student's class
          const { error: updateError } = await supabase
            .from("students")
            .update({ class_id: promotionData.targetClassId })
            .eq("id", studentId)
            .eq("school_id", schoolId);

          if (updateError) throw updateError;

          // Create new enrollment record
          const { error: enrollmentError } = await supabase
            .from("student_classes")
            .insert({
              student_id: studentId,
              class_id: promotionData.targetClassId,
              academic_year: promotionData.academicYear,
              school_id: schoolId,
              is_active: true,
            });

          if (enrollmentError) throw enrollmentError;

          promotedCount++;
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          console.error(`Error promoting student ${studentId}:`, error);
          errors.push(
            `Failed to promote student ${studentId}: ${errorMessage}`
          );
        }
      }

      if (promotedCount > 0) {
        toast({
          title: "Success",
          description: `Successfully promoted ${promotedCount} students to the new class.`,
        });

        // Reset form
        setPromotionData({
          currentClassId: "",
          targetClassId: "",
          academicYear: new Date().getFullYear().toString(),
          term: "Term 1",
          selectedStudents: [],
          filterStream: "",
          filterCurriculum: "",
          retainStudents: false,
        });

        setStudentsInClass([]);
        setFilteredStudents([]);
        setPromotionErrors({});

        // Refresh data
        retryClasses();
        retryStudents();
      }

      if (errors.length > 0) {
        toast({
          title: "Partial Success",
          description: `Promoted ${promotedCount} students, but ${errors.length} failed.`,
          variant: "destructive",
        });
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to promote students. Please try again.";
      console.error("Error during promotion:", error);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setPromoting(false);
    }
  };

  const getClassName = (classId: string) => {
    const classItem = classes.find((cls) => cls.id === classId);
    return classItem?.name || "Unknown Class";
  };

  const isAllSelected =
    filteredStudents.length > 0 &&
    promotionData.selectedStudents.length === filteredStudents.length;
  const isIndeterminate =
    promotionData.selectedStudents.length > 0 &&
    promotionData.selectedStudents.length < filteredStudents.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ArrowUpDown className="h-6 w-6 text-green-600" />
            Student Promotion
          </h2>
          <p className="text-muted-foreground">
            Promote students from one class to another at the end of an academic
            year
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

      {/* Promotion Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Promotion Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Class Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="currentClass">Current Class *</Label>
              <Select
                value={promotionData.currentClassId}
                onValueChange={handleCurrentClassChange}
              >
                <SelectTrigger
                  className={
                    promotionErrors.currentClassId ? "border-red-500" : ""
                  }
                >
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
              {promotionErrors.currentClassId && (
                <p className="text-sm text-red-500 mt-1">
                  {promotionErrors.currentClassId}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="targetClass">Target Class *</Label>
              <Select
                value={promotionData.targetClassId}
                onValueChange={(value) =>
                  setPromotionData((prev) => ({
                    ...prev,
                    targetClassId: value,
                  }))
                }
              >
                <SelectTrigger
                  className={
                    promotionErrors.targetClassId ? "border-red-500" : ""
                  }
                >
                  <SelectValue placeholder="Select target class" />
                </SelectTrigger>
                <SelectContent>
                  {classes
                    .filter((cls) => cls.id !== promotionData.currentClassId)
                    .map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {promotionErrors.targetClassId && (
                <p className="text-sm text-red-500 mt-1">
                  {promotionErrors.targetClassId}
                </p>
              )}
            </div>
          </div>

          {/* Academic Period */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="academicYear">Academic Year *</Label>
              <Select
                value={promotionData.academicYear}
                onValueChange={(value) =>
                  setPromotionData((prev) => ({ ...prev, academicYear: value }))
                }
              >
                <SelectTrigger
                  className={
                    promotionErrors.academicYear ? "border-red-500" : ""
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
              {promotionErrors.academicYear && (
                <p className="text-sm text-red-500 mt-1">
                  {promotionErrors.academicYear}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="term">Term *</Label>
              <Select
                value={promotionData.term}
                onValueChange={(value) =>
                  setPromotionData((prev) => ({ ...prev, term: value }))
                }
              >
                <SelectTrigger
                  className={promotionErrors.term ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Select term" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Term 1">Term 1</SelectItem>
                  <SelectItem value="Term 2">Term 2</SelectItem>
                  <SelectItem value="Term 3">Term 3</SelectItem>
                </SelectContent>
              </Select>
              {promotionErrors.term && (
                <p className="text-sm text-red-500 mt-1">
                  {promotionErrors.term}
                </p>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="space-y-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              {showFilters ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              {showFilters ? "Hide" : "Show"} Filters
            </Button>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label htmlFor="filterStream">Filter by Stream</Label>
                  <Input
                    id="filterStream"
                    value={promotionData.filterStream}
                    onChange={(e) =>
                      setPromotionData((prev) => ({
                        ...prev,
                        filterStream: e.target.value,
                      }))
                    }
                    placeholder="Enter stream name"
                  />
                </div>

                <div>
                  <Label htmlFor="filterCurriculum">Filter by Curriculum</Label>
                  <Select
                    value={promotionData.filterCurriculum}
                    onValueChange={(value) =>
                      setPromotionData((prev) => ({
                        ...prev,
                        filterCurriculum: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select curriculum" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CBC">CBC</SelectItem>
                      <SelectItem value="IGCSE">IGCSE</SelectItem>
                      <SelectItem value="Standard">Standard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          {/* Options */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="retainStudents"
              checked={promotionData.retainStudents}
              onCheckedChange={(checked) =>
                setPromotionData((prev) => ({
                  ...prev,
                  retainStudents: !!checked,
                }))
              }
            />
            <Label htmlFor="retainStudents">
              Retain students in current class (for repeat students)
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Student Selection */}
      {promotionData.currentClassId && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Students in {getClassName(promotionData.currentClassId)}
                <Badge variant="secondary">
                  {filteredStudents.length} students
                </Badge>
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={isAllSelected}
                  ref={(el) => {
                    if (el)
                      (el as HTMLInputElement).indeterminate = isIndeterminate;
                  }}
                  onCheckedChange={handleSelectAll}
                />
                <Label className="text-sm">Select All</Label>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading students...</span>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No students found in the selected class.
              </div>
            ) : (
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Select</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Admission Number</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <Checkbox
                            checked={promotionData.selectedStudents.includes(
                              student.id
                            )}
                            onCheckedChange={(checked) =>
                              handleStudentSelection(student.id, !!checked)
                            }
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          {student.name}
                        </TableCell>
                        <TableCell>{student.admission_number}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              student.is_active ? "default" : "secondary"
                            }
                          >
                            {student.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {promotionErrors.selectedStudents && (
                  <p className="text-sm text-red-500">
                    {promotionErrors.selectedStudents}
                  </p>
                )}

                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    {promotionData.selectedStudents.length} of{" "}
                    {filteredStudents.length} students selected
                  </p>
                  <Button
                    onClick={handlePromotion}
                    disabled={
                      promoting || promotionData.selectedStudents.length === 0
                    }
                    className="min-w-[140px]"
                  >
                    {promoting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Promoting...
                      </>
                    ) : (
                      <>
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Promote Students
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StudentPromotionTab;
