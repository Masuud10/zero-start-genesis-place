import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useFinanceTracking } from '@/hooks/useFinanceTracking';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2 } from 'lucide-react';
import { FinancialTransaction } from '@/types/finance';

interface StudentFeeInfo {
  id: string;
  name: string;
  admission_number: string;
  class_name: string;
  balance: number;
}

interface EnrichedFinancialTransaction {
    id: string;
    students: { name: string } | null;
    amount: number;
    payment_method: string | null;
    mpesa_code: string | null;
    reference_number: string | null;
    processed_at: string | null;
    created_at: string;
}

const ProcessPaymentsModule = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const { processPayment, isProcessing } = useFinanceTracking();

    const [searchTerm, setSearchTerm] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<StudentFeeInfo[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<StudentFeeInfo | null>(null);
    
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('');
    const [reference, setReference] = useState('');
    
    const [recentTransactions, setRecentTransactions] = useState<EnrichedFinancialTransaction[]>([]);
    const [transactionsLoading, setTransactionsLoading] = useState(true);

    const handleSearch = async () => {
        if (!user?.school_id || !searchTerm.trim()) return;
        setIsSearching(true);
        setSelectedStudent(null);
        
        try {
            console.log('🔍 Optimized student search for:', searchTerm);
            
            // Add timeout control
            const controller = new AbortController();
            const timeoutId = setTimeout(() => {
                controller.abort();
                console.error('🔍 Student search query timed out');
            }, 3000);

            // Simplified student search without complex joins
            const { data, error } = await supabase
                .from('students')
                .select(`id, name, admission_number, class_id`)
                .eq('school_id', user.school_id)
                .eq('is_active', true)
                .or(`name.ilike.%${searchTerm.trim()}%,admission_number.ilike.%${searchTerm.trim()}%`)
                .limit(10);

            clearTimeout(timeoutId);

            if (error) throw error;
            
            if (!data || data.length === 0) {
                setSearchResults([]);
                return;
            }

            // Get classes data separately
            const classIds = [...new Set(data.map(s => s.class_id).filter(Boolean))];
            const classesResult = classIds.length > 0 ? await supabase
                .from('classes')
                .select('id, name')
                .in('id', classIds)
                .eq('school_id', user.school_id)
                .limit(20) : { data: [] };

            const classMap = new Map((classesResult.data || []).map(c => [c.id, c.name]));
            
            // Get fee data separately
            const studentIds = data.map(s => s.id);
            const { data: feesData, error: feesError } = await supabase
                .from('fees')
                .select('student_id, amount, paid_amount')
                .in('student_id', studentIds)
                .not('amount', 'is', null)
                .limit(50);

            if (feesError) {
                console.warn('Error fetching fees data:', feesError);
                // Continue without fee data
            }

            const feeMap = (feesData || []).reduce((acc, fee) => {
                if (fee.student_id && !acc[fee.student_id]) {
                    acc[fee.student_id] = { total: 0, paid: 0 };
                }
                if (fee.student_id) {
                    acc[fee.student_id].total += Number(fee.amount) || 0;
                    acc[fee.student_id].paid += Number(fee.paid_amount) || 0;
                }
                return acc;
            }, {} as Record<string, { total: number, paid: number }>);
            
            const studentsWithBalance = data.map(student => {
                const balanceData = feeMap[student.id] || { total: 0, paid: 0 };
                return {
                    id: student.id,
                    name: student.name,
                    admission_number: student.admission_number,
                    class_name: classMap.get(student.class_id) || 'N/A',
                    balance: Math.max(0, balanceData.total - balanceData.paid),
                };
            });
            setSearchResults(studentsWithBalance);

        } catch (error: any) {
            console.error('Student search error:', error);
            toast({ 
                title: "Error searching students", 
                description: error.message || 'Search failed', 
                variant: 'destructive' 
            });
        } finally {
            setIsSearching(false);
        }
    };

    const handleSelectStudent = (student: StudentFeeInfo) => {
        setSelectedStudent(student);
        setSearchTerm(student.name);
        setSearchResults([]);
    };

    const fetchRecentTransactions = async () => {
        if (!user?.school_id) return;
        setTransactionsLoading(true);
        
        try {
            console.log('💳 Optimized recent transactions fetch for school:', user.school_id);
            
            // Add timeout control
            const controller = new AbortController();
            const timeoutId = setTimeout(() => {
                controller.abort();
                console.error('💳 Recent transactions query timed out');
            }, 3000);

            // Simplified query without complex joins
            const { data, error } = await supabase
                .from('financial_transactions')
                .select(`
                    id,
                    student_id,
                    amount,
                    payment_method,
                    mpesa_code,
                    reference_number,
                    processed_at,
                    created_at
                `)
                .eq('school_id', user.school_id)
                .not('id', 'is', null)
                .order('created_at', { ascending: false })
                .limit(10);

            clearTimeout(timeoutId);

            if (error) throw error;
            
            if (!data || data.length === 0) {
                setRecentTransactions([]);
                return;
            }

            // Get student data separately
            const studentIds = [...new Set(data.map(t => t.student_id).filter(Boolean))];
            const studentsResult = studentIds.length > 0 ? await supabase
                .from('students')
                .select('id, name')
                .in('id', studentIds)
                .eq('school_id', user.school_id)
                .limit(20) : { data: [] };

            const studentMap = new Map((studentsResult.data || []).map(s => [s.id, s.name]));

            const enrichedTransactions = data.map(txn => ({
                ...txn,
                students: txn.student_id && studentMap.has(txn.student_id) ? 
                    { name: studentMap.get(txn.student_id) } : null
            })) as EnrichedFinancialTransaction[];

            setRecentTransactions(enrichedTransactions);
        } catch (error: any) {
            console.error('Recent transactions error:', error);
            toast({ 
                title: "Error fetching transactions", 
                description: error.message || 'Failed to fetch transactions', 
                variant: 'destructive' 
            });
        } finally {
            setTransactionsLoading(false);
        }
    };
    
    useEffect(() => {
        fetchRecentTransactions();
    }, [user?.school_id]);

    const handleSubmitPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStudent || !paymentAmount || !paymentMethod || !user) {
            toast({ title: 'Missing Information', description: 'Please fill all fields', variant: 'destructive' });
            return;
        }
        
        const amount = parseFloat(paymentAmount);
        if (isNaN(amount) || amount <= 0) {
            toast({ title: 'Invalid amount', description: 'Please enter a valid amount', variant: 'destructive' });
            return;
        }

        const paymentData = {
            student_id: selectedStudent.id,
            amount,
            transaction_type: 'payment',
            payment_method: paymentMethod,
            reference_number: reference,
            mpesa_code: paymentMethod === 'mpesa' ? reference : undefined,
            processed_by: user.id,
            description: `Fee payment for ${selectedStudent.name}`,
        };

        const result = await processPayment(paymentData);

        if (result.success) {
            toast({ title: "Payment processed successfully!" });
            fetchRecentTransactions();
            setSelectedStudent(prev => prev ? { ...prev, balance: prev.balance - amount } : null);
            setPaymentAmount('');
            setPaymentMethod('');
            setReference('');
        } else {
            toast({ title: "Payment failed", description: (result.error as any)?.message || 'An unknown error occurred.', variant: 'destructive' });
        }
    };
    
    const referenceLabel = useMemo(() => {
        switch (paymentMethod) {
            case 'mpesa': return 'M-Pesa Code';
            case 'bank_transfer': return 'Bank Reference';
            case 'cheque': return 'Cheque Number';
            case 'card': return 'Card Transaction ID';
            default: return 'Reference';
        }
    }, [paymentMethod]);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Record a Payment</CardTitle>
                    <CardDescription>Search for a student to record a fee payment.</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="student-search">Search Student (Name or Admission No.)</Label>
                            <div className="flex gap-2">
                                <Input id="student-search" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="e.g. Jane Doe or S123" onKeyDown={e => e.key === 'Enter' && handleSearch()}/>
                                <Button onClick={handleSearch} disabled={isSearching}>
                                    {isSearching ? <Loader2 className="h-4 w-4 animate-spin"/> : 'Search'}
                                </Button>
                            </div>
                        </div>

                        {searchResults.length > 0 && (
                            <div className="border rounded-md max-h-48 overflow-y-auto">
                                {searchResults.map(s => (
                                    <div key={s.id} onClick={() => handleSelectStudent(s)} className="p-3 hover:bg-muted cursor-pointer flex justify-between items-center">
                                        <div>
                                            <p className="font-medium">{s.name} ({s.admission_number})</p>
                                            <p className="text-sm text-muted-foreground">{s.class_name}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold">KES {s.balance.toLocaleString()}</p>
                                            <p className="text-xs text-muted-foreground">Balance</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {selectedStudent && (
                            <Card className="bg-muted/40">
                                <CardHeader>
                                    <CardTitle>{selectedStudent.name}</CardTitle>
                                    <CardDescription>Adm No: {selectedStudent.admission_number} | Class: {selectedStudent.class_name}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-2xl font-bold">Outstanding Balance: KES {selectedStudent.balance.toLocaleString()}</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    <div className="space-y-4">
                        {selectedStudent ? (
                            <form onSubmit={handleSubmitPayment} className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="amount">Amount (KES)</Label>
                                    <Input id="amount" type="number" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} placeholder={`Paying towards KES ${selectedStudent.balance.toLocaleString()}`} required />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="payment-method">Payment Method</Label>
                                    <Select onValueChange={setPaymentMethod} value={paymentMethod} required>
                                        <SelectTrigger id="payment-method">
                                            <SelectValue placeholder="Select method" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="mpesa">MPESA</SelectItem>
                                            <SelectItem value="cash">Cash</SelectItem>
                                            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                            <SelectItem value="card">Card</SelectItem>
                                            <SelectItem value="cheque">Cheque</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                {paymentMethod && paymentMethod !== 'cash' && (
                                    <div className="space-y-1.5">
                                        <Label htmlFor="reference">{referenceLabel}</Label>
                                        <Input id="reference" value={reference} onChange={e => setReference(e.target.value)} placeholder={`Enter ${referenceLabel}`} required />
                                    </div>
                                )}
                                <Button type="submit" disabled={isProcessing} className="w-full">
                                    {isProcessing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Processing...</> : 'Record Payment'}
                                </Button>
                            </form>
                        ) : (
                            <div className="flex items-center justify-center h-full text-center text-muted-foreground bg-muted/40 rounded-md p-8">
                                <p>Please search for and select a student to record a payment.</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                    {transactionsLoading ? (
                        <div className="flex justify-center items-center h-24">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground"/>
                        </div>
                    ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Student</TableHead>
                                <TableHead className="text-right">Amount (KES)</TableHead>
                                <TableHead>Method</TableHead>
                                <TableHead>Reference</TableHead>
                                <TableHead>Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentTransactions.length > 0 ? recentTransactions.map(tx => (
                                <TableRow key={tx.id}>
                                    <TableCell>{tx.students?.name || 'N/A'}</TableCell>
                                    <TableCell className="text-right font-medium">{tx.amount.toLocaleString()}</TableCell>
                                    <TableCell className="capitalize">{tx.payment_method?.replace('_', ' ')}</TableCell>
                                    <TableCell>{tx.mpesa_code || tx.reference_number || 'N/A'}</TableCell>
                                    <TableCell>{new Date(tx.processed_at || tx.created_at).toLocaleString()}</TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24">No recent transactions.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default ProcessPaymentsModule;
