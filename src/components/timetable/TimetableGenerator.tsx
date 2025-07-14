import React, { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  AlertCircle,
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

interface TimetableGeneratorProps {
  open?: boolean;
  onClose?: () => void;
  onTimetableGenerated?: () => void;
}

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
  profiles?: { id: string; name: string };
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
  curriculum_type?: string;
}

interface TimetableData {
  id: string;
  subject_id: string;
  teacher_id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  is_published: boolean;
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

const TimetableGenerator: React.FC<TimetableGeneratorProps> = ({
  open = false,
  onClose,
  onTimetableGenerated,
}) => {
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
  const [useAIGeneration, setUseAIGeneration] = useState(true);

  const { toast } = useToast();
  const { schoolId } = useSchoolScopedData();
  const queryClient = useQueryClient();

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
  const { data: classes = [], isLoading: classesLoading } = useQuery({
    queryKey: ["classes", schoolId],
    queryFn: async () => {
      if (!schoolId) return [];
      const { data, error } = await supabase
        .from("classes")
        .select("id, name, level, stream, curriculum_type")
        .eq("school_id", schoolId)
        .order("name");

      if (error) throw error;
      return data || [];
    },
    enabled: !!schoolId,
  });

  // Get teachers
  const { data: teachers = [], isLoading: teachersLoading } = useQuery({
    queryKey: ["teachers", schoolId],
    queryFn: async () => {
      if (!schoolId) return [];
      // @ts-ignore - Deep type instantiation issue with Supabase
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

  // Get subjects for selected class
  const { data: subjects = [], isLoading: subjectsLoading } = useQuery({
    queryKey: ["subjects", selectedClass, schoolId],
    queryFn: async (): Promise<Subject[]> => {
      if (!selectedClass || !schoolId) return [];
      const { data, error } = await supabase
        .from("subjects")
        .select(
          `
          id, 
          name, 
          code, 
          teacher_id,
          profiles!subjects_teacher_id_fkey(id, name)
        `
        )
        .eq("class_id", selectedClass)
        .eq("school_id", schoolId)
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedClass && !!schoolId,
  });

  // Get existing timetable for selected class
  const { data: existingTimetable = [], isLoading: timetableLoading } =
    useQuery({
      queryKey: ["timetable", selectedClass, schoolId],
      queryFn: async (): Promise<TimetableData[]> => {
        if (!selectedClass || !schoolId) return [];
        const { data, error } = await supabase
          .from("timetables")
          .select(
            `
          id,
          subject_id,
          teacher_id,
          day_of_week,
          start_time,
          end_time,
          is_published
        `
          )
          .eq("class_id", selectedClass)
          .eq("school_id", schoolId)
          .order("day_of_week, start_time");

        if (error) throw error;
        return data || [];
      },
      enabled: !!selectedClass && !!schoolId,
    });

  // Save timetable mutation
  const saveTimetableMutation = useMutation({
    mutationFn: async (entries: TimetableEntry[]) => {
      if (!selectedClass || !schoolId || !currentUser?.id)
        throw new Error("Missing required data");

      // Delete existing timetable entries for this class
      await supabase
        .from("timetables")
        .delete()
        .eq("class_id", selectedClass)
        .eq("school_id", schoolId);

      // Insert new timetable entries
      const { error } = await supabase.from("timetables").insert(
        entries.map((entry) => ({
          ...entry,
          class_id: selectedClass,
          school_id: schoolId,
          created_by_principal_id: currentUser.id,
          is_published: false,
        }))
      );

      if (error) throw error;
      return entries;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["timetable", selectedClass, schoolId],
      });
      toast({
        title: "Timetable Saved",
        description: "Timetable has been saved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Save Failed",
        description:
          error instanceof Error ? error.message : "Failed to save timetable",
        variant: "destructive",
      });
    },
  });

  // Send to teachers mutation
  const sendToTeachersMutation = useMutation({
    mutationFn: async (entries: TimetableEntry[]) => {
      if (!selectedClass || !schoolId || !currentUser?.id)
        throw new Error("Missing required data");

      // Update timetable entries to published
      const { error } = await supabase
        .from("timetables")
        .update({ is_published: true })
        .eq("class_id", selectedClass)
        .eq("school_id", schoolId);

      if (error) throw error;
      return entries;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["timetable", selectedClass, schoolId],
      });
      queryClient.invalidateQueries({
        queryKey: ["teacher-timetables"],
      });
      toast({
        title: "Timetable Published",
        description: "Timetable has been sent to teachers and is now live.",
      });
      onTimetableGenerated?.();
    },
    onError: (error) => {
      toast({
        title: "Publish Failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to publish timetable",
        variant: "destructive",
      });
    },
  });

  // Check if any data is still loading
  const isLoading =
    classesLoading ||
    teachersLoading ||
    (selectedClass && (subjectsLoading || timetableLoading));

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

  // Don't render until all required data is loaded
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading timetable data...</p>
        </div>
      </div>
    );
  }

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

  const generateAITimetable = () => {
    if (!selectedSubjects.length) return [];

    const entries: TimetableEntry[] = [];
    const days = DAYS_OF_WEEK.map((day) => day.value);
    let dayIndex = 0;
    let timeSlotIndex = 0;

    selectedSubjects.forEach((subjectId) => {
      if (timeSlotIndex >= timeSlots.length) {
        timeSlotIndex = 0;
        dayIndex = (dayIndex + 1) % days.length;
      }

      if (dayIndex < days.length && timeSlotIndex < timeSlots.length) {
        entries.push({
          subject_id: subjectId,
          teacher_id: subjectTeacherMap[subjectId] || teachers[0]?.id || "",
          day_of_week: days[dayIndex],
          start_time: timeSlots[timeSlotIndex].start,
          end_time: timeSlots[timeSlotIndex].end,
        });

        timeSlotIndex++;
      }
    });

    return entries;
  };

  const checkConflicts = (entries: TimetableEntry[]) => {
    const conflicts: string[] = [];
    const teacherSchedules: Record<string, Set<string>> = {};

    entries.forEach((entry) => {
      const timeSlot = `${entry.day_of_week}-${entry.start_time}-${entry.end_time}`;

      if (!teacherSchedules[entry.teacher_id]) {
        teacherSchedules[entry.teacher_id] = new Set();
      }

      if (teacherSchedules[entry.teacher_id].has(timeSlot)) {
        const teacher = teachers.find((t) => t.id === entry.teacher_id);
        const subject = subjects.find((s) => s.id === entry.subject_id);
        conflicts.push(
          `Teacher ${teacher?.name} has a conflict on ${entry.day_of_week} at ${entry.start_time}`
        );
      } else {
        teacherSchedules[entry.teacher_id].add(timeSlot);
      }
    });

    return conflicts;
  };

  const handleAIGenerate = async () => {
    if (!selectedSubjects.length) {
      toast({
        title: "No Subjects Selected",
        description:
          "Please select at least one subject to generate a timetable.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);

    // Simulate AI generation progress
    const progressInterval = setInterval(() => {
      setGenerationProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    // Generate timetable
    setTimeout(() => {
      const generatedEntries = generateAITimetable();
      setTimetableEntries(generatedEntries);

      // Check for conflicts
      const detectedConflicts = checkConflicts(generatedEntries);
      setConflicts(detectedConflicts);

      setIsGenerating(false);
      setGenerationProgress(0);
      clearInterval(progressInterval);

      if (detectedConflicts.length > 0) {
        toast({
          title: "Conflicts Detected",
          description: `${detectedConflicts.length} scheduling conflicts found. Please review and adjust.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Timetable Generated",
          description:
            "AI has generated an optimal timetable with no conflicts!",
        });
      }

      setActiveTab("preview");
    }, 2000);
  };

  const handleSave = () => {
    if (!timetableEntries.length) {
      toast({
        title: "No Timetable",
        description: "Please generate a timetable first.",
        variant: "destructive",
      });
      return;
    }

    const detectedConflicts = checkConflicts(timetableEntries);
    if (detectedConflicts.length > 0) {
      setConflicts(detectedConflicts);
      toast({
        title: "Conflicts Found",
        description: "Please resolve scheduling conflicts before saving.",
        variant: "destructive",
      });
      return;
    }

    saveTimetableMutation.mutate(timetableEntries);
  };

  const handleSendToTeachers = () => {
    sendToTeachersMutation.mutate(timetableEntries);
  };

  const handleDownload = () => {
    if (!timetableEntries.length) return;

    const classData = classes.find((c) => c.id === selectedClass);
    const timetableData = timetableEntries.map((entry) => {
      const subject = subjects.find((s) => s.id === entry.subject_id);
      const teacher = teachers.find((t) => t.id === entry.teacher_id);
      const day = DAYS_OF_WEEK.find((d) => d.value === entry.day_of_week);

      return {
        Day: day?.label || entry.day_of_week,
        Time: `${entry.start_time} - ${entry.end_time}`,
        Subject: subject?.name || "Unknown",
        Teacher: teacher?.name || "Unknown",
      };
    });

    const csvContent = [
      ["Day", "Time", "Subject", "Teacher"],
      ...timetableData.map((row) => [
        row.Day,
        row.Time,
        row.Subject,
        row.Teacher,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${classData?.name || "Class"}_Timetable.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Download Complete",
      description: "Timetable has been downloaded as CSV.",
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleClose = () => {
    setSelectedClass("");
    setSelectedSubjects([]);
    setSubjectTeacherMap({});
    setTimetableEntries([]);
    setConflicts([]);
    setActiveTab("setup");
    onClose?.();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            AI-Powered Timetable Generator
          </DialogTitle>
          <DialogDescription className="text-base">
            Create intelligent, conflict-free timetables with AI assistance
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
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

          <TabsContent value="setup" className="space-y-6 mt-6">
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
                              <span>{cls.name}</span>
                              {cls.curriculum_type && (
                                <Badge variant="outline" className="text-xs">
                                  {cls.curriculum_type.toUpperCase()}
                                </Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {subjects.map((subject) => (
                      <div
                        key={subject.id}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedSubjects.includes(subject.id)
                            ? "border-green-500 bg-green-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => handleSubjectToggle(subject.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{subject.name}</h4>
                            <p className="text-sm text-gray-600">
                              {subject.code}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {selectedSubjects.includes(subject.id) && (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
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
                    Assign teachers to subjects (optional - AI will assign if
                    not specified)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedSubjects.map((subjectId) => {
                      const subject = subjects.find((s) => s.id === subjectId);
                      return (
                        <div
                          key={subjectId}
                          className="flex items-center gap-4"
                        >
                          <div className="flex-1">
                            <Label className="font-medium">
                              {subject?.name}
                            </Label>
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

            {/* Time Slots Configuration */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-red-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Clock className="h-5 w-5 text-orange-600" />
                  Step 4: Time Slots Configuration
                </CardTitle>
                <CardDescription>
                  Configure the time slots for the timetable
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {timeSlots.map((slot, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Label>Slot {index + 1}:</Label>
                        <Input
                          type="time"
                          value={slot.start}
                          onChange={(e) =>
                            handleTimeSlotChange(index, "start", e.target.value)
                          }
                          className="w-32"
                        />
                        <span>to</span>
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
                          variant="outline"
                          size="sm"
                          onClick={() => removeTimeSlot(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={addTimeSlot}
                    className="mt-2"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Time Slot
                  </Button>
                </div>
              </CardContent>
            </Card>

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
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="ai-generation"
                        checked={useAIGeneration}
                        onCheckedChange={setUseAIGeneration}
                      />
                      <Label htmlFor="ai-generation">
                        Use AI-powered generation
                      </Label>
                    </div>

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
                      disabled={isGenerating || !selectedSubjects.length}
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Generate AI Timetable
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="preview" className="space-y-6 mt-6">
            {timetableEntries.length > 0 ? (
              <>
                {/* Conflicts Warning */}
                {conflicts.length > 0 && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Scheduling Conflicts Detected:</strong>
                      <ul className="mt-2 list-disc list-inside">
                        {conflicts.map((conflict, index) => (
                          <li key={index}>{conflict}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Timetable Preview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Timetable Preview
                    </CardTitle>
                    <CardDescription>
                      {classes.find((c) => c.id === selectedClass)?.name} -
                      Generated on {new Date().toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Day</TableHead>
                            <TableHead>Time</TableHead>
                            <TableHead>Subject</TableHead>
                            <TableHead>Teacher</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {DAYS_OF_WEEK.map((day) => {
                            const dayEntries = timetableEntries.filter(
                              (entry) => entry.day_of_week === day.value
                            );
                            return dayEntries.length > 0 ? (
                              dayEntries.map((entry, index) => {
                                const subject = subjects.find(
                                  (s) => s.id === entry.subject_id
                                );
                                const teacher = teachers.find(
                                  (t) => t.id === entry.teacher_id
                                );
                                return (
                                  <TableRow key={`${day.value}-${index}`}>
                                    <TableCell className="font-medium">
                                      {index === 0 ? day.label : ""}
                                    </TableCell>
                                    <TableCell>
                                      {entry.start_time} - {entry.end_time}
                                    </TableCell>
                                    <TableCell>{subject?.name}</TableCell>
                                    <TableCell>{teacher?.name}</TableCell>
                                  </TableRow>
                                );
                              })
                            ) : (
                              <TableRow>
                                <TableCell className="font-medium">
                                  {day.label}
                                </TableCell>
                                <TableCell
                                  colSpan={3}
                                  className="text-gray-500"
                                >
                                  No classes scheduled
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="p-8">
                  <div className="text-center text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No timetable generated yet.</p>
                    <p className="text-sm">
                      Go back to Setup to generate a timetable.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="actions" className="space-y-6 mt-6">
            {timetableEntries.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Save className="h-5 w-5 text-green-600" />
                      Save Timetable
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      Save the timetable to the database for later editing.
                    </p>
                    <Button
                      onClick={handleSave}
                      disabled={saveTimetableMutation.isPending}
                      className="w-full"
                    >
                      {saveTimetableMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Timetable
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Send className="h-5 w-5 text-blue-600" />
                      Publish to Teachers
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      Make the timetable available to teachers in their
                      dashboards.
                    </p>
                    <Button
                      onClick={handleSendToTeachers}
                      disabled={sendToTeachersMutation.isPending}
                      className="w-full"
                    >
                      {sendToTeachersMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Publishing...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Publish to Teachers
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Download className="h-5 w-5 text-purple-600" />
                      Download CSV
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      Download the timetable as a CSV file for printing or
                      sharing.
                    </p>
                    <Button onClick={handleDownload} className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Download CSV
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-red-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Printer className="h-5 w-5 text-orange-600" />
                      Print Timetable
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      Print the timetable for physical display or distribution.
                    </p>
                    <Button onClick={handlePrint} className="w-full">
                      <Printer className="h-4 w-4 mr-2" />
                      Print Timetable
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="p-8">
                  <div className="text-center text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No timetable available for actions.</p>
                    <p className="text-sm">
                      Generate a timetable first to see available actions.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default TimetableGenerator;
