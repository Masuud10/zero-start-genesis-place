import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Edit,
  Save,
  Download,
  Eye,
  Send,
  CheckCircle,
  AlertCircle,
  FileText,
  Printer,
} from "lucide-react";

interface TimetableEntry {
  id?: string;
  subject_id: string;
  teacher_id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  room?: string;
}

interface TimetableData {
  id: string;
  class_id: string;
  class_name: string;
  is_published: boolean;
  created_at: string;
  entries: TimetableEntry[];
}

interface EnhancedTimetableGeneratorProps {
  open?: boolean;
  onClose?: () => void;
  onTimetableGenerated?: () => void;
}

const DAYS_OF_WEEK = [
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
];

const TIME_SLOTS = [
  "08:00",
  "08:40",
  "09:20",
  "10:00",
  "10:40",
  "11:20",
  "12:00",
  "12:40",
  "13:20",
  "14:00",
  "14:40",
  "15:20",
  "16:00",
  "16:40",
];

const EnhancedTimetableGenerator: React.FC<EnhancedTimetableGeneratorProps> = ({
  open = false,
  onClose,
  onTimetableGenerated,
}) => {
  const [selectedClass, setSelectedClass] = useState("");
  const [timetableEntries, setTimetableEntries] = useState<TimetableEntry[]>(
    []
  );
  const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null);
  const [activeTab, setActiveTab] = useState("generator");
  const [isPublishing, setIsPublishing] = useState(false);

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

  // Get existing timetable
  const { data: existingTimetable = [] } = useQuery({
    queryKey: ["timetable", selectedClass, schoolId],
    queryFn: async () => {
      if (!selectedClass || !schoolId) return [];
      const { data, error } = await supabase
        .from("timetables")
        .select(
          `
          id, subject_id, teacher_id, day_of_week, start_time, end_time, room,
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

  // Get all timetables for list view
  const { data: allTimetables = [] } = useQuery({
    queryKey: ["all-timetables", schoolId],
    queryFn: async () => {
      if (!schoolId) return [];
      const { data, error } = await supabase
        .from("timetables")
        .select(
          `
          id, class_id, is_published, created_at,
          classes(name)
        `
        )
        .eq("school_id", schoolId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Group by class and get unique timetables
      const grouped = data?.reduce((acc: any, item: any) => {
        if (!acc[item.class_id]) {
          acc[item.class_id] = {
            id: item.id,
            class_id: item.class_id,
            class_name: item.classes?.name,
            is_published: item.is_published,
            created_at: item.created_at,
          };
        }
        return acc;
      }, {});

      return Object.values(grouped || {});
    },
    enabled: !!schoolId,
  });

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
      const timetableData = entries.map((entry) => ({
        school_id: schoolId,
        class_id: selectedClass,
        subject_id: entry.subject_id,
        teacher_id: entry.teacher_id,
        day_of_week: entry.day_of_week,
        start_time: entry.start_time,
        end_time: entry.end_time,
        room: entry.room || null,
        created_by_principal_id: currentUser.id,
        is_published: false,
      }));

      const { error } = await supabase.from("timetables").insert(timetableData);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Timetable Saved",
        description:
          "Timetable has been saved successfully. You can now publish it.",
      });
      queryClient.invalidateQueries({ queryKey: ["timetable"] });
      queryClient.invalidateQueries({ queryKey: ["all-timetables"] });
      onTimetableGenerated?.();
    },
    onError: (error: any) => {
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save timetable.",
        variant: "destructive",
      });
    },
  });

  // Publish timetable mutation
  const publishTimetableMutation = useMutation({
    mutationFn: async () => {
      if (!selectedClass || !schoolId) throw new Error("Missing required data");

      const { error } = await supabase
        .from("timetables")
        .update({ is_published: true })
        .eq("class_id", selectedClass)
        .eq("school_id", schoolId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Timetable Published",
        description: "Timetable has been published to teacher dashboards.",
      });
      queryClient.invalidateQueries({ queryKey: ["timetable"] });
      queryClient.invalidateQueries({ queryKey: ["all-timetables"] });
      setIsPublishing(false);
    },
    onError: (error: any) => {
      toast({
        title: "Publish Failed",
        description: error.message || "Failed to publish timetable.",
        variant: "destructive",
      });
      setIsPublishing(false);
    },
  });

  const addTimetableEntry = () => {
    const newEntry: TimetableEntry = {
      subject_id: "",
      teacher_id: "",
      day_of_week: "monday",
      start_time: "08:00",
      end_time: "08:40",
      room: "",
    };
    setTimetableEntries([...timetableEntries, newEntry]);
    setEditingEntry(newEntry);
  };

  const updateTimetableEntry = (
    index: number,
    field: keyof TimetableEntry,
    value: string
  ) => {
    const updatedEntries = [...timetableEntries];
    updatedEntries[index] = { ...updatedEntries[index], [field]: value };
    setTimetableEntries(updatedEntries);
  };

  const removeTimetableEntry = (index: number) => {
    setTimetableEntries(timetableEntries.filter((_, i) => i !== index));
  };

  const handleAutoGenerate = () => {
    if (!subjects.length || !teachers.length) {
      toast({
        title: "Cannot Auto-Generate",
        description:
          "Please ensure there are subjects and teachers assigned to this class.",
        variant: "destructive",
      });
      return;
    }

    const generatedEntries: TimetableEntry[] = [];
    let subjectIndex = 0;
    let teacherIndex = 0;

    DAYS_OF_WEEK.forEach((day) => {
      TIME_SLOTS.slice(0, 8).forEach((startTime, timeIndex) => {
        if (subjectIndex < subjects.length) {
          const endTime = TIME_SLOTS[timeIndex + 1] || "16:40";
          generatedEntries.push({
            subject_id: subjects[subjectIndex].id,
            teacher_id: teachers[teacherIndex % teachers.length].id,
            day_of_week: day.value,
            start_time: startTime,
            end_time: endTime,
            room: `Room ${Math.floor(Math.random() * 10) + 1}`,
          });
          subjectIndex++;
          teacherIndex++;
        }
      });
    });

    setTimetableEntries(generatedEntries);
    toast({
      title: "Auto-Generated",
      description: `Generated ${generatedEntries.length} timetable entries.`,
    });
  };

  const handleSave = () => {
    if (!timetableEntries.length) {
      toast({
        title: "No Entries",
        description: "Please add at least one timetable entry.",
        variant: "destructive",
      });
      return;
    }

    const invalidEntries = timetableEntries.filter(
      (entry) => !entry.subject_id || !entry.teacher_id || !entry.day_of_week
    );

    if (invalidEntries.length > 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields for all entries.",
        variant: "destructive",
      });
      return;
    }

    saveTimetableMutation.mutate(timetableEntries);
  };

  const handlePublish = () => {
    setIsPublishing(true);
    publishTimetableMutation.mutate();
  };

  const handleDownload = () => {
    // Generate CSV content
    let csvContent = "Day,Start Time,End Time,Subject,Teacher,Room\n";

    timetableEntries.forEach((entry) => {
      const subject = subjects.find((s) => s.id === entry.subject_id);
      const teacher = teachers.find((t) => t.id === entry.teacher_id);
      const day = DAYS_OF_WEEK.find((d) => d.value === entry.day_of_week);

      csvContent += `${day?.label},${entry.start_time},${entry.end_time},${
        subject?.name || ""
      },${teacher?.name || ""},${entry.room || ""}\n`;
    });

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `timetable_${selectedClass}_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Downloaded",
      description: "Timetable has been downloaded as CSV.",
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleClose = () => {
    setSelectedClass("");
    setTimetableEntries([]);
    setEditingEntry(null);
    setActiveTab("generator");
    onClose?.();
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
        room: item.room || "",
      }));
      setTimetableEntries(entries);
    } else {
      setTimetableEntries([]);
    }
  }, [existingTimetable]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Enhanced Timetable Generator
          </DialogTitle>
          <DialogDescription>
            Create, edit, and manage timetables for all classes. Support manual
            editing and publishing to teacher dashboards.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="generator">Generator</TabsTrigger>
            <TabsTrigger value="editor">Manual Editor</TabsTrigger>
            <TabsTrigger value="list">Timetable List</TabsTrigger>
          </TabsList>

          <TabsContent value="generator" className="space-y-6">
            {/* Class Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Class Selection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="class-select">Select Class</Label>
                    <Select
                      value={selectedClass}
                      onValueChange={setSelectedClass}
                    >
                      <SelectTrigger id="class-select">
                        <SelectValue placeholder="Choose a class" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id}>
                            {cls.name} - {cls.level} {cls.stream}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedClass && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Available Subjects</Label>
                        <div className="text-sm text-muted-foreground">
                          {subjects.length} subjects assigned
                        </div>
                      </div>
                      <div>
                        <Label>Available Teachers</Label>
                        <div className="text-sm text-muted-foreground">
                          {teachers.length} teachers available
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Timetable Entries */}
            {selectedClass && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Timetable Entries
                    </span>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleAutoGenerate}
                        variant="outline"
                        size="sm"
                      >
                        Auto-Generate
                      </Button>
                      <Button onClick={addTimetableEntry} size="sm">
                        <Plus className="h-4 w-4 mr-1" />
                        Add Entry
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {timetableEntries.map((entry, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-6 gap-2 p-3 border rounded-lg"
                      >
                        <Select
                          value={entry.day_of_week}
                          onValueChange={(value) =>
                            updateTimetableEntry(index, "day_of_week", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {DAYS_OF_WEEK.map((day) => (
                              <SelectItem key={day.value} value={day.value}>
                                {day.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Input
                          value={entry.start_time}
                          onChange={(e) =>
                            updateTimetableEntry(
                              index,
                              "start_time",
                              e.target.value
                            )
                          }
                          placeholder="08:00"
                          type="time"
                        />

                        <Input
                          value={entry.end_time}
                          onChange={(e) =>
                            updateTimetableEntry(
                              index,
                              "end_time",
                              e.target.value
                            )
                          }
                          placeholder="08:40"
                          type="time"
                        />

                        <Select
                          value={entry.subject_id}
                          onValueChange={(value) =>
                            updateTimetableEntry(index, "subject_id", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Subject" />
                          </SelectTrigger>
                          <SelectContent>
                            {subjects.map((subject) => (
                              <SelectItem key={subject.id} value={subject.id}>
                                {subject.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Select
                          value={entry.teacher_id}
                          onValueChange={(value) =>
                            updateTimetableEntry(index, "teacher_id", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Teacher" />
                          </SelectTrigger>
                          <SelectContent>
                            {teachers.map((teacher) => (
                              <SelectItem key={teacher.id} value={teacher.id}>
                                {teacher.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <div className="flex gap-1">
                          <Input
                            value={entry.room || ""}
                            onChange={(e) =>
                              updateTimetableEntry(
                                index,
                                "room",
                                e.target.value
                              )
                            }
                            placeholder="Room"
                            className="flex-1"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeTimetableEntry(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}

                    {timetableEntries.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No timetable entries yet. Add entries manually or use
                        auto-generate.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            {selectedClass && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSave}
                        disabled={saveTimetableMutation.isPending}
                      >
                        {saveTimetableMutation.isPending ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        Save Timetable
                      </Button>
                      <Button
                        onClick={handlePublish}
                        disabled={isPublishing || !timetableEntries.length}
                        variant="outline"
                      >
                        {isPublishing ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4 mr-2" />
                        )}
                        Publish to Teachers
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleDownload}
                        variant="outline"
                        size="sm"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download CSV
                      </Button>
                      <Button onClick={handlePrint} variant="outline" size="sm">
                        <Printer className="h-4 w-4 mr-2" />
                        Print
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="editor" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  Manual Timetable Editor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  Manual editor component will be implemented here.
                  <br />
                  This will allow drag-and-drop editing of timetable entries.
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="list" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Generated Timetables
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Class</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allTimetables.map((timetable: any) => (
                      <TableRow key={timetable.id}>
                        <TableCell className="font-medium">
                          {timetable.class_name}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              timetable.is_published ? "default" : "secondary"
                            }
                          >
                            {timetable.is_published ? (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Published
                              </>
                            ) : (
                              <>
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Draft
                              </>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(timetable.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                            <Button size="sm" variant="outline">
                              <Download className="h-3 w-3 mr-1" />
                              Download
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {allTimetables.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="text-center py-8 text-muted-foreground"
                        >
                          No timetables generated yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedTimetableGenerator;
