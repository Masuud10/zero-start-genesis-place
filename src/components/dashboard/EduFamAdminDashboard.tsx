import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminSchoolsData } from "@/hooks/useAdminSchoolsData";
import { supabase } from "@/integrations/supabase/client";
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
  Loader2,
  CheckCircle,
  XCircle,
  Globe,
} from "lucide-react";

// Import modals
import UserManagementModal from "./modals/UserManagementModal";
import MaintenanceModeModal from "./modals/MaintenanceModeModal";
import DatabaseSettingsModal from "./modals/DatabaseSettingsModal";
import SecuritySettingsModal from "./modals/SecuritySettingsModal";
import NotificationSettingsModal from "./modals/NotificationSettingsModal";
import CompanyDetailsModal from "./modals/CompanyDetailsModal";
import SchoolRegistrationModal from "./modals/SchoolRegistrationModal";
import SchoolDetailsModal from "@/components/modals/SchoolDetailsModal";

interface School {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  status?: string;
  created_at: string;
  school_type?: string;
  curriculum_type?: string;
  website_url?: string;
  registration_number?: string;
  year_established?: number;
  motto?: string;
  slogan?: string;
  logo_url?: string;
  owner_id?: string;
  principal_id?: string;
  term_structure?: string;
}

const EduFamAdminDashboard = () => {
  const { user } = useAuth();

  // Debug user info
  console.log("🏫 EduFamAdminDashboard: User info:", {
    user: user?.email,
    role: user?.role,
    id: user?.id,
  });
  const {
    data: schools = [],
    isLoading: schoolsLoading,
    error: schoolsError,
    refetch: refetchSchools,
    isRefetching: schoolsRefetching,
  } = useAdminSchoolsData();

  // Modal states
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [showMaintenanceMode, setShowMaintenanceMode] = useState(false);
  const [showDatabaseSettings, setShowDatabaseSettings] = useState(false);
  const [showSecuritySettings, setShowSecuritySettings] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] =
    useState(false);
  const [showCompanyDetails, setShowCompanyDetails] = useState(false);
  const [showSchoolRegistration, setShowSchoolRegistration] = useState(false);
  const [showSchoolDetails, setShowSchoolDetails] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);

  // Calculate stats with better error handling
  const totalSchools = Array.isArray(schools) ? schools.length : 0;
  const activeSchools = Array.isArray(schools)
    ? schools.filter((school) => school.status === "active").length
    : 0;
  const recentSchools = Array.isArray(schools)
    ? schools.filter((school) => {
        const createdAt = new Date(school.created_at);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return createdAt >= thirtyDaysAgo;
      }).length
    : 0;

  // Debug logging
  console.log("🏫 EduFamAdminDashboard: Schools data:", {
    totalSchools,
    activeSchools,
    recentSchools,
    schoolsLoading,
    schoolsError,
    schoolsData: schools,
  });

  const handleModalSuccess = () => {
    console.log("🏫 Refreshing school data after successful operation...");
    refetchSchools();
  };

  // Test function to manually fetch schools
  const testFetchSchools = async () => {
    console.log("🏫 Testing direct schools fetch...");
    try {
      const { data, error } = await supabase
        .from("schools")
        .select("*")
        .limit(5);

      console.log("🏫 Direct fetch result:", { data, error });
    } catch (err) {
      console.error("🏫 Direct fetch error:", err);
    }
  };

  const handleViewSchool = (school: School) => {
    setSelectedSchool(school);
    setShowSchoolDetails(true);
  };

  const handleEditSchool = (school: School) => {
    // For now, we'll show the school details modal in edit mode
    // In the future, you can create a separate edit modal
    setSelectedSchool(school);
    setShowSchoolDetails(true);
  };

  const getSchoolStatusColor = (status?: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "inactive":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "suspended":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    }
  };

  const getSchoolStatusIcon = (status?: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-3 w-3" />;
      case "inactive":
      case "suspended":
        return <XCircle className="h-3 w-3" />;
      default:
        return <AlertCircle className="h-3 w-3" />;
    }
  };

  // Show error if there's a schools error
  if (schoolsError) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error loading schools data: {schoolsError.message}
          </AlertDescription>
        </Alert>
        <Button onClick={() => refetchSchools()} variant="outline">
          Retry Loading Schools
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-600">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Schools</CardTitle>
            <Building2 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {totalSchools}
            </div>
            <p className="text-xs text-gray-600">Registered in platform</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-600">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Schools
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {activeSchools}
            </div>
            <p className="text-xs text-gray-600">Currently operational</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-600">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              New This Month
            </CardTitle>
            <Plus className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {recentSchools}
            </div>
            <p className="text-xs text-gray-600">Last 30 days</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-600">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
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
              className="h-20 flex flex-col items-center gap-2 hover:bg-blue-50"
              onClick={() => setShowUserManagement(true)}
            >
              <User className="h-6 w-6 text-blue-600" />
              <span className="text-sm">User Management</span>
            </Button>

            <Button
              variant="outline"
              className="h-20 flex flex-col items-center gap-2 hover:bg-orange-50"
              onClick={() => setShowMaintenanceMode(true)}
            >
              <Settings className="h-6 w-6 text-orange-600" />
              <span className="text-sm">Maintenance Mode</span>
            </Button>

            <Button
              variant="outline"
              className="h-20 flex flex-col items-center gap-2 hover:bg-green-50"
              onClick={() => setShowDatabaseSettings(true)}
            >
              <Database className="h-6 w-6 text-green-600" />
              <span className="text-sm">Database Settings</span>
            </Button>

            <Button
              variant="outline"
              className="h-20 flex flex-col items-center gap-2 hover:bg-red-50"
              onClick={() => setShowSecuritySettings(true)}
            >
              <Shield className="h-6 w-6 text-red-600" />
              <span className="text-sm">Security Settings</span>
            </Button>

            <Button
              variant="outline"
              className="h-20 flex flex-col items-center gap-2 hover:bg-yellow-50"
              onClick={() => setShowNotificationSettings(true)}
            >
              <Bell className="h-6 w-6 text-yellow-600" />
              <span className="text-sm">Notification Settings</span>
            </Button>

            <Button
              variant="outline"
              className="h-20 flex flex-col items-center gap-2 hover:bg-purple-50"
              onClick={() => setShowCompanyDetails(true)}
            >
              <Globe className="h-6 w-6 text-purple-600" />
              <span className="text-sm">Company Details</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Registered Schools Section */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Registered Schools ({totalSchools})
              </CardTitle>
              <CardDescription>
                Overview of all schools registered in the Edufam platform
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  console.log(
                    "🏫 EduFamAdminDashboard: Manual refresh triggered"
                  );
                  refetchSchools();
                }}
                variant="outline"
                size="sm"
                disabled={schoolsLoading || schoolsRefetching}
              >
                {schoolsLoading || schoolsRefetching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Refresh"
                )}
              </Button>
              <Button onClick={testFetchSchools} variant="outline" size="sm">
                Test Fetch
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {schoolsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                <p className="text-gray-600">Loading schools...</p>
              </div>
            </div>
          ) : !Array.isArray(schools) || schools.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Schools Registered Yet
              </h3>
              <p className="text-gray-600 mb-6">
                Get started by registering the first school in your platform
              </p>
              <Button
                onClick={() => setShowSchoolRegistration(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Register First School
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {schools.map((school) => (
                <div
                  key={school.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h4 className="font-semibold text-lg text-gray-900">
                          {school.name}
                        </h4>
                        <Badge
                          className={`${getSchoolStatusColor(
                            school.status
                          )} flex items-center gap-1`}
                        >
                          {getSchoolStatusIcon(school.status)}
                          {school.status || "Active"}
                        </Badge>
                        {school.school_type && (
                          <Badge variant="secondary" className="capitalize">
                            {school.school_type}
                          </Badge>
                        )}
                        {/* Curriculum type is now managed at class level */}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{school.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 flex-shrink-0" />
                          <span>{school.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{school.address}</span>
                        </div>
                        {school.registration_number && (
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 flex-shrink-0" />
                            <span>Reg: {school.registration_number}</span>
                          </div>
                        )}
                        {school.year_established && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 flex-shrink-0" />
                            <span>Est: {school.year_established}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 flex-shrink-0" />
                          <span>Students: Managed per class</span>
                        </div>
                      </div>

                      {/* Additional Information */}
                      <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                        {school.website_url && (
                          <div className="flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            <span>Website Available</span>
                          </div>
                        )}
                        {school.term_structure && (
                          <div>
                            <span>Term: {school.term_structure}</span>
                          </div>
                        )}
                        <div>
                          <span>
                            Created:{" "}
                            {new Date(school.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Owner Information */}
                      {school.owner_id && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="flex flex-wrap gap-4 text-sm">
                            <div>
                              <span className="font-medium text-gray-700">
                                Owner ID:
                              </span>
                              <span className="font-mono text-xs text-gray-500 ml-1">
                                {school.owner_id.slice(0, 8)}...
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* School Branding */}
                      {(school.motto || school.slogan) && (
                        <div className="mt-2 text-sm italic text-gray-600">
                          {school.motto && <div>"{school.motto}"</div>}
                          {school.slogan && (
                            <div className="text-xs">— {school.slogan}</div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="hover:bg-blue-50"
                        onClick={() => handleViewSchool(school)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="hover:bg-gray-50"
                        onClick={() => handleEditSchool(school)}
                      >
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

      {/* School Details Modal */}
      {selectedSchool && (
        <SchoolDetailsModal
          school={selectedSchool}
          isOpen={showSchoolDetails}
          onClose={() => {
            setShowSchoolDetails(false);
            setSelectedSchool(null);
          }}
        />
      )}
    </div>
  );
};

export default EduFamAdminDashboard;
