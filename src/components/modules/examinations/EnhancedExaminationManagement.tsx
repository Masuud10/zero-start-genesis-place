import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Plus,
  Edit,
  Eye,
  Trash2,
  Calendar,
  BookOpen,
  RefreshCw,
  AlertCircle,
  Loader2,
  Users,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSchoolScopedData } from "@/hooks/useSchoolScopedData";
import { useToast } from "@/hooks/use-toast";
import { SystemIntegrationService } from "@/services/integration/SystemIntegrationService";
import { supabase } from "@/integrations/supabase/client";
import CreateExaminationModal from "./CreateExaminationModal";
import EditExaminationModal from "./EditExaminationModal";
import ViewExaminationModal from "./ViewExaminationModal";
import DeleteExaminationModal from "./DeleteExaminationModal";

interface Examination {
  id: string;
  name: string;
  type: string;
  term_id: string;
  academic_year_id: string;
  classes: string[];
  start_date: string;
  end_date: string;
  coordinator_id?: string;
  remarks?: string;
  is_active: boolean;
  created_at: string;
  academic_terms?: {
    term_name: string;
  };
  academic_years?: {
    year_name: string;
  };
}

const EnhancedExaminationManagement = () => {
  const { user } = useAuth();
  const { schoolId } = useSchoolScopedData();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [termFilter, setTermFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedExamination, setSelectedExamination] =
    useState<Examination | null>(null);

  // Get current academic period
  const { data: currentPeriod, isLoading: loadingPeriod } = useQuery({
    queryKey: ["currentAcademicPeriod", schoolId],
    queryFn: async () => {
      if (!schoolId) return null;
      return await SystemIntegrationService.getCurrentAcademicPeriod(schoolId);
    },
    enabled: !!schoolId,
  });

  // Fetch examinations
  const {
    data: examinations,
    isLoading: loadingExams,
    error: examsError,
  } = useQuery({
    queryKey: ["examinations", schoolId],
    queryFn: async () => {
      if (!schoolId) return [];
      const { data, error } = await supabase
        .from("examinations")
        .select(
          `
          *,
          academic_terms (term_name),
          academic_years (year_name),
          profiles!examinations_coordinator_id_fkey (id, name, email)
        `
        )
        .eq("school_id", schoolId)
        .order("start_date", { ascending: false });

      if (error) throw new Error(error.message);
      return data || [];
    },
    enabled: !!schoolId,
  });

  // Fetch available classes
  const { data: availableClasses } = useQuery({
    queryKey: ["availableClasses", schoolId, currentPeriod?.year?.id],
    queryFn: async () => {
      if (!schoolId) return [];
      const result = await SystemIntegrationService.getAvailableClasses(
        schoolId,
        currentPeriod?.year?.id
      );
      return result.classes || [];
    },
    enabled: !!schoolId && !!currentPeriod?.year?.id,
  });

  // Check if user is principal
  if (user?.role !== "principal") {
    return (
      <div className="p-8 text-center text-red-600">
        <Alert className="max-w-md mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Access denied. Only principals can manage examinations.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Filter examinations based on search and filters
  const filteredExaminations =
    examinations?.filter((examination) => {
      const matchesSearch =
        examination.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        examination.academic_years?.year_name?.includes(searchTerm) ||
        examination.academic_terms?.term_name?.includes(searchTerm);

      const matchesType =
        typeFilter === "all" || examination.type === typeFilter;
      const matchesTerm =
        termFilter === "all" || examination.term_id === termFilter;
      const matchesYear =
        yearFilter === "all" || examination.academic_year_id === yearFilter;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && examination.is_active) ||
        (statusFilter === "inactive" && !examination.is_active);

      return (
        matchesSearch &&
        matchesType &&
        matchesTerm &&
        matchesYear &&
        matchesStatus
      );
    }) || [];

  // Get unique academic years for filter
  const academicYears = [
    ...new Set(examinations?.map((exam) => exam.academic_year_id) || []),
  ];

  // Get unique terms for filter
  const academicTerms = [
    ...new Set(examinations?.map((exam) => exam.term_id) || []),
  ];

  const handleCreateExamination = () => {
    if (!currentPeriod?.year?.id || !currentPeriod?.term?.id) {
      toast({
        title: "Warning",
        description:
          "Please set a current academic year and term before creating examinations.",
        variant: "destructive",
      });
      return;
    }
    setCreateModalOpen(true);
  };

  const handleViewExamination = (examination: Examination) => {
    setSelectedExamination(examination);
    setViewModalOpen(true);
  };

  const handleEditExamination = (examination: Examination) => {
    setSelectedExamination(examination);
    setEditModalOpen(true);
  };

  const handleDeleteExamination = (examination: Examination) => {
    setSelectedExamination(examination);
    setDeleteModalOpen(true);
  };

  const getExaminationStatus = (examination: Examination) => {
    const now = new Date();
    const startDate = new Date(examination.start_date);
    const endDate = new Date(examination.end_date);

    if (now < startDate) {
      return {
        status: "upcoming",
        label: "Upcoming",
        color: "bg-blue-100 text-blue-800",
      };
    } else if (now >= startDate && now <= endDate) {
      return {
        status: "ongoing",
        label: "Ongoing",
        color: "bg-green-100 text-green-800",
      };
    } else {
      return {
        status: "completed",
        label: "Completed",
        color: "bg-gray-100 text-gray-800",
      };
    }
  };

  const getExaminationTypeIcon = (type: string) => {
    switch (type) {
      case "Written":
        return <BookOpen className="h-4 w-4" />;
      case "Practical":
        return <Users className="h-4 w-4" />;
      case "Mock":
        return <AlertCircle className="h-4 w-4" />;
      case "Final":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getExaminationTypeColor = (type: string) => {
    switch (type) {
      case "Written":
        return "bg-blue-100 text-blue-800";
      case "Practical":
        return "bg-green-100 text-green-800";
      case "Mock":
        return "bg-orange-100 text-orange-800";
      case "Final":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loadingPeriod || loadingExams) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading examination data...</p>
        </div>
      </div>
    );
  }

  if (examsError) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error loading examinations: {examsError.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Examination Management</h1>
          <p className="text-muted-foreground">
            Manage examinations, schedules, and assessments for your school
          </p>
        </div>
        <Button
          onClick={handleCreateExamination}
          disabled={!currentPeriod?.year?.id || !currentPeriod?.term?.id}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Examination
        </Button>
      </div>

      {/* Current Academic Period Info */}
      {currentPeriod && (
        <Card className="border-2 border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2 text-blue-800">
              <Calendar className="h-4 w-4" />
              Current Academic Period
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="font-medium">
                  {currentPeriod.year?.year_name || "Year not set"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="font-medium">
                  {currentPeriod.term?.term_name || "Term not set"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="font-medium">
                  {availableClasses?.length || 0} Available Classes
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Warning if no current period */}
      {(!currentPeriod?.year?.id || !currentPeriod?.term?.id) && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Warning:</strong> No current academic year or term is set.
            Please set a current academic year and term in Academic Settings
            before creating examinations.
          </AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Examinations
                </p>
                <p className="text-xl font-bold">{examinations?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Active Examinations
                </p>
                <p className="text-xl font-bold">
                  {examinations?.filter((e) => e.is_active).length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Upcoming</p>
                <p className="text-xl font-bold">
                  {examinations?.filter((e) => {
                    const now = new Date();
                    const startDate = new Date(e.start_date);
                    return now < startDate;
                  }).length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">This Term</p>
                <p className="text-xl font-bold">
                  {examinations?.filter(
                    (e) => e.term_id === currentPeriod?.term?.id
                  ).length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search examinations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="all">All Types</option>
                <option value="Written">Written</option>
                <option value="Practical">Practical</option>
                <option value="Mock">Mock</option>
                <option value="Final">Final</option>
                <option value="Mid-Term">Mid-Term</option>
                <option value="End-Term">End-Term</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Term</label>
              <select
                value={termFilter}
                onChange={(e) => setTermFilter(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="all">All Terms</option>
                {academicTerms.map((termId) => {
                  const term = examinations?.find((e) => e.term_id === termId);
                  return (
                    <option key={termId} value={termId}>
                      {term?.academic_terms?.term_name || termId}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Year</label>
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="all">All Years</option>
                {academicYears.map((yearId) => {
                  const year = examinations?.find(
                    (e) => e.academic_year_id === yearId
                  );
                  return (
                    <option key={yearId} value={yearId}>
                      {year?.academic_years?.year_name || yearId}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Examinations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Examinations</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredExaminations.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                {examinations?.length === 0
                  ? "No examinations found"
                  : "No examinations match your filters"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {examinations?.length === 0
                  ? "Create your first examination to get started."
                  : "Try adjusting your search or filter criteria."}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Examination</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Classes</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExaminations.map((examination) => {
                  const examStatus = getExaminationStatus(examination);
                  return (
                    <TableRow key={examination.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{examination.name}</div>
                          {examination.remarks && (
                            <div className="text-sm text-muted-foreground">
                              {examination.remarks}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={getExaminationTypeColor(examination.type)}
                        >
                          {getExaminationTypeIcon(examination.type)}
                          <span className="ml-1">{examination.type}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{examination.academic_terms?.term_name}</div>
                          <div className="text-muted-foreground">
                            {examination.academic_years?.year_name}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {examination.classes?.length || 0} classes
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>
                            {new Date(
                              examination.start_date
                            ).toLocaleDateString()}
                          </div>
                          <div className="text-muted-foreground">
                            to{" "}
                            {new Date(
                              examination.end_date
                            ).toLocaleDateString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={examStatus.color}>
                          {examStatus.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewExamination(examination)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditExamination(examination)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteExamination(examination)}
                          >
                            <Trash2 className="h-4 w-4" />
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

      {/* Modals */}
      <CreateExaminationModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={() => {
          setCreateModalOpen(false);
          queryClient.invalidateQueries({
            queryKey: ["examinations", schoolId],
          });
        }}
      />

      {selectedExamination && (
        <>
          <EditExaminationModal
            open={editModalOpen}
            onClose={() => setEditModalOpen(false)}
            onSuccess={() => {
              setEditModalOpen(false);
              queryClient.invalidateQueries({
                queryKey: ["examinations", schoolId],
              });
            }}
            examination={selectedExamination}
          />
          <ViewExaminationModal
            open={viewModalOpen}
            onClose={() => setViewModalOpen(false)}
            examination={selectedExamination}
          />
          <DeleteExaminationModal
            open={deleteModalOpen}
            onClose={() => setDeleteModalOpen(false)}
            onSuccess={() => {
              setDeleteModalOpen(false);
              queryClient.invalidateQueries({
                queryKey: ["examinations", schoolId],
              });
            }}
            examination={selectedExamination}
          />
        </>
      )}
    </div>
  );
};

export default EnhancedExaminationManagement;
