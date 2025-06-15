
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSchoolScopedData } from "@/hooks/useSchoolScopedData";
import { Edit, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const SubjectManagementTab = () => {
  const { toast } = useToast();
  const { schoolId } = useSchoolScopedData();
  const [form, setForm] = useState({ name: "", code: "", curriculum: "", class_id: "", teacher_id: "" });
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [subjectRows, setSubjectRows] = useState<any[]>([]);
  const [loadingTable, setLoadingTable] = useState(true);

  const [classes, setClasses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);

  const fetchSubjects = async () => {
    if (!schoolId) {
      setSubjectRows([]);
      setLoadingTable(false);
      return;
    }
    setLoadingTable(true);
    const { data, error } = await supabase
      .from("subjects")
      .select("*, class:classes(name), teacher:profiles(name)")
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
  
  const fetchClassesAndTeachers = async () => {
    if(!schoolId) return;
    const [classesRes, teachersRes] = await Promise.all([
      supabase.from('classes').select('id, name').eq('school_id', schoolId).order('name'),
      supabase.from('profiles').select('id, name').eq('school_id', schoolId).eq('role', 'teacher').order('name')
    ]);
    
    if(classesRes.data) setClasses(classesRes.data);
    else if(classesRes.error) toast({ title: "Class Load Error", description: classesRes.error.message, variant: "destructive" });

    if(teachersRes.data) setTeachers(teachersRes.data);
    else if(teachersRes.error) toast({ title: "Teacher Load Error", description: teachersRes.error.message, variant: "destructive" });
  }

  useEffect(() => { 
    if (schoolId) {
      fetchSubjects();
      fetchClassesAndTeachers();
    }
  }, [schoolId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSelectChange = (name: string) => (value: string) => {
    setForm(f => ({ ...f, [name]: value }));
  };

  const alreadyExists = (name: string, classId: string) =>
    subjectRows.some(s => 
      s.name.trim().toLowerCase() === name.trim().toLowerCase() && 
      s.class_id === classId && 
      s.id !== editingId
    );

  const handleCreateOrEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.code || !form.curriculum || !form.class_id) {
      toast({ title: "Validation Error", description: "Subject Name, Code, Curriculum, and Class are required.", variant: "destructive" });
      return;
    }
    if (alreadyExists(form.name, form.class_id)) {
      toast({ title: "Duplicate", description: "A subject with this name already exists in the selected class.", variant: "destructive" });
      return;
    }
    setLoading(true);
    
    const subjectData = {
        name: form.name,
        code: form.code,
        curriculum: form.curriculum,
        class_id: form.class_id,
        teacher_id: form.teacher_id || null,
        school_id: schoolId,
    };

    let result;
    if (editingId) {
      const { error } = await supabase
        .from("subjects")
        .update(subjectData)
        .eq("id", editingId);
      result = { error };
    } else {
      const { error } = await supabase
        .from("subjects")
        .insert(subjectData);
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
      handleCancelEdit();
      fetchSubjects();
    }
  };

  const handleEdit = (row: any) => {
    setEditingId(row.id);
    setForm({
      name: row.name || "",
      code: row.code || "",
      curriculum: row.curriculum || "",
      class_id: row.class_id || "",
      teacher_id: row.teacher_id || ""
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    setForm({ name: "", code: "", curriculum: "", class_id: "", teacher_id: "" });
  };

  return (
    <div>
      <div className="font-semibold text-lg mb-2">{editingId ? "Edit Subject" : "Add New Subject"}</div>
      <form className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mb-6 border p-4 rounded-lg" onSubmit={handleCreateOrEdit}>
        <div>
          <Label htmlFor="name">Subject Name *</Label>
          <Input id="name" name="name" required placeholder="e.g., Mathematics" value={form.name} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="code">Subject Code *</Label>
          <Input id="code" name="code" required placeholder="e.g., MATH101" value={form.code} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="class_id">Class *</Label>
          <Select required value={form.class_id} onValueChange={handleSelectChange('class_id')}>
            <SelectTrigger id="class_id">
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="teacher_id">Assign Teacher (Optional)</Label>
          <Select value={form.teacher_id} onValueChange={handleSelectChange('teacher_id')}>
            <SelectTrigger id="teacher_id">
              <SelectValue placeholder="Select teacher" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">None</SelectItem>
              {teachers.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="curriculum">Curriculum *</Label>
          <Select required value={form.curriculum} onValueChange={handleSelectChange('curriculum')}>
            <SelectTrigger id="curriculum">
              <SelectValue placeholder="Select curriculum" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CBC">CBC</SelectItem>
              <SelectItem value="IGCSE">IGCSE</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2 md:col-span-2">
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
        <div className="text-gray-500">Loading subjects...</div>
      ) : !subjectRows.length ? (
        <div className="text-gray-400 italic p-4 border rounded-lg">No subjects found for this school. Use the form above to add one.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table-auto w-full border-collapse mb-4">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="border px-4 py-2">Name</th>
                <th className="border px-4 py-2">Code</th>
                <th className="border px-4 py-2">Class</th>
                <th className="border px-4 py-2">Teacher</th>
                <th className="border px-4 py-2">Curriculum</th>
                <th className="border px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subjectRows.map((row: any) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="border px-4 py-2">{row.name}</td>
                  <td className="border px-4 py-2">{row.code}</td>
                  <td className="border px-4 py-2">{row.class?.name ?? <span className="text-gray-400">N/A</span>}</td>
                  <td className="border px-4 py-2">{row.teacher?.name ?? <span className="text-gray-400">N/A</span>}</td>
                  <td className="border px-4 py-2">{row.curriculum ?? "-"}</td>
                  <td className="border px-4 py-2 flex gap-2 flex-wrap">
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
        </div>
      )}
    </div>
  );
};

export default SubjectManagementTab;
