
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, CreditCard, TrendingUp, PieChart, Smartphone, Receipt, Plus, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import FeeCollectionModal from '@/components/modals/FeeCollectionModal';
import FinancialReportsModal from '@/components/modals/FinancialReportsModal';
import MpesaPaymentModal from '@/components/modals/MpesaPaymentModal';
import ExpenseModal from '@/components/modals/ExpenseModal';

const FinanceModule = () => {
  const { user } = useAuth();
  const [showFeeCollection, setShowFeeCollection] = useState(false);
  const [showReports, setShowReports] = useState(false);
  const [showMpesa, setShowMpesa] = useState(false);
  const [showExpenses, setShowExpenses] = useState(false);

  const isFinanceOfficer = user?.role === 'finance_officer' || user?.role === 'principal' || user?.role === 'school_owner';

  // Calculate net revenue (revenue - expenses)
  const totalRevenue = 2500000;
  const totalExpenses = 1200000;
  const netRevenue = totalRevenue - totalExpenses;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent">
          Finance Management
        </h1>
        <p className="text-muted-foreground">Manage fees, payments, and financial records</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">KES {totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Receipt className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Expenses</p>
                <p className="text-2xl font-bold">KES {totalExpenses.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Net Revenue</p>
                <p className="text-2xl font-bold">KES {netRevenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <PieChart className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Collection Rate</p>
                <p className="text-2xl font-bold">87%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Button 
          onClick={() => setShowMpesa(true)}
          className="h-16 flex flex-col items-center gap-2"
        >
          <Smartphone className="w-6 h-6" />
          M-PESA Payments
        </Button>
        
        {isFinanceOfficer && (
          <Button 
            onClick={() => setShowFeeCollection(true)}
            variant="outline"
            className="h-16 flex flex-col items-center gap-2"
          >
            <CreditCard className="w-6 h-6" />
            Fee Collection
          </Button>
        )}
        
        {isFinanceOfficer && (
          <Button 
            onClick={() => setShowExpenses(true)}
            variant="outline"
            className="h-16 flex flex-col items-center gap-2"
          >
            <Plus className="w-6 h-6" />
            Add Expenses
          </Button>
        )}
        
        <Button 
          onClick={() => setShowReports(true)}
          variant="outline"
          className="h-16 flex flex-col items-center gap-2"
        >
          <FileText className="w-6 h-6" />
          Financial Reports
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Financial Management Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">M-PESA Integration</h3>
              <p className="text-sm text-muted-foreground">
                Automated fee collection through M-PESA mobile payments using Safaricom Daraja API
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Fee Management</h3>
              <p className="text-sm text-muted-foreground">
                Track student fees, payments, and outstanding balances automatically
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Receipt className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="font-semibold mb-2">Expense Management</h3>
              <p className="text-sm text-muted-foreground">
                Record and track school expenses with automatic revenue deduction
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <PieChart className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Financial Reports</h3>
              <p className="text-sm text-muted-foreground">
                Generate comprehensive financial reports and analytics
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="font-semibold mb-2">Revenue Tracking</h3>
              <p className="text-sm text-muted-foreground">
                Monitor net revenue after automatic expense deductions
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="font-semibold mb-2">Payment Processing</h3>
              <p className="text-sm text-muted-foreground">
                Secure payment processing with real-time transaction tracking
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      {showMpesa && <MpesaPaymentModal onClose={() => setShowMpesa(false)} />}
      {showFeeCollection && <FeeCollectionModal onClose={() => setShowFeeCollection(false)} />}
      {showReports && <FinancialReportsModal onClose={() => setShowReports(false)} />}
      {showExpenses && <ExpenseModal onClose={() => setShowExpenses(false)} />}
    </div>
  );
};

export default FinanceModule;
