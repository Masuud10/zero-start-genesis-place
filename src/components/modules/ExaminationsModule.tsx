import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
} from "lucide-react";
import { useExaminations } from "@/hooks/useExaminations";
import { useClasses } from "@/hooks/useClasses";
import { useAuth } from "@/contexts/AuthContext";
import { Examination } from "@/types/academic";
import CreateExaminationModal from "./examinations/CreateExaminationModal";
import EditExaminationModal from "./examinations/EditExaminationModal";
import ViewExaminationModal from "./examinations/ViewExaminationModal";
import DeleteExaminationModal from "./examinations/DeleteExaminationModal";

const ExaminationsModule: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [termFilter, setTermFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");

  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedExamination, setSelectedExamination] =
    useState<Examination | null>(null);

  const { user } = useAuth();
  const { examinations, loading, error, retry } = useExaminations();
  const { classes } = useClasses();

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
  const filteredExaminations = examinations.filter((examination) => {
    const matchesSearch =
      examination.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      examination.academic_year.includes(searchTerm);
    const matchesType = typeFilter === "all" || examination.type === typeFilter;
    const matchesTerm = termFilter === "all" || examination.term === termFilter;
    const matchesYear =
      yearFilter === "all" || examination.academic_year === yearFilter;

    return matchesSearch && matchesType && matchesTerm && matchesYear;
  });

  // Get unique academic years for filter
  const academicYears = [
    ...new Set(examinations.map((exam) => exam.academic_year)),
  ]
    .sort()
    .reverse();

  // Get class names for display
  const getClassNames = (classIds: string[]) => {
    return classIds
      .map((id) => classes.find((c) => c.id === id)?.name)
      .filter(Boolean)
      .join(", ");
  };

  // Modal handlers
  const handleCreate = () => {
    setCreateModalOpen(true);
  };

  const handleEdit = (examination: Examination) => {
    setSelectedExamination(examination);
    setEditModalOpen(true);
  };

  const handleView = (examination: Examination) => {
    setSelectedExamination(examination);
    setViewModalOpen(true);
  };

  const handleDelete = (examination: Examination) => {
    setSelectedExamination(examination);
    setDeleteModalOpen(true);
  };

  const handleModalClose = () => {
    setCreateModalOpen(false);
    setEditModalOpen(false);
    setViewModalOpen(false);
    setDeleteModalOpen(false);
    setSelectedExamination(null);
  };

  const handleSuccess = () => {
    handleModalClose();
    retry();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading examinations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button
              variant="outline"
              size="sm"
              onClick={retry}
              className="ml-4"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Examinations Management
          </h1>
          <p className="text-muted-foreground">
            Create and manage school examinations
          </p>
        </div>
        <Button
          onClick={handleCreate}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New Examination
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
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
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Written">Written</SelectItem>
                  <SelectItem value="Practical">Practical</SelectItem>
                  <SelectItem value="Mock">Mock</SelectItem>
                  <SelectItem value="Final">Final</SelectItem>
                  <SelectItem value="Mid-Term">Mid-Term</SelectItem>
                  <SelectItem value="End-Term">End-Term</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Term</label>
              <Select value={termFilter} onValueChange={setTermFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Terms</SelectItem>
                  <SelectItem value="Term 1">Term 1</SelectItem>
                  <SelectItem value="Term 2">Term 2</SelectItem>
                  <SelectItem value="Term 3">Term 3</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Academic Year
              </label>
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {academicYears.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Examinations Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Examinations ({filteredExaminations.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredExaminations.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No examinations found</p>
              <Button onClick={handleCreate} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Create First Examination
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Exam Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Term</TableHead>
                  <TableHead>Academic Year</TableHead>
                  <TableHead>Target Classes</TableHead>
                  <TableHead>Duration</TableHead>
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
                      <Badge variant="secondary">{examination.term}</Badge>
                    </TableCell>
                    <TableCell>{examination.academic_year}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {getClassNames(examination.classes)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Calendar className="h-3 w-3" />
                        {new Date(
                          examination.start_date
                        ).toLocaleDateString()}{" "}
                        - {new Date(examination.end_date).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleView(examination)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(examination)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(examination)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
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
        onClose={handleModalClose}
        onSuccess={handleSuccess}
      />

      {selectedExamination && (
        <>
          <EditExaminationModal
            open={editModalOpen}
            onClose={handleModalClose}
            onSuccess={handleSuccess}
            examination={selectedExamination}
          />

          <ViewExaminationModal
            open={viewModalOpen}
            onClose={handleModalClose}
            examination={selectedExamination}
          />

          <DeleteExaminationModal
            open={deleteModalOpen}
            onClose={handleModalClose}
            onSuccess={handleSuccess}
            examination={selectedExamination}
          />
        </>
      )}
    </div>
  );
};

export default ExaminationsModule;
