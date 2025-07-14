import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Search,
  Edit,
  Save,
  X,
  AlertTriangle,
  Clock,
  User,
  GraduationCap,
  BookOpen,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSchoolScopedData } from "@/hooks/useSchoolScopedData";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { GradeManagementService } from "@/services/gradeManagementService";

interface Student {
  id: string;
  name: string;
  admission_number: string;
  roll_number?: string;
  class_name: string;
  class_id: string;
}

interface Grade {
  id: string;
  student_id: string;
  subject_id: string;
  subject_name: string;
  class_id: string;
  term: string;
  exam_type: string;
  score: number;
  max_score: number;
  percentage: number;
  letter_grade?: string;
  cbc_performance_level?: string;
  status: string;
  submitted_by: string;
  submitted_at: string;
  curriculum_type: string;
  teacher_name?: string;
  original_score?: number;
  overridden_by?: string;
  overridden_at?: string;
  principal_notes?: string;
}

interface OverrideData {
  gradeId: string;
  newScore: number;
  reason: string;
}

const GradesOverrideModule: React.FC = () => {
  const { user } = useAuth();
  const { schoolId } = useSchoolScopedData();
  const { toast } = useToast();

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingGrades, setLoadingGrades] = useState(false);
  const [overrideDialogOpen, setOverrideDialogOpen] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
  const [overrideScore, setOverrideScore] = useState("");
  const [overrideReason, setOverrideReason] = useState("");
  const [processing, setProcessing] = useState(false);

  // Load classes
  const loadClasses = useCallback(async () => {
    if (!schoolId) return;

    try {
      const { data, error } = await supabase
        .from("classes")
        .select("id, name, level, stream")
        .eq("school_id", schoolId)
        .order("name");

      if (error) throw error;
      setClasses(data || []);
    } catch (error) {
      console.error("Error loading classes:", error);
    }
  }, [schoolId]);

  // Search students
  const searchStudents = useCallback(async () => {
    if (!schoolId || (!searchQuery && selectedClass === "all")) {
      setStudents([]);
      return;
    }

    setLoading(true);
    try {
      let query = supabase
        .from("students")
        .select(`
          id, name, admission_number, roll_number, class_id,
          classes!inner(name)
        `)
        .eq("school_id", schoolId)
        .eq("is_active", true);

      if (selectedClass !== "all") {
        query = query.eq("class_id", selectedClass);
      }

      if (searchQuery) {
        query = query.or(
          `name.ilike.%${searchQuery}%,admission_number.ilike.%${searchQuery}%,roll_number.ilike.%${searchQuery}%`
        );
      }

      const { data, error } = await query.limit(50).order("name");

      if (error) throw error;

      const formattedStudents: Student[] =
        data?.map((student: any) => ({
          id: student.id,
          name: student.name,
          admission_number: student.admission_number,
          roll_number: student.roll_number,
          class_name: student.classes?.name || "Unknown",
          class_id: student.class_id,
        })) || [];

      setStudents(formattedStudents);
    } catch (error) {
      console.error("Error searching students:", error);
      toast({
        title: "Error",
        description: "Failed to search students",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [schoolId, searchQuery, selectedClass, toast]);

  // Load student grades
  const loadStudentGrades = useCallback(async (studentId: string) => {
    if (!schoolId) return;

    setLoadingGrades(true);
    try {
      const { data, error } = await supabase
        .from("grades")
        .select(`
          id, student_id, subject_id, class_id, term, exam_type,
          score, max_score, percentage, letter_grade, cbc_performance_level,
          status, submitted_by, submitted_at, curriculum_type,
          principal_notes, overridden_by, overridden_at,
          subjects!inner(name),
          profiles!grades_submitted_by_fkey(name)
        `)
        .eq("school_id", schoolId)
        .eq("student_id", studentId)
        .in("status", ["submitted", "approved", "released"])
        .order("submitted_at", { ascending: false });

      if (error) throw error;

      const formattedGrades: Grade[] =
        data?.map((grade: any) => ({
          id: grade.id,
          student_id: grade.student_id,
          subject_id: grade.subject_id,
          subject_name: grade.subjects?.name || "Unknown Subject",
          class_id: grade.class_id,
          term: grade.term,
          exam_type: grade.exam_type,
          score: grade.score,
          max_score: grade.max_score,
          percentage: grade.percentage,
          letter_grade: grade.letter_grade,
          cbc_performance_level: grade.cbc_performance_level,
          status: grade.status,
          submitted_by: grade.submitted_by,
          submitted_at: grade.submitted_at,
          curriculum_type: grade.curriculum_type,
          teacher_name: grade.profiles?.name || "Unknown Teacher",
          original_score: grade.overridden_by ? grade.score : undefined,
          overridden_by: grade.overridden_by,
          overridden_at: grade.overridden_at,
          principal_notes: grade.principal_notes,
        })) || [];

      setGrades(formattedGrades);
    } catch (error) {
      console.error("Error loading student grades:", error);
      toast({
        title: "Error",
        description: "Failed to load student grades",
        variant: "destructive",
      });
    } finally {
      setLoadingGrades(false);
    }
  }, [schoolId, toast]);

  // Handle student selection
  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student);
    loadStudentGrades(student.id);
  };

  // Handle grade override
  const handleOverrideGrade = (grade: Grade) => {
    setSelectedGrade(grade);
    setOverrideScore(grade.score.toString());
    setOverrideReason("");
    setOverrideDialogOpen(true);
  };

  // Execute override
  const executeOverride = async () => {
    if (!selectedGrade || !user?.id) return;

    const newScore = parseFloat(overrideScore);
    if (isNaN(newScore) || newScore < 0 || newScore > selectedGrade.max_score) {
      toast({
        title: "Invalid Score",
        description: `Score must be between 0 and ${selectedGrade.max_score}`,
        variant: "destructive",
      });
      return;
    }

    if (!overrideReason.trim()) {
      toast({
        title: "Reason Required",
        description: "Please provide a reason for the grade override",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    try {
      const result = await GradeManagementService.overrideGrades(
        [selectedGrade.id],
        user.id,
        schoolId || "",
        newScore,
        overrideReason.trim()
      );

      if (!result.success) {
        throw new Error(result.error || "Failed to override grade");
      }

      toast({
        title: "Grade Override Successful",
        description: `Grade for ${selectedGrade.subject_name} has been overridden`,
      });

      // Close dialog and refresh grades
      setOverrideDialogOpen(false);
      setSelectedGrade(null);
      setOverrideScore("");
      setOverrideReason("");

      if (selectedStudent) {
        loadStudentGrades(selectedStudent.id);
      }
    } catch (error) {
      console.error("Error overriding grade:", error);
      toast({
        title: "Override Failed",
        description: error instanceof Error ? error.message : "Failed to override grade",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  // Get grade status badge
  const getStatusBadge = (grade: Grade) => {
    if (grade.overridden_by) {
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Overridden</Badge>;
    }
    
    switch (grade.status) {
      case "submitted":
        return <Badge variant="secondary">Pending</Badge>;
      case "approved":
        return <Badge variant="default" className="bg-green-50 text-green-700">Approved</Badge>;
      case "released":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700">Released</Badge>;
      default:
        return <Badge variant="outline">Draft</Badge>;
    }
  };

  // Effects
  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      searchStudents();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchStudents]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Grades Override</h2>
          <p className="text-gray-600">
            Search and override student grades as needed
          </p>
        </div>
      </div>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Student Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search Student</Label>
              <Input
                id="search"
                placeholder="Enter name, admission number, or roll number"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="class">Filter by Class</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name} {cls.stream && `- ${cls.stream}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Search Results */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Searching students...</span>
            </div>
          ) : students.length > 0 ? (
            <div className="mt-4">
              <h4 className="font-medium mb-2">Students Found ({students.length})</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {students.map((student) => (
                  <Card
                    key={student.id}
                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => handleSelectStudent(student)}
                  >
                    <CardContent className="p-3">
                      <div className="font-medium">{student.name}</div>
                      <div className="text-sm text-gray-600">{student.admission_number}</div>
                      <div className="text-sm text-gray-500">{student.class_name}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : searchQuery || selectedClass !== "all" ? (
            <div className="mt-4 text-center text-gray-500 py-8">
              No students found matching your search criteria
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Selected Student Grades */}
      {selectedStudent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Grades for {selectedStudent.name}
            </CardTitle>
            <p className="text-sm text-gray-600">
              {selectedStudent.admission_number} • {selectedStudent.class_name}
            </p>
          </CardHeader>
          <CardContent>
            {loadingGrades ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading grades...</span>
              </div>
            ) : grades.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>Term</TableHead>
                      <TableHead>Exam Type</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Percentage</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Teacher</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {grades.map((grade) => (
                      <TableRow key={grade.id}>
                        <TableCell className="font-medium">{grade.subject_name}</TableCell>
                        <TableCell>{grade.term}</TableCell>
                        <TableCell>{grade.exam_type}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{grade.score}/{grade.max_score}</span>
                            {grade.overridden_by && (
                              <AlertTriangle className="h-4 w-4 text-yellow-600" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{grade.percentage.toFixed(1)}%</TableCell>
                        <TableCell>{getStatusBadge(grade)}</TableCell>
                        <TableCell>{grade.teacher_name}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOverrideGrade(grade)}
                            className="flex items-center gap-1"
                          >
                            <Edit className="h-3 w-3" />
                            Override
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                No grades found for this student
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Override Dialog */}
      <Dialog open={overrideDialogOpen} onOpenChange={setOverrideDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Override Grade</DialogTitle>
          </DialogHeader>
          
          {selectedGrade && (
            <div className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  You are about to override the grade for <strong>{selectedGrade.subject_name}</strong>. 
                  This action will be logged for audit purposes.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label>Current Score</Label>
                <div className="text-sm text-gray-600">
                  {selectedGrade.score}/{selectedGrade.max_score} ({selectedGrade.percentage.toFixed(1)}%)
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="override-score">New Score *</Label>
                <Input
                  id="override-score"
                  type="number"
                  min="0"
                  max={selectedGrade.max_score}
                  value={overrideScore}
                  onChange={(e) => setOverrideScore(e.target.value)}
                  placeholder={`Enter score (0-${selectedGrade.max_score})`}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="override-reason">Reason for Override *</Label>
                <Textarea
                  id="override-reason"
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="Explain why this grade is being overridden..."
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setOverrideDialogOpen(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={executeOverride} disabled={processing}>
              {processing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Override Grade
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GradesOverrideModule;