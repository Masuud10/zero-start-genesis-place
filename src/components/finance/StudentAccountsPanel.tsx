
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useStudentAccounts } from '@/hooks/useStudentAccounts';
import StudentAccountsFilters from './student-accounts/StudentAccountsFilters';
import StudentAccountsTable from './student-accounts/StudentAccountsTable';
import StudentAccountDetailsModal from './student-accounts/StudentAccountDetailsModal';
import type { StudentAccount } from '@/hooks/useStudentAccounts';

const StudentAccountsPanel: React.FC = () => {
  const { students, studentAccounts, loading, error } = useStudentAccounts();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState<StudentAccount | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredAccounts = studentAccounts.filter(account => {
    const matchesSearch = account.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.student.admission_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass === 'all' || account.student.class_id === selectedClass;
    return matchesSearch && matchesClass;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => `KES ${amount.toLocaleString()}`;

  const handleViewDetails = (account: StudentAccount) => {
    setSelectedStudent(account);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedStudent(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="ml-2">Loading student accounts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error loading student accounts: {error}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Student Accounts</h2>
          <p className="text-muted-foreground">View detailed financial records for each student</p>
        </div>
      </div>

      <StudentAccountsFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedClass={selectedClass}
        setSelectedClass={setSelectedClass}
        students={students}
      />

      <Card>
        <CardHeader>
          <CardTitle>Student Financial Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <StudentAccountsTable
            accounts={filteredAccounts}
            formatCurrency={formatCurrency}
            onViewDetails={handleViewDetails}
          />
        </CardContent>
      </Card>

      <StudentAccountDetailsModal
        account={selectedStudent}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        formatCurrency={formatCurrency}
        getStatusColor={getStatusColor}
      />
    </div>
  );
};

export default StudentAccountsPanel;
