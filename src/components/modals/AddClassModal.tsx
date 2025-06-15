
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface AddClassModalProps {
  open: boolean;
  onClose: () => void;
  onClassCreated?: (cls: { id: string; name: string }) => void;
}
const AddClassModal: React.FC<AddClassModalProps> = ({
  open,
  onClose,
  onClassCreated,
}) => {
  const [className, setClassName] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!className.trim()) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("classes")
        .insert({
          name: className,
          school_id: user?.school_id || null,
        })
        .select()
        .single();
      if (error) throw error;
      toast({ title: "Class Added", description: `${className} was created.` });
      onClassCreated && onClassCreated({ id: data.id, name: data.name });
      setClassName("");
      onClose();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Could not create class",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Class</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="className">Class Name</Label>
            <Input
              id="className"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Class"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
export default AddClassModal;
