
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Parent {
  id: string;
  name: string;
  email: string;
}

export function useParents(open: boolean) {
  const [parents, setParents] = useState<Parent[]>([]);
  const [loadingParents, setLoadingParents] = useState(false);

  useEffect(() => {
    if (!open) return;
    let mounted = true;
    setLoadingParents(true);
    supabase
      .from("profiles")
      .select("id, name, email")
      .eq("role", "parent")
      .then(({ data }) => {
        if (mounted) setParents(data || []);
        setLoadingParents(false);
      });
    return () => {
      mounted = false;
    };
  }, [open]);

  return { parents, loadingParents };
}
