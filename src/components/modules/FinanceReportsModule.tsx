
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const FinanceReportsModule = () => {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Financial Reports</h2>
            <Card>
                <CardHeader>
                    <CardTitle>Generate and Download Reports</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p>Select a report to download.</p>
                    <div className="flex flex-wrap gap-4">
                        <Button>Download Fee Statements</Button>
                        <Button>Download Payment Summaries</Button>
                        <Button>Download Outstanding Balances Report</Button>
                        <Button>Download Expense Reports</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default FinanceReportsModule;
