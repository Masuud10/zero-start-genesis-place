
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSchoolScopedData } from "@/hooks/useSchoolScopedData";

const ClassManagementTab = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { getCurrentSchoolId } = useSchoolScopedData();
  const [form, setForm] = useState({ name: "", level: "", stream: "", year: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validation
    if (!form.name || !form.level || !form.year) {
      toast({ title: "Validation Error", description: "All required fields must be filled", variant: "destructive" });
      return;
    }
    setLoading(true);
    // Remove dummy: directly insert real class
    const { data, error } = await supabase.from("classes").insert({
      name: form.name,
      school_id: getCurrentSchoolId(),
      // You may want to save "stream" and "level" in metadata columns
    });
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Class Created", description: `Class "${form.name}" added.` });
      setForm({ name: "", level: "", stream: "", year: "" });
    }
  };

  return (
    <div>
      <div className="font-semibold text-lg mb-2">Add New Class</div>
      <form className="flex flex-col gap-2 max-w-md" onSubmit={handleCreate}>
        <Input name="name" required placeholder="Class Name (e.g., Grade 1A)" value={form.name} onChange={handleChange} />
        <Input name="level" required placeholder="Class Level (e.g., Grade 1)" value={form.level} onChange={handleChange} />
        <Input name="stream" placeholder="Stream (if applicable)" value={form.stream} onChange={handleChange} />
        <Input name="year" required placeholder="Year (e.g., 2025)" value={form.year} onChange={handleChange} />
        <Button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Class"}
        </Button>
      </form>
      {/* TODO: Show existing classes in a table/list, and allow edit/delete */}
    </div>
  );
};

export default ClassManagementTab;
