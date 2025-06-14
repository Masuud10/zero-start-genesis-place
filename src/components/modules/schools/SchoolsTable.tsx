
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface School {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  created_at: string;
  updated_at: string;
}

interface SchoolsTableProps {
  schools: School[];
  loading: boolean;
}

const SchoolsTable = ({ schools, loading }: SchoolsTableProps) => {
  const [schoolsWithSubscriptions, setSchoolsWithSubscriptions] = useState<any[]>([]);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      if (schools.length === 0) return;

      try {
        const { data: subscriptions, error } = await supabase
          .from('subscriptions')
          .select('*')
          .in('school_id', schools.map(s => s.id));

        if (error) {
          console.error('Error fetching subscriptions:', error);
          return;
        }

        const schoolsWithSubs = schools.map(school => {
          const schoolSubscriptions = subscriptions?.filter(sub => sub.school_id === school.id) || [];
          return {
            ...school,
            subscriptions: schoolSubscriptions
          };
        });

        setSchoolsWithSubscriptions(schoolsWithSubs);
      } catch (error) {
        console.error('Error processing subscriptions:', error);
        setSchoolsWithSubscriptions(schools.map(school => ({ ...school, subscriptions: [] })));
      }
    };

    fetchSubscriptions();
  }, [schools]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      active: 'default',
      inactive: 'secondary',
      suspended: 'destructive',
      cancelled: 'outline'
    };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Schools Directory</CardTitle>
        <CardDescription>
          All schools registered in the Elimisha platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p>Loading schools...</p>
            </div>
          </div>
        ) : schoolsWithSubscriptions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No schools found.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>School Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Subscription</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Monthly Fee</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schoolsWithSubscriptions.map((school) => {
                const subscription = school.subscriptions?.[0];
                return (
                  <TableRow key={school.id}>
                    <TableCell className="font-medium">{school.name}</TableCell>
                    <TableCell>{school.email}</TableCell>
                    <TableCell>{school.phone || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {subscription?.plan_type || 'No Plan'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(subscription?.status || 'inactive')}
                    </TableCell>
                    <TableCell>${subscription?.amount || 0}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default SchoolsTable;
