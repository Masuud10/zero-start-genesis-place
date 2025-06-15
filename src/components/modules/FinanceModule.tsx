import React, { useState, useEffect } from 'react';
import SchoolSummaryFilter from '../shared/SchoolSummaryFilter';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, TrendingUp, Users, FileText, Plus, Download, CreditCard } from 'lucide-react';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import DownloadReportButton from "@/components/reports/DownloadReportButton";

interface FeeRecord {
  id: string;
  student_id: string;
  amount: number;
  paid_amount: number;
  category: string;
  status: string;
  due_date: string;
  student?: {
    name: string;
    admission_number: string;
    class_id: string;
  };
  className?: string;
}

const FinanceModule: React.FC = () => {
  const { user } = useAuth();
  const isEdufamAdmin = user?.role === 'edufam_admin';

  const [schoolFilter, setSchoolFilter] = useState<string | null>(null);
  const [schools, setSchools] = useState<{ id: string; name: string }[]>([]);
  const [financeSummary, setFinanceSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch schools for dropdown
  useEffect(() => {
    if (!isEdufamAdmin) return;
    supabase.from("schools")
      .select("id, name")
      .then(({ data, error }) => {
        if (error) setError("Could not fetch schools");
        else setSchools(data || []);
      });
  }, [isEdufamAdmin]);

  // Fetch finance summary for admin
  useEffect(() => {
    if (!isEdufamAdmin) return;
    setLoading(true);
    setError(null);
    let query = supabase.rpc('get_finance_summary', { school_id: schoolFilter });
    if (!schoolFilter) query = supabase.rpc('get_finance_summary');
    query.then(({ data, error }) => {
      if (error) setError("Failed to fetch financial summary");
      setFinanceSummary(data || null);
      setLoading(false);
    });
  }, [isEdufamAdmin, schoolFilter]);

  if (isEdufamAdmin) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between w-full gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              System Finance Overview
            </h1>
            <p className="text-muted-foreground">
              View financial summaries across all schools.
            </p>
          </div>
          <SchoolSummaryFilter
            schools={schools}
            value={schoolFilter}
            onChange={setSchoolFilter}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {loading ? (
            <Card><CardContent>Loading summary...</CardContent></Card>
          ) : error ? (
            <Card><CardContent className="text-red-500">{error}</CardContent></Card>
          ) : financeSummary ? (
            <>
              <Card>
                <CardHeader><CardTitle>Total Fee Collections</CardTitle></CardHeader>
                <CardContent>
                  <div className="font-bold text-xl">
                    {financeSummary.total_collected !== undefined ? `KES ${Number(financeSummary.total_collected).toLocaleString()}` : 'N/A'}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Outstanding Fees</CardTitle></CardHeader>
                <CardContent>
                  <div>
                    {financeSummary.outstanding !== undefined ? `KES ${Number(financeSummary.outstanding).toLocaleString()}` : 'N/A'}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Major Expense Categories</CardTitle></CardHeader>
                <CardContent>
                  <div>
                    {financeSummary.major_expenses || 'N/A'}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card><CardContent>No summary data found.</CardContent></Card>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Finance Management
          </h1>
          <p className="text-muted-foreground">Manage school finances and fee collection</p>
        </div>
        <div className="flex gap-2">
          <DownloadReportButton
            type="finance"
            label="Download Fees Report"
            queryFilters={isSystemAdmin ? {} : { school_id: schoolId }}
          />
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Record Payment
          </Button>
        </div>
      </div>

      {/* Finance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(financialStats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">Expected this term</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collected</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(financialStats.collected)}</div>
            <p className="text-xs text-muted-foreground">
              {financialStats.totalRevenue > 0 ? 
                `${((financialStats.collected / financialStats.totalRevenue) * 100).toFixed(1)}% of target` : 
                '0% of target'
              }
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <FileText className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{formatCurrency(financialStats.pending)}</div>
            <p className="text-xs text-muted-foreground">Outstanding fees</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expenses</CardTitle>
            <CreditCard className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(financialStats.expenses)}</div>
            <p className="text-xs text-muted-foreground">This term</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>Financial Records</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Select term" />
                </SelectTrigger>
                <SelectContent>
                  {terms.map((term) => (
                    <SelectItem key={term.id} value={term.id}>{term.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="fees" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="fees">Fee Collection</TabsTrigger>
              <TabsTrigger value="expenses">Expenses</TabsTrigger>
              <TabsTrigger value="reports">Financial Reports</TabsTrigger>
            </TabsList>
            
            <TabsContent value="fees" className="mt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Admission No.</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Fee Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feeRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        {record.student?.name || 'Unknown Student'}
                      </TableCell>
                      <TableCell>{record.student?.admission_number || 'N/A'}</TableCell>
                      <TableCell>{record.className || 'N/A'}</TableCell>
                      <TableCell className="capitalize">{record.category}</TableCell>
                      <TableCell>{formatCurrency(record.amount)}</TableCell>
                      <TableCell>{formatCurrency(record.paid_amount || 0)}</TableCell>
                      <TableCell>{formatCurrency(record.amount - (record.paid_amount || 0))}</TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                      <TableCell>{format(new Date(record.due_date), 'dd/MM/yyyy')}</TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleRecordPayment(record.id, 1000, 'mpesa')}
                          disabled={record.status === 'paid'}
                        >
                          Record Payment
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {feeRecords.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                        No financial records found for the selected criteria.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TabsContent>
            
            <TabsContent value="expenses" className="mt-6">
              <div className="text-center py-8">
                <p className="text-muted-foreground">Expense tracking coming soon...</p>
              </div>
            </TabsContent>
            
            <TabsContent value="reports" className="mt-6">
              <div className="text-center py-8">
                <p className="text-muted-foreground">Financial reports coming soon...</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinanceModule;
