
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DollarSign, Users } from 'lucide-react';

interface FeeDetails {
  totalBalance: number;
  balanceByStudent: Record<string, number>;
}

const ParentFinanceView: React.FC = () => {
  const { user } = useAuth();
  const [feeDetails, setFeeDetails] = useState<FeeDetails | null>(null);
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
          .select('students:student_id(id, name)')
          .eq('parent_id', user.id);
        
        if (parentStudentsError) throw parentStudentsError;

        const studentNameMap = new Map<string, string>();
        const studentIds: string[] = [];

        if (parentStudents) {
          parentStudents.forEach((ps: any) => {
            if (ps.students) {
              studentNameMap.set(ps.students.id, ps.students.name);
              studentIds.push(ps.students.id);
            }
          });
        }
        
        if (studentIds.length === 0) {
          setFeeDetails({ totalBalance: 0, balanceByStudent: {} });
          setLoading(false);
          return;
        }

        const { data: studentFees, error: feesError } = await supabase
          .from('fees')
          .select('student_id, amount, paid_amount')
          .in('student_id', studentIds)
          .in('status', ['pending', 'partial']);

        if (feesError) throw feesError;

        const balanceByStudent = studentFees.reduce((acc, fee) => {
          const studentName = studentNameMap.get(fee.student_id) || 'Unknown Student';
          if (!acc[studentName]) {
            acc[studentName] = 0;
          }
          acc[studentName] += (fee.amount || 0) - (fee.paid_amount || 0);
          return acc;
        }, {} as Record<string, number>);

        const totalBalance = Object.values(balanceByStudent).reduce((sum, balance) => sum + balance, 0);
        setFeeDetails({ totalBalance, balanceByStudent });

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
    <div className="space-y-6">
      <h3 className="text-2xl font-bold mb-2">Financial Overview</h3>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Outstanding Balance</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {feeDetails !== null ? `Ksh ${feeDetails.totalBalance.toLocaleString()}` : 'N/A'}
          </div>
          <p className="text-xs text-muted-foreground">
            Combined outstanding balance for all your children.
          </p>
        </CardContent>
      </Card>

      {feeDetails && Object.keys(feeDetails.balanceByStudent).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground"/>
              Balance Breakdown by Child
            </CardTitle>
            <CardDescription>
              Outstanding fee balance for each child.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {Object.entries(feeDetails.balanceByStudent).map(([studentName, balance]) => (
                <li key={studentName} className="flex justify-between items-center text-sm">
                  <span>{studentName}</span>
                  <span className="font-semibold bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">
                    Ksh {balance.toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ParentFinanceView;
