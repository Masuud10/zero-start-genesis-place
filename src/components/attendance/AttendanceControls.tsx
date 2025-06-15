
import React from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

interface Class {
  id: string;
  name: string;
}

interface SessionOption {
    label: string;
    value: string;
}

interface AttendanceControlsProps {
  classes: Class[];
  selectedClass: string;
  onClassChange: (value: string) => void;
  selectedDate: string;
  onDateChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  session: string;
  onSessionChange: (value: string) => void;
  sessionOptions: SessionOption[];
  onMarkAllPresent: () => void;
  onSaveAttendance: () => void;
  loading: boolean;
  saving: boolean;
  academicInfoError: string | null;
  studentCount: number;
}

const AttendanceControls: React.FC<AttendanceControlsProps> = ({
  classes,
  selectedClass,
  onClassChange,
  selectedDate,
  onDateChange,
  session,
  onSessionChange,
  sessionOptions,
  onMarkAllPresent,
  onSaveAttendance,
  loading,
  saving,
  academicInfoError,
  studentCount,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-end gap-6 mb-6">
      <div className="w-full md:w-1/4">
        <label className="block mb-1">Class</label>
        <Select value={selectedClass} onValueChange={onClassChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select class" />
          </SelectTrigger>
          <SelectContent>
            {classes.map((cls) => (
              <SelectItem key={cls.id} value={cls.id}>
                {cls.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="w-full md:w-1/4">
        <label className="block mb-1">Date</label>
        <input
          type="date"
          value={selectedDate}
          onChange={onDateChange}
          className="h-10 px-2 rounded-md border border-input w-full"
        />
      </div>
      <div className="w-full md:w-1/4">
        <label className="block mb-1">Session</label>
        <Select value={session} onValueChange={onSessionChange}>
          <SelectTrigger>
            <SelectValue placeholder="Session" />
          </SelectTrigger>
          <SelectContent>
            {sessionOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="w-full md:w-1/4 flex gap-2">
        <Button variant="outline" type="button" onClick={onMarkAllPresent} disabled={loading || !selectedClass || studentCount === 0}>
          Mark All Present
        </Button>
        <Button onClick={onSaveAttendance} disabled={saving || !selectedClass || studentCount === 0 || !!academicInfoError}>
          {saving ? "Saving..." : "Save Attendance"}
        </Button>
      </div>
    </div>
  );
};

export default AttendanceControls;
