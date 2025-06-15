
import React, { useState } from 'react';
import { useFinanceOfficerAnalytics } from '@/hooks/useFinanceOfficerAnalytics';
import { Loader2, AlertCircle, PlusCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import FinanceKeyMetrics from '@/components/analytics/finance/FinanceKeyMetrics';
import FeeCollectionChart from '@/components/analytics/finance/FeeCollectionChart';
import DailyTransactionsChart from '@/components/analytics/finance/DailyTransactionsChart';
import ExpenseBreakdownChart from '@/components/analytics/finance/ExpenseBreakdownChart';
import TopDefaultersList from '@/components/analytics/finance/TopDefaultersList';
import ClassCollectionProgress from '@/components/analytics/finance/ClassCollectionProgress';
import { Button } from '@/components/ui/button';
import ExpenseModal from '@/components/modals/ExpenseModal';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

const FeeManagementModule = () => {
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const { user } = useAuth();
    const queryClient = useQueryClient();

    // Set default filters. In the future, we can add UI for these.
    const filters = { term: 'current', class: 'all' };
    const { data, isLoading, error, refetch } = useFinanceOfficerAnalytics(filters);

    const handleExpenseAdded = () => {
        setIsExpenseModalOpen(false);
        // Invalidate queries to refetch data after a new expense is added.
        queryClient.invalidateQueries({ queryKey: ['financeOfficerAnalytics', user?.school_id, filters] });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="ml-2">Loading financial analytics...</p>
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error Loading Data</AlertTitle>
                <AlertDescription>
                    There was a problem loading the financial analytics. Please try again later.
                    <br />
                    <small className="text-xs">{error.message}</small>
                </AlertDescription>
            </Alert>
        );
    }
  
    if (!data) {
        return <p className="text-center text-muted-foreground mt-8">No financial data available to display.</p>;
    }

    const { keyMetrics, feeCollectionData, dailyTransactions, expenseBreakdown, defaultersList } = data;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Fee Management & Analytics</h2>
                <Button onClick={() => setIsExpenseModalOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Record Expense
                </Button>
            </div>

            {isExpenseModalOpen && (
                <ExpenseModal
                    onClose={() => setIsExpenseModalOpen(false)}
                    onExpenseAdded={handleExpenseAdded}
                />
            )}
            
            <FinanceKeyMetrics keyMetrics={keyMetrics} />
            
            <FeeCollectionChart data={feeCollectionData} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DailyTransactionsChart data={dailyTransactions} />
                <ExpenseBreakdownChart data={expenseBreakdown} />
            </div>

            <TopDefaultersList data={defaultersList} />

            <ClassCollectionProgress data={feeCollectionData} />
        </div>
    )
}

export default FeeManagementModule;
