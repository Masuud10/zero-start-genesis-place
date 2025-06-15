
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSchoolScopedData } from "@/hooks/useSchoolScopedData";
import { Edit, X } from "lucide-react";

const SubjectManagementTab = () => {
  const { toast } = useToast();
  const { getCurrentSchoolId } = useSchoolScopedData();
  const [form, setForm] = useState({ name: "", code: "", curriculum: "" });
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [subjectRows, setSubjectRows] = useState<any[]>([]);
  const [loadingTable, setLoadingTable] = useState(true);
  const schoolId = getCurrentSchoolId();

  const fetchSubjects = async () => {
    if (!schoolId) {
      setSubjectRows([]);
      setLoadingTable(false);
      return;
    }
    setLoadingTable(true);
    const { data, error } = await supabase
      .from("subjects")
      .select("*")
      .eq("school_id", schoolId)
      .order("name");
    if (error) {
      toast({ title: "Load Error", description: error.message, variant: "destructive" });
      setSubjectRows([]);
    } else {
      setSubjectRows(data || []);
    }
    setLoadingTable(false);
  };

  useEffect(() => { fetchSubjects(); }, [schoolId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const alreadyExists = (name: string) =>
    subjectRows.some(s => s.name.trim().toLowerCase() === name.trim().toLowerCase() && s.id !== editingId);

  const handleCreateOrEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.code || !form.curriculum) {
      toast({ title: "Validation Error", description: "All required fields must be filled", variant: "destructive" });
      return;
    }
    if (alreadyExists(form.name)) {
      toast({ title: "Duplicate", description: "A subject with this name already exists.", variant: "destructive" });
      return;
    }
    setLoading(true);
    let result;
    if (editingId) {
      const { error } = await supabase
        .from("subjects")
        .update({
          name: form.name,
          code: form.code,
          curriculum: form.curriculum,
        })
        .eq("id", editingId);
      result = { error };
    } else {
      const { error } = await supabase
        .from("subjects")
        .insert({
          name: form.name,
          code: form.code,
          school_id: schoolId,
          curriculum: form.curriculum,
        });
      result = { error };
    }
    setLoading(false);
    if (result.error) {
      toast({ title: "DB Error", description: result.error.message, variant: "destructive" });
    } else {
      toast({
        title: editingId ? "Subject Updated" : "Subject Created",
        description: editingId ? `Subject "${form.name}" updated.` : `Subject "${form.name}" added.`
      });
      setForm({ name: "", code: "", curriculum: "" });
      setEditingId(null);
      fetchSubjects();
    }
  };

  const handleEdit = (row: any) => {
    setEditingId(row.id);
    setForm({
      name: row.name || "",
      code: row.code || "",
      curriculum: row.curriculum || ""
    });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this subject? This cannot be undone.")) return;
    setLoading(true);
    const { error } = await supabase
      .from("subjects")
      .delete()
      .eq("id", id);
    setLoading(false);
    if (error) {
      toast({ title: "Delete Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Subject Deleted", description: "Subject removed." });
      setSubjectRows(subjectRows.filter(s => s.id !== id));
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm({ name: "", code: "", curriculum: "" });
  };

  return (
    <div>
      <div className="font-semibold text-lg mb-2">{editingId ? "Edit Subject" : "Add New Subject"}</div>
      <form className="flex flex-col gap-2 max-w-md mb-4" onSubmit={handleCreateOrEdit}>
        <Input name="name" required placeholder="Subject Name (e.g., Mathematics)" value={form.name} onChange={handleChange} />
        <Input name="code" required placeholder="Subject Code (e.g., MATH101)" value={form.code} onChange={handleChange} />
        <Input name="curriculum" required placeholder="Curriculum (CBC or IGCSE)" value={form.curriculum} onChange={handleChange} />
        <div className="flex gap-2">
          <Button type="submit" disabled={loading}>
            {loading ? (editingId ? "Saving..." : "Creating...") : (editingId ? "Save Changes" : "Create Subject")}
          </Button>
          {editingId && (
            <Button type="button" variant="outline" onClick={handleCancelEdit}>
              Cancel
            </Button>
          )}
        </div>
      </form>

      <div className="font-semibold text-lg mb-2">Existing Subjects</div>
      {loadingTable ? (
        <div className="text-gray-500">Loading...</div>
      ) : !subjectRows.length ? (
        <div className="text-gray-400 italic">No subjects found for this school.</div>
      ) : (
        <table className="table-auto w-full border mb-4">
          <thead>
            <tr className="bg-gray-50">
              <th className="border px-2 py-1">Name</th>
              <th className="border px-2 py-1">Code</th>
              <th className="border px-2 py-1">Curriculum</th>
              <th className="border px-2 py-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {subjectRows.map((row: any) => (
              <tr key={row.id}>
                <td className="border px-2 py-1">{row.name}</td>
                <td className="border px-2 py-1">{row.code}</td>
                <td className="border px-2 py-1">{row.curriculum ?? "-"}</td>
                <td className="border px-2 py-1 flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(row)}>
                    <Edit className="w-4 h-4 mr-1" /> Edit
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(row.id)}>
                    <X className="w-4 h-4 mr-1" /> Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default SubjectManagementTab;
