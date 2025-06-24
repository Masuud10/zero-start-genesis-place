
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Users, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { useStudentAccounts } from '@/hooks/useStudentAccounts';
import StudentAccountsFilters from './student-accounts/StudentAccountsFilters';
import StudentAccountsTable from './student-accounts/StudentAccountsTable';
import StudentAccountDetailsModal from './student-accounts/StudentAccountDetailsModal';
import type { StudentAccount } from '@/hooks/useStudentAccounts';

const StudentAccountsPanel: React.FC = () => {
  const { studentAccounts, loading, error, refetch } = useStudentAccounts();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedAccount, setSelectedAccount] = useState<StudentAccount | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const formatCurrency = (amount: number) => `KES ${amount.toLocaleString()}`;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter accounts based on search and class
  const filteredAccounts = studentAccounts.filter(account => {
    const matchesSearch = account.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.student.admission_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass === 'all' || account.student.class_id === selectedClass;
    return matchesSearch && matchesClass;
  });

  const handleViewDetails = (account: StudentAccount) => {
    setSelectedAccount(account);
    setModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2">Loading student accounts...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600 mb-4">Error loading student accounts: {error}</p>
        <Button onClick={refetch} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  // Calculate summary stats
  const totalBalance = filteredAccounts.reduce((sum, acc) => sum + acc.outstanding, 0);
  const totalCollected = filteredAccounts.reduce((sum, acc) => sum + acc.totalPaid, 0);
  const studentsWithBalances = filteredAccounts.filter(acc => acc.outstanding > 0).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6" />
            Student Accounts
          </h2>
          <p className="text-muted-foreground">Manage student fee accounts and payment history</p>
        </div>
        <Button onClick={refetch} variant="outline">
          <FileText className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredAccounts.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalBalance)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalCollected)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Students with Balances</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{studentsWithBalances}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="accounts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="accounts">All Accounts</TabsTrigger>
          <TabsTrigger value="outstanding">Outstanding Only</TabsTrigger>
          <TabsTrigger value="paid">Paid Up</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts">
          <Card>
            <CardHeader>
              <CardTitle>Student Fee Accounts</CardTitle>
              <StudentAccountsFilters
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                selectedClass={selectedClass}
                setSelectedClass={setSelectedClass}
                students={studentAccounts.map(acc => acc.student)}
              />
            </CardHeader>
            <CardContent>
              <StudentAccountsTable
                accounts={filteredAccounts}
                formatCurrency={formatCurrency}
                onViewDetails={handleViewDetails}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="outstanding">
          <Card>
            <CardHeader>
              <CardTitle>Outstanding Balances</CardTitle>
            </CardHeader>
            <CardContent>
              <StudentAccountsTable
                accounts={filteredAccounts.filter(acc => acc.outstanding > 0)}
                formatCurrency={formatCurrency}
                onViewDetails={handleViewDetails}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="paid">
          <Card>
            <CardHeader>
              <CardTitle>Paid Up Students</CardTitle>
            </CardHeader>
            <CardContent>
              <StudentAccountsTable
                accounts={filteredAccounts.filter(acc => acc.outstanding <= 0)}
                formatCurrency={formatCurrency}
                onViewDetails={handleViewDetails}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Student Account Details Modal */}
      <StudentAccountDetailsModal
        account={selectedAccount}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        formatCurrency={formatCurrency}
        getStatusColor={getStatusColor}
      />
    </div>
  );
};

export default StudentAccountsPanel;
