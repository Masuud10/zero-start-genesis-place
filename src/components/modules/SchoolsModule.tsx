
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import SchoolStatsCards from './schools/SchoolStatsCards';
import AddSchoolDialog from './schools/AddSchoolDialog';
import SchoolsFilter from './schools/SchoolsFilter';
import SchoolsTable from './schools/SchoolsTable';

interface School {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  created_at: string;
  updated_at: string;
  subscriptions?: {
    plan_type: string;
    status: string;
    amount: number;
  }[];
}

const SchoolsModule = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { toast } = useToast();
  const { buildSchoolScopedQuery, isSystemAdmin } = useSchoolScopedData();

  useEffect(() => {
    if (isSystemAdmin) {
      fetchSchools();
    } else {
      setLoading(false);
    }
  }, [isSystemAdmin]);

  const fetchSchools = async () => {
    try {
      setLoading(true);
      const { data: schoolsData, error } = await buildSchoolScopedQuery('schools', `
        *,
        subscriptions(plan_type, status, amount)
      `);

      if (error) {
        console.error('Error fetching schools:', error);
        toast({
          title: "Error",
          description: "Failed to fetch schools data",
          variant: "destructive",
        });
        setSchools([]);
        return;
      }

      setSchools(schoolsData || []);
    } catch (error) {
      console.error('Error fetching schools:', error);
      toast({
        title: "Error",
        description: "Failed to fetch schools data",
        variant: "destructive",
      });
      setSchools([]);
    } finally {
      setLoading(false);
    }
  };

  if (!isSystemAdmin) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-muted-foreground">Access Denied</h2>
          <p className="text-muted-foreground mt-2">
            Only system administrators can manage schools.
          </p>
        </div>
      </div>
    );
  }

  const filteredSchools = schools.filter(school => {
    const matchesSearch = school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         school.email.toLowerCase().includes(searchTerm.toLowerCase());
    const subscription = school.subscriptions?.[0];
    const matchesStatus = statusFilter === 'all' || subscription?.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Schools Management</h2>
          <p className="text-muted-foreground">Manage all schools in the Elimisha network</p>
        </div>
        <AddSchoolDialog onSchoolAdded={fetchSchools} />
      </div>

      <SchoolStatsCards schools={schools} />

      <SchoolsFilter 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      <SchoolsTable schools={filteredSchools} loading={loading} />
    </div>
  );
};

export default SchoolsModule;
