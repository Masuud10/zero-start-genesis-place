import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useConsolidatedAuth } from "@/hooks/useConsolidatedAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  LineChart,
  Activity,
  Plus,
  Search,
  Filter,
  Calendar,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Calculator,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Loader2,
  Building2,
  Users,
  CreditCard,
  Receipt,
  FileText,
  FileSpreadsheet,
  FileBarChart,
  FilePieChart,
  FileLineChart,
  Wallet,
  PiggyBank,
  Banknote,
  Coins,
  CreditCard as CreditCardIcon,
  Receipt as ReceiptIcon,
  Award,
  Plane,
  FileText as FileDollar,
  FileText as FilePercent,
} from "lucide-react";
import {
  EnhancedCard,
  StatCard,
  MetricCard,
  ProgressCard,
} from "@/components/ui/EnhancedCard";
import {
  LineChart as LineChartComponent,
  BarChart,
  PieChart as PieChartComponent,
} from "@/components/ui/BeautifulCharts";

interface FinancialKPIs {
  current: {
    mrr: number;
    arr: number;
    customerCount: number;
    churnRate: number;
  };
  expenses: {
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
  expenseList: Array<{
    id: number;
    expense_date: string;
    description: string;
    amount: number;
    category: string;
    vendor: string;
    status: string;
  }>;
}

interface CompanyExpense {
  id: number;
  expense_date: string;
  description: string;
  amount: number;
  category: "operational" | "marketing" | "development" | "hr" | "other";
  vendor: string;
  receipt_url: string;
  approved_by: string;
  status: "pending" | "approved" | "rejected";
  created_by: string;
  created_at: string;
  updated_at: string;
}

const FinanceDashboard = () => {
  const { user } = useConsolidatedAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [financialData, setFinancialData] = useState<FinancialKPIs | null>(
    null
  );

  // Filter states
  const [expenseCategory, setExpenseCategory] = useState<string>("");
  const [expenseStatus, setExpenseStatus] = useState<string>("");
  const [period, setPeriod] = useState<string>("current_month");

  // Modal states
  const [showNewExpense, setShowNewExpense] = useState(false);
  const [showBudgetAllocation, setShowBudgetAllocation] = useState(false);

  // Fetch financial data
  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        setLoading(true);
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          throw new Error("No session found");
        }

