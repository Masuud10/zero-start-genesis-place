import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, DollarSign, Calendar, User, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface PendingExpense {
  id: string;
  amount: number;
  description: string;
  category: string;
  created_at: string;
  submitted_by?: string;
  status: 'pending_approval';
  approval_date?: string | null;
  approved_by?: string | null;
  rejection_reason?: string | null;
  school_id?: string;
  expense_date?: string;
  date?: string;
  receipt_url?: string | null;
  profiles?: {
    name?: string;
    email?: string;
  } | null;
}

interface ExpenseApprovalsSectionProps {
  schoolId: string | null;
}

const ExpenseApprovalsSection: React.FC<ExpenseApprovalsSectionProps> = ({ schoolId }) => {
  const [pendingExpenses, setPendingExpenses] = useState<PendingExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; expenseId: string | null }>({
    open: false,
    expenseId: null
  });
  const [rejectionReason, setRejectionReason] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (schoolId) {
      fetchPendingExpenses();
    }
  }, [schoolId]);

  const fetchPendingExpenses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('expenses')
        .select(`
          *,
          profiles:submitted_by (name, email)
        `)
        .eq('school_id', schoolId)
        .eq('status', 'pending_approval')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching pending expenses:', error);
        toast({
          title: "Error",
          description: "Failed to load pending expense approvals",
          variant: "destructive",
        });
        return;
      }

      setPendingExpenses((data || []) as unknown as PendingExpense[]);
    } catch (error) {
      console.error('Error fetching pending expenses:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (expenseId: string) => {
    try {
      setActionLoading(expenseId);
      
      const { error } = await supabase.functions.invoke('approve-expense', {
        body: { expenseId }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Expense approved successfully",
      });

      // Refresh the list
      await fetchPendingExpenses();
    } catch (error) {
      console.error('Error approving expense:', error);
      toast({
        title: "Error",
        description: "Failed to approve expense",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectDialog.expenseId || !rejectionReason.trim()) return;

    try {
      setActionLoading(rejectDialog.expenseId);
      
      const { error } = await supabase.functions.invoke('reject-expense', {
        body: { 
          expenseId: rejectDialog.expenseId,
          rejectionReason: rejectionReason.trim()
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Expense rejected successfully",
      });

      // Reset state
      setRejectDialog({ open: false, expenseId: null });
      setRejectionReason("");

      // Refresh the list
      await fetchPendingExpenses();
    } catch (error) {
      console.error('Error rejecting expense:', error);
      toast({
        title: "Error",
        description: "Failed to reject expense",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Pending Expense Approvals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading pending approvals...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Pending Expense Approvals
            </div>
            <Badge variant={pendingExpenses.length > 0 ? "destructive" : "secondary"}>
              {pendingExpenses.length} pending
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingExpenses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <p>No pending expense approvals</p>
              <p className="text-sm">All expenses have been reviewed</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingExpenses.map((expense) => (
                <div key={expense.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h4 className="font-medium">{expense.description}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          {formatCurrency(expense.amount)}
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {expense.profiles?.name || 'Unknown'}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(expense.created_at)}
                        </div>
                      </div>
                      <Badge variant="outline">{expense.category}</Badge>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() => handleApprove(expense.id)}
                      disabled={actionLoading === expense.id}
                      className="flex-1"
                      variant="default"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {actionLoading === expense.id ? 'Approving...' : 'Approve'}
                    </Button>
                    <Button
                      onClick={() => setRejectDialog({ open: true, expenseId: expense.id })}
                      disabled={actionLoading === expense.id}
                      className="flex-1"
                      variant="destructive"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={rejectDialog.open} onOpenChange={(open) => {
        if (!open) {
          setRejectDialog({ open: false, expenseId: null });
          setRejectionReason("");
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Expense Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Please provide a reason for rejecting this expense request. This will help the finance officer understand what needs to be corrected.
            </p>
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectDialog({ open: false, expenseId: null });
                setRejectionReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectionReason.trim() || actionLoading === rejectDialog.expenseId}
            >
              {actionLoading === rejectDialog.expenseId ? 'Rejecting...' : 'Reject Expense'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ExpenseApprovalsSection;