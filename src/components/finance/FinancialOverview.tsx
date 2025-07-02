
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, DollarSign, Users, CreditCard, AlertCircle, Coins, FileText, Settings } from 'lucide-react';

const FinancialOverview: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Financial Overview</h1>
          <p className="text-gray-600">Navigate to specific finance modules using the sidebar</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <Coins className="h-5 w-5" />
              Fee Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-3">Manage student fees, create fee structures, and track payment status</p>
            <p className="text-sm text-blue-600">Use the "Fee Management" link in the sidebar to access this module</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <CreditCard className="h-5 w-5" />
              MPESA Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-3">Process mobile money payments and view transaction history</p>
            <p className="text-sm text-green-600">Use the "MPESA Payments" link in the sidebar to access this module</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-700">
              <TrendingUp className="h-5 w-5" />
              Financial Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-3">View financial trends, collection rates, and performance metrics</p>
            <p className="text-sm text-purple-600">Use the "Financial Analytics" link in the sidebar to access this module</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <FileText className="h-5 w-5" />
              Financial Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-3">Generate and download comprehensive financial reports</p>
            <p className="text-sm text-orange-600">Use the "Financial Reports" link in the sidebar to access this module</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-indigo-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-700">
              <Users className="h-5 w-5" />
              Student Accounts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-3">Manage individual student financial accounts and payment tracking</p>
            <p className="text-sm text-indigo-600">Use the "Student Accounts" link in the sidebar to access this module</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-gray-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-700">
              <Settings className="h-5 w-5" />
              Finance Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-3">Configure payment methods, late fees, and financial preferences</p>
            <p className="text-sm text-gray-600">Use the "Finance Settings" link in the sidebar to access this module</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FinancialOverview;
