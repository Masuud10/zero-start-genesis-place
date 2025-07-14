import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSchoolScopedData } from "@/hooks/useSchoolScopedData";
import TimetableFilter from "./TimetableFilter";
import {
  Calendar,
  Clock,
  MapPin,
  BookOpen,
  Loader2,
  AlertCircle,
  Filter,
} from "lucide-react";

interface TimetableEntry {
  id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  subject: {
    name: string;
    code?: string;
  };
  class: {
    name: string;
  };
  room?: string;
}

const CompactTeacherTimetable: React.FC = () => {
  const { user } = useAuth();
  const { schoolId } = useSchoolScopedData();
  const [filterActive, setFilterActive] = useState(false);
  const [filters, setFilters] = useState<{
    day?: string;
    subject?: string;
    class?: string;
  }>({});
  const [selectedDay, setSelectedDay] = useState<string>("all");

  const {
    data: timetable,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["teacher-timetable", user?.id, schoolId],
    queryFn: async () => {
      if (!user?.id || !schoolId) return [];

      console.log("Fetching teacher timetable for:", user.id);

      let attempts = 0;
      const maxAttempts = 3;

      while (attempts < maxAttempts) {
        try {
          const { data, error: timetableError } = await supabase
            .from("timetables")
            .select(
              `
              id,
              day_of_week,
              start_time,
              end_time,
              room,
              subjects!inner(name, code),
              classes!inner(name)
            `
            )
            .eq("teacher_id", user.id)
            .eq("school_id", schoolId)
            .eq("is_published", true)
            .not("day_of_week", "is", null)
            .not("start_time", "is", null)
            .order("day_of_week")
            .order("start_time");

          if (timetableError) {
            console.error("Error fetching timetable:", timetableError);
            throw timetableError;
          }

          const result =
            data?.map((entry) => ({
              id: entry.id,
              day_of_week: entry.day_of_week,
              start_time: entry.start_time,
              end_time: entry.end_time,
              room: entry.room,
              subject: entry.subjects,
              class: entry.classes,
            })) || [];

          // Add warning if no timetable entries found
          if (result.length === 0) {
            console.warn("⚠️ No timetable entries found for teacher");
          }

          return result;
        } catch (error) {
          attempts++;
          console.error(
            `Error in CompactTeacherTimetable (attempt ${attempts}/${maxAttempts}):`,
            error
          );

          // If this is the last attempt, throw the error
          if (attempts >= maxAttempts) {
            throw error;
          }

          // Wait before retrying (exponential backoff)
          await new Promise((resolve) =>
            setTimeout(resolve, Math.pow(2, attempts) * 1000)
          );
        }
      }

      // This should never be reached, but TypeScript requires it
      throw new Error(
        "Failed to fetch teacher timetable after all retry attempts"
      );
    },
    enabled: !!user?.id && !!schoolId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 1, // Let our custom retry logic handle it
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

  const getDayName = (day: string) => {
    const days: { [key: string]: string } = {
      monday: "Mon",
      tuesday: "Tue",
      wednesday: "Wed",
      thursday: "Thu",
      friday: "Fri",
      saturday: "Sat",
      sunday: "Sun",
    };
    return days[day.toLowerCase()] || day;
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

  // Get unique subjects and classes for filter
  const uniqueSubjects = React.useMemo(() => {
    if (!timetable) return [];
    const subjects = timetable.map((entry) => ({
      id: entry.subject.name,
      name: entry.subject.name,
    }));
    return subjects.filter(
      (subject, index, self) =>
        index === self.findIndex((s) => s.id === subject.id)
    );
  }, [timetable]);

  const uniqueClasses = React.useMemo(() => {
    if (!timetable) return [];
    const classes = timetable.map((entry) => ({
      id: entry.class.name,
      name: entry.class.name,
    }));
    return classes.filter(
      (cls, index, self) => index === self.findIndex((c) => c.id === cls.id)
    );
  }, [timetable]);

  // Apply filters to timetable
  const filteredTimetable = React.useMemo(() => {
    if (!timetable) return [];
    return timetable.filter((entry) => {
      const matchesDay =
        !filters.day ||
        entry.day_of_week.toLowerCase() === filters.day.toLowerCase();
      const matchesSubject =
        !filters.subject || entry.subject.name === filters.subject;
      const matchesClass = !filters.class || entry.class.name === filters.class;
      return matchesDay && matchesSubject && matchesClass;
    });
  }, [timetable, filters]);

  // Apply day filter
  const dayFilteredTimetable = React.useMemo(() => {
    if (selectedDay === "all") return filteredTimetable;
    return filteredTimetable.filter(
      (entry) => entry.day_of_week.toLowerCase() === selectedDay.toLowerCase()
    );
  }, [filteredTimetable, selectedDay]);

  const todaySchedule =
    filteredTimetable?.filter(
      (entry) => entry.day_of_week.toLowerCase() === getCurrentDay()
    ) || [];

  const handleFilterChange = (newFilters: {
    day?: string;
    subject?: string;
    class?: string;
  }) => {
    setFilters(newFilters);
  };

  const handleDaySelect = (day: string) => {
    setSelectedDay(day);
  };

  const days = [
    { value: "all", label: "All Days", count: filteredTimetable.length },
    {
      value: "monday",
      label: "Monday",
      count: filteredTimetable.filter(
        (e) => e.day_of_week.toLowerCase() === "monday"
      ).length,
    },
    {
      value: "tuesday",
      label: "Tuesday",
      count: filteredTimetable.filter(
        (e) => e.day_of_week.toLowerCase() === "tuesday"
      ).length,
    },
    {
      value: "wednesday",
      label: "Wednesday",
      count: filteredTimetable.filter(
        (e) => e.day_of_week.toLowerCase() === "wednesday"
      ).length,
    },
    {
      value: "thursday",
      label: "Thursday",
      count: filteredTimetable.filter(
        (e) => e.day_of_week.toLowerCase() === "thursday"
      ).length,
    },
    {
      value: "friday",
      label: "Friday",
      count: filteredTimetable.filter(
        (e) => e.day_of_week.toLowerCase() === "friday"
      ).length,
    },
  ];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            My Timetable
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              <span className="text-gray-600">Loading timetable...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    console.error("Timetable error:", error);
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            My Timetable
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-red-600">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              <p>Unable to load timetable</p>
              {process.env.NODE_ENV === "development" && (
                <p className="text-xs mt-1 text-gray-500">
                  {error instanceof Error ? error.message : "Unknown error"}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!timetable || timetable.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            My Timetable
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium">No Timetable Available</p>
            <p className="text-sm mt-1">
              Your teaching timetable hasn't been published yet.
            </p>
            <p className="text-sm text-blue-600 mt-2">
              Contact your administrator for timetable setup.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            My Timetable
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {filteredTimetable.length} Scheduled Classes
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilterActive(!filterActive)}
              className="text-xs"
            >
              <Filter className="h-3 w-3 mr-1" />
              {filterActive ? "Hide Filters" : "Show Filters"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Timetable Filter */}
        <TimetableFilter
          onFilterChange={handleFilterChange}
          subjects={uniqueSubjects}
          classes={uniqueClasses}
          isActive={filterActive}
        />

        {/* Day Filter Tabs */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {days.map((day) => (
              <Button
                key={day.value}
                variant={selectedDay === day.value ? "default" : "outline"}
                size="sm"
                onClick={() => handleDaySelect(day.value)}
                className="text-xs"
              >
                {day.label}
                {day.count > 0 && (
                  <Badge
                    variant={
                      selectedDay === day.value ? "secondary" : "default"
                    }
                    className="ml-2 text-xs"
                  >
                    {day.count}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </div>

        {/* Today's Schedule Highlight */}
        {todaySchedule.length > 0 && selectedDay === "all" && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-blue-600" />
              <h3 className="font-semibold text-blue-900">Today's Schedule</h3>
              <Badge variant="default" className="bg-blue-600 text-xs">
                {todaySchedule.length}{" "}
                {todaySchedule.length === 1 ? "Class" : "Classes"}
              </Badge>
            </div>
            <div className="space-y-2">
              {todaySchedule.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-2 bg-white border rounded text-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-blue-600 font-medium">
                      {formatTime(entry.start_time)} -{" "}
                      {formatTime(entry.end_time)}
                    </div>
                    <div>
                      <span className="font-medium">{entry.subject.name}</span>
                      <span className="text-gray-500 ml-1">
                        • {entry.class.name}
                      </span>
                    </div>
                  </div>
                  {entry.room && (
                    <Badge
                      variant="outline"
                      className="text-xs flex items-center gap-1"
                    >
                      <MapPin className="h-3 w-3" />
                      {entry.room}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timetable Display */}
        <div className="space-y-4">
          {selectedDay === "all" ? (
            // Weekly Overview
            <>
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Weekly Schedule
              </h3>

              {["monday", "tuesday", "wednesday", "thursday", "friday"].map(
                (day) => {
                  const daySchedule = filteredTimetable.filter(
                    (entry) => entry.day_of_week.toLowerCase() === day
                  );

                  if (daySchedule.length === 0) return null;

                  return (
                    <div key={day} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900 capitalize">
                          {day}
                        </h4>
                        <Badge variant="secondary" className="text-xs">
                          {daySchedule.length}{" "}
                          {daySchedule.length === 1 ? "Class" : "Classes"}
                        </Badge>
                      </div>
                      <div className="grid gap-2">
                        {daySchedule.map((entry) => (
                          <div
                            key={entry.id}
                            className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-gray-600 font-mono text-xs">
                                {formatTime(entry.start_time)}
                              </span>
                              <span className="font-medium">
                                {entry.subject.name}
                              </span>
                              <span className="text-gray-500">
                                ({entry.class.name})
                              </span>
                            </div>
                            {entry.room && (
                              <span className="text-gray-500 text-xs">
                                {entry.room}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
              )}
            </>
          ) : (
            // Single Day View
            <>
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                {days.find((d) => d.value === selectedDay)?.label} Schedule
              </h3>

              {dayFilteredTimetable.length > 0 ? (
                <div className="space-y-3">
                  {dayFilteredTimetable.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between p-3 bg-gray-50 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-blue-600 font-medium text-sm">
                          {formatTime(entry.start_time)} -{" "}
                          {formatTime(entry.end_time)}
                        </div>
                        <div>
                          <span className="font-medium">
                            {entry.subject.name}
                          </span>
                          <span className="text-gray-500 ml-2">
                            • {entry.class.name}
                          </span>
                        </div>
                      </div>
                      {entry.room && (
                        <Badge
                          variant="outline"
                          className="text-xs flex items-center gap-1"
                        >
                          <MapPin className="h-3 w-3" />
                          {entry.room}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>
                    No classes scheduled for{" "}
                    {days.find((d) => d.value === selectedDay)?.label}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Summary */}
        <div className="mt-6 pt-4 border-t bg-gray-50 -m-4 p-4 rounded-b-lg">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <span className="text-gray-700">
                <strong>{dayFilteredTimetable.length}</strong>{" "}
                {selectedDay !== "all"
                  ? `${
                      days.find((d) => d.value === selectedDay)?.label
                    } Classes`
                  : "Total Classes"}
              </span>
              {selectedDay === "all" && (
                <span className="text-gray-700">
                  <strong>{todaySchedule.length}</strong> Today
                </span>
              )}
            </div>
            <Badge variant="default">Published Schedule</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompactTeacherTimetable;
