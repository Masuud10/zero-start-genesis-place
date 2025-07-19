import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Building2,
  Plus,
  Search,
  Filter,
  Edit,
  Users,
  Phone,
  Mail,
  MapPin,
  AlertCircle,
  CheckCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import CreateSchoolDialog from "@/components/dashboard/modals/CreateSchoolDialog";

interface School {
  id: string;
  name: string;
  motto?: string;
  slogan?: string;
  email: string;
  phone: string;
  address: string;
  logo_url?: string;
  school_type: string;
  term_structure: string;
  director_name?: string;
  director_contact?: string;
  mpesa_paybill?: string;
  mpesa_consumer_key?: string;
  mpesa_consumer_secret?: string;
  status: string;
  created_at: string;
  updated_at: string;
  student_count?: number;
}

const SchoolsManagementPage: React.FC = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("schools")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      // Get student count for each school (mock data for now)
      const schoolsWithCounts =
        data?.map((school) => ({
          ...school,
          student_count: Math.floor(Math.random() * 1000) + 50, // Mock data
        })) || [];

      setSchools(schoolsWithCounts);
    } catch (err) {
      console.error("Error fetching schools:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch schools");
    } finally {
      setLoading(false);
    }
  };

  const toggleSchoolStatus = async (
    schoolId: string,
    currentStatus: string
  ) => {
    try {
      setUpdatingStatus(schoolId);
      const isActive = currentStatus === "inactive";

      const { data, error } = await supabase.functions.invoke(
        "toggle-school-status",
        {
          body: { school_id: schoolId, is_active: isActive },
        }
      );

      if (error) {
        throw error;
      }

      if (data?.success) {
        // Update local state
        setSchools((prev) =>
          prev.map((school) =>
            school.id === schoolId
              ? { ...school, status: data.new_status }
              : school
          )
        );
      }
    } catch (err) {
      console.error("Error toggling school status:", err);
      setError(
        err instanceof Error ? err.message : "Failed to update school status"
      );
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleSchoolCreated = (schoolData: {
    school_id: string;
    school_name?: string;
    school_email?: string;
    school_phone?: string;
    school_address?: string;
    school_type?: string;
    term_structure?: string;
  }) => {
    // Add the new school to the list
    const newSchool: School = {
      id: schoolData.school_id,
      name: schoolData.school_name || "New School",
      email: schoolData.school_email || "",
      phone: schoolData.school_phone || "",
      address: schoolData.school_address || "",
      school_type: schoolData.school_type || "Primary",
      term_structure: schoolData.term_structure || "Two Semesters",
      status: "active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      student_count: 0,
    };

    setSchools((prev) => [newSchool, ...prev]);
  };

  const filteredSchools = schools.filter((school) => {
    const matchesSearch =
      school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || school.status === statusFilter;
    const matchesType =
      typeFilter === "all" || school.school_type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    return status === "active"
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";
  };

  const getStatusIcon = (status: string) => {
    return status === "active" ? (
      <CheckCircle className="h-4 w-4" />
    ) : (
      <AlertCircle className="h-4 w-4" />
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading schools...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Schools Management</h1>
          <p className="text-muted-foreground">
            Manage all schools on the platform
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create School
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Schools
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{schools.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Schools
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {schools.filter((s) => s.status === "active").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Inactive Schools
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {schools.filter((s) => s.status === "inactive").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {schools.reduce(
                (sum, school) => sum + (school.student_count || 0),
                0
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search schools..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status-filter">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="type-filter">School Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger id="type-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Primary">Primary</SelectItem>
                  <SelectItem value="Secondary">Secondary</SelectItem>
                  <SelectItem value="Tertiary">Tertiary</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Schools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSchools.map((school) => (
          <Card key={school.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {school.logo_url ? (
                    <img
                      src={school.logo_url}
                      alt={school.name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-blue-600" />
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-lg">{school.name}</CardTitle>
                    <CardDescription>{school.school_type}</CardDescription>
                  </div>
                </div>
                <Badge className={getStatusColor(school.status)}>
                  {getStatusIcon(school.status)}
                  <span className="ml-1 capitalize">{school.status}</span>
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{school.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{school.phone}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{school.address}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{school.student_count || 0} students</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center space-x-2">
                  <Label htmlFor={`status-${school.id}`} className="text-sm">
                    {school.status === "active" ? "Active" : "Inactive"}
                  </Label>
                  <Switch
                    id={`status-${school.id}`}
                    checked={school.status === "active"}
                    onCheckedChange={() =>
                      toggleSchoolStatus(school.id, school.status)
                    }
                    disabled={updatingStatus === school.id}
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSchools.length === 0 && !loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No schools found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchTerm || statusFilter !== "all" || typeFilter !== "all"
                ? "Try adjusting your filters or search terms."
                : "Get started by creating your first school."}
            </p>
            {!searchTerm && statusFilter === "all" && typeFilter === "all" && (
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First School
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create School Dialog */}
      <CreateSchoolDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSchoolCreated={() => fetchSchools()}
      />
    </div>
  );
};

export default SchoolsManagementPage;
