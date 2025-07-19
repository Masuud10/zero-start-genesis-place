import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { supabase } from "@/integrations/supabase/client";

// Types for dashboard data
interface KPIData {
  schools: {
    total: number;
    active: number;
    growth: number;
  };
  users: {
    total: number;
    students: number;
    growth: number;
  };
  revenue: {
    mrr: number;
    arr: number;
    mrrGrowth: number;
    customerCount: number;
    customerGrowth: number;
    churnRate: number;
  };
  activity: {
    recentLogs: any[];
    totalActions: number;
  };
}

interface SupportTicket {
  id: number;
  school_id: string;
  submitted_by: string;
  subject: string;
  description: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in_progress" | "resolved" | "closed";
  assigned_to: string | null;
  category: "technical" | "billing" | "feature_request" | "general";
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  schools: {
    name: string;
    email: string;
  };
  submitted_by_user: {
    name: string;
    email: string;
  };
  assigned_to_user: {
    name: string;
    email: string;
  } | null;
}

interface CRMLead {
  id: number;
  school_name: string;
  contact_person: string;
  email: string;
  phone: string;
  school_size: "small" | "medium" | "large";
  location: string;
  lead_source: "website" | "referral" | "cold_outreach" | "event";
  status:
    | "new"
    | "contacted"
    | "qualified"
    | "demo"
    | "proposal"
    | "closed_won"
    | "closed_lost";
  lead_score: number;
  assigned_to: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
  assigned_to_user: {
    name: string;
    email: string;
  } | null;
}

interface SystemHealth {
  status: "healthy" | "warning" | "critical";
  metrics: Array<{
    id: number;
    metric_type: string;
    metric_value: string;
    metric_unit: string;
    recorded_at: string;
  }>;
  errors: Array<{
    id: number;
    error_type: string;
    error_message: string;
    stack_trace: string;
    user_id: string;
    school_id: string;
    severity: "low" | "medium" | "high" | "critical";
    resolved: boolean;
    created_at: string;
  }>;
  slowQueries: Array<{
    id: number;
    query_hash: string;
    query_text: string;
    execution_time_ms: number;
    rows_returned: number;
    table_name: string;
    executed_at: string;
  }>;
  summary: {
    totalErrors: number;
    criticalErrors: number;
    avgResponseTime: number;
  };
}

interface FinancialKPIs {
  current: {
    mrr: number;
    arr: number;
    customerCount: number;
    churnRate: number;
  };
  expensesSummary: {
    total: number;
    byCategory: Record<string, number>;
  };
  budget: {
    total: number;
    utilization: number;
    allocations: Array<{
      id: number;
      department: string;
      budget_year: number;
      budget_amount: number;
      allocated_amount: number;
    }>;
  };
  growth: {
    revenue: number;
    customers: number;
  };
  period: string;
  metrics: Array<{
    id: number;
    metric_date: string;
    mrr: number;
    arr: number;
    churn_rate: number;
    customer_count: number;
  }>;
  expenses: Array<{
    id: number;
    expense_date: string;
    description: string;
    amount: number;
    category: string;
    vendor: string;
    status: string;
  }>;
}

interface DashboardContextType {
  // Super Admin Data
  kpiData: KPIData | null;
  loadingKPIs: boolean;
  errorKPIs: string | null;
  refreshKPIs: () => Promise<void>;

  // Support HR Data
  supportTickets: SupportTicket[];
  loadingTickets: boolean;
  errorTickets: string | null;
  refreshTickets: () => Promise<void>;

  // Sales Marketing Data
  crmLeads: CRMLead[];
  loadingLeads: boolean;
  errorLeads: string | null;
  refreshLeads: () => Promise<void>;

  // Software Engineer Data
  systemHealth: SystemHealth | null;
  loadingSystemHealth: boolean;
  errorSystemHealth: string | null;
  refreshSystemHealth: () => Promise<void>;

  // Finance Data
  financialData: FinancialKPIs | null;
  loadingFinancial: boolean;
  errorFinancial: string | null;
  refreshFinancial: () => Promise<void>;

  // Global loading state
  isLoading: boolean;
}

const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined
);

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
};

interface DashboardProviderProps {
  children: ReactNode;
}

