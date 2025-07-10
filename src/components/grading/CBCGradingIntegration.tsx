import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Target,
  BookOpen,
  Users,
  FileText,
  Save,
  Send,
  Eye,
  Edit,
  Plus,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  BarChart3,
  Download,
  Printer,
  Loader2,
  Info,
  Star,
  Award,
  Clock,
  Calendar,
  Settings,
  Database,
  Zap,
  Upload,
} from "lucide-react";
import { useSchoolScopedData } from "@/hooks/useSchoolScopedData";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ComprehensiveCBCGradingSheet } from "./ComprehensiveCBCGradingSheet";
import { CBCReportCard } from "../reports/CBCReportCard";
import { CBCAnalyticsDashboard } from "../analytics/CBCAnalyticsDashboard";
import { useCBCData } from "@/hooks/useCBCData";
import { supabase } from "@/integrations/supabase/client";

interface CBCGradingIntegrationProps {
  classId: string;
  subjectId: string;
  term: string;
  academicYear: string;
  students: Array<{
    id: string;
    first_name: string;
    last_name: string;
    admission_number: string;
  }>;
  isReadOnly?: boolean;
  isPrincipal?: boolean;
  onSave?: () => void;
  onSubmit?: () => void;
}

export const CBCGradingIntegration: React.FC<CBCGradingIntegrationProps> = ({
  classId,
  subjectId,
  term,
  academicYear,
  students,
  isReadOnly = false,
  isPrincipal = false,
  onSave,
  onSubmit,
}) => {
  const { schoolId } = useSchoolScopedData();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("grading");
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [isInitialized, setIsInitialized] = useState(false);

  // Data fetching for CBC system
  const { data: learningAreas = [], isLoading: learningAreasLoading } =
    useCBCData().useCBCLearningAreas(subjectId, classId);
  const { data: performanceDescriptors = [] } =
    useCBCData().useCBCPerformanceDescriptors();
  const { data: grades = [] } = useCBCData().useCBCGrades(
    classId,
    subjectId,
    term,
    academicYear
  );
  const { data: strandAssessments = [] } = useCBCData().useCBCStrandAssessments(
    classId,
    subjectId,
    term,
    academicYear
  );

  // Check if CBC system is properly initialized
  useEffect(() => {
    const checkCBCInitialization = async () => {
      if (!schoolId) return;

      try {
        // Check if CBC strands exist for this subject and class
        const hasStrands = learningAreas.length > 0;
        const hasAssessmentTypes = performanceDescriptors.length > 0;
        const hasPerformanceLevels = grades.length > 0;

        if (!hasStrands || !hasAssessmentTypes || !hasPerformanceLevels) {
          // Initialize default CBC data if missing
          await initializeDefaultCBCData();
        }

        setIsInitialized(true);
      } catch (error) {
        console.error("Error checking CBC initialization:", error);
        setIsInitialized(true); // Continue anyway
      }
    };

    checkCBCInitialization();
  }, [
    schoolId,
    learningAreas.length,
    performanceDescriptors.length,
    grades.length,
  ]);

  // Initialize default CBC data
  const initializeDefaultCBCData = async () => {
    if (!schoolId || !user) return;

    try {
      // Create default performance descriptors if they don't exist
      const defaultDescriptors = [
        {
          performance_level: "EM",
          descriptor_text: "Beginning to show understanding and skills",
        },
        {
          performance_level: "AP",
          descriptor_text: "Shows developing understanding with support needed",
        },
        {
          performance_level: "PR",
          descriptor_text: "Demonstrates good understanding and application",
        },
        {
          performance_level: "AD",
          descriptor_text:
            "Consistently demonstrates exceptional understanding and skills",
        },
      ];

      for (const descriptor of defaultDescriptors) {
        await supabase.from("cbc_performance_descriptors").upsert({
          school_id: schoolId,
          ...descriptor,
          is_default: true,
        });
      }

      // Create default learning areas if they don't exist
      const defaultLearningAreas = [
        {
          learning_area_name: "Mathematics",
          learning_area_code: "MATH",
          description: "Mathematical concepts and problem solving",
          grade_level: "Primary",
        },
        {
          learning_area_name: "English",
          learning_area_code: "ENG",
          description: "English language and literacy",
          grade_level: "Primary",
        },
        {
          learning_area_name: "Science",
          learning_area_code: "SCI",
          description: "Scientific inquiry and understanding",
          grade_level: "Primary",
        },
      ];

      for (const area of defaultLearningAreas) {
        await supabase.from("cbc_learning_areas").upsert({
          school_id: schoolId,
          ...area,
        });
      }

      toast({
        title: "CBC System Initialized",
        description: "Default CBC data has been created successfully",
      });
    } catch (error) {
      console.error("Error initializing CBC data:", error);
      toast({
        title: "Initialization Error",
        description: "Failed to initialize CBC data",
        variant: "destructive",
      });
    }
  };

  // Handle save
  const handleSave = () => {
    toast({
      title: "Success",
      description: "CBC grades saved successfully",
    });
    onSave?.();
  };

  // Handle submit
  const handleSubmit = () => {
    toast({
      title: "Success",
      description: "CBC grades submitted for approval",
    });
    onSubmit?.();
  };

  // Loading state
  if (learningAreasLoading || !isInitialized) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Initializing CBC Grading System...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* CBC System Header */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-green-800">
            <Target className="w-6 h-6" />
            CBC (Competency-Based Curriculum) Grading System
          </CardTitle>
          <CardDescription className="text-green-700">
            Comprehensive assessment and grading following Kenyan CBC guidelines
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Term: {term}</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span>Academic Year: {academicYear}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>Students: {students.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              <span>Strands: {learningAreas.length}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CBC System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            CBC System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <div className="font-medium text-green-800">
                  Performance Levels
                </div>
                <div className="text-sm text-green-600">
                  {grades.length} configured
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              <div>
                <div className="font-medium text-blue-800">
                  Assessment Types
                </div>
                <div className="text-sm text-blue-600">
                  {performanceDescriptors.length} available
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-purple-600" />
              <div>
                <div className="font-medium text-purple-800">
                  Learning Strands
                </div>
                <div className="text-sm text-purple-600">
                  {learningAreas.length} defined
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-orange-600" />
              <div>
                <div className="font-medium text-orange-800">
                  Student Assessments
                </div>
                <div className="text-sm text-orange-600">
                  {strandAssessments.length} recorded
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main CBC Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="grading">Grading</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="setup">Setup</TabsTrigger>
        </TabsList>

        {/* Grading Tab */}
        <TabsContent value="grading" className="space-y-4">
          <ComprehensiveCBCGradingSheet
            classId={classId}
            subjectId={subjectId}
            term={term}
            academicYear={academicYear}
            students={students}
            isReadOnly={isReadOnly}
            isPrincipal={isPrincipal}
            onSave={handleSave}
            onSubmit={handleSubmit}
          />
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                CBC Report Cards
              </CardTitle>
              <CardDescription>
                Generate and view individual student report cards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Student Selection */}
                <div>
                  <label className="text-sm font-medium">Select Student</label>
                  <select
                    value={selectedStudent}
                    onChange={(e) => setSelectedStudent(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Choose a student...</option>
                    {students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.first_name} {student.last_name} (
                        {student.admission_number})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Report Card Preview */}
                {selectedStudent && (
                  <CBCReportCard
                    studentId={selectedStudent}
                    classId={classId}
                    term={term}
                    academicYear={academicYear}
                    isPreview={true}
                  />
                )}

                {/* Bulk Report Generation */}
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Bulk Report Generation</h4>
                  <div className="flex gap-2">
                    <Button variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Generate All Reports
                    </Button>
                    <Button variant="outline">
                      <Printer className="w-4 h-4 mr-2" />
                      Print All Reports
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <CBCAnalyticsDashboard
            classId={classId}
            subjectId={subjectId}
            term={term}
            academicYear={academicYear}
            isPrincipal={isPrincipal}
          />
        </TabsContent>

        {/* Setup Tab */}
        <TabsContent value="setup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                CBC System Configuration
              </CardTitle>
              <CardDescription>
                Configure strands, assessment types, and performance levels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Strands Configuration */}
                <div>
                  <h4 className="font-medium mb-2">Learning Strands</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {learningAreas.map((strand) => (
                      <div
                        key={strand.id}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <span className="text-sm">
                          {strand.learning_area_name}
                        </span>
                        <Badge variant="outline">
                          {strand.learning_area_code}
                        </Badge>
                      </div>
                    ))}
                  </div>
                  {!isReadOnly && (
                    <Button variant="outline" className="mt-2">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Strand
                    </Button>
                  )}
                </div>

                {/* Assessment Types Configuration */}
                <div>
                  <h4 className="font-medium mb-2">Assessment Types</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {performanceDescriptors.map((type) => (
                      <div
                        key={type.id}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <div>
                          <div className="text-sm font-medium">
                            {type.descriptor_text}
                          </div>
                          <div className="text-xs text-gray-600">
                            {type.description}
                          </div>
                        </div>
                        <Badge variant="outline">
                          {type.weighting_percentage}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                  {!isReadOnly && (
                    <Button variant="outline" className="mt-2">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Assessment Type
                    </Button>
                  )}
                </div>

                {/* Performance Levels Configuration */}
                <div>
                  <h4 className="font-medium mb-2">Performance Levels</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {performanceDescriptors.map((level) => (
                      <div
                        key={level.id}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <div>
                          <div className="text-sm font-medium">
                            {level.performance_level}
                          </div>
                          <div className="text-xs text-gray-600">
                            {level.descriptor_text}
                          </div>
                        </div>
                        <Badge variant="outline">
                          {level.performance_level}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* System Actions */}
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">System Actions</h4>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={initializeDefaultCBCData}
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Reinitialize Default Data
                    </Button>
                    <Button variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Export Configuration
                    </Button>
                    <Button variant="outline">
                      <Upload className="w-4 h-4 mr-2" />
                      Import Configuration
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Help and Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            CBC System Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Performance Levels</h4>
              <ul className="space-y-1 text-gray-600">
                <li>
                  <strong>EM (Emerging):</strong> Beginning to show
                  understanding
                </li>
                <li>
                  <strong>AP (Approaching):</strong> Shows developing
                  understanding
                </li>
                <li>
                  <strong>PR (Proficient):</strong> Demonstrates good
                  understanding
                </li>
                <li>
                  <strong>AD (Advanced):</strong> Consistently demonstrates
                  exceptional skills
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Assessment Types</h4>
              <ul className="space-y-1 text-gray-600">
                <li>
                  <strong>Observations:</strong> Teacher observations (20%)
                </li>
                <li>
                  <strong>Projects:</strong> Project-based work (25%)
                </li>
                <li>
                  <strong>Oral Questions:</strong> Discussions (15%)
                </li>
                <li>
                  <strong>Assignments:</strong> Written work (20%)
                </li>
                <li>
                  <strong>Quizzes:</strong> Short tests (10%)
                </li>
                <li>
                  <strong>Practical:</strong> Hands-on activities (10%)
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
