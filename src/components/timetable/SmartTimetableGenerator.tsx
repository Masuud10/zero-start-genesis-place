
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const SmartTimetableGenerator = ({
  term,
  onGenerationSuccess,
}: {
  term: string;
  onGenerationSuccess: () => void;
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    setLoading(true);
    try {
      // Call edge function with school_id and preferences
      const { data, error } = await supabase.functions.invoke("generate-timetable", {
        body: { school_id: user.school_id, term },
        headers: { "x-user-id": user.id }, // for audit
      });
      if (error || data?.error) throw new Error(error?.message || data?.error);
      toast({ title: "Success", description: "AI Timetable generated", variant: "success" });
      if (onGenerationSuccess) onGenerationSuccess();
    } catch (err: any) {
      toast({ title: "Generation Failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="my-4">
      <Button 
        onClick={handleGenerate} 
        loading={loading}
        className="bg-gradient-to-r from-blue-500 to-purple-600 text-white"
      >
        {loading ? "Generating..." : "Generate Smart Timetable"}
      </Button>
      <div className="text-xs text-gray-500 mt-2">
        Auto-assigns classes, subjects and teachers using AI scheduling. Edit or publish after review.
      </div>
    </div>
  );
};

export default SmartTimetableGenerator;