export const DashboardProvider: React.FC<DashboardProviderProps> = ({
  children,
}) => {
  const [user] = useState(null); // Placeholder for user context

  // Super Admin States
  const [kpiData, setKpiData] = useState<KPIData | null>(null);
  const [loadingKPIs, setLoadingKPIs] = useState(false);
  const [errorKPIs, setErrorKPIs] = useState<string | null>(null);

  // Support HR States
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [errorTickets, setErrorTickets] = useState<string | null>(null);

  // Sales Marketing States
  const [crmLeads, setCrmLeads] = useState<CRMLead[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [errorLeads, setErrorLeads] = useState<string | null>(null);

  // Software Engineer States
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [loadingSystemHealth, setLoadingSystemHealth] = useState(false);
  const [errorSystemHealth, setErrorSystemHealth] = useState<string | null>(
    null
  );

  // Finance States
  const [financialData, setFinancialData] = useState<FinancialKPIs | null>(
    null
  );
  const [loadingFinancial, setLoadingFinancial] = useState(false);
  const [errorFinancial, setErrorFinancial] = useState<string | null>(null);

  // Fetch Super Admin KPIs
  const fetchKPIs = async () => {
    try {
      setLoadingKPIs(true);
      setErrorKPIs(null);

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("No session found");

      const response = await fetch(
        `https://lmqyizrnuahkmwauonqr.supabase.co/functions/v1/get-super-admin-kpis`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch KPIs");
      }

      const result = await response.json();
      setKpiData(result.data);
    } catch (error) {
      console.error("Error fetching KPIs:", error);
      setErrorKPIs(
        error instanceof Error ? error.message : "Failed to fetch KPIs"
      );
    } finally {
      setLoadingKPIs(false);
    }
  };

  // Fetch Support Tickets
  const fetchSupportTickets = async () => {
    if (!user || (user.role !== "support_hr" && user.role !== "super_admin"))
      return;

    try {
      setLoadingTickets(true);
      setErrorTickets(null);

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("No session found");

      const response = await fetch("/functions/v1/get-support-tickets", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch support tickets");
      }

      const result = await response.json();
      setSupportTickets(result.data || []);
    } catch (error) {
      console.error("Error fetching support tickets:", error);
      setErrorTickets(
        error instanceof Error
          ? error.message
          : "Failed to fetch support tickets"
      );
    } finally {
      setLoadingTickets(false);
    }
  };

  // Fetch CRM Leads
  const fetchCRMLeads = async () => {
    if (
      !user ||
      (user.role !== "sales_marketing" && user.role !== "super_admin")
    )
      return;

    try {
      setLoadingLeads(true);
      setErrorLeads(null);

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("No session found");

      const response = await fetch("/functions/v1/get-crm-leads", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch CRM leads");
      }

      const result = await response.json();
      setCrmLeads(result.data || []);
    } catch (error) {
      console.error("Error fetching CRM leads:", error);
      setErrorLeads(
        error instanceof Error ? error.message : "Failed to fetch CRM leads"
      );
    } finally {
      setLoadingLeads(false);
    }
  };

  // Fetch System Health
  const fetchSystemHealth = async () => {
    if (
      !user ||
      (user.role !== "software_engineer" && user.role !== "super_admin")
    )
      return;

    try {
      setLoadingSystemHealth(true);
      setErrorSystemHealth(null);

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("No session found");

      const response = await fetch("/functions/v1/get-system-health", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch system health");
      }

      const result = await response.json();
      setSystemHealth(result.data);
    } catch (error) {
      console.error("Error fetching system health:", error);
      setErrorSystemHealth(
        error instanceof Error ? error.message : "Failed to fetch system health"
      );
    } finally {
      setLoadingSystemHealth(false);
    }
  };

  // Fetch Financial Data
  const fetchFinancialData = async () => {
    if (!user || (user.role !== "finance" && user.role !== "super_admin"))
      return;

    try {
      setLoadingFinancial(true);
      setErrorFinancial(null);

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("No session found");

      const response = await fetch(
        "/functions/v1/get-financial-kpis?period=current_month",
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch financial data");
      }

      const result = await response.json();
      setFinancialData(result.data);
    } catch (error) {
      console.error("Error fetching financial data:", error);
      setErrorFinancial(
        error instanceof Error
          ? error.message
          : "Failed to fetch financial data"
      );
    } finally {
      setLoadingFinancial(false);
    }
  };

  // Initial data fetching
  useEffect(() => {
    // Always fetch KPIs for now since user is commented out
    fetchKPIs();
  }, []);

  // Set up real-time subscriptions for live updates
  useEffect(() => {
    // Real-time subscription for admin tables
    const adminSubscription = supabase
      .channel("admin_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "admin_users",
        },
        () => {
          fetchKPIs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(adminSubscription);
    };
  }, []);

  const value: DashboardContextType = {
    // Super Admin Data
    kpiData,
    loadingKPIs,
    errorKPIs,
    refreshKPIs: fetchKPIs,

    // Support HR Data
    supportTickets,
    loadingTickets,
    errorTickets,
    refreshTickets: fetchSupportTickets,

    // Sales Marketing Data
    crmLeads,
    loadingLeads,
    errorLeads,
    refreshLeads: fetchCRMLeads,

    // Software Engineer Data
    systemHealth,
    loadingSystemHealth,
    errorSystemHealth,
    refreshSystemHealth: fetchSystemHealth,

    // Finance Data
    financialData,
    loadingFinancial,
    errorFinancial,
    refreshFinancial: fetchFinancialData,

    // Global loading state
    isLoading:
      loadingKPIs ||
      loadingTickets ||
      loadingLeads ||
      loadingSystemHealth ||
      loadingFinancial,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};
