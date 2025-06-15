
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSchoolScopedData } from "@/hooks/useSchoolScopedData";

const SubjectManagementTab = () => {
  const { toast } = useToast();
  const { getCurrentSchoolId } = useSchoolScopedData();
  const [form, setForm] = useState({ name: "", code: "", curriculum: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.code || !form.curriculum) {
      toast({ title: "Validation Error", description: "All required fields must be filled", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.from("subjects").insert({
      name: form.name,
      code: form.code,
      // You may want to save curriculum type; if not, ignore
      school_id: getCurrentSchoolId(),
    });
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Subject Created", description: `Subject "${form.name}" added.` });
      setForm({ name: "", code: "", curriculum: "" });
    }
  };

  return (
    <div>
      <div className="font-semibold text-lg mb-2">Add New Subject</div>
      <form className="flex flex-col gap-2 max-w-md" onSubmit={handleCreate}>
        <Input name="name" required placeholder="Subject Name (e.g., Mathematics)" value={form.name} onChange={handleChange} />
        <Input name="code" required placeholder="Subject Code (e.g., MATH101)" value={form.code} onChange={handleChange} />
        <Input name="curriculum" required placeholder="Curriculum (CBC or IGCSE)" value={form.curriculum} onChange={handleChange} />
        <Button type="submit" loading={loading}>Create Subject</Button>
      </form>
      {/* TODO: Show subjects table/list with assign-to-class logic */}
    </div>
  );
};

export default SubjectManagementTab;
