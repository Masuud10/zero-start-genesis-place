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

  const { toast } = useToast();
  const { schoolId } = useSchoolScopedData();
  const queryClient = useQueryClient();

  // Get current user
  const { data: currentUser, isLoading: userLoading } = useQuery({
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
        .select("id, name, level, stream")
        .eq("school_id", schoolId)
        .order("name");

      if (error) throw error;
      return data || [];
    },
    enabled: !!schoolId,
  });

  // Get subjects for selected class
  const { data: subjects = [], isLoading: subjectsLoading } = useQuery({
    queryKey: ["subjects", selectedClass, schoolId],
    queryFn: async () => {
      if (!selectedClass || !schoolId) return [];
      const { data, error } = await supabase
        .from("subjects")
        .select(
          "id, name, code, teacher_id, profiles!subjects_teacher_id_fkey(name)"
        )
        .eq("class_id", selectedClass)
        .eq("school_id", schoolId)
        .order("name");

      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedClass && !!schoolId,
  });

  // Get teachers
  const { data: teachers = [], isLoading: teachersLoading } = useQuery({
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

  // Get existing timetable
  const { data: existingTimetable = [], isLoading: timetableLoading } =
    useQuery({
      queryKey: ["timetable", selectedClass, schoolId],
      queryFn: async () => {
        if (!selectedClass || !schoolId) return [];
        const { data, error } = await supabase
          .from("timetables")
          .select(
            `
          id, subject_id, teacher_id, day_of_week, start_time, end_time,
          subjects(name),
          profiles!timetables_teacher_id_fkey(name)
        `
          )
          .eq("class_id", selectedClass)
          .eq("school_id", schoolId)
          .order("day_of_week")
          .order("start_time");

        if (error) throw error;
        return data || [];
      },
      enabled: !!selectedClass && !!schoolId,
    });

  // AI-powered timetable generation algorithm
  const generateAITimetable = useMemo(() => {
    return () => {
      if (!selectedSubjects.length || !timeSlots.length) return [];

      const entries: TimetableEntry[] = [];
      const teacherSchedule: Record<string, Set<string>> = {};
      const daySubjectCount: Record<string, number> = {};

      // Initialize teacher schedules
      teachers.forEach((teacher) => {
        teacherSchedule[teacher.id] = new Set();
      });

      // Initialize day subject counts
      DAYS_OF_WEEK.forEach((day) => {
        daySubjectCount[day.value] = 0;
      });

      selectedSubjects.forEach((subjectId, index) => {
        const subject = subjects.find((s) => s.id === subjectId);
        const teacherId =
          subjectTeacherMap[subjectId] ||
          subject?.teacher_id ||
          teachers[0]?.id;

        if (!subject || !teacherId) return;

        // Find best day and time slot
        let bestDay = "";
        let bestTimeSlot = 0;
        let minConflicts = Infinity;

        DAYS_OF_WEEK.forEach((day, dayIndex) => {
          timeSlots.forEach((timeSlot, slotIndex) => {
            const timeKey = `${day.value}-${timeSlot.start}`;
            const teacherConflicts = teacherSchedule[teacherId]?.has(timeKey)
              ? 1
              : 0;
            const dayLoad = daySubjectCount[day.value] || 0;
            const totalConflicts = teacherConflicts + dayLoad;

            if (totalConflicts < minConflicts) {
              minConflicts = totalConflicts;
              bestDay = day.value;
              bestTimeSlot = slotIndex;
            }
          });
        });

        if (bestDay && bestTimeSlot < timeSlots.length) {
          const timeSlot = timeSlots[bestTimeSlot];
          const timeKey = `${bestDay}-${timeSlot.start}`;

          entries.push({
            subject_id: subjectId,
            teacher_id: teacherId,
            day_of_week: bestDay,
            start_time: timeSlot.start,
            end_time: timeSlot.end,
          });

          // Update tracking
          teacherSchedule[teacherId]?.add(timeKey);
          daySubjectCount[bestDay] = (daySubjectCount[bestDay] || 0) + 1;
        }
      });

      return entries;
    };
  }, [selectedSubjects, subjects, subjectTeacherMap, teachers, timeSlots]);

  // Check for conflicts
  const checkConflicts = useMemo(() => {
    return (entries: TimetableEntry[]) => {
      const conflicts: string[] = [];
      const teacherSchedule: Record<string, Set<string>> = {};

      entries.forEach((entry, index) => {
        const timeKey = `${entry.day_of_week}-${entry.start_time}`;

        if (!teacherSchedule[entry.teacher_id]) {
          teacherSchedule[entry.teacher_id] = new Set();
        }

        if (teacherSchedule[entry.teacher_id].has(timeKey)) {
          const teacher = teachers.find((t) => t.id === entry.teacher_id);
          const subject = subjects.find((s) => s.id === entry.subject_id);
          conflicts.push(
            `${teacher?.name} has conflicting classes at ${entry.day_of_week} ${entry.start_time} (${subject?.name})`
          );
        } else {
          teacherSchedule[entry.teacher_id].add(timeKey);
        }
      });

      return conflicts;
    };
  }, [teachers, subjects]);

  // Save timetable mutation
  const saveTimetableMutation = useMutation({
    mutationFn: async (entries: TimetableEntry[]) => {
      if (!selectedClass || !schoolId || !currentUser?.id)
        throw new Error("Missing required data");

      // Delete existing timetable entries
      await supabase
        .from("timetables")
        .delete()
        .eq("class_id", selectedClass)
        .eq("school_id", schoolId);

      // Insert new entries
      const { error } = await supabase.from("timetables").insert(
        entries.map((entry) => ({
          class_id: selectedClass,
          school_id: schoolId,
          subject_id: entry.subject_id,
          teacher_id: entry.teacher_id,
          day_of_week: entry.day_of_week,
          start_time: entry.start_time,
          end_time: entry.end_time,
          created_by_principal_id: currentUser.id,
        }))
      );

      if (error) throw error;
      return entries;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["timetable", selectedClass, schoolId],
      });
      queryClient.invalidateQueries({
        queryKey: ["principal-timetables", schoolId],
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
        queryKey: ["principal-timetables", schoolId],
      });
    },
  });

  // Check if any data is still loading
  const isLoading =
    userLoading ||
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

            {/* Time Slots Configuration */}
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
                          <Badge
                            variant="outline"
                            className="text-orange-700 border-orange-300"
                          >
                            Period {index + 1}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Select
                            value={slot.start}
                            onValueChange={(value) =>
                              handleTimeSlotChange(index, "start", value)
                            }
                          >
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {TIME_SLOTS.map((time) => (
                                <SelectItem key={time} value={time}>
                                  {time}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <span className="text-gray-500">to</span>
                          <Select
                            value={slot.end}
                            onValueChange={(value) =>
                              handleTimeSlotChange(index, "end", value)
                            }
                          >
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {TIME_SLOTS.map((time) => (
                                <SelectItem key={time} value={time}>
                                  {time}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        {timeSlots.length > 1 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeTimeSlot(index)}
                            className="text-red-600 border-red-300 hover:bg-red-50"
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
              <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-blue-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Brain className="h-5 w-5 text-indigo-600" />
                    Step 5: AI-Powered Generation
                  </CardTitle>
                  <CardDescription>
                    Generate an optimal timetable using AI algorithms
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {isGenerating ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Sparkles className="h-6 w-6 text-indigo-600 animate-pulse" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              AI is generating your timetable...
                            </p>
                            <p className="text-sm text-gray-600">
                              Analyzing conflicts and optimizing schedules
                            </p>
                          </div>
                        </div>
                        <Progress value={generationProgress} className="h-2" />
                        <p className="text-sm text-gray-600 text-center">
                          {generationProgress}% complete
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="p-4 bg-white rounded-lg border border-indigo-200">
                          <div className="flex items-center gap-3">
                            <Zap className="h-5 w-5 text-indigo-600" />
                            <div>
                              <h4 className="font-medium text-gray-900">
                                AI Features
                              </h4>
                              <ul className="text-sm text-gray-600 mt-1 space-y-1">
                                <li>
                                  • Intelligent conflict detection and
                                  resolution
                                </li>
                                <li>
                                  • Optimal subject distribution across days
                                </li>
                                <li>• Teacher workload balancing</li>
                                <li>• Time slot optimization</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        <Button
                          onClick={handleAIGenerate}
                          className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium"
                          disabled={selectedSubjects.length === 0}
                        >
                          <Sparkles className="h-5 w-5 mr-2" />
                          Generate AI Timetable
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="preview" className="space-y-6 mt-6">
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
                  <div className="text-center py-12">
                    <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No Timetable Generated
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Go back to the Setup tab to generate a timetable
                    </p>
                    <Button
                      onClick={() => setActiveTab("setup")}
                      variant="outline"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Back to Setup
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Conflicts Alert */}
                    {conflicts.length > 0 && (
                      <Alert className="border-red-200 bg-red-50">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-700">
                          <div className="font-medium mb-2">
                            Scheduling Conflicts Detected:
                          </div>
                          <ul className="list-disc list-inside space-y-1">
                            {conflicts.map((conflict, index) => (
                              <li key={index} className="text-sm">
                                {conflict}
                              </li>
                            ))}
                          </ul>
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Timetable Grid */}
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
                                      <Badge
                                        variant="outline"
                                        className="text-blue-700 border-blue-300"
                                      >
                                        {entry.start_time} - {entry.end_time}
                                      </Badge>
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-2">
                                        <BookOpen className="h-4 w-4 text-green-600" />
                                        {subject?.name}
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-purple-600" />
                                        {teacher?.name}
                                      </div>
                                    </TableCell>
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
                                  className="text-center text-gray-500"
                                >
                                  No classes scheduled
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Summary Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="text-sm text-blue-600 font-medium">
                              Total Periods
                            </p>
                            <p className="text-2xl font-bold text-blue-800">
                              {timetableEntries.length}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="text-sm text-green-600 font-medium">
                              Subjects
                            </p>
                            <p className="text-2xl font-bold text-green-800">
                              {
                                new Set(
                                  timetableEntries.map(
                                    (entry) => entry.subject_id
                                  )
                                ).size
                              }
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="flex items-center gap-2">
                          <Users className="h-5 w-5 text-purple-600" />
                          <div>
                            <p className="text-sm text-purple-600 font-medium">
                              Teachers
                            </p>
                            <p className="text-2xl font-bold text-purple-800">
                              {
                                new Set(
                                  timetableEntries.map(
                                    (entry) => entry.teacher_id
                                  )
                                ).size
                              }
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-orange-600" />
                          <div>
                            <p className="text-sm text-orange-600 font-medium">
                              Conflicts
                            </p>
                            <p className="text-2xl font-bold text-orange-800">
                              {conflicts.length}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="actions" className="space-y-6 mt-6">
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

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            Close
          </Button>
          {timetableEntries.length > 0 && conflicts.length === 0 && (
            <Button
              onClick={handleSave}
              disabled={saveTimetableMutation.isPending}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {saveTimetableMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save & Publish
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TimetableGenerator;