        const response = await fetch(
          `/functions/v1/get-financial-kpis?period=${period}`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const result = await response.json();
          setFinancialData(result.data);
        } else {
          // Use mock data if API is not available
          setFinancialData({
            current: {
              mrr: 50000,
              arr: 600000,
              customerCount: 150,
              churnRate: 0.025,
            },
            expenses: {
              total: 25000,
              byCategory: {
                operational: 12000,
                marketing: 8000,
                development: 3000,
                hr: 2000,
              },
            },
            budget: {
              total: 100000,
              utilization: 25,
              allocations: [
                {
                  id: 1,
                  department: "Marketing",
                  budget_year: 2024,
                  budget_amount: 30000,
                  allocated_amount: 8000,
                },
                {
                  id: 2,
                  department: "Development",
                  budget_year: 2024,
                  budget_amount: 40000,
                  allocated_amount: 3000,
                },
                {
                  id: 3,
                  department: "Operations",
                  budget_year: 2024,
                  budget_amount: 20000,
                  allocated_amount: 12000,
                },
                {
                  id: 4,
                  department: "HR",
                  budget_year: 2024,
                  budget_amount: 10000,
                  allocated_amount: 2000,
                },
              ],
            },
            growth: {
              revenue: 12.5,
              customers: 8.3,
            },
            period: period,
            metrics: [],
            expenseList: [],
          });
        }
      } catch (err) {
        console.error("Error fetching financial data:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchFinancialData();
  }, [period]);

  const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours();
    let greeting = "Good morning";

    if (hours >= 12 && hours < 17) {
      greeting = "Good afternoon";
    } else if (hours >= 17) {
      greeting = "Good evening";
    }

    return greeting;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "operational":
        return "bg-blue-100 text-blue-800";
      case "marketing":
        return "bg-purple-100 text-purple-800";
      case "development":
        return "bg-green-100 text-green-800";
      case "hr":
        return "bg-orange-100 text-orange-800";
      case "other":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Error loading dashboard: {error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <DollarSign className="h-6 w-6 text-green-600" />
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Finance Dashboard
                </h1>
                <p className="text-muted-foreground">
                  {getCurrentTime()}, {user?.name || "Finance Team"}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="flex items-center space-x-1">
              <Activity className="h-3 w-3" />
              <span>Fiscal Year 2024</span>
            </Badge>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(financialData?.current.mrr || 0)}
            </div>
            <div className="flex items-center text-xs">
              {financialData?.growth.revenue || 0 >= 0 ? (
                <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-red-600 mr-1" />
              )}
              <span
                className={
                  financialData?.growth.revenue || 0 >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }
              >
                {formatPercentage(financialData?.growth.revenue || 0)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Annual Revenue
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(financialData?.current.arr || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Projected ARR</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Expenses
            </CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(financialData?.expenses.total || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              This {period.replace("_", " ")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Budget Utilization
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(financialData?.budget.utilization || 0).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              of {formatCurrency(financialData?.budget.total || 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-5 h-12">
          <TabsTrigger
            value="overview"
            className="flex items-center gap-2 text-sm"
          >
            <BarChart3 className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger
            value="revenue"
            className="flex items-center gap-2 text-sm"
          >
            <TrendingUp className="h-4 w-4" />
            <span>Revenue</span>
          </TabsTrigger>
          <TabsTrigger
            value="expenses"
            className="flex items-center gap-2 text-sm"
          >
            <Receipt className="h-4 w-4" />
            <span>Expenses</span>
          </TabsTrigger>
          <TabsTrigger
            value="budgeting"
            className="flex items-center gap-2 text-sm"
          >
            <Target className="h-4 w-4" />
            <span>Budgeting</span>
          </TabsTrigger>
          <TabsTrigger
            value="reports"
            className="flex items-center gap-2 text-sm"
          >
            <FileText className="h-4 w-4" />
            <span>Reports</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Financial Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calculator className="h-5 w-5" />
                <span>Financial Summary</span>
              </CardTitle>
              <CardDescription>
                Key financial metrics and performance indicators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Revenue Metrics</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Monthly Recurring Revenue (MRR)</span>
                      <span className="font-medium">
                        {formatCurrency(financialData?.current.mrr || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Annual Recurring Revenue (ARR)</span>
                      <span className="font-medium">
                        {formatCurrency(financialData?.current.arr || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Customer Count</span>
                      <span className="font-medium">
                        {financialData?.current.customerCount || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Churn Rate</span>
                      <span className="font-medium">
                        {(
                          (financialData?.current.churnRate || 0) * 100
                        ).toFixed(2)}
                        %
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold">Growth Metrics</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Revenue Growth</span>
                      <span
                        className={`font-medium ${
                          financialData?.growth.revenue || 0 >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {formatPercentage(financialData?.growth.revenue || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Customer Growth</span>
                      <span
                        className={`font-medium ${
                          financialData?.growth.customers || 0 >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {formatPercentage(financialData?.growth.customers || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Expense Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PieChart className="h-5 w-5" />
                <span>Expense Breakdown</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(financialData?.expenses.byCategory || {}).map(
                  ([category, amount]) => (
                    <div
                      key={category}
                      className="text-center p-4 border rounded-lg"
                    >
                      <div className="text-2xl font-bold mb-2">
                        {formatCurrency(amount)}
                      </div>
                      <div className="text-sm font-medium capitalize">
                        {category}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {financialData?.expenses.total
                          ? (
                              (amount / financialData.expenses.total) *
                              100
                            ).toFixed(1)
                          : 0}
                        % of total
                      </div>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-6">
          {/* Revenue Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Revenue Management</span>
              </CardTitle>
              <CardDescription>
                Monitor and manage subscription payments and revenue streams
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Revenue Streams */}
                <div>
                  <h4 className="font-semibold mb-4">Revenue Streams</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Building2 className="h-5 w-5 text-blue-600" />
                        <span className="font-medium">
                          School Subscriptions
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-blue-600">
                        {formatCurrency(financialData?.current.mrr || 0)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Monthly recurring
                      </div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Plane className="h-5 w-5 text-green-600" />
                        <span className="font-medium">Academic Trips</span>
                      </div>
                      <div className="text-2xl font-bold text-green-600">
                        $15,000
                      </div>
                      <div className="text-sm text-muted-foreground">
                        This month
                      </div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Award className="h-5 w-5 text-purple-600" />
                        <span className="font-medium">Premium Services</span>
                      </div>
                      <div className="text-2xl font-bold text-purple-600">
                        $5,000
                      </div>
                      <div className="text-sm text-muted-foreground">
                        This month
                      </div>
                    </div>
                  </div>
                </div>

                {/* Revenue Chart Placeholder */}
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <LineChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">
                      Revenue trend chart coming soon
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Expenses Tab */}
        <TabsContent value="expenses" className="space-y-6">
          {/* Expense Management */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Receipt className="h-5 w-5" />
                    <span>Expense Management</span>
                  </CardTitle>
                  <CardDescription>
                    Track and categorize company operational expenses
                  </CardDescription>
                </div>
                <Button onClick={() => setShowNewExpense(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Expense
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <Input
                    placeholder="Search expenses..."
                    className="max-w-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <Select
                    value={expenseCategory}
                    onValueChange={setExpenseCategory}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Categories</SelectItem>
                      <SelectItem value="operational">Operational</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="development">Development</SelectItem>
                      <SelectItem value="hr">HR</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={expenseStatus}
                    onValueChange={setExpenseStatus}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Expenses List */}
              <div className="space-y-4">
                {financialData?.expenseList.map((expense) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Receipt className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">{expense.description}</div>
                        <div className="text-sm text-muted-foreground">
                          {expense.vendor} •{" "}
                          {new Date(expense.expense_date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="font-medium">
                          {formatCurrency(expense.amount)}
                        </div>
                        <Badge className={getCategoryColor(expense.category)}>
                          {expense.category}
                        </Badge>
                      </div>
                      <Badge className={getStatusColor(expense.status)}>
                        {expense.status}
                      </Badge>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {(!financialData?.expenseList ||
                  financialData.expenseList.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    No expenses found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Budgeting Tab */}
        <TabsContent value="budgeting" className="space-y-6">
          {/* Budget Allocations */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5" />
                    <span>Budget Allocations</span>
                  </CardTitle>
                  <CardDescription>
                    Set and track departmental budgets
                  </CardDescription>
                </div>
                <Button onClick={() => setShowBudgetAllocation(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Allocate Budget
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {financialData?.budget.allocations.map((allocation) => {
                  const utilization =
                    (allocation.allocated_amount / allocation.budget_amount) *
                    100;
                  return (
                    <div key={allocation.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="font-medium">
                            {allocation.department}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Budget Year {allocation.budget_year}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            {formatCurrency(allocation.allocated_amount)} /{" "}
                            {formatCurrency(allocation.budget_amount)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {utilization.toFixed(1)}% utilized
                          </div>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            utilization > 80
                              ? "bg-red-500"
                              : utilization > 60
                              ? "bg-yellow-500"
                              : "bg-green-500"
                          }`}
                          style={{ width: `${Math.min(utilization, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Forecasting */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Financial Forecasting</span>
              </CardTitle>
              <CardDescription>
                Project future revenue and cash flow based on current metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Revenue Forecast</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Next Month MRR</span>
                      <span className="font-medium">
                        {formatCurrency(
                          (financialData?.current.mrr || 0) * 1.08
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Next Quarter ARR</span>
                      <span className="font-medium">
                        {formatCurrency(
                          (financialData?.current.arr || 0) * 1.15
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Year End ARR</span>
                      <span className="font-medium">
                        {formatCurrency(
                          (financialData?.current.arr || 0) * 1.35
                        )}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold">Cash Flow Projection</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Monthly Cash Flow</span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(
                          (financialData?.current.mrr || 0) -
                            (financialData?.expenses.total || 0)
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Quarterly Cash Flow</span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(
                          ((financialData?.current.mrr || 0) -
                            (financialData?.expenses.total || 0)) *
                            3
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          {/* Financial Reports */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Financial Reports</span>
              </CardTitle>
              <CardDescription>
                Generate key financial reports for stakeholders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                >
                  <FileBarChart className="h-6 w-6" />
                  <span className="text-sm">Profit & Loss</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                >
                  <FileSpreadsheet className="h-6 w-6" />
                  <span className="text-sm">Balance Sheet</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                >
                  <FileLineChart className="h-6 w-6" />
                  <span className="text-sm">Cash Flow</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                >
                  <FilePieChart className="h-6 w-6" />
                  <span className="text-sm">Revenue Analysis</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                >
                  <FileDollar className="h-6 w-6" />
                  <span className="text-sm">Expense Report</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                >
                  <FilePercent className="h-6 w-6" />
                  <span className="text-sm">Budget Report</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinanceDashboard;
