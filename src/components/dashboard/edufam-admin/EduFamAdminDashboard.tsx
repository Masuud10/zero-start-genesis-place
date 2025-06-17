
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Users, 
  GraduationCap, 
  DollarSign, 
  TrendingUp,
  School,
  UserPlus,
  Settings,
  BarChart3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AdministrativeHub from './AdministrativeHub';

const EduFamAdminDashboard = () => {
  const [selectedSchool, setSelectedSchool] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'overview' | 'schools' | 'analytics' | 'management'>('overview');
  const { toast } = useToast();

  const { data: schools, isLoading: schoolsLoading } = useQuery({
    queryKey: ['schools-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schools')
        .select('id, name, email, created_at')
        .order('name');
      
      if (error) {
        console.error('Error fetching schools:', error);
        throw error;
      }
      
      return data || [];
    }
  });

  const { data: systemStats, isLoading: statsLoading } = useQuery({
    queryKey: ['system-stats', selectedSchool],
    queryFn: async () => {
      try {
        // Get total schools
        const { count: schoolCount } = await supabase
          .from('schools')
          .select('*', { count: 'exact', head: true });

        // Get total students
        let studentsQuery = supabase
          .from('students')
          .select('*', { count: 'exact', head: true });
        
        if (selectedSchool !== 'all') {
          studentsQuery = studentsQuery.eq('school_id', selectedSchool);
        }
        
        const { count: studentCount } = await studentsQuery;

        // Get total users
        let usersQuery = supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
        
        if (selectedSchool !== 'all') {
          usersQuery = usersQuery.eq('school_id', selectedSchool);
        }
        
        const { count: userCount } = await usersQuery;

        // Get revenue data (mock for now)
        const revenue = selectedSchool === 'all' ? 45000 : 12000;

        return {
          schoolCount: schoolCount || 0,
          studentCount: studentCount || 0,
          userCount: userCount || 0,
          revenue
        };
      } catch (error) {
        console.error('Error fetching system stats:', error);
        return {
          schoolCount: 0,
          studentCount: 0,
          userCount: 0,
          revenue: 0
        };
      }
    }
  });

  if (schoolsLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Total Schools</p>
                <p className="text-3xl font-bold">{systemStats?.schoolCount || 0}</p>
              </div>
              <Building2 className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Total Students</p>
                <p className="text-3xl font-bold">{systemStats?.studentCount || 0}</p>
              </div>
              <GraduationCap className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Total Users</p>
                <p className="text-3xl font-bold">{systemStats?.userCount || 0}</p>
              </div>
              <Users className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100">Revenue</p>
                <p className="text-3xl font-bold">${systemStats?.revenue?.toLocaleString() || 0}</p>
              </div>
              <DollarSign className="h-8 w-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Schools List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <School className="h-5 w-5" />
            Schools Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {schools?.map((school) => (
              <div key={school.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-semibold">{school.name}</h3>
                  <p className="text-sm text-muted-foreground">{school.email}</p>
                  <p className="text-xs text-muted-foreground">
                    Created: {new Date(school.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Active</Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedSchool(school.id)}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            EduFam Admin Dashboard
          </h1>
          <p className="text-muted-foreground">System-wide management and analytics</p>
        </div>

        <div className="flex items-center gap-4">
          <Select value={selectedSchool} onValueChange={setSelectedSchool}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select School" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Schools</SelectItem>
              {schools?.map((school) => (
                <SelectItem key={school.id} value={school.id}>
                  {school.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 rounded-lg bg-muted p-1">
        <Button
          variant={activeTab === 'overview' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('overview')}
          className="flex items-center gap-2"
        >
          <BarChart3 className="h-4 w-4" />
          Overview
        </Button>
        <Button
          variant={activeTab === 'management' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('management')}
          className="flex items-center gap-2"
        >
          <Settings className="h-4 w-4" />
          System Management
        </Button>
      </div>

      {/* Content */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'management' && <AdministrativeHub />}
    </div>
  );
};

export default EduFamAdminDashboard;
