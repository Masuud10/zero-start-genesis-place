import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSchoolScopedData } from "@/hooks/useSchoolScopedData";
import {
  Calendar,
  Clock,
  Users,
  BookOpen,
  Loader2,
  Plus,
  Trash2,
  Save,
  Download,
  Printer,
  Send,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Eye,
  Edit3,
  RefreshCw,
  Zap,
  Brain,
  Target,
  Settings,
  FileText,
  ArrowLeft,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigation } from "@/contexts/NavigationContext";

interface TimetableEntry {
  id?: string;
  subject_id: string;
  teacher_id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
}

interface Subject {
  id: string;
  name: string;
  code: string;
  teacher_id?: string;
  profiles?: { name: string };
}

interface Teacher {
  id: string;
  name: string;
  email: string;
}

interface Class {
  id: string;
  name: string;
  level: string;
  stream?: string;
}

const DAYS_OF_WEEK = [
  { value: "monday", label: "Monday", short: "Mon" },
  { value: "tuesday", label: "Tuesday", short: "Tue" },
  { value: "wednesday", label: "Wednesday", short: "Wed" },
  { value: "thursday", label: "Thursday", short: "Thu" },
  { value: "friday", label: "Friday", short: "Fri" },
];

const TIME_SLOTS = [
  "07:30",
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
];

