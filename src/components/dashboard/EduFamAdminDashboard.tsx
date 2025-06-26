
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useSchools } from '@/hooks/useSchools';
import { 
  Building2, 
  Users, 
  TrendingUp, 
  AlertCircle, 
  Plus,
  Settings,
  Database,
  Shield,
  Bell,
  User,
  Eye,
  Edit,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Loader2
} from 'lucide-react';

// Import modals
import UserManagementModal from './modals/UserManagementModal';
import MaintenanceModeModal from './modals/MaintenanceModeModal';
import DatabaseSettingsModal from './modals/DatabaseSettingsModal';
import SecuritySettingsModal from './modals/SecuritySettingsModal';
import NotificationSettingsModal from './modals/NotificationSettingsModal';
import CompanyDetailsModal from './modals/CompanyDetailsModal';
import SchoolRegistrationModal from './modals/SchoolRegistrationModal';

const EduFamAdminDashboard = () => {
  const { user } = useAuth();
  const { data: schools = [], isLoading: schoolsLoading, refetch: refetchSchools } = useSchools();
  
  // Modal states
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [showMaintenanceMode, setShowMaintenanceMode] = useState(false);
  const [showDatabaseSettings, setShowDatabaseSettings] = useState(false);
  const [showSecuritySettings, setShowSecuritySettings] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [showCompanyDetails, setShowCompanyDetails] = useState(false);
  const [showSchoolRegistration, setShowSchoolRegistration] = useState(false);

  // Calculate stats
  const totalSchools = schools.length;
  const activeSchools = schools.filter(school => school.status === 'active').length;
  const recentSchools = schools.filter(school => {
    const createdAt = new Date(school.created_at);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return createdAt >= thirtyDaysAgo;
  }).length;

  const handleModalSuccess = () => {
    refetchSchools();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">EduFam Admin Dashboard</h1>
          <p className="text-gray-600">System overview and administrative controls</p>
        </div>
        <Button onClick={() => setShowSchoolRegistration(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Register New School
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Schools</CardTitle>
            <Building2 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalSchools}</div>
            <p className="text-xs text-gray-600">Registered schools</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Schools</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeSchools}</div>
            <p className="text-xs text-gray-600">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New This Month</CardTitle>
            <Plus className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{recentSchools}</div>
            <p className="text-xs text-gray-600">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Operational</div>
            <p className="text-xs text-gray-600">All systems running</p>
          </CardContent>
        </Card>
      </div>

      {/* System Management Center */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            System Management Center
          </CardTitle>
          <CardDescription>
            Comprehensive administrative tools for managing the EduFam platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center gap-2"
              onClick={() => setShowUserManagement(true)}
            >
              <User className="h-6 w-6 text-blue-600" />
              <span className="text-sm">User Management</span>
            </Button>

            <Button
              variant="outline"
              className="h-20 flex flex-col items-center gap-2"
              onClick={() => setShowMaintenanceMode(true)}
            >
              <Settings className="h-6 w-6 text-orange-600" />
              <span className="text-sm">Maintenance Mode</span>
            </Button>

            <Button
              variant="outline"
              className="h-20 flex flex-col items-center gap-2"
              onClick={() => setShowDatabaseSettings(true)}
            >
              <Database className="h-6 w-6 text-green-600" />
              <span className="text-sm">Database Settings</span>
            </Button>

            <Button
              variant="outline"
              className="h-20 flex flex-col items-center gap-2"
              onClick={() => setShowSecuritySettings(true)}
            >
              <Shield className="h-6 w-6 text-red-600" />
              <span className="text-sm">Security Settings</span>
            </Button>

            <Button
              variant="outline"
              className="h-20 flex flex-col items-center gap-2"
              onClick={() => setShowNotificationSettings(true)}
            >
              <Bell className="h-6 w-6 text-purple-600" />
              <span className="text-sm">Notifications</span>
            </Button>

            <Button
              variant="outline"
              className="h-20 flex flex-col items-center gap-2"
              onClick={() => setShowCompanyDetails(true)}
            >
              <Building2 className="h-6 w-6 text-indigo-600" />
              <span className="text-sm">Company Details</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Schools List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Registered Schools
          </CardTitle>
          <CardDescription>
            Overview of all schools registered in the EduFam platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          {schoolsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading schools...</span>
            </div>
          ) : schools.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Schools Registered</h3>
              <p className="text-gray-600 mb-4">Get started by registering the first school</p>
              <Button onClick={() => setShowSchoolRegistration(true)} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Register New School
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {schools.map((school) => (
                <div key={school.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-lg">{school.name}</h4>
                        <Badge variant={school.status === 'active' ? 'default' : 'secondary'}>
                          {school.status || 'Active'}
                        </Badge>
                        {school.school_type && (
                          <Badge variant="outline">{school.school_type}</Badge>
                        )}
                        {school.curriculum_type && (
                          <Badge variant="outline">{school.curriculum_type.toUpperCase()}</Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          <span>{school.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          <span>{school.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{school.address}</span>
                        </div>
                        {school.registration_number && (
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            <span>Reg: {school.registration_number}</span>
                          </div>
                        )}
                        {school.year_established && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>Est: {school.year_established}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>Max: {school.max_students || 1000} students</span>
                        </div>
                      </div>

                      {(school.principal_name || school.principal_email) && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-sm text-gray-700">
                            <strong>Principal:</strong> {school.principal_name}
                            {school.principal_email && ` (${school.principal_email})`}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Modals */}
      <SchoolRegistrationModal
        isOpen={showSchoolRegistration}
        onClose={() => setShowSchoolRegistration(false)}
        onSuccess={handleModalSuccess}
        currentUser={user!}
      />

      <UserManagementModal
        isOpen={showUserManagement}
        onClose={() => setShowUserManagement(false)}
        onSuccess={handleModalSuccess}
        currentUser={user!}
      />

      <MaintenanceModeModal
        isOpen={showMaintenanceMode}
        onClose={() => setShowMaintenanceMode(false)}
        onSuccess={handleModalSuccess}
        currentUser={user!}
      />

      <DatabaseSettingsModal
        isOpen={showDatabaseSettings}
        onClose={() => setShowDatabaseSettings(false)}
        onSuccess={handleModalSuccess}
        currentUser={user!}
      />

      <SecuritySettingsModal
        isOpen={showSecuritySettings}
        onClose={() => setShowSecuritySettings(false)}
        onSuccess={handleModalSuccess}
        currentUser={user!}
      />

      <NotificationSettingsModal
        isOpen={showNotificationSettings}
        onClose={() => setShowNotificationSettings(false)}
        onSuccess={handleModalSuccess}
        currentUser={user!}
      />

      <CompanyDetailsModal
        isOpen={showCompanyDetails}
        onClose={() => setShowCompanyDetails(false)}
        onSuccess={handleModalSuccess}
        currentUser={user!}
      />
    </div>
  );
};

export default EduFamAdminDashboard;
