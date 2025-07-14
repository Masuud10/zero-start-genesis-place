import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useSchoolScopedData } from "@/hooks/useSchoolScopedData";
import { supabase } from "@/integrations/supabase/client";
import { Edit, X, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface ClassData {
  id: string;
  name: string;
  level: string;
  stream?: string;
  year: string;
  curriculum?: string;
  curriculum_type?: string;
  school_id: string;
  created_at: string;
}

const ClassManagementTab = () => {
  const { toast } = useToast();
  const { schoolId } = useSchoolScopedData();
  const [classRows, setClassRows] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingTable, setLoadingTable] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    level: "",
    stream: "",
    year: "",
    curriculum: "",
  });

  useEffect(() => {
    fetchClasses();
  }, [schoolId]);

  const fetchClasses = async () => {
    if (!schoolId) return;
    setLoadingTable(true);
    try {
      const { data, error } = await supabase
        .from("classes")
        .select("*")
        .eq("school_id", schoolId)
        .order("name");
      if (error) throw error;
      setClassRows(data || []);
    } catch (error) {
      console.error("Error fetching classes:", error);
      toast({
        title: "Error",
        description: "Failed to fetch classes",
        variant: "destructive",
      });
    } finally {
      setLoadingTable(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const alreadyExists = (name: string) =>
    classRows.some(
      (row) =>
        row.name.toLowerCase() === name.toLowerCase() && row.id !== editingId
    );

  const validateForm = () => {
    if (!form.name.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a class name",
        variant: "destructive",
      });
      return false;
    }

    if (!form.level.trim()) {
      toast({
        title: "Level Required",
        description: "Please enter a class level",
        variant: "destructive",
      });
      return false;
    }

    if (!form.year.trim()) {
      toast({
        title: "Year Required",
        description: "Please enter a year",
        variant: "destructive",
      });
      return false;
    }

    if (!form.curriculum.trim()) {
      toast({
        title: "Curriculum Type Required",
        description:
          "Please select a curriculum type. This is mandatory for proper grading and reporting.",
        variant: "destructive",
      });
      return false;
    }

    if (alreadyExists(form.name)) {
      toast({
        title: "Class Already Exists",
        description: "A class with this name already exists",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleCreateOrEdit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!schoolId) {
      toast({
        title: "School Context Required",
        description: "Please ensure you have access to a school",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    let result;
    if (editingId) {
      const { error } = await supabase
        .from("classes")
        .update({
          name: form.name,
          level: form.level,
          stream: form.stream,
          year: form.year,
          curriculum: form.curriculum,
          curriculum_type: form.curriculum, // Ensure both fields are updated
        })
        .eq("id", editingId);
      result = { error };
    } else {
      const { error } = await supabase.from("classes").insert({
        name: form.name,
        school_id: schoolId,
        level: form.level,
        stream: form.stream,
        year: form.year,
        curriculum: form.curriculum,
        curriculum_type: form.curriculum, // Ensure both fields are set
      });
      result = { error };
    }
    setLoading(false);
    if (result.error) {
      toast({
        title: "Database Error",
        description: result.error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: editingId ? "Class Updated" : "Class Created",
        description: editingId
          ? `Class "${form.name}" updated successfully.`
          : `Class "${form.name}" created successfully with ${form.curriculum} curriculum.`,
      });
      setForm({ name: "", level: "", stream: "", year: "", curriculum: "" });
      setEditingId(null);
      fetchClasses();
    }
  };

  const handleEdit = (row: ClassData) => {
    setEditingId(row.id);
    setForm({
      name: row.name || "",
      level: row.level || "",
      stream: row.stream || "",
      year: row.year || "",
      curriculum: row.curriculum || row.curriculum_type || "",
    });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this class? This cannot be undone.")) return;
    setLoading(true);
    const { error } = await supabase.from("classes").delete().eq("id", id);
    setLoading(false);
    if (error) {
      toast({
        title: "Delete Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Class Deleted",
        description: "Class removed successfully.",
      });
      // Remove from UI
      setClassRows(classRows.filter((c) => c.id !== id));
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm({ name: "", level: "", stream: "", year: "", curriculum: "" });
  };

  const getCurriculumBadge = (curriculum: string) => {
    switch (curriculum?.toLowerCase()) {
      case "cbc":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            CBC
          </span>
        );
      case "igcse":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            IGCSE
          </span>
        );
      case "standard":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            Standard
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Not Set
          </span>
        );
    }
  };

  return (
    <div>
      <div className="font-semibold text-lg mb-2">
        {editingId ? "Edit Class" : "Add New Class"}
      </div>

      {/* Curriculum Type Warning */}
      <Alert className="mb-4 border-orange-200 bg-orange-50">
        <AlertTriangle className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800">
          <strong>Important:</strong> Curriculum type selection is mandatory.
          This determines the grading system, timetable structure, and report
          generation for this class.
        </AlertDescription>
      </Alert>

      <form
        className="flex flex-col gap-4 max-w-md mb-6"
        onSubmit={handleCreateOrEdit}
      >
        <div className="space-y-2">
          <Label htmlFor="name">Class Name *</Label>
          <Input
            id="name"
            name="name"
            required
            placeholder="Class Name (e.g., Grade 1A)"
            value={form.name}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="level">Class Level *</Label>
          <Input
            id="level"
            name="level"
            required
            placeholder="Class Level (e.g., Grade 1)"
            value={form.level}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="stream">Stream (Optional)</Label>
          <Input
            id="stream"
            name="stream"
            placeholder="Stream (if applicable)"
            value={form.stream}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="year">Year *</Label>
          <Input
            id="year"
            name="year"
            required
            placeholder="Year (e.g., 2025)"
            value={form.year}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="curriculum">Curriculum Type *</Label>
          <Select
            value={form.curriculum}
            onValueChange={(value) =>
              setForm((f) => ({ ...f, curriculum: value }))
            }
            required
          >
            <SelectTrigger className={!form.curriculum ? "border-red-500" : ""}>
              <SelectValue placeholder="Select Curriculum Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CBC">
                CBC (Competency Based Curriculum)
              </SelectItem>
              <SelectItem value="IGCSE">
                IGCSE (International General Certificate)
              </SelectItem>
              <SelectItem value="Standard">
                Standard (8-4-4 Traditional)
              </SelectItem>
            </SelectContent>
          </Select>
          {!form.curriculum && (
            <p className="text-sm text-red-600">Curriculum type is required</p>
          )}
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={loading || !form.curriculum}>
            {loading
              ? editingId
                ? "Saving..."
                : "Creating..."
              : editingId
              ? "Save Changes"
              : "Create Class"}
          </Button>
          {editingId && (
            <Button type="button" variant="outline" onClick={handleCancelEdit}>
              Cancel
            </Button>
          )}
        </div>
      </form>

      <div className="font-semibold text-lg mb-2">Existing Classes</div>
      {loadingTable ? (
        <div className="text-gray-500">Loading classes...</div>
      ) : !classRows.length ? (
        <div className="text-gray-400 italic">
          No classes found for this school.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table-auto w-full border mb-4">
            <thead>
              <tr className="bg-gray-50">
                <th className="border px-2 py-1">Name</th>
                <th className="border px-2 py-1">Level</th>
                <th className="border px-2 py-1">Stream</th>
                <th className="border px-2 py-1">Year</th>
                <th className="border px-2 py-1">Curriculum</th>
                <th className="border px-2 py-1">Actions</th>
              </tr>
            </thead>
            <tbody>
              {classRows.map((row: ClassData) => (
                <tr key={row.id}>
                  <td className="border px-2 py-1">{row.name}</td>
                  <td className="border px-2 py-1">{row.level ?? "-"}</td>
                  <td className="border px-2 py-1">{row.stream ?? "-"}</td>
                  <td className="border px-2 py-1">{row.year ?? "-"}</td>
                  <td className="border px-2 py-1">
                    {getCurriculumBadge(row.curriculum || row.curriculum_type)}
                  </td>
                  <td className="border px-2 py-1 flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(row)}
                    >
                      <Edit className="w-4 h-4 mr-1" /> Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(row.id)}
                    >
                      <X className="w-4 h-4 mr-1" /> Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary Information */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">
          Curriculum Type Information:
        </h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>
            <strong>CBC:</strong> Competency-based grading with performance
            levels (EM, AP, PR, EX)
          </li>
          <li>
            <strong>IGCSE:</strong> International grading with letter grades
            (A*, A, B, C, D, E, F, G, U)
          </li>
          <li>
            <strong>Standard:</strong> Traditional 8-4-4 system with numeric
            scores and letter grades
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ClassManagementTab;
