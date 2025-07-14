import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSchoolScopedData } from "@/hooks/useSchoolScopedData";
import {
  Calendar,
  Clock,
  MapPin,
  BookOpen,
  Loader2,
  AlertCircle,
  Filter,
  Download,
  Eye,
  Users,
  GraduationCap,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TimetableEntry {
  id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  room?: string;
  subject: {
    name: string;
    code?: string;
  };
  class: {
    name: string;
  };
  teacher: {
    name: string;
  };
}

const SchoolOwnerTimetableView: React.FC = () => {
  const { user } = useAuth();
  const { schoolId } = useSchoolScopedData();
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [selectedDay, setSelectedDay] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"all" | "by-class" | "by-day">(
    "all"
  );

  const {
    data: timetable,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["school-owner-timetable", schoolId, selectedClass, selectedDay],
    queryFn: async () => {
      if (!schoolId) return [];

      console.log("Fetching school timetable for school owner:", schoolId);

      let query = supabase
        .from("timetables")
        .select(
          `
          id,
          day_of_week,
          start_time,
          end_time,
          room,
          subjects!inner(name, code),
          classes!inner(name),
          profiles!inner(name)
        `
        )
        .eq("school_id", schoolId)
        .eq("is_published", true)
        .order("day_of_week")
        .order("start_time");

      if (selectedClass !== "all") {
        query = query.eq("class_id", selectedClass);
      }

      if (selectedDay !== "all") {
        query = query.eq("day_of_week", selectedDay);
      }

      const { data, error: timetableError } = await query;

      if (timetableError) {
        console.error("Error fetching timetable:", timetableError);
        throw timetableError;
      }

      return (
        data?.map((entry) => ({
          id: entry.id,
          day_of_week: entry.day_of_week,
          start_time: entry.start_time,
          end_time: entry.end_time,
          room: entry.room,
          subject: entry.subjects,
          class: entry.classes,
          teacher: entry.profiles,
        })) || []
      );
    },
    enabled: !!schoolId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const { data: classes } = useQuery({
    queryKey: ["school-classes", schoolId],
    queryFn: async () => {
      if (!schoolId) return [];

      const { data, error } = await supabase
        .from("classes")
        .select("id, name")
        .eq("school_id", schoolId)
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      return data || [];
    },
    enabled: !!schoolId,
  });

  const formatTime = (timeString: string) => {
    try {
      const time = new Date(`1970-01-01T${timeString}`);
      return time.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return timeString;
    }
  };

  const getCurrentDay = () => {
    const days = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    return days[new Date().getDay()];
  };

  const daysOfWeek = [
    { value: "monday", label: "Monday" },
    { value: "tuesday", label: "Tuesday" },
    { value: "wednesday", label: "Wednesday" },
    { value: "thursday", label: "Thursday" },
    { value: "friday", label: "Friday" },
    { value: "saturday", label: "Saturday" },
    { value: "sunday", label: "Sunday" },
  ];

  const handleExportTimetable = () => {
    // Implement export functionality
    console.log("Exporting school timetable...");
  };

  const groupedByDay =
    timetable?.reduce((acc, entry) => {
      const day = entry.day_of_week.toLowerCase();
      if (!acc[day]) acc[day] = [];
      acc[day].push(entry);
      return acc;
    }, {} as Record<string, typeof timetable>) || {};

  const groupedByClass =
    timetable?.reduce((acc, entry) => {
      const className = entry.class.name;
      if (!acc[className]) acc[className] = [];
      acc[className].push(entry);
      return acc;
    }, {} as Record<string, typeof timetable>) || {};

  if (error) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load timetable data. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
            <Calendar className="h-8 w-8 text-blue-600" />
            School Timetables
          </h1>
          <p className="text-muted-foreground mt-1">
            View all published timetables from your school
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setViewMode(
                viewMode === "all"
                  ? "by-class"
                  : viewMode === "by-class"
                  ? "by-day"
                  : "all"
              )
            }
          >
            {viewMode === "all"
              ? "By Class"
              : viewMode === "by-class"
              ? "By Day"
              : "All"}
          </Button>

          <Button variant="outline" size="sm" onClick={handleExportTimetable}>
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Entries</p>
                <p className="text-2xl font-bold">{timetable?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Classes</p>
                <p className="text-2xl font-bold">{classes?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Subjects</p>
                <p className="text-2xl font-bold">
                  {timetable
                    ? new Set(timetable.map((t) => t.subject.name)).size
                    : 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Teachers</p>
                <p className="text-2xl font-bold">
                  {timetable
                    ? new Set(timetable.map((t) => t.teacher.name)).size
                    : 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Class</label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {classes?.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Day</label>
              <Select value={selectedDay} onValueChange={setSelectedDay}>
                <SelectTrigger>
                  <SelectValue placeholder="All Days" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Days</SelectItem>
                  {daysOfWeek.map((day) => (
                    <SelectItem key={day.value} value={day.value}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timetable Display */}
      {isLoading ? (
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin mr-2" />
              <span>Loading timetables...</span>
            </div>
          </CardContent>
        </Card>
      ) : !timetable || timetable.length === 0 ? (
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No Timetables Found</h3>
              <p className="text-muted-foreground">
                No published timetables are available for your school.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : viewMode === "by-class" ? (
        // By Class View
        <div className="space-y-6">
          {Object.entries(groupedByClass).map(([className, entries]) => (
            <Card key={className}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {className}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Day</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Teacher</TableHead>
                      <TableHead>Room</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="font-medium">
                          {entry.day_of_week.charAt(0).toUpperCase() +
                            entry.day_of_week.slice(1)}
                        </TableCell>
                        <TableCell>
                          {formatTime(entry.start_time)} -{" "}
                          {formatTime(entry.end_time)}
                        </TableCell>
                        <TableCell>{entry.subject.name}</TableCell>
                        <TableCell>{entry.teacher.name}</TableCell>
                        <TableCell>{entry.room || "TBA"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : viewMode === "by-day" ? (
        // By Day View
        <div className="space-y-6">
          {daysOfWeek.map((day) => {
            const dayEntries = groupedByDay[day.value] || [];
            if (dayEntries.length === 0) return null;

            return (
              <Card key={day.value}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    {day.label}
                    {day.value === getCurrentDay() && (
                      <Badge variant="secondary">Today</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Teacher</TableHead>
                        <TableHead>Room</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dayEntries.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell className="font-medium">
                            {formatTime(entry.start_time)} -{" "}
                            {formatTime(entry.end_time)}
                          </TableCell>
                          <TableCell>{entry.class.name}</TableCell>
                          <TableCell>{entry.subject.name}</TableCell>
                          <TableCell>{entry.teacher.name}</TableCell>
                          <TableCell>{entry.room || "TBA"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        // All View
        <Card>
          <CardHeader>
            <CardTitle>Complete School Timetable</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Day</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Room</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {timetable.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">
                      {entry.day_of_week.charAt(0).toUpperCase() +
                        entry.day_of_week.slice(1)}
                    </TableCell>
                    <TableCell>
                      {formatTime(entry.start_time)} -{" "}
                      {formatTime(entry.end_time)}
                    </TableCell>
                    <TableCell>{entry.class.name}</TableCell>
                    <TableCell>{entry.subject.name}</TableCell>
                    <TableCell>{entry.teacher.name}</TableCell>
                    <TableCell>{entry.room || "TBA"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SchoolOwnerTimetableView;
