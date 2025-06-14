
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import FeeStatsCards from './fee-collection/FeeStatsCards';
import FeeFilters from './fee-collection/FeeFilters';
import StudentFeeList from './fee-collection/StudentFeeList';
import PaymentForm from './fee-collection/PaymentForm';

interface FeeStudent {
  id: string;
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
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState<FeeStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<FeeStudent | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [mpesaCode, setMpesaCode] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const loadStudentFees = async () => {
      if (!user?.school_id) return;

      try {
        setLoading(true);
        
        // Fetch students with their fee information
        const { data: studentsData, error: studentsError } = await supabase
          .from('students')
          .select(`
            id,
            name,
            admission_number,
            class:classes(name),
            fees(
              amount,
              paid_amount,
              due_date,
              status,
              created_at
            )
          `)
          .eq('school_id', user.school_id)
          .eq('is_active', true);

        if (studentsError) {
          throw studentsError;
        }

        // Transform the data
        const transformedStudents: FeeStudent[] = (studentsData || []).map(student => {
          const totalFees = student.fees?.reduce((sum: number, fee: any) => sum + (fee.amount || 0), 0) || 0;
          const paidAmount = student.fees?.reduce((sum: number, fee: any) => sum + (fee.paid_amount || 0), 0) || 0;
          const lastPayment = student.fees
            ?.filter((fee: any) => fee.paid_amount > 0)
            ?.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())?.[0]?.created_at || '';

          return {
            id: student.id,
            name: student.name,
            admissionNo: student.admission_number,
            class: student.class?.name || 'Not Assigned',
            totalFees,
            paidAmount,
            balance: totalFees - paidAmount,
            lastPayment: lastPayment ? new Date(lastPayment).toLocaleDateString() : 'No payments'
          };
        });

        setStudents(transformedStudents);
      } catch (error) {
        console.error('Error loading student fees:', error);
        toast({
          title: "Error",
          description: "Failed to load student fee data.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadStudentFees();
  }, [user?.school_id, toast]);

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.admissionNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = !selectedClass || selectedClass === 'all' || student.class === selectedClass;
    return matchesSearch && matchesClass;
  });

  const handlePayment = async () => {
    if (!selectedStudent || !paymentAmount || !paymentMethod || !user) {
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

    try {
      // Record the payment in financial_transactions
      const { error: transactionError } = await supabase
        .from('financial_transactions')
        .insert({
          student_id: selectedStudent.id,
          amount: amount,
          transaction_type: 'fee_payment',
          payment_method: paymentMethod,
          mpesa_code: paymentMethod === 'mpesa' ? mpesaCode : null,
          processed_by: user.id,
          school_id: user.school_id,
          description: `Fee payment for ${selectedStudent.name}`
        });

      if (transactionError) {
        throw transactionError;
      }

      // Update the local state
      setStudents(prev => prev.map(student => 
        student.id === selectedStudent.id 
          ? { 
              ...student, 
              paidAmount: student.paidAmount + amount,
              balance: student.balance - amount,
              lastPayment: new Date().toLocaleDateString()
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
    } catch (error) {
      console.error('Error recording payment:', error);
      toast({
        title: "Error",
        description: "Failed to record payment. Please try again.",
        variant: "destructive"
      });
    }
  };

  const openPaymentForm = (student: FeeStudent) => {
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

  if (loading) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle>Fee Collection Management</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground mt-2">Loading fee data...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

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
