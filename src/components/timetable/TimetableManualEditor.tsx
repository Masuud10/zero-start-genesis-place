import React, { useState } from "react";
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
import { Edit, Save, X, Plus, Clock, GripVertical, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TimetableEntry {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  subject: string;
  teacher: string;
  room: string;
}

interface Subject {
  id: string;
  name: string;
  code: string;
}

interface Teacher {
  id: string;
  name: string;
  email: string;
}

interface TimetableManualEditorProps {
  entries: TimetableEntry[];
  onSave: (entries: TimetableEntry[]) => void;
  subjects: Subject[];
  teachers: Teacher[];
}

const TimetableManualEditor: React.FC<TimetableManualEditorProps> = ({
  entries: initialEntries,
  onSave,
  subjects,
  teachers,
}) => {
  const { toast } = useToast();
  const [entries, setEntries] = useState<TimetableEntry[]>(initialEntries);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draggedEntry, setDraggedEntry] = useState<TimetableEntry | null>(null);

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const timeSlots = [
    "08:00-08:40",
    "08:40-09:20",
    "09:20-10:00",
    "10:00-10:40",
    "11:00-11:40",
    "11:40-12:20",
    "12:20-13:00",
    "13:00-13:40",
    "14:00-14:40",
    "14:40-15:20",
  ];

  const addNewEntry = () => {
    const newEntry: TimetableEntry = {
      id: Date.now().toString(),
      day: "Monday",
      startTime: "08:00",
      endTime: "08:40",
      subject: "",
      teacher: "",
      room: "",
    };
    setEntries([...entries, newEntry]);
    setEditingId(newEntry.id);
  };

  const updateEntry = (
    id: string,
    field: keyof TimetableEntry,
    value: string
  ) => {
    setEntries(
      entries.map((entry) =>
        entry.id === id ? { ...entry, [field]: value } : entry
      )
    );
  };

  const deleteEntry = (id: string) => {
    setEntries(entries.filter((entry) => entry.id !== id));
    if (editingId === id) {
      setEditingId(null);
    }
  };

  const handleSave = () => {
    // Validate entries
    const invalidEntries = entries.filter(
      (entry) => !entry.subject || !entry.teacher || !entry.day
    );

    if (invalidEntries.length > 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields for all entries",
        variant: "destructive",
      });
      return;
    }

    onSave(entries);
    setEditingId(null);
    toast({
      title: "Saved",
      description: "Timetable changes saved successfully",
    });
  };

  const getEntriesForDay = (day: string) => {
    return entries
      .filter((entry) => entry.day === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  const handleDragStart = (e: React.DragEvent, entry: TimetableEntry) => {
    setDraggedEntry(entry);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (
    e: React.DragEvent,
    targetDay: string,
    targetTimeSlot: string
  ) => {
    e.preventDefault();
    if (!draggedEntry) return;

    const [startTime, endTime] = targetTimeSlot.split("-");

    setEntries(
      entries.map((entry) =>
        entry.id === draggedEntry.id
          ? { ...entry, day: targetDay, startTime, endTime }
          : entry
      )
    );

    setDraggedEntry(null);
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Timetable Editor</h3>
          <p className="text-sm text-muted-foreground">
            Manually edit timetable entries. Drag and drop entries to move them
            around.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={addNewEntry} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Entry
          </Button>
          <Button
            onClick={handleSave}
            size="sm"
            className="bg-green-600 hover:bg-green-700"
          >
            <Save className="h-4 w-4 mr-1" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Timetable Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {days.map((day) => (
          <Card key={day} className="min-h-[400px]">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-center">{day}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {timeSlots.map((timeSlot) => {
                const [startTime, endTime] = timeSlot.split("-");
                const entry = entries.find(
                  (e) =>
                    e.day === day &&
                    e.startTime === startTime &&
                    e.endTime === endTime
                );

                return (
                  <div
                    key={timeSlot}
                    className={`p-2 border rounded min-h-[60px] transition-colors ${
                      entry
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, day, timeSlot)}
                  >
                    {entry ? (
                      <div
                        draggable
                        onDragStart={(e) => handleDragStart(e, entry)}
                        className="cursor-move"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-600">
                            {timeSlot}
                          </span>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingId(entry.id)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteEntry(entry.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        {editingId === entry.id ? (
                          <div className="space-y-2">
                            <Select
                              value={entry.subject}
                              onValueChange={(value) =>
                                updateEntry(entry.id, "subject", value)
                              }
                            >
                              <SelectTrigger className="h-7 text-xs">
                                <SelectValue placeholder="Select subject" />
                              </SelectTrigger>
                              <SelectContent>
                                {subjects.map((subject) => (
                                  <SelectItem
                                    key={subject.id}
                                    value={subject.name}
                                  >
                                    {subject.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            <Select
                              value={entry.teacher}
                              onValueChange={(value) =>
                                updateEntry(entry.id, "teacher", value)
                              }
                            >
                              <SelectTrigger className="h-7 text-xs">
                                <SelectValue placeholder="Select teacher" />
                              </SelectTrigger>
                              <SelectContent>
                                {teachers.map((teacher) => (
                                  <SelectItem
                                    key={teacher.id}
                                    value={teacher.name}
                                  >
                                    {teacher.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            <Input
                              value={entry.room}
                              onChange={(e) =>
                                updateEntry(entry.id, "room", e.target.value)
                              }
                              placeholder="Room number"
                              className="h-7 text-xs"
                            />

                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                onClick={() => setEditingId(null)}
                                className="h-7 text-xs"
                              >
                                <Save className="h-3 w-3 mr-1" />
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingId(null)}
                                className="h-7 text-xs"
                              >
                                <X className="h-3 w-3 mr-1" />
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="font-medium text-sm">
                              {entry.subject}
                            </div>
                            <div className="text-xs text-gray-600">
                              {entry.teacher}
                            </div>
                            {entry.room && (
                              <div className="text-xs text-gray-500">
                                {entry.room}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center text-gray-400 text-xs py-2">
                        Drop here
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Floating Entries (not assigned to time slots) */}
      {entries.filter((entry) => !entry.day || !entry.startTime).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Unassigned Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {entries
                .filter((entry) => !entry.day || !entry.startTime)
                .map((entry) => (
                  <div
                    key={entry.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, entry)}
                    className="p-2 border rounded cursor-move bg-yellow-50"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm">
                        {entry.subject || "No subject"} -{" "}
                        {entry.teacher || "No teacher"}
                      </span>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingId(entry.id)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteEntry(entry.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TimetableManualEditor;
