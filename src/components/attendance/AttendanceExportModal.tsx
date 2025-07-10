import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Download,
  FileText,
  FileSpreadsheet,
  Filter,
  Settings,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface AttendanceExportModalProps {
  open: boolean;
  onClose: () => void;
  onExport: (options: ExportOptions) => Promise<void>;
  classes: Array<{ id: string; name: string }>;
  selectedClass: string;
  loading?: boolean;
}

interface ExportOptions {
  format: "excel" | "pdf";
  dateRange: {
    startDate: string;
    endDate: string;
  };
  classes: string[];
  includeRemarks: boolean;
  includeSummary: boolean;
  includeCharts: boolean;
  statusFilter: string[];
  sessionFilter: string[];
  fileName: string;
}

const AttendanceExportModal: React.FC<AttendanceExportModalProps> = ({
  open,
  onClose,
  onExport,
  classes,
  selectedClass,
  loading = false,
}) => {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: "excel",
    dateRange: {
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date().toISOString().split("T")[0],
    },
    classes: selectedClass ? [selectedClass] : [],
    includeRemarks: true,
    includeSummary: true,
    includeCharts: false,
    statusFilter: ["present", "absent", "late", "excused"],
    sessionFilter: ["morning", "afternoon", "full_day"],
    fileName: `attendance_export_${new Date().toISOString().split("T")[0]}`,
  });

  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const validateOptions = (): boolean => {
    const errors: string[] = [];

    if (exportOptions.classes.length === 0) {
      errors.push("Please select at least one class");
    }

    if (
      !exportOptions.dateRange.startDate ||
      !exportOptions.dateRange.endDate
    ) {
      errors.push("Please select both start and end dates");
    }

    if (
      new Date(exportOptions.dateRange.startDate) >
      new Date(exportOptions.dateRange.endDate)
    ) {
      errors.push("Start date cannot be after end date");
    }

    if (exportOptions.statusFilter.length === 0) {
      errors.push("Please select at least one attendance status");
    }

    if (exportOptions.sessionFilter.length === 0) {
      errors.push("Please select at least one session");
    }

    if (!exportOptions.fileName.trim()) {
      errors.push("Please enter a file name");
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleExport = async () => {
    if (!validateOptions()) {
      return;
    }

    try {
      await onExport(exportOptions);
      onClose();
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  const updateOption = <K extends keyof ExportOptions>(
    key: K,
    value: ExportOptions[K]
  ) => {
    setExportOptions((prev) => ({ ...prev, [key]: value }));
  };

  const updateDateRange = (field: "startDate" | "endDate", value: string) => {
    setExportOptions((prev) => ({
      ...prev,
      dateRange: { ...prev.dateRange, [field]: value },
    }));
  };

  const toggleStatusFilter = (status: string) => {
    setExportOptions((prev) => ({
      ...prev,
      statusFilter: prev.statusFilter.includes(status)
        ? prev.statusFilter.filter((s) => s !== status)
        : [...prev.statusFilter, status],
    }));
  };

  const toggleSessionFilter = (session: string) => {
    setExportOptions((prev) => ({
      ...prev,
      sessionFilter: prev.sessionFilter.includes(session)
        ? prev.sessionFilter.filter((s) => s !== session)
        : [...prev.sessionFilter, session],
    }));
  };

  const toggleClass = (classId: string) => {
    setExportOptions((prev) => ({
      ...prev,
      classes: prev.classes.includes(classId)
        ? prev.classes.filter((c) => c !== classId)
        : [...prev.classes, classId],
    }));
  };

  const selectAllClasses = () => {
    setExportOptions((prev) => ({
      ...prev,
      classes: classes.map((c) => c.id),
    }));
  };

  const clearAllClasses = () => {
    setExportOptions((prev) => ({
      ...prev,
      classes: [],
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Attendance Data
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="font-medium text-red-800">
                    Please fix the following errors:
                  </span>
                </div>
                <ul className="list-disc list-inside space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index} className="text-red-700 text-sm">
                      {error}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Export Format */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5" />
                Export Format
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    exportOptions.format === "excel"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => updateOption("format", "excel")}
                >
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="h-8 w-8 text-blue-600" />
                    <div>
                      <h3 className="font-medium">Excel (CSV)</h3>
                      <p className="text-sm text-gray-600">
                        Spreadsheet format for data analysis
                      </p>
                    </div>
                  </div>
                </div>
                <div
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    exportOptions.format === "pdf"
                      ? "border-red-500 bg-red-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => updateOption("format", "pdf")}
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-red-600" />
                    <div>
                      <h3 className="font-medium">PDF Report</h3>
                      <p className="text-sm text-gray-600">
                        Professional report format
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Date Range */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5" />
                Date Range
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={exportOptions.dateRange.startDate}
                    onChange={(e) =>
                      updateDateRange("startDate", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={exportOptions.dateRange.endDate}
                    onChange={(e) => updateDateRange("endDate", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Class Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Settings className="h-5 w-5" />
                Class Selection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Button variant="outline" size="sm" onClick={selectAllClasses}>
                  Select All
                </Button>
                <Button variant="outline" size="sm" onClick={clearAllClasses}>
                  Clear All
                </Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {classes.map((cls) => (
                  <div
                    key={cls.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      exportOptions.classes.includes(cls.id)
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => toggleClass(cls.id)}
                  >
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={exportOptions.classes.includes(cls.id)}
                        onChange={() => toggleClass(cls.id)}
                      />
                      <span className="text-sm font-medium">{cls.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Status Filter */}
              <div>
                <Label className="text-sm font-medium">Attendance Status</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                  {[
                    {
                      value: "present",
                      label: "Present",
                      color: "bg-green-100 text-green-800",
                    },
                    {
                      value: "absent",
                      label: "Absent",
                      color: "bg-red-100 text-red-800",
                    },
                    {
                      value: "late",
                      label: "Late",
                      color: "bg-yellow-100 text-yellow-800",
                    },
                    {
                      value: "excused",
                      label: "Excused",
                      color: "bg-blue-100 text-blue-800",
                    },
                  ].map((status) => (
                    <div
                      key={status.value}
                      className={`p-2 border rounded-lg cursor-pointer transition-all ${
                        exportOptions.statusFilter.includes(status.value)
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => toggleStatusFilter(status.value)}
                    >
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={exportOptions.statusFilter.includes(
                            status.value
                          )}
                          onChange={() => toggleStatusFilter(status.value)}
                        />
                        <Badge className={status.color}>{status.label}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Session Filter */}
              <div>
                <Label className="text-sm font-medium">Session</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {[
                    { value: "morning", label: "Morning" },
                    { value: "afternoon", label: "Afternoon" },
                    { value: "full_day", label: "Full Day" },
                  ].map((session) => (
                    <div
                      key={session.value}
                      className={`p-2 border rounded-lg cursor-pointer transition-all ${
                        exportOptions.sessionFilter.includes(session.value)
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => toggleSessionFilter(session.value)}
                    >
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={exportOptions.sessionFilter.includes(
                            session.value
                          )}
                          onChange={() => toggleSessionFilter(session.value)}
                        />
                        <span className="text-sm">{session.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Export Options */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Settings className="h-5 w-5" />
                Export Options
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="fileName">File Name</Label>
                <Input
                  id="fileName"
                  value={exportOptions.fileName}
                  onChange={(e) => updateOption("fileName", e.target.value)}
                  placeholder="Enter file name"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeRemarks"
                    checked={exportOptions.includeRemarks}
                    onCheckedChange={(checked) =>
                      updateOption("includeRemarks", checked as boolean)
                    }
                  />
                  <Label htmlFor="includeRemarks">
                    Include student remarks
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeSummary"
                    checked={exportOptions.includeSummary}
                    onCheckedChange={(checked) =>
                      updateOption("includeSummary", checked as boolean)
                    }
                  />
                  <Label htmlFor="includeSummary">
                    Include summary statistics
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeCharts"
                    checked={exportOptions.includeCharts}
                    onCheckedChange={(checked) =>
                      updateOption("includeCharts", checked as boolean)
                    }
                  />
                  <Label htmlFor="includeCharts">
                    Include charts (PDF only)
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleExport}
              disabled={loading || validationErrors.length > 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AttendanceExportModal;
