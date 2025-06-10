
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import FeeStatsCards from './fee-collection/FeeStatsCards';
import FeeFilters from './fee-collection/FeeFilters';
import StudentFeeList from './fee-collection/StudentFeeList';
import PaymentForm from './fee-collection/PaymentForm';

interface Student {
  id: number;
  name: string;
  admissionNo: string;
  class: string;
  totalFees: number;
  paidAmount: number;
  balance: number;
  lastPayment: string;
}

interface FeeCollectionModalProps {
  onClose: () => void;
}

const FeeCollectionModal: React.FC<FeeCollectionModalProps> = ({ onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState<Student[]>([
    { 
      id: 1, 
      name: 'John Doe', 
      admissionNo: 'STU001', 
      class: 'Grade 8A',
      totalFees: 15000,
      paidAmount: 10000,
      balance: 5000,
      lastPayment: '2024-01-15'
    },
    { 
      id: 2, 
      name: 'Jane Smith', 
      admissionNo: 'STU002', 
      class: 'Grade 8A',
      totalFees: 15000,
      paidAmount: 15000,
      balance: 0,
      lastPayment: '2024-01-20'
    },
    { 
      id: 3, 
      name: 'Mike Johnson', 
      admissionNo: 'STU003', 
      class: 'Grade 8B',
      totalFees: 15000,
      paidAmount: 8000,
      balance: 7000,
      lastPayment: '2024-01-10'
    },
  ]);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [mpesaCode, setMpesaCode] = useState('');
  const { toast } = useToast();

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.admissionNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = !selectedClass || selectedClass === 'all' || student.class === selectedClass;
    return matchesSearch && matchesClass;
  });

  const handlePayment = () => {
    if (!selectedStudent || !paymentAmount || !paymentMethod) {
      toast({
        title: "Missing Information",
        description: "Please fill in all payment details.",
        variant: "destructive"
      });
      return;
    }

    const amount = parseFloat(paymentAmount);
    if (amount <= 0 || amount > selectedStudent.balance) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid payment amount.",
        variant: "destructive"
      });
      return;
    }

    // Update student payment
    setStudents(prev => prev.map(student => 
      student.id === selectedStudent.id 
        ? { 
            ...student, 
            paidAmount: student.paidAmount + amount,
            balance: student.balance - amount,
            lastPayment: new Date().toISOString().split('T')[0]
          }
        : student
    ));

    toast({
      title: "Payment Recorded",
      description: `Payment of KES ${amount.toLocaleString()} recorded for ${selectedStudent.name}.`,
    });

    setShowPaymentForm(false);
    setSelectedStudent(null);
    setPaymentAmount('');
    setPaymentMethod('');
    setMpesaCode('');
  };

  const openPaymentForm = (student: Student) => {
    setSelectedStudent(student);
    setShowPaymentForm(true);
  };

  const getTotalStats = () => {
    const totalFees = students.reduce((sum, s) => sum + s.totalFees, 0);
    const totalPaid = students.reduce((sum, s) => sum + s.paidAmount, 0);
    const totalBalance = students.reduce((sum, s) => sum + s.balance, 0);
    const collectionRate = totalFees > 0 ? (totalPaid / totalFees) * 100 : 0;

    return { totalFees, totalPaid, totalBalance, collectionRate };
  };

  const stats = getTotalStats();

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Fee Collection Management</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <FeeStatsCards {...stats} />
          
          <FeeFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedClass={selectedClass}
            setSelectedClass={setSelectedClass}
          />

          <StudentFeeList
            students={filteredStudents}
            onRecordPayment={openPaymentForm}
          />

          {showPaymentForm && selectedStudent && (
            <PaymentForm
              student={selectedStudent}
              paymentAmount={paymentAmount}
              setPaymentAmount={setPaymentAmount}
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              mpesaCode={mpesaCode}
              setMpesaCode={setMpesaCode}
              onSubmit={handlePayment}
              onCancel={() => setShowPaymentForm(false)}
            />
          )}

          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FeeCollectionModal;