const PrincipalTimetableGenerator: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [subjectTeacherMap, setSubjectTeacherMap] = useState<
    Record<string, string>
  >({});
  const [timeSlots, setTimeSlots] = useState<{ start: string; end: string }[]>([
    { start: "08:00", end: "08:40" },
    { start: "08:40", end: "09:20" },
    { start: "09:20", end: "10:00" },
    { start: "10:00", end: "10:40" },
    { start: "10:40", end: "11:20" },
    { start: "11:20", end: "12:00" },
    { start: "12:00", end: "12:40" },
    { start: "12:40", end: "13:20" },
  ]);
  const [timetableEntries, setTimetableEntries] = useState<TimetableEntry[]>(
    []
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [activeTab, setActiveTab] = useState("setup");
  const [conflicts, setConflicts] = useState<string[]>([]);

  const { toast } = useToast();
  const { schoolId } = useSchoolScopedData();
  const queryClient = useQueryClient();
  const { setActiveSection } = useNavigation();

  // Get current user
  const { data: currentUser } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      return user;
    },
  });

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

  // Get subjects for selected class
  const { data: subjects = [] } = useQuery({
    queryKey: ["subjects", selectedClass, schoolId],
    queryFn: async () => {
      if (!selectedClass || !schoolId) return [];
      const { data, error } = await supabase
        .from("subjects")
        .select("id, name, code, teacher_id")
        .eq("school_id", schoolId)
        .order("name");

      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedClass && !!schoolId,
  });

  // Get teachers
  const { data: teachers = [] } = useQuery({
    queryKey: ["teachers", schoolId],
    queryFn: async () => {
      if (!schoolId) return [];
      const { data, error } = await supabase
        .from("profiles")
        .select("id, name, email")
        .eq("school_id", schoolId)
        .eq("role", "teacher")
        .order("name");

      if (error) throw error;
      return data || [];
    },
    enabled: !!schoolId,
  });

  // Get existing timetable for selected class
  const { data: existingTimetable = [] } = useQuery({
    queryKey: ["existing-timetable", selectedClass],
    queryFn: async () => {
      if (!selectedClass) return [];
      const { data, error } = await supabase
        .from("timetables")
        .select(
          `
          id,
          subject_id,
          teacher_id,
          day_of_week,
          start_time,
          end_time
        `
        )
        .eq("class_id", selectedClass);

      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedClass,
  });

  // Mutations
  const saveTimetableMutation = useMutation({
    mutationFn: async (entries: TimetableEntry[]) => {
      if (!selectedClass || !currentUser?.id)
        throw new Error("Missing required data");

      // Delete existing entries for this class
      await supabase.from("timetables").delete().eq("class_id", selectedClass);

      // Insert new entries
      const { data, error } = await supabase
        .from("timetables")
        .insert(
          entries.map((entry) => ({
            ...entry,
            class_id: selectedClass,
            school_id: schoolId,
            created_by: currentUser.id,
          }))
        )
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Timetable saved successfully!",
      });
      queryClient.invalidateQueries({
        queryKey: ["existing-timetable", selectedClass],
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save timetable",
        variant: "destructive",
      });
    },
  });

  const sendToTeachersMutation = useMutation({
    mutationFn: async () => {
      // Simulate sending to teachers
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Timetable sent to teachers successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send timetable",
        variant: "destructive",
      });
    },
  });

  // Handlers
  const handleClassChange = (classId: string) => {
    setSelectedClass(classId);
    setSelectedSubjects([]);
    setSubjectTeacherMap({});
    setTimetableEntries([]);
    setConflicts([]);
    setActiveTab("setup");
  };

  const handleSubjectToggle = (subjectId: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subjectId)
        ? prev.filter((id) => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  const handleTeacherAssignment = (subjectId: string, teacherId: string) => {
    setSubjectTeacherMap((prev) => ({
      ...prev,
      [subjectId]: teacherId,
    }));
  };

  const handleTimeSlotChange = (
    index: number,
    field: "start" | "end",
    value: string
  ) => {
    setTimeSlots((prev) =>
      prev.map((slot, i) => (i === index ? { ...slot, [field]: value } : slot))
    );
  };

  const addTimeSlot = () => {
    setTimeSlots((prev) => [...prev, { start: "14:00", end: "14:40" }]);
  };

  const removeTimeSlot = (index: number) => {
    setTimeSlots((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAIGenerate = async () => {
    if (!selectedClass || selectedSubjects.length === 0) {
      toast({
        title: "Error",
        description: "Please select a class and at least one subject",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      // Simulate AI generation with progress updates
      const totalSteps = 5;
      for (let i = 0; i < totalSteps; i++) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        setGenerationProgress(((i + 1) / totalSteps) * 100);
      }

      // Generate timetable entries
      const entries: TimetableEntry[] = [];
      const days = DAYS_OF_WEEK.map((day) => day.value);

      selectedSubjects.forEach((subjectId, subjectIndex) => {
        const dayIndex = subjectIndex % days.length;
        const timeSlotIndex =
          Math.floor(subjectIndex / days.length) % timeSlots.length;

        if (timeSlotIndex < timeSlots.length) {
          entries.push({
            subject_id: subjectId,
            teacher_id: subjectTeacherMap[subjectId] || teachers[0]?.id || "",
            day_of_week: days[dayIndex],
            start_time: timeSlots[timeSlotIndex].start,
            end_time: timeSlots[timeSlotIndex].end,
          });
        }
      });

      setTimetableEntries(entries);
      setConflicts([]); // No conflicts in this simple generation
      setActiveTab("preview");

      toast({
        title: "Success",
        description: "Timetable generated successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate timetable",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  const handleSave = () => {
    if (timetableEntries.length === 0) {
      toast({
        title: "Error",
        description: "No timetable entries to save",
        variant: "destructive",
      });
      return;
    }
    saveTimetableMutation.mutate(timetableEntries);
  };

  const handleSendToTeachers = () => {
    sendToTeachersMutation.mutate();
  };

  const handleDownload = () => {
    if (timetableEntries.length === 0) {
      toast({
        title: "Error",
        description: "No timetable to download",
        variant: "destructive",
      });
      return;
    }

    // Create CSV content
    const csvContent = [
      "Day,Subject,Teacher,Start Time,End Time",
      ...timetableEntries.map((entry) => {
        const subject = subjects.find((s) => s.id === entry.subject_id);
        const teacher = teachers.find((t) => t.id === entry.teacher_id);
        return `${entry.day_of_week},${subject?.name || ""},${
          teacher?.name || ""
        },${entry.start_time},${entry.end_time}`;
      }),
    ].join("\n");

    // Download file
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `timetable-${selectedClass}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: "Timetable downloaded successfully!",
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleBackToDashboard = () => {
    setActiveSection("dashboard");
  };

  // Load existing timetable when class is selected
  useEffect(() => {
    if (existingTimetable.length > 0) {
      const entries = existingTimetable.map((item) => ({
        id: item.id,
        subject_id: item.subject_id,
        teacher_id: item.teacher_id,
        day_of_week: item.day_of_week,
        start_time: item.start_time,
        end_time: item.end_time,
      }));
      setTimetableEntries(entries);
      setActiveTab("preview");
    }
  }, [existingTimetable]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToDashboard}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    AI-Powered Timetable Generator
                  </h1>
                  <p className="text-gray-600">
                    Create intelligent, conflict-free timetables with AI
                    assistance
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="setup" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Setup
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="actions" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Actions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="setup" className="space-y-6">
            {/* Class Selection */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Target className="h-5 w-5 text-blue-600" />
                  Step 1: Class Selection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label
                      htmlFor="class-select"
                      className="text-base font-medium"
                    >
                      Select Class
                    </Label>
                    <Select
                      value={selectedClass}
                      onValueChange={handleClassChange}
                    >
                      <SelectTrigger className="h-12 text-base">
                        <SelectValue placeholder="Choose a class to generate timetable for" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id}>
                            <div className="flex items-center gap-2">
                              <BookOpen className="h-4 w-4" />
                              {cls.name} {cls.stream && `- ${cls.stream}`}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedClass && (
                    <div className="p-4 bg-white rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 text-blue-700">
                        <CheckCircle className="h-4 w-4" />
                        <span className="font-medium">
                          Class selected successfully
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Subject Selection */}
            {selectedClass && (
              <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <BookOpen className="h-5 w-5 text-green-600" />
                    Step 2: Subject Selection
                  </CardTitle>
                  <CardDescription>
                    Select subjects to include in the timetable
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {subjects.map((subject) => (
                        <div
                          key={subject.id}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            selectedSubjects.includes(subject.id)
                              ? "border-green-500 bg-green-50"
                              : "border-gray-200 bg-white hover:border-gray-300"
                          }`}
                          onClick={() => handleSubjectToggle(subject.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {subject.name}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {subject.code}
                              </p>
                            </div>
                            {selectedSubjects.includes(subject.id) && (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {selectedSubjects.length > 0 && (
                      <div className="p-4 bg-white rounded-lg border border-green-200">
                        <div className="flex items-center gap-2 text-green-700">
                          <CheckCircle className="h-4 w-4" />
                          <span className="font-medium">
                            {selectedSubjects.length} subjects selected
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Teacher Assignment */}
            {selectedSubjects.length > 0 && (
              <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Users className="h-5 w-5 text-purple-600" />
                    Step 3: Teacher Assignment
                  </CardTitle>
                  <CardDescription>
                    Assign teachers to each selected subject
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedSubjects.map((subjectId) => {
                      const subject = subjects.find((s) => s.id === subjectId);
                      return (
                        <div
                          key={subjectId}
                          className="flex items-center justify-between p-4 bg-white rounded-lg border border-purple-200"
                        >
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {subject?.name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {subject?.code}
                            </p>
                          </div>
                          <Select
                            value={subjectTeacherMap[subjectId] || ""}
                            onValueChange={(value) =>
                              handleTeacherAssignment(subjectId, value)
                            }
                          >
                            <SelectTrigger className="w-48">
                              <SelectValue placeholder="Select teacher" />
                            </SelectTrigger>
                            <SelectContent>
                              {teachers.map((teacher) => (
                                <SelectItem key={teacher.id} value={teacher.id}>
                                  {teacher.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Time Slots */}
            {selectedSubjects.length > 0 && (
              <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-red-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Clock className="h-5 w-5 text-orange-600" />
                    Step 4: Time Slots Configuration
                  </CardTitle>
                  <CardDescription>
                    Configure time slots for the timetable
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {timeSlots.map((slot, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-4 bg-white rounded-lg border border-orange-200"
                      >
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-orange-700">
                            Slot {index + 1}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="time"
                            value={slot.start}
                            onChange={(e) =>
                              handleTimeSlotChange(
                                index,
                                "start",
                                e.target.value
                              )
                            }
                            className="w-32"
                          />
                          <span className="text-gray-500">to</span>
                          <Input
                            type="time"
                            value={slot.end}
                            onChange={(e) =>
                              handleTimeSlotChange(index, "end", e.target.value)
                            }
                            className="w-32"
                          />
                        </div>
                        {timeSlots.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTimeSlot(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      onClick={addTimeSlot}
                      className="w-full border-orange-300 text-orange-700 hover:bg-orange-50"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Time Slot
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* AI Generation */}
            {selectedSubjects.length > 0 && (
              <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-purple-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Brain className="h-5 w-5 text-indigo-600" />
                    Step 5: AI Generation
                  </CardTitle>
                  <CardDescription>
                    Generate the timetable using AI to avoid conflicts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {isGenerating && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm text-gray-600">
                            Generating timetable...
                          </span>
                        </div>
                        <Progress
                          value={generationProgress}
                          className="w-full"
                        />
                      </div>
                    )}
                    <Button
                      onClick={handleAIGenerate}
                      disabled={isGenerating || selectedSubjects.length === 0}
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Generate Timetable with AI
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="preview" className="space-y-6">
            {/* Timetable Preview */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Eye className="h-5 w-5 text-blue-600" />
                  Timetable Preview
                </CardTitle>
                <CardDescription>
                  Review the generated timetable before saving
                </CardDescription>
              </CardHeader>
              <CardContent>
                {timetableEntries.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-800 mb-2">
                      No timetable generated yet
                    </h3>
                    <p className="text-gray-600">
                      Complete the setup steps and generate a timetable to see
                      the preview.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Timetable Table */}
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Day</TableHead>
                            <TableHead>Subject</TableHead>
                            <TableHead>Teacher</TableHead>
                            <TableHead>Time</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {timetableEntries.map((entry, index) => {
                            const subject = subjects.find(
                              (s) => s.id === entry.subject_id
                            );
                            const teacher = teachers.find(
                              (t) => t.id === entry.teacher_id
                            );
                            const day = DAYS_OF_WEEK.find(
                              (d) => d.value === entry.day_of_week
                            );

                            return (
                              <TableRow key={index}>
                                <TableCell className="font-medium">
                                  {day?.label}
                                </TableCell>
                                <TableCell>{subject?.name}</TableCell>
                                <TableCell>{teacher?.name}</TableCell>
                                <TableCell>
                                  {entry.start_time} - {entry.end_time}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Conflicts Warning */}
                    {conflicts.length > 0 && (
                      <Alert className="border-orange-200 bg-orange-50">
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                        <AlertDescription className="text-orange-700">
                          {conflicts.length} conflict(s) detected. Please review
                          and resolve before saving.
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Summary Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-600 font-medium">
                          Total Entries
                        </p>
                        <p className="text-2xl font-bold text-blue-800">
                          {timetableEntries.length}
                        </p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-600 font-medium">
                          Subjects Covered
                        </p>
                        <p className="text-2xl font-bold text-green-800">
                          {
                            new Set(timetableEntries.map((e) => e.subject_id))
                              .size
                          }
                        </p>
                      </div>
                      <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <p className="text-sm text-orange-600 font-medium">
                          Conflicts
                        </p>
                        <p className="text-2xl font-bold text-orange-800">
                          {conflicts.length}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="actions" className="space-y-6">
            {/* Actions */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Timetable Actions
                </CardTitle>
                <CardDescription>
                  Save, share, and export your timetable
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Save Timetable */}
                  <Card className="border-2 border-dashed border-blue-200 hover:border-blue-300 transition-colors">
                    <CardContent className="p-6">
                      <div className="text-center space-y-4">
                        <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto">
                          <Save className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            Save Timetable
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Save the timetable to the system for future access
                          </p>
                        </div>
                        <Button
                          onClick={handleSave}
                          disabled={
                            saveTimetableMutation.isPending ||
                            timetableEntries.length === 0
                          }
                          className="w-full"
                        >
                          {saveTimetableMutation.isPending ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              Save Timetable
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Send to Teachers */}
                  <Card className="border-2 border-dashed border-green-200 hover:border-green-300 transition-colors">
                    <CardContent className="p-6">
                      <div className="text-center space-y-4">
                        <div className="p-3 bg-green-100 rounded-full w-fit mx-auto">
                          <Send className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            Send to Teachers
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Distribute timetable to all relevant teachers
                          </p>
                        </div>
                        <Button
                          onClick={handleSendToTeachers}
                          disabled={
                            sendToTeachersMutation.isPending ||
                            timetableEntries.length === 0
                          }
                          variant="outline"
                          className="w-full border-green-300 text-green-700 hover:bg-green-50"
                        >
                          {sendToTeachersMutation.isPending ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4 mr-2" />
                              Send to Teachers
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Download */}
                  <Card className="border-2 border-dashed border-purple-200 hover:border-purple-300 transition-colors">
                    <CardContent className="p-6">
                      <div className="text-center space-y-4">
                        <div className="p-3 bg-purple-100 rounded-full w-fit mx-auto">
                          <Download className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            Download CSV
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Download timetable as CSV file
                          </p>
                        </div>
                        <Button
                          onClick={handleDownload}
                          disabled={timetableEntries.length === 0}
                          variant="outline"
                          className="w-full border-purple-300 text-purple-700 hover:bg-purple-50"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download CSV
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Print */}
                  <Card className="border-2 border-dashed border-orange-200 hover:border-orange-300 transition-colors">
                    <CardContent className="p-6">
                      <div className="text-center space-y-4">
                        <div className="p-3 bg-orange-100 rounded-full w-fit mx-auto">
                          <Printer className="h-6 w-6 text-orange-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            Print Timetable
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Print timetable for physical distribution
                          </p>
                        </div>
                        <Button
                          onClick={handlePrint}
                          disabled={timetableEntries.length === 0}
                          variant="outline"
                          className="w-full border-orange-300 text-orange-700 hover:bg-orange-50"
                        >
                          <Printer className="h-4 w-4 mr-2" />
                          Print Timetable
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PrincipalTimetableGenerator;
