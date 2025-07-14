import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, AlertCircle, Calendar, Eye } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

const ParentFeeOverview: React.FC = () => {
  const { user } = useAuth();

  // Fetch parent's students and their fees
  const {
    data: studentFees,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["parent-student-fees", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      let attempts = 0;
      const maxAttempts = 3;

      while (attempts < maxAttempts) {
        try {
          // Get parent's students
          const { data: parentStudents, error: parentError } = await supabase
            .from("parent_students")
            .select(
              `
              student_id,
              students:student_id(
                id,
                name,
                admission_number,
                class_id
              )
            `
            )
            .eq("parent_id", user.id)
            .limit(50); // Add reasonable limit

          if (parentError) throw parentError;

          const studentIds = parentStudents?.map((ps) => ps.student_id) || [];
          if (studentIds.length === 0) {
            console.log("📊 No students found for parent");
            return [];
          }

          // Add warning if many students found
          if (studentIds.length >= 50) {
            console.warn(
              "⚠️ Many students found for parent (50+), data may be truncated"
            );
          }

          // Get class information separately to avoid ambiguity
          const { data: studentsWithClasses, error: studentsError } =
            await supabase
              .from("students")
              .select(
                `
              id,
              name,
              admission_number,
              class_id
            `
              )
              .in("id", studentIds)
              .limit(50);

          if (studentsError) throw studentsError;

          // Get class names
          const classIds = [
            ...new Set(
              studentsWithClasses?.map((s) => s.class_id).filter(Boolean)
            ),
          ];
          const { data: classes, error: classesError } = await supabase
            .from("classes")
            .select("id, name")
            .in("id", classIds)
            .limit(50);

          if (classesError) throw classesError;

          // Create a map of class names
          const classMap =
            classes?.reduce((acc, cls) => {
              acc[cls.id] = cls.name;
              return acc;
            }, {} as Record<string, string>) || {};

          // Get fees for these students
          const { data: fees, error: feesError } = await supabase
            .from("student_fees")
            .select(
              `
              *,
              fee:fee_id(
                id,
                category,
                amount,
                term,
                academic_year,
                due_date
              )
            `
            )
            .in("student_id", studentIds)
            .order("due_date", { ascending: true })
            .limit(200); // Add reasonable limit

          if (feesError) throw feesError;

          // Add warning if many fees found
          if (fees && fees.length >= 200) {
            console.warn(
              "⚠️ Many fees found for parent students (200+), data may be truncated"
            );
          }

          // Combine student info with fees and class names
          const result =
            fees?.map((fee) => {
              const student = studentsWithClasses?.find(
                (s) => s.id === fee.student_id
              );
              return {
                ...fee,
                student: student
                  ? {
                      ...student,
                      class_name: student.class_id
                        ? classMap[student.class_id] || "Unknown Class"
                        : "No Class",
                    }
                  : null,
              };
            }) || [];

          // Add warning if no fees found
          if (result.length === 0 && studentIds.length > 0) {
            console.warn(
              "⚠️ No fees found for parent students - possible data issue"
            );
          }

          return result;
        } catch (error) {
          attempts++;
          console.error(
            `📊 Parent fee overview error (attempt ${attempts}/${maxAttempts}):`,
            error
          );

          // If this is the last attempt, throw the error
          if (attempts >= maxAttempts) {
            throw error;
          }

          // Wait before retrying (exponential backoff)
          await new Promise((resolve) =>
            setTimeout(resolve, Math.pow(2, attempts) * 1000)
          );
        }
      }

      // This should never be reached, but TypeScript requires it
      throw new Error(
        "Failed to fetch parent fee data after all retry attempts"
      );
    },
    enabled: !!user?.id,
    retry: 1, // Let our custom retry logic handle it
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "partial":
        return "bg-yellow-100 text-yellow-800";
      case "unpaid":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Fee Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading fee information...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            Fee Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-red-600">
            Error loading fee information. Please try again later.
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!studentFees || studentFees.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Fee Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            No fee information available for your children.
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate totals
  const totalFees = studentFees.reduce(
    (sum, sf) => sum + (sf.fee?.amount || 0),
    0
  );
  const totalPaid = studentFees.reduce(
    (sum, sf) => sum + (sf.amount_paid || 0),
    0
  );
  const totalOutstanding = totalFees - totalPaid;
  const overdueCount = studentFees.filter(
    (sf) => new Date(sf.due_date) < new Date() && sf.status !== "paid"
  ).length;

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Fees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalFees)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Paid Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalPaid)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalOutstanding)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {overdueCount}
            </div>
            <p className="text-xs text-muted-foreground">Fee(s) overdue</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Fees */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Recent Fee Assignments</span>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  View All
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>All Fee Assignments</DialogTitle>
                </DialogHeader>
                <div className="max-h-96 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Term</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Paid</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Due Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {studentFees.map((sf) => {
                        const isOverdue =
                          new Date(sf.due_date) < new Date() &&
                          sf.status !== "paid";
                        return (
                          <TableRow
                            key={sf.id}
                            className={isOverdue ? "bg-red-50" : ""}
                          >
                            <TableCell>
                              <div>
                                <p className="font-medium">
                                  {sf.student?.name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {sf.student?.admission_number} -{" "}
                                  {sf.student?.class_name}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>{sf.fee?.category}</TableCell>
                            <TableCell>{sf.fee?.term}</TableCell>
                            <TableCell>
                              {formatCurrency(sf.fee?.amount || 0)}
                            </TableCell>
                            <TableCell>
                              {formatCurrency(sf.amount_paid || 0)}
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(sf.status)}>
                                {sf.status.charAt(0).toUpperCase() +
                                  sf.status.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span
                                  className={
                                    isOverdue ? "text-red-600 font-medium" : ""
                                  }
                                >
                                  {format(
                                    new Date(sf.due_date),
                                    "MMM dd, yyyy"
                                  )}
                                </span>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {studentFees.slice(0, 5).map((sf) => {
              const isOverdue =
                new Date(sf.due_date) < new Date() && sf.status !== "paid";
              const outstanding = (sf.fee?.amount || 0) - (sf.amount_paid || 0);

              return (
                <div
                  key={sf.id}
                  className={`flex items-center justify-between p-3 border rounded-lg ${
                    isOverdue ? "border-red-200 bg-red-50" : ""
                  }`}
                >
                  <div>
                    <p className="font-medium">{sf.student?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {sf.fee?.category} - {sf.fee?.term} |{" "}
                      {sf.student?.class_name}
                    </p>
                    {isOverdue && (
                      <p className="text-sm text-red-600 font-medium">
                        Overdue
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(sf.status)}>
                      {sf.status.charAt(0).toUpperCase() + sf.status.slice(1)}
                    </Badge>
                    <p className="text-sm mt-1">
                      {formatCurrency(sf.amount_paid || 0)} /{" "}
                      {formatCurrency(sf.fee?.amount || 0)}
                    </p>
                    {outstanding > 0 && (
                      <p className="text-xs text-red-600">
                        Outstanding: {formatCurrency(outstanding)}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ParentFeeOverview;
