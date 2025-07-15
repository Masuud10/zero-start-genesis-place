import React, { useState, useEffect } from 'react';
import { Plus, Download, Printer, Search, Filter, Users, UserCheck, UserX } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { SupportStaff, SupportStaffFilters, SUPPORT_STAFF_ROLES, EMPLOYMENT_TYPES } from '@/types/supportStaff';
import { SupportStaffService } from '@/services/supportStaffService';
import { AddStaffDialog } from '@/components/hr/AddStaffDialog';
import { StaffProfileDialog } from '@/components/hr/StaffProfileDialog';
import { StaffFiltersDialog } from '@/components/hr/StaffFiltersDialog';
import { StaffCard } from '@/components/hr/StaffCard';
import { StatsCard } from '@/components/ui/stats-card';

export const StaffManagement: React.FC = () => {
  const [staff, setStaff] = useState<SupportStaff[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<SupportStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<SupportStaffFilters>({});
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showFiltersDialog, setShowFiltersDialog] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<SupportStaff | null>(null);
  const { toast } = useToast();

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const staffData = await SupportStaffService.getSupportStaff();
      setStaff(staffData);
      setFilteredStaff(staffData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch staff data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  useEffect(() => {
    let filtered = staff;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(s => 
        s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.role_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply other filters
    if (filters.role_title) {
      filtered = filtered.filter(s => s.role_title === filters.role_title);
    }
    if (filters.employment_type) {
      filtered = filtered.filter(s => s.employment_type === filters.employment_type);
    }
    if (filters.is_active !== undefined) {
      filtered = filtered.filter(s => s.is_active === filters.is_active);
    }
    if (filters.department) {
      filtered = filtered.filter(s => s.department === filters.department);
    }

    setFilteredStaff(filtered);
  }, [staff, searchTerm, filters]);

  const handleStaffAdded = () => {
    fetchStaff();
    setShowAddDialog(false);
    toast({
      title: 'Success',
      description: 'Staff member added successfully'
    });
  };

  const handleStaffUpdated = () => {
    fetchStaff();
    setSelectedStaff(null);
    toast({
      title: 'Success',
      description: 'Staff member updated successfully'
    });
  };

  const handleArchiveStaff = async (id: string, isActive: boolean) => {
    try {
      if (isActive) {
        await SupportStaffService.archiveSupportStaff(id);
        toast({
          title: 'Success',
          description: 'Staff member archived successfully'
        });
      } else {
        await SupportStaffService.reactivateSupportStaff(id);
        toast({
          title: 'Success',
          description: 'Staff member reactivated successfully'
        });
      }
      fetchStaff();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update staff status',
        variant: 'destructive'
      });
    }
  };

  const exportToPDF = () => {
    // TODO: Implement PDF export
    toast({
      title: 'Coming Soon',
      description: 'PDF export functionality will be available soon'
    });
  };

  const exportToExcel = () => {
    // TODO: Implement Excel export
    toast({
      title: 'Coming Soon',
      description: 'Excel export functionality will be available soon'
    });
  };

  const printRecords = () => {
    window.print();
  };

  const activeStaff = staff.filter(s => s.is_active);
  const inactiveStaff = staff.filter(s => !s.is_active);
  const staffByRole = SupportStaffService.getStaffCountByRole(staff);

  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
  };

  const hasActiveFilters = Object.keys(filters).length > 0 || searchTerm.length > 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Staff Management</h1>
          <p className="text-muted-foreground">
            Manage non-teaching support staff
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportToPDF}>
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
          <Button variant="outline" onClick={exportToExcel}>
            <Download className="h-4 w-4 mr-2" />
            Excel
          </Button>
          <Button variant="outline" onClick={printRecords}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Staff
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Total Staff"
          value={staff.length}
          icon={Users}
          description="All staff members"
        />
        <StatsCard
          title="Active Staff"
          value={activeStaff.length}
          icon={UserCheck}
          description="Currently employed"
          className="text-green-600"
        />
        <StatsCard
          title="Inactive Staff"
          value={inactiveStaff.length}
          icon={UserX}
          description="Archived/inactive"
          className="text-red-600"
        />
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search staff by name, ID, role, phone, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFiltersDialog(true)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            {hasActiveFilters && (
              <Button variant="ghost" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
          
          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="mt-4 flex flex-wrap gap-2">
              {Object.entries(filters).map(([key, value]) => 
                value && (
                  <Badge key={key} variant="secondary">
                    {key}: {value.toString()}
                  </Badge>
                )
              )}
              {searchTerm && (
                <Badge variant="secondary">
                  Search: {searchTerm}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Staff Grid */}
      {filteredStaff.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Staff Found</h3>
            <p className="text-muted-foreground mb-4">
              {hasActiveFilters 
                ? 'No staff members match your current filters.'
                : 'Start by adding your first staff member.'
              }
            </p>
            {!hasActiveFilters && (
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Staff Member
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStaff.map((staffMember) => (
            <StaffCard
              key={staffMember.id}
              staff={staffMember}
              onView={(staff) => setSelectedStaff(staff)}
              onArchive={(id, isActive) => handleArchiveStaff(id, isActive)}
            />
          ))}
        </div>
      )}

      {/* Dialogs */}
      <AddStaffDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onStaffAdded={handleStaffAdded}
      />

      <StaffFiltersDialog
        open={showFiltersDialog}
        onOpenChange={setShowFiltersDialog}
        filters={filters}
        onFiltersChange={setFilters}
      />

      {selectedStaff && (
        <StaffProfileDialog
          staff={selectedStaff}
          open={!!selectedStaff}
          onOpenChange={(open) => !open && setSelectedStaff(null)}
          onStaffUpdated={handleStaffUpdated}
        />
      )}
    </div>
  );
};