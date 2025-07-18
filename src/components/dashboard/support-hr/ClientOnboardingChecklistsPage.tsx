import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { OnboardingChecklistsService } from "@/services/mockAdvancedFeaturesService";
import { OnboardingChecklistWithSchool } from "@/types/advanced-features";
import {
  Plus,
  CheckCircle,
  Clock,
  Building2,
  User,
  Calendar,
  FileText,
  Edit,
  Trash2,
  Eye,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

const ClientOnboardingChecklistsPage: React.FC = () => {
  const [checklists, setChecklists] = useState<OnboardingChecklistWithSchool[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [selectedChecklist, setSelectedChecklist] =
    useState<OnboardingChecklistWithSchool | null>(null);
  const { toast } = useToast();

  const [newChecklist, setNewChecklist] = useState({
    schoolId: "",
    checklistName: "",
  });

  const [completionNotes, setCompletionNotes] = useState("");

  // Predefined checklist templates
  const checklistTemplates = [
    "Initial Setup & Configuration",
    "User Training & Documentation",
    "Data Migration & Import",
    "Integration Setup",
    "Go-Live Support",
    "Post-Launch Review",
  ];

  const getStatusIcon = (isCompleted: boolean) => {
    return isCompleted ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <Clock className="h-5 w-5 text-yellow-500" />
    );
  };

  const getStatusBadgeVariant = (isCompleted: boolean) => {
    return isCompleted ? ("default" as const) : ("secondary" as const);
  };

  const fetchChecklists = async () => {
    try {
      setLoading(true);
      const response =
        await OnboardingChecklistsService.getOnboardingChecklists();

      if (response.success) {
        setChecklists(response.data);
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to fetch checklists",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching checklists:", error);
      toast({
        title: "Error",
        description: "Failed to fetch checklists",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createChecklist = async () => {
    try {
      const response =
        await OnboardingChecklistsService.createOnboardingChecklist(
          newChecklist.schoolId,
          newChecklist.checklistName
        );

      if (response.success) {
        toast({
          title: "Success",
          description: "Checklist created successfully",
        });
        setCreateDialogOpen(false);
        setNewChecklist({ schoolId: "", checklistName: "" });
        fetchChecklists();
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to create checklist",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating checklist:", error);
      toast({
        title: "Error",
        description: "Failed to create checklist",
        variant: "destructive",
      });
    }
  };

  const completeChecklist = async () => {
    if (!selectedChecklist) return;

    try {
      const response =
        await OnboardingChecklistsService.completeOnboardingChecklist(
          selectedChecklist.id.toString(),
          completionNotes
        );

      if (response.success) {
        toast({
          title: "Success",
          description: "Checklist marked as completed",
        });
        setCompleteDialogOpen(false);
        setSelectedChecklist(null);
        setCompletionNotes("");
        fetchChecklists();
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to complete checklist",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error completing checklist:", error);
      toast({
        title: "Error",
        description: "Failed to complete checklist",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchChecklists();
  }, []);

  const completedChecklistsCount = checklists.filter(
    (checklist) => checklist.is_completed
  ).length;
  const totalChecklistsCount = checklists.length;
  const pendingChecklistsCount =
    totalChecklistsCount - completedChecklistsCount;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Client Onboarding Checklists
          </h1>
          <p className="text-muted-foreground">
            Manage the onboarding process for new schools
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Checklist
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create Onboarding Checklist</DialogTitle>
              <DialogDescription>
                Add a new checklist for a school's onboarding process
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="school_id" className="text-sm font-medium">
                  School ID
                </label>
                <Input
                  id="school_id"
                  placeholder="Enter school ID"
                  value={newChecklist.schoolId}
                  onChange={(e) =>
                    setNewChecklist((prev) => ({
                      ...prev,
                      schoolId: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="checklist_name" className="text-sm font-medium">
                  Checklist Name
                </label>
                <Select
                  value={newChecklist.checklistName}
                  onValueChange={(value) =>
                    setNewChecklist((prev) => ({
                      ...prev,
                      checklistName: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select checklist template" />
                  </SelectTrigger>
                  <SelectContent>
                    {checklistTemplates.map((template) => (
                      <SelectItem key={template} value={template}>
                        {template}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={createChecklist}
                disabled={!newChecklist.schoolId || !newChecklist.checklistName}
              >
                Create Checklist
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Checklists
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalChecklistsCount}</div>
            <p className="text-xs text-muted-foreground">
              Onboarding checklists
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {completedChecklistsCount}
            </div>
            <p className="text-xs text-muted-foreground">
              Successfully onboarded
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {pendingChecklistsCount}
            </div>
            <p className="text-xs text-muted-foreground">In progress</p>
          </CardContent>
        </Card>
      </div>

      {/* Checklists Table */}
      <Card>
        <CardHeader>
          <CardTitle>Onboarding Checklists</CardTitle>
          <CardDescription>
            Track the onboarding progress for each school
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">
                  Loading checklists...
                </p>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>School</TableHead>
                  <TableHead>Checklist</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Completed</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {checklists.map((checklist) => (
                  <TableRow key={checklist.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-gray-500" />
                          <div>
                            <div className="font-medium">
                              {checklist.school.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {checklist.school.email}
                            </div>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        {checklist.checklist_name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(checklist.is_completed)}
                        <Badge
                          variant={getStatusBadgeVariant(
                            checklist.is_completed
                          )}
                        >
                          {checklist.is_completed ? "Completed" : "Pending"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        {new Date(checklist.created_at).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      {checklist.completed_at ? (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          {new Date(
                            checklist.completed_at
                          ).toLocaleDateString()}
                        </div>
                      ) : (
                        <span className="text-gray-500">Not completed</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedChecklist(checklist);
                            setCompleteDialogOpen(true);
                          }}
                          disabled={checklist.is_completed}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {!checklist.is_completed && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedChecklist(checklist);
                              setCompleteDialogOpen(true);
                            }}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
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

      {/* Complete Checklist Dialog */}
      {selectedChecklist && (
        <Dialog open={completeDialogOpen} onOpenChange={setCompleteDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Complete Onboarding Checklist</DialogTitle>
              <DialogDescription>
                Mark this checklist as completed and add notes
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">School</label>
                <div className="flex items-center gap-2 p-2 border rounded">
                  <Building2 className="h-4 w-4 text-gray-500" />
                  <span>{selectedChecklist.school.name}</span>
                </div>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Checklist</label>
                <div className="flex items-center gap-2 p-2 border rounded">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span>{selectedChecklist.checklist_name}</span>
                </div>
              </div>
              <div className="grid gap-2">
                <label
                  htmlFor="completion_notes"
                  className="text-sm font-medium"
                >
                  Completion Notes
                </label>
                <Textarea
                  id="completion_notes"
                  placeholder="Add any notes about the completion of this checklist..."
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setCompleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={completeChecklist}>Mark as Completed</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ClientOnboardingChecklistsPage;
