
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign } from 'lucide-react';

const ParentFinanceView: React.FC = () => {
  const { user } = useAuth();
  const [feeBalance, setFeeBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFinance = async () => {
      if (!user?.id) return;
      setLoading(true);
      setError(null);

      try {
        const { data: parentStudents, error: parentStudentsError } = await supabase
          .from('parent_students')
          .select('student_id')
          .eq('parent_id', user.id);
        
        if (parentStudentsError) throw parentStudentsError;

        const studentIds = parentStudents.map(ps => ps.student_id);

        if (studentIds.length === 0) {
          setFeeBalance(0);
          return;
        }

        const { data: studentFees, error: feesError } = await supabase
          .from('fees')
          .select('amount, paid_amount')
          .in('student_id', studentIds)
          .in('status', ['pending', 'partial']);

        if (feesError) throw feesError;

        const balance = studentFees.reduce((sum, fee) => sum + (fee.amount || 0) - (fee.paid_amount || 0), 0);
        setFeeBalance(balance);

      } catch (err: any) {
        setError(`Failed to fetch financial data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchFinance();
  }, [user]);

  if (loading) return <div>Loading financial information...</div>;
  
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error Loading Finances</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Outstanding Fee Balance</CardTitle>
        <DollarSign className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {feeBalance !== null ? `Ksh ${feeBalance.toLocaleString()}` : 'N/A'}
        </div>
        <p className="text-xs text-muted-foreground">
          Total balance for all your children.
        </p>
      </CardContent>
    </Card>
  );
};

export default ParentFinanceView;
