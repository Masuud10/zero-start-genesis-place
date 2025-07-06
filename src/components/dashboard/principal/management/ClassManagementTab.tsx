import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSchoolScopedData } from "@/hooks/useSchoolScopedData";
import { Edit, X } from "lucide-react";

const ClassManagementTab = () => {
  const { toast } = useToast();
  const { schoolId } = useSchoolScopedData();
  const [form, setForm] = useState({
    name: "",
    level: "",
    stream: "",
    year: "",
    curriculum: "",
  });
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // For table of existing classes:
  const [classRows, setClassRows] = useState<any[]>([]);
  const [loadingTable, setLoadingTable] = useState(true);

  // Fetch all classes for current school
  const fetchClasses = async () => {
    if (!schoolId) {
      setClassRows([]);
      setLoadingTable(false);
      return;
    }
    setLoadingTable(true);
    const { data, error } = await supabase
      .from("classes")
      .select(
        "id, name, level, stream, year, curriculum, school_id, teacher_id, created_at"
      )
      .eq("school_id", schoolId)
      .order("name");
    if (error) {
      toast({
        title: "Load Error",
        description: error.message,
        variant: "destructive",
      });
      setClassRows([]);
    } else {
      setClassRows(data || []);
    }
    setLoadingTable(false);
  };

  useEffect(() => {
    fetchClasses();
  }, [schoolId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  // Validate for duplicates (client-side only for UX, but DB unique constraint recommended)
  const alreadyExists = (name: string) =>
    classRows.some(
      (c) =>
        c.name.trim().toLowerCase() === name.trim().toLowerCase() &&
        c.id !== editingId
    );

  const handleCreateOrEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.level || !form.year || !form.curriculum) {
      toast({
        title: "Validation Error",
        description: "All required fields must be filled",
        variant: "destructive",
      });
      return;
    }
    if (alreadyExists(form.name)) {
      toast({
        title: "Duplicate",
        description: "A class with this name already exists.",
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
      });
      result = { error };
    }
    setLoading(false);
    if (result.error) {
      toast({
        title: "DB Error",
        description: result.error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: editingId ? "Class Updated" : "Class Created",
        description: editingId
          ? `Class "${form.name}" updated.`
          : `Class "${form.name}" added.`,
      });
      setForm({ name: "", level: "", stream: "", year: "", curriculum: "" });
      setEditingId(null);
      fetchClasses();
    }
  };

  const handleEdit = (row: any) => {
    setEditingId(row.id);
    setForm({
      name: row.name || "",
      level: row.level || "",
      stream: row.stream || "",
      year: row.year || "",
      curriculum: row.curriculum || "",
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
      toast({ title: "Class Deleted", description: "Class removed." });
      // Remove from UI
      setClassRows(classRows.filter((c) => c.id !== id));
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm({ name: "", level: "", stream: "", year: "", curriculum: "" });
  };

  return (
    <div>
      <div className="font-semibold text-lg mb-2">
        {editingId ? "Edit Class" : "Add New Class"}
      </div>
      <form
        className="flex flex-col gap-2 max-w-md mb-4"
        onSubmit={handleCreateOrEdit}
      >
        <Input
          name="name"
          required
          placeholder="Class Name (e.g., Grade 1A)"
          value={form.name}
          onChange={handleChange}
        />
        <Input
          name="level"
          required
          placeholder="Class Level (e.g., Grade 1)"
          value={form.level}
          onChange={handleChange}
        />
        <Input
          name="stream"
          placeholder="Stream (if applicable)"
          value={form.stream}
          onChange={handleChange}
        />
        <Input
          name="year"
          required
          placeholder="Year (e.g., 2025)"
          value={form.year}
          onChange={handleChange}
        />
        <select
          name="curriculum"
          required
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          value={form.curriculum || ""}
          onChange={(e) =>
            setForm((f) => ({ ...f, curriculum: e.target.value }))
          }
        >
          <option value="">Select Curriculum Type</option>
          <option value="CBC">CBC (Competency Based Curriculum)</option>
          <option value="IGCSE">
            IGCSE (International General Certificate)
          </option>
          <option value="Standard">Standard (8-4-4 Traditional)</option>
        </select>
        <div className="flex gap-2">
          <Button type="submit" disabled={loading}>
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
        <div className="text-gray-500">Loading...</div>
      ) : !classRows.length ? (
        <div className="text-gray-400 italic">
          No classes found for this school.
        </div>
      ) : (
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
            {classRows.map((row: any) => (
              <tr key={row.id}>
                <td className="border px-2 py-1">{row.name}</td>
                <td className="border px-2 py-1">{row.level ?? "-"}</td>
                <td className="border px-2 py-1">{row.stream ?? "-"}</td>
                <td className="border px-2 py-1">{row.year ?? "-"}</td>
                <td className="border px-2 py-1">{row.curriculum ?? "-"}</td>
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
      )}
      {/* TODO: Show summary: Which class has students/subjects/teachers linked */}
    </div>
  );
};

export default ClassManagementTab;
