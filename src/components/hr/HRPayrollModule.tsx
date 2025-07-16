import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMultiTenantQuery } from "@/hooks/useMultiTenantQuery";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DollarSign,
  Search,
  Filter,
  Download,
  Calculator,
  TrendingUp,
  Users,
  CreditCard,
} from "lucide-react";
import { AuthUser } from "@/types/auth";
import { useToast } from "@/hooks/use-toast";

interface HRPayrollModuleProps {
  user: AuthUser;
}

interface PayrollRecord {
  id: string;
  employee_id: string;
  full_name: string;
  role_title: string;
  base_salary: number;
  allowances: number;
  deductions: number;
  net_salary: number;
  payment_status: 'pending' | 'paid' | 'processing';
  pay_period: string;
  payment_date?: string;
  currency: string;
}

const HRPayrollModule: React.FC<HRPayrollModuleProps> = ({ user }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [periodFilter, setPeriodFilter] = useState<string>("current");
  const { toast } = useToast();
  const { createSchoolScopedQuery } = useMultiTenantQuery();

  // Fetch payroll data with multi-tenant isolation
  const {
    data: payrollRecords,
    isLoading,
    refetch,
  } = useQuery<PayrollRecord[]>({
    queryKey: ["hr-payroll", user.school_id, periodFilter],
    queryFn: async () => {
      if (!user.school_id) {
        throw new Error("No school access");
      }

      // Use multi-tenant query to enforce school isolation
      const { data, error } = await supabase
        .from('support_staff')
        .select(`
          id,
          employee_id,
          full_name,
          role_title,
          salary_amount,
          salary_currency,
          is_active,
          created_at
        `)
        .eq('school_id', user.school_id);
      if (error) throw error;

      // Transform to payroll records (in real implementation, this would come from a payroll table)
      return (data || []).map((staff: any) => ({
        id: staff.id,
        employee_id: staff.employee_id,
        full_name: staff.full_name,
        role_title: staff.role_title,
        base_salary: staff.salary_amount || 0,
        allowances: staff.salary_amount * 0.1, // Mock allowances
        deductions: staff.salary_amount * 0.05, // Mock deductions
        net_salary: (staff.salary_amount || 0) * 1.05, // Mock net calculation
        payment_status: 'pending' as const,
        pay_period: new Date().toISOString().slice(0, 7), // Current month
        currency: staff.salary_currency || 'KES',
      }));
    },
    enabled: !!user.school_id,
  });

  // Calculate payroll summary
  const payrollSummary = React.useMemo(() => {
    if (!payrollRecords) return null;

    const total = payrollRecords.reduce((acc, record) => ({
      totalEmployees: acc.totalEmployees + 1,
      totalBaseSalary: acc.totalBaseSalary + record.base_salary,
      totalAllowances: acc.totalAllowances + record.allowances,
      totalDeductions: acc.totalDeductions + record.deductions,
      totalNetPayroll: acc.totalNetPayroll + record.net_salary,
    }), {
      totalEmployees: 0,
      totalBaseSalary: 0,
      totalAllowances: 0,
      totalDeductions: 0,
      totalNetPayroll: 0,
    });

    return total;
  }, [payrollRecords]);

  // Filter payroll records
  const filteredRecords = payrollRecords?.filter((record) => {
    const matchesSearch = record.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.employee_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || record.payment_status === statusFilter;

    return matchesSearch && matchesStatus;
  }) || [];

  const handleProcessPayroll = async () => {
    try {
      // In a real implementation, this would trigger payroll processing
      toast({
        title: "Payroll Processing",
        description: "Payroll processing has been initiated for all pending records.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process payroll. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      paid: "bg-green-100 text-green-800",
    };
    return variants[status as keyof typeof variants] || "bg-gray-100 text-gray-800";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Calculator className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading payroll data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Payroll Management</h2>
          <p className="text-muted-foreground">
            Manage staff salaries, allowances, and payroll processing
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleProcessPayroll}>
            <Calculator className="h-4 w-4 mr-2" />
            Process Payroll
          </Button>
        </div>
      </div>

      {/* Payroll Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Employees</p>
                <p className="text-2xl font-bold">{payrollSummary?.totalEmployees || 0}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Base Salary</p>
                <p className="text-2xl font-bold">
                  KES {payrollSummary?.totalBaseSalary?.toLocaleString() || 0}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Allowances</p>
                <p className="text-2xl font-bold text-green-600">
                  KES {payrollSummary?.totalAllowances?.toLocaleString() || 0}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Net Payroll</p>
                <p className="text-2xl font-bold text-primary">
                  KES {payrollSummary?.totalNetPayroll?.toLocaleString() || 0}
                </p>
              </div>
              <CreditCard className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or employee ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Payment status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
            <Select value={periodFilter} onValueChange={setPeriodFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Pay period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">Current Month</SelectItem>
                <SelectItem value="last">Last Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Payroll Records */}
      <Card>
        <CardHeader>
          <CardTitle>Payroll Records</CardTitle>
          <CardDescription>
            Detailed breakdown of employee compensation and payment status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredRecords.length > 0 ? (
              filteredRecords.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary font-semibold">
                        {record.full_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium">{record.full_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {record.role_title} • {record.employee_id}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getStatusBadge(record.payment_status)}>
                          {record.payment_status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Pay Period: {record.pay_period}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Base Salary</p>
                        <p className="font-medium">
                          {record.currency} {record.base_salary.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Net Pay</p>
                        <p className="font-bold text-primary">
                          {record.currency} {record.net_salary.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No payroll records found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || statusFilter !== "all"
                    ? "Try adjusting your search or filters"
                    : "No payroll data available for the selected period"}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HRPayrollModule;