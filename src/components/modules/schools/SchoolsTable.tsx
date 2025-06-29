
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2, Eye, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import SchoolDetailsModal from '@/components/modals/SchoolDetailsModal';

interface School {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  created_at: string;
  updated_at: string;
  curriculum_type?: string;
  registration_number?: string;
  year_established?: number;
  logo_url?: string;
  website_url?: string;
  motto?: string;
  slogan?: string;
  principal_name?: string;
  principal_contact?: string;
  principal_email?: string;
  owner_information?: string;
  school_type?: string;
  status?: string;
  subscription_plan?: string;
  max_students?: number;
  timezone?: string;
  term_structure?: string;
}

interface SchoolsTableProps {
  schools: School[];
  loading: boolean;
}

const SchoolsTable = ({ schools, loading }: SchoolsTableProps) => {
  const [schoolsWithSubscriptions, setSchoolsWithSubscriptions] = useState<any[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [subscriptionsLoading, setSubscriptionsLoading] = useState(false);
  const [subscriptionsError, setSubscriptionsError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      console.log('🏫 SchoolsTable: Starting subscription fetch for schools:', schools.length);
      
      if (schools.length === 0) {
        console.log('🏫 SchoolsTable: No schools to fetch subscriptions for');
        return;
      }

      setSubscriptionsLoading(true);
      setSubscriptionsError(null);

      try {
        const schoolIds = schools.map(s => s.id).filter(Boolean);
        console.log('🏫 SchoolsTable: Fetching subscriptions for school IDs:', schoolIds);

        const { data: subscriptions, error } = await supabase
          .from('subscriptions')
          .select('*')
          .in('school_id', schoolIds);

        if (error) {
          console.error('🏫 SchoolsTable: Subscription fetch error:', error);
          setSubscriptionsError('Failed to load subscription data');
          // Still show schools without subscription data
          setSchoolsWithSubscriptions(schools.map(school => ({ ...school, subscriptions: [] })));
          return;
        }

        console.log('🏫 SchoolsTable: Successfully fetched subscriptions:', subscriptions?.length || 0);

        const schoolsWithSubs = schools.map(school => {
          const schoolSubscriptions = subscriptions?.filter(sub => sub.school_id === school.id) || [];
          return {
            ...school,
            subscriptions: schoolSubscriptions
          };
        });

        console.log('🏫 SchoolsTable: Schools with subscriptions mapped:', schoolsWithSubs.length);
        setSchoolsWithSubscriptions(schoolsWithSubs);
      } catch (error) {
        console.error('🏫 SchoolsTable: Error processing subscriptions:', error);
        setSubscriptionsError('Failed to process subscription data');
        setSchoolsWithSubscriptions(schools.map(school => ({ ...school, subscriptions: [] })));
      } finally {
        setSubscriptionsLoading(false);
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

  const handleViewSchool = (school: School) => {
    console.log('🏫 SchoolsTable: Opening school details for:', {
      id: school.id,
      name: school.name,
      hasSubscriptionData: !!school
    });
    
    if (!school || !school.id) {
      console.error('🏫 SchoolsTable: Invalid school data for modal:', school);
      return;
    }
    
    setSelectedSchool(school);
    setIsDetailsModalOpen(true);
  };

  const handleCloseModal = () => {
    console.log('🏫 SchoolsTable: Closing school details modal');
    setIsDetailsModalOpen(false);
    setSelectedSchool(null);
  };

  if (loading) {
    console.log('🏫 SchoolsTable: Showing loading state');
    return (
      <Card>
        <CardHeader>
          <CardTitle>Schools Directory</CardTitle>
          <CardDescription>
            All schools registered in the Elimisha platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p>Loading schools...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (schoolsWithSubscriptions.length === 0) {
    console.log('🏫 SchoolsTable: Showing empty state');
    return (
      <Card>
        <CardHeader>
          <CardTitle>Schools Directory</CardTitle>
          <CardDescription>
            All schools registered in the Elimisha platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">No schools found.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  console.log('🏫 SchoolsTable: Rendering table with schools:', schoolsWithSubscriptions.length);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Schools Directory</CardTitle>
          <CardDescription>
            All schools registered in the Elimisha platform
            {subscriptionsError && (
              <div className="flex items-center gap-1 text-amber-600 text-sm mt-1">
                <AlertCircle className="h-3 w-3" />
                {subscriptionsError}
              </div>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                    <TableCell className="font-medium">
                      <div>
                        <p className="font-medium">{school.name || 'Unnamed School'}</p>
                        {school.registration_number && (
                          <p className="text-xs text-gray-500">Reg: {school.registration_number}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{school.email || 'N/A'}</TableCell>
                    <TableCell>{school.phone || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {subscription?.plan_type || school.subscription_plan || 'No Plan'}
                      </Badge>
                      {subscriptionsLoading && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse ml-1 inline-block"></div>
                      )}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(subscription?.status || school.status || 'inactive')}
                    </TableCell>
                    <TableCell>
                      ${subscription?.amount || 0}
                      {subscription?.currency && subscription.currency !== 'USD' && (
                        <span className="text-xs text-gray-500 ml-1">({subscription.currency})</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleViewSchool(school);
                          }}
                          className="hover:bg-blue-50"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" disabled>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" disabled>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedSchool && (
        <SchoolDetailsModal
          school={selectedSchool}
          isOpen={isDetailsModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
};

export default SchoolsTable;
