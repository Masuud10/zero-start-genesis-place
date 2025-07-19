import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  Building2,
  DollarSign,
  Calendar,
  Users,
  FileText,
  CheckCircle,
  AlertTriangle,
  Clock,
  XCircle,
  Edit,
  Download,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface SchoolBillingDetailsProps {
  schoolId: string;
  onBack: () => void;
  onEditRecord: (record: BillingRecord) => void;
}

interface BillingRecord {
  id: string;
  school_id: string;
  billing_type: "setup_fee" | "subscription_fee";
  amount: number;
  currency: string;
  billing_period_start?: string;
  billing_period_end?: string;
  student_count?: number;
  status: "pending" | "paid" | "overdue" | "cancelled";
  invoice_number: string;
  description: string;
  due_date: string;
  paid_date?: string;
  payment_method?: string;
  created_at: string;
  updated_at: string;
}

interface School {
  id: string;
  name: string;
  email: string;
  status: string;
}

const SchoolBillingDetails: React.FC<SchoolBillingDetailsProps> = ({
  schoolId,
  onBack,
  onEditRecord,
}) => {
  const { data: school, isLoading: schoolLoading } = useQuery({
    queryKey: ["school", schoolId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("schools")
        .select("id, name, email, status")
        .eq("id", schoolId)
        .single();

      if (error) throw error;
      return data as School;
    },
  });

  const { data: billingRecords, isLoading: recordsLoading } = useQuery({
    queryKey: ["school-billing-records", schoolId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("school_billing_records")
        .select("*")
        .eq("school_id", schoolId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as BillingRecord[];
    },
  });

  const { data: studentCount } = useQuery({
    queryKey: ["school-student-count", schoolId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("students")
        .select("*", { count: "exact", head: true })
        .eq("school_id", schoolId)
        .eq("is_active", true);

      if (error) throw error;
      return count || 0;
    },
  });

  const formatCurrency = (amount: number) => {
    return `KES ${amount.toLocaleString("en-KE", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-KE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      paid: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
      overdue: { color: "bg-red-100 text-red-800", icon: AlertTriangle },
      cancelled: { color: "bg-gray-100 text-gray-800", icon: XCircle },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getBillingTypeBadge = (type: string) => {
    const typeConfig = {
      setup_fee: { color: "bg-blue-100 text-blue-800", label: "Setup Fee" },
      subscription_fee: {
        color: "bg-purple-100 text-purple-800",
        label: "Subscription",
      },
    };

    const config =
      typeConfig[type as keyof typeof typeConfig] || typeConfig.setup_fee;

    return <Badge className={config.color}>{config.label}</Badge>;
  };

  // Calculate summary statistics
  const summary = React.useMemo(() => {
    if (!billingRecords) return null;

    const totalBilled = billingRecords.reduce(
      (sum, record) => sum + record.amount,
      0
    );
    const totalPaid = billingRecords
      .filter((r) => r.status === "paid")
      .reduce((sum, record) => sum + record.amount, 0);
    const outstandingBalance = totalBilled - totalPaid;
    const setupFees = billingRecords.filter(
      (r) => r.billing_type === "setup_fee"
    );
    const subscriptionFees = billingRecords.filter(
      (r) => r.billing_type === "subscription_fee"
    );

    return {
      totalBilled,
      totalPaid,
      outstandingBalance,
      setupFees: setupFees.length,
      subscriptionFees: subscriptionFees.length,
      totalRecords: billingRecords.length,
      pendingRecords: billingRecords.filter((r) => r.status === "pending")
        .length,
      paidRecords: billingRecords.filter((r) => r.status === "paid").length,
    };
  }, [billingRecords]);

  if (schoolLoading || recordsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading school billing details...</p>
        </div>
      </div>
    );
  }

  if (!school) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>School not found.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to List
          </Button>
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {school.name}
            </h2>
            <p className="text-muted-foreground">{school.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* School Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>School Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge
                className={
                  school.status === "active"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }
              >
                {school.status}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Students</p>
              <p className="text-lg font-semibold flex items-center gap-1">
                <Users className="h-4 w-4" />
                {studentCount || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Total Billing Records
              </p>
              <p className="text-lg font-semibold flex items-center gap-1">
                <FileText className="h-4 w-4" />
                {summary?.totalRecords || 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Billing Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Billed
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(summary.totalBilled)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(summary.totalPaid)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(summary.outstandingBalance)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Collection Rate
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summary.totalBilled > 0
                  ? Math.round((summary.totalPaid / summary.totalBilled) * 100)
                  : 0}
                %
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Billing Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Billing Records</CardTitle>
        </CardHeader>
        <CardContent>
          {!billingRecords || billingRecords.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No billing records found for this school.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {billingRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {record.invoice_number}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {record.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getBillingTypeBadge(record.billing_type)}
                        {record.student_count && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {record.student_count} students
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {formatCurrency(record.amount)}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {formatDate(record.due_date)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {formatDate(record.created_at)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditRecord(record)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment History */}
      {billingRecords &&
        billingRecords.filter((r) => r.status === "paid").length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {billingRecords
                  .filter((r) => r.status === "paid")
                  .map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <div className="font-medium">
                          {record.invoice_number}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {record.description}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {formatCurrency(record.amount)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Paid on{" "}
                          {record.paid_date
                            ? formatDate(record.paid_date)
                            : "N/A"}
                        </div>
                        {record.payment_method && (
                          <div className="text-xs text-muted-foreground">
                            via {record.payment_method.replace("_", " ")}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
    </div>
  );
};

export default SchoolBillingDetails;
