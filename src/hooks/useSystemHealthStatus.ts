
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SystemHealthStatus {
  current_status: string;
  supabase_connected: boolean;
  uptime_percent: number;
  updated_at: string;
}

// NOTE: Workaround until types.ts is regenerated
export function useSystemHealthStatus() {
  const [health, setHealth] = useState<SystemHealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function fetchStatus() {
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await (supabase as any)
          .from("system_status")
          .select("current_status, supabase_connected, uptime_percent, updated_at")
          .order("updated_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) throw error;
        if (active) setHealth(data || null);
      } catch (err: any) {
        setError("Cannot fetch system status");
        setHealth(null);
      } finally {
        setLoading(false);
      }
    }

    fetchStatus();
    const interval = setInterval(fetchStatus, 60000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  return { health, loading, error };
}
