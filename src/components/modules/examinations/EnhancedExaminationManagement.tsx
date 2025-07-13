import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSchoolScopedData } from "@/hooks/useSchoolScopedData";
import { useToast } from "@/hooks/use-toast";
import { useAcademicModuleIntegration } from "@/hooks/useAcademicModuleIntegration";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Calendar,
  Plus,
  Search,
  Filter,
  Edit,
  Trash,
  Eye,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  BookOpen,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import CreateExaminationModal from "./CreateExaminationModal";
import EditExaminationModal from "./EditExaminationModal";
import ViewExaminationModal from "./ViewExaminationModal";

const EnhancedExaminationManagement = () => {
  const { user } = useAuth();
  const { schoolId } = useSchoolScopedData();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedExamination, setSelectedExamination] = useState<{
    id: string;
    name: string;
    type: string;
    start_date: string;
    end_date: string;
    is_active: boolean;
    academic_years?: { year_name: string };
    academic_terms?: { term_name: string };
    profiles?: { name: string };
  } | null>(null);

  // Use academic module integration
  const {
    context,
    isLoading,
    error,
    data,
    isValid,
    createExamination,
    refreshData,
    currentPeriod,
    validation,
  } = useAcademicModuleIntegration(["examinations"]);

  // Delete examination mutation
  const deleteExaminationMutation = useMutation({
    mutationFn: async (examinationId: string) => {
      const { error } = await supabase
        .from("examinations")
        .delete()
        .eq("id", examinationId)
        .eq("school_id", schoolId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Examination deleted successfully",
      });
      refreshData();
      setDeleteModalOpen(false);
      setSelectedExamination(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete examination",
        variant: "destructive",
      });
    },
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
    data.examinations?.filter((examination) => {
      const matchesSearch =
        examination.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        examination.academic_years?.year_name?.includes(searchTerm) ||
        examination.academic_terms?.term_name?.includes(searchTerm);

      const matchesType =
        typeFilter === "all" || examination.type === typeFilter;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && examination.is_active) ||
        (statusFilter === "inactive" && !examination.is_active);

      return matchesSearch && matchesType && matchesStatus;
    }) || [];

  // Handle create examination
  const handleCreateExamination = () => {
    if (!isValid) {
      toast({
        title: "Validation Error",
        description:
          validation?.errors?.join(", ") ||
          "Please set up academic year and term first",
        variant: "destructive",
      });
      return;
    }
    setCreateModalOpen(true);
  };

  const handleEditExamination = (examination: any) => {
    console.log("Editing examination:", examination);
    setSelectedExamination(examination);
    setEditModalOpen(true);
  };

  const handleViewExamination = (examination: any) => {
    console.log("Viewing examination:", examination);
    setSelectedExamination(examination);
    setViewModalOpen(true);
  };

  // Handle delete examination
  const handleDeleteExamination = (examination: typeof selectedExamination) => {
    setSelectedExamination(examination);
    setDeleteModalOpen(true);
  };

  // Get examination type options
  const examinationTypes = [
    "Written",
    "Practical",
    "Mock",
    "Final",
    "Mid-Term",
    "End-Term",
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin mr-3" />
        <span>Loading examination data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error loading examination data: {error}
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
        <Button onClick={handleCreateExamination} disabled={!isValid}>
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
              <Badge variant="outline" className="bg-blue-100">
                {currentPeriod.year?.year_name || "Not Set"}
              </Badge>
              <Badge variant="outline" className="bg-blue-100">
                {currentPeriod.term?.term_name || "Not Set"}
              </Badge>
              {!isValid && (
                <Badge variant="destructive" className="text-xs">
                  Context Invalid
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Validation Errors */}
      {!isValid && validation?.errors && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Academic Context Issues:</strong>
            <ul className="mt-2 list-disc list-inside">
              {validation.errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Input
                placeholder="Search examinations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {examinationTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {filteredExaminations.length} examinations
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Examinations Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Examinations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredExaminations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No examinations found</p>
              <p className="text-sm">
                {searchTerm || typeFilter !== "all" || statusFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Create your first examination to get started"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Academic Period</TableHead>
                  <TableHead>Date Range</TableHead>
                  <TableHead>Coordinator</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExaminations.map((examination) => (
                  <TableRow key={examination.id}>
                    <TableCell className="font-medium">
                      {examination.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{examination.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>
                          {examination.academic_years?.year_name || "N/A"}
                        </div>
                        <div className="text-muted-foreground">
                          {examination.academic_terms?.term_name || "N/A"}
                        </div>
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
                          {new Date(examination.end_date).toLocaleDateString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {examination.profiles?.name || "Not assigned"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          examination.is_active ? "default" : "secondary"
                        }
                        className={
                          examination.is_active
                            ? "bg-green-100 text-green-800"
                            : ""
                        }
                      >
                        {examination.is_active ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <Clock className="h-3 w-3 mr-1" />
                            Inactive
                          </>
                        )}
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
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
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
          refreshData();
        }}
      />

      {selectedExamination && (
        <>
          <EditExaminationModal
            open={editModalOpen}
            onClose={() => {
              setEditModalOpen(false);
              setSelectedExamination(null);
            }}
            onSuccess={() => {
              setEditModalOpen(false);
              setSelectedExamination(null);
              refreshData();
            }}
            examination={{
              ...selectedExamination,
              type: (selectedExamination.type || 'Written') as "Written" | "Practical" | "Mock" | "Final" | "Mid-Term" | "End-Term",
              term: (selectedExamination.academic_terms?.term_name || 'Term 1') as "Term 1" | "Term 2" | "Term 3",
              academic_year: selectedExamination.academic_years?.year_name || new Date().getFullYear().toString(),
              classes: [],
              school_id: context.school_id || '',
              created_by: selectedExamination.profiles?.name || '',
              updated_at: new Date().toISOString(),
              created_at: new Date().toISOString()
            }}
          />

          <ViewExaminationModal
            open={viewModalOpen}
            onClose={() => {
              setViewModalOpen(false);
              setSelectedExamination(null);
            }}
            examination={{
              ...selectedExamination,
              type: (selectedExamination.type || 'Written') as "Written" | "Practical" | "Mock" | "Final" | "Mid-Term" | "End-Term",
              term: (selectedExamination.academic_terms?.term_name || 'Term 1') as "Term 1" | "Term 2" | "Term 3",
              academic_year: selectedExamination.academic_years?.year_name || new Date().getFullYear().toString(),
              classes: [],
              school_id: context.school_id || '',
              created_by: selectedExamination.profiles?.name || '',
              updated_at: new Date().toISOString(),
              created_at: new Date().toISOString()
            }}
          />

          <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Examination</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete "{selectedExamination.name}"?
                  This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setDeleteModalOpen(false)}
                  disabled={deleteExaminationMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() =>
                    deleteExaminationMutation.mutate(selectedExamination.id)
                  }
                  disabled={deleteExaminationMutation.isPending}
                >
                  {deleteExaminationMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
};

export default EnhancedExaminationManagement;
