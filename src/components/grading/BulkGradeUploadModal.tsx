
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";

interface StudentRow {
  student_id: string;
  name: string;
  score: number;
}

interface BulkGradeUploadModalProps {
  classId: string;
  subjectId: string;
  term: string;
  examType: string;
  maxScore: number;
  students: { id: string; name: string }[];
  open: boolean;
  onClose: () => void;
}

const BulkGradeUploadModal: React.FC<BulkGradeUploadModalProps> = ({
  classId,
  subjectId,
  term,
  examType,
  maxScore,
  students,
  open,
  onClose,
}) => {
  const [parsedRows, setParsedRows] = useState<StudentRow[]>([]);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  // Parse Excel file to rows: expects headers: student_id, name, score
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result as string;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsName = wb.SheetNames[0];
      const ws = wb.Sheets[wsName];
      const data: any[] = XLSX.utils.sheet_to_json(ws, { defval: "" });

      // Validate
      const validRows = data.filter(
        (row) =>
          row.student_id &&
          students.find((stu) => stu.id === row.student_id) &&
          typeof row.score === "number"
      );
      setParsedRows(validRows as StudentRow[]);
      if (!validRows.length) {
        toast({
          title: "No valid rows found",
          description: "Check the template. Make sure there are columns: student_id, name, score.",
          variant: "destructive",
        });
      }
    };
    reader.readAsBinaryString(file);
  };

  // Download Excel template
  const handleDownloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet(
      students.map((s) => ({
        student_id: s.id,
        name: s.name,
        score: 0,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "GradesTemplate");
    XLSX.writeFile(wb, "grades_template.xlsx");
  };

  // Calculate
  const total = parsedRows.reduce((sum, r) => sum + Number(r.score), 0);
  const avg = parsedRows.length ? total / parsedRows.length : 0;

  // Class positions
  const getPositions = () => {
    // descending order
    const ranked = [...parsedRows].sort((a, b) => b.score - a.score);
    return ranked.map((row, i) => ({
      ...row,
      position: i + 1,
    }));
  };

  // Save grades as immutable
  const handleUpload = async () => {
    setUploading(true);
    const grades = getPositions().map((r) => ({
      student_id: r.student_id,
      subject_id: subjectId,
      class_id: classId,
      score: r.score,
      max_score: maxScore,
      percentage: maxScore ? (Number(r.score) / maxScore) * 100 : 0,
      position: r.position,
      term,
      exam_type: examType,
      is_immutable: true, // enforce immutability
      status: "submitted",
      submitted_at: new Date().toISOString(),
    }));

    // Bulk insert
    const { error } = await supabase.from("grades").insert(grades);
    if (error) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Grades uploaded",
        description: "Grades are now saved and locked (immutable).",
      });
      setParsedRows([]);
      onClose();
    }
    setUploading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Bulk Upload Grades (Excel)</DialogTitle>
        </DialogHeader>
        <div className="flex gap-3 mb-2 items-center">
          <Button size="sm" onClick={handleDownloadTemplate} variant="outline">
            Download Template
          </Button>
          <Input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileImport}
            className="w-auto"
          />
        </div>
        {parsedRows.length > 0 && (
          <div className="overflow-x-auto max-h-96 border rounded-md p-2">
            <table className="table-auto w-full text-sm">
              <thead>
                <tr>
                  <th className="px-2 py-1 border-b">Student ID</th>
                  <th className="px-2 py-1 border-b">Name</th>
                  <th className="px-2 py-1 border-b">Score</th>
                  <th className="px-2 py-1 border-b">Position</th>
                </tr>
              </thead>
              <tbody>
                {getPositions().map((r) => (
                  <tr key={r.student_id}>
                    <td className="px-2 py-1">{r.student_id}</td>
                    <td className="px-2 py-1">{r.name}</td>
                    <td className="px-2 py-1">{r.score}</td>
                    <td className="px-2 py-1">{r.position}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-end mt-2 gap-6 text-xs text-gray-700">
              <span>Total: <b>{total}</b></span>
              <span>Average: <b>{avg.toFixed(2)}</b></span>
              <span># Students: <b>{parsedRows.length}</b></span>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button
            onClick={handleUpload}
            disabled={uploading || !parsedRows.length}
          >
            {uploading ? "Uploading..." : "Upload Grades"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkGradeUploadModal;
