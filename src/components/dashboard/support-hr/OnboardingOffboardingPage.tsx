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
import { Progress } from "@/components/ui/progress";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  User,
  Mail,
  Phone,
  Building2,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  MessageSquare,
  Star,
  Target,
  TrendingUp,
  Users,
  DollarSign,
  Search,
  Filter,
  Download,
  RefreshCw,
  Activity,
  FileText,
  Link,
  MapPin,
  UserPlus,
  UserMinus,
  ClipboardList,
  CheckSquare,
  Square,
  ArrowRight,
  ArrowLeft,
  CalendarDays,
  Clock3,
  AlertCircle,
  FileCheck,
  FileX,
  Send,
  MailCheck,
  PhoneCall,
  Video,
  BookOpen,
  GraduationCap,
  Shield,
  Key,
  Laptop,
  CreditCard,
  Building,
  Car,
  Wifi,
  Coffee,
  Utensils,
  Bed,
  Briefcase,
  FolderOpen,
  Settings,
  HelpCircle,
  Users2,
  Handshake,
  Gift,
  PartyPopper,
  LogOut,
  Archive,
  FileText2,
  Calculator,
  Receipt,
  CreditCard2,
  Lock,
  Unlock,
} from "lucide-react";

interface Process {
  id: string;
  employee_name: string;
  employee_email: string;
  type: "onboarding" | "offboarding";
  status: "pending" | "in_progress" | "completed" | "cancelled";
  start_date: string;
  target_completion: string;
  actual_completion?: string;
  assigned_to: string;
  department: string;
  position: string;
  checklist: ChecklistItem[];
  notes: string;
  priority: "low" | "medium" | "high";
}

interface ChecklistItem {
  id: string;
  category: string;
  task: string;
  status: "pending" | "in_progress" | "completed" | "skipped";
  assigned_to: string;
  due_date: string;
  completed_date?: string;
  notes: string;
}

const OnboardingOffboardingPage: React.FC = () => {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState<Process | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { toast } = useToast();

  const [newProcess, setNewProcess] = useState({
    employee_name: "",
    employee_email: "",
    type: "onboarding" as const,
    department: "",
    position: "",
    start_date: "",
    target_completion: "",
    assigned_to: "",
    priority: "medium" as const,
    notes: "",
  });

  const onboardingChecklist = [
    {
      category: "IT Setup",
      task: "Create email account",
      assigned_to: "IT Team",
    },
    {
      category: "IT Setup",
      task: "Set up computer and software",
      assigned_to: "IT Team",
    },
    {
      category: "IT Setup",
      task: "Configure access permissions",
      assigned_to: "IT Team",
    },
    {
      category: "HR Paperwork",
      task: "Complete employment contract",
      assigned_to: "HR Team",
    },
    {
      category: "HR Paperwork",
      task: "Submit tax forms",
      assigned_to: "HR Team",
    },
    {
      category: "HR Paperwork",
      task: "Complete benefits enrollment",
      assigned_to: "HR Team",
    },
    {
      category: "Office Setup",
      task: "Assign workspace",
      assigned_to: "Facilities",
    },
    {
      category: "Office Setup",
      task: "Provide office supplies",
      assigned_to: "Facilities",
    },
    {
      category: "Training",
      task: "Company orientation",
      assigned_to: "HR Team",
    },
    {
      category: "Training",
      task: "Role-specific training",
      assigned_to: "Manager",
    },
    {
      category: "Integration",
      task: "Team introductions",
      assigned_to: "Manager",
    },
    {
      category: "Integration",
      task: "Buddy assignment",
      assigned_to: "HR Team",
    },
  ];

  const offboardingChecklist = [
    { category: "IT", task: "Disable system access", assigned_to: "IT Team" },
    { category: "IT", task: "Collect company devices", assigned_to: "IT Team" },
    { category: "IT", task: "Transfer work files", assigned_to: "IT Team" },
    { category: "HR", task: "Exit interview", assigned_to: "HR Team" },
    {
      category: "HR",
      task: "Final paycheck processing",
      assigned_to: "HR Team",
    },
    { category: "HR", task: "Benefits termination", assigned_to: "HR Team" },
    {
      category: "Facilities",
      task: "Return office keys",
      assigned_to: "Facilities",
    },
    {
      category: "Facilities",
      task: "Clear workspace",
      assigned_to: "Facilities",
    },
    {
      category: "Knowledge Transfer",
      task: "Document handover",
      assigned_to: "Manager",
    },
    {
      category: "Knowledge Transfer",
      task: "Client transition",
      assigned_to: "Manager",
    },
    { category: "Legal", task: "NDA compliance", assigned_to: "Legal Team" },
    {
      category: "Legal",
      task: "Non-compete review",
      assigned_to: "Legal Team",
    },
  ];

  const departments = [
    "Executive",
    "Finance",
    "Sales & Marketing",
    "Engineering",
    "Human Resources",
    "Support",
    "Operations",
  ];

  const getTypeIcon = (type: string) => {
    return type === "onboarding" ? (
      <UserPlus className="h-4 w-4 text-green-600" />
    ) : (
      <UserMinus className="h-4 w-4 text-red-600" />
    );
  };

  const getTypeBadgeVariant = (type: string) => {
    return type === "onboarding" ? "default" : "destructive";
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "secondary" as const;
      case "in_progress":
        return "default" as const;
      case "completed":
        return "outline" as const;
      case "cancelled":
        return "destructive" as const;
      default:
        return "outline" as const;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "in_progress":
        return <Activity className="h-4 w-4 text-blue-600" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive" as const;
      case "medium":
        return "secondary" as const;
      case "low":
        return "outline" as const;
      default:
        return "outline" as const;
    }
  };

  // Mock data for demonstration
  useEffect(() => {
    const mockProcesses: Process[] = [
      {
        id: "1",
        employee_name: "Sarah Johnson",
        employee_email: "sarah.johnson@edufam.com",
        type: "onboarding",
        status: "in_progress",
        start_date: "2024-01-20",
        target_completion: "2024-02-03",
        assigned_to: "HR Team",
        department: "Sales & Marketing",
        position: "Sales Representative",
        priority: "high",
        notes: "Experienced sales professional joining the team.",
        checklist: onboardingChecklist.map((item, index) => ({
          id: index.toString(),
          ...item,
          status:
            index < 6 ? "completed" : index < 9 ? "in_progress" : "pending",
          due_date: "2024-02-03",
          completed_date: index < 6 ? "2024-01-25" : undefined,
          notes: "",
        })),
      },
      {
        id: "2",
        employee_name: "Michael Chen",
        employee_email: "michael.chen@edufam.com",
        type: "offboarding",
        status: "in_progress",
        start_date: "2024-01-22",
        target_completion: "2024-02-05",
        assigned_to: "HR Team",
        department: "Engineering",
        position: "Software Engineer",
        priority: "medium",
        notes: "Moving to another company. Knowledge transfer required.",
        checklist: offboardingChecklist.map((item, index) => ({
          id: index.toString(),
          ...item,
          status:
            index < 4 ? "completed" : index < 7 ? "in_progress" : "pending",
          due_date: "2024-02-05",
          completed_date: index < 4 ? "2024-01-26" : undefined,
          notes: "",
        })),
      },
      {
        id: "3",
        employee_name: "Emma Wilson",
        employee_email: "emma.wilson@edufam.com",
        type: "onboarding",
        status: "completed",
        start_date: "2024-01-15",
        target_completion: "2024-01-29",
        actual_completion: "2024-01-28",
        assigned_to: "HR Team",
        department: "Finance",
        position: "Financial Analyst",
        priority: "medium",
        notes: "Successfully completed onboarding process.",
        checklist: onboardingChecklist.map((item, index) => ({
          id: index.toString(),
          ...item,
          status: "completed",
          due_date: "2024-01-29",
          completed_date: "2024-01-28",
          notes: "",
        })),
      },
    ];

    setProcesses(mockProcesses);
    setLoading(false);
  }, []);

  const filteredProcesses = processes.filter((process) => {
    const matchesSearch =
      process.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      process.employee_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      process.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || process.type === typeFilter;
    const matchesStatus =
      statusFilter === "all" || process.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const totalProcesses = processes.length;
  const onboardingProcesses = processes.filter(
    (process) => process.type === "onboarding"
  ).length;
  const offboardingProcesses = processes.filter(
    (process) => process.type === "offboarding"
  ).length;
  const completedProcesses = processes.filter(
    (process) => process.status === "completed"
  ).length;
  const inProgressProcesses = processes.filter(
    (process) => process.status === "in_progress"
  ).length;

  const createProcess = () => {
    const checklist =
      newProcess.type === "onboarding"
        ? onboardingChecklist
        : offboardingChecklist;

    const process: Process = {
      id: Date.now().toString(),
      ...newProcess,
      status: "pending",
      checklist: checklist.map((item, index) => ({
        id: index.toString(),
        ...item,
        status: "pending",
        due_date: newProcess.target_completion,
        notes: "",
      })),
    };

    setProcesses([...processes, process]);
    setCreateDialogOpen(false);
    setNewProcess({
      employee_name: "",
      employee_email: "",
      type: "onboarding",
      department: "",
      position: "",
      start_date: "",
      target_completion: "",
      assigned_to: "",
      priority: "medium",
      notes: "",
    });
    toast({
      title: "Success",
      description: `${
        newProcess.type === "onboarding" ? "Onboarding" : "Offboarding"
      } process created successfully`,
    });
  };

  const updateProcessStatus = (id: string, status: Process["status"]) => {
    setProcesses(
      processes.map((process) =>
        process.id === id
          ? {
              ...process,
              status,
              actual_completion:
                status === "completed"
                  ? new Date().toISOString()
                  : process.actual_completion,
            }
          : process
      )
    );
    toast({
      title: "Status Updated",
      description: `Process status changed to ${status}`,
    });
  };

  const updateChecklistItem = (
    processId: string,
    itemId: string,
    status: ChecklistItem["status"]
  ) => {
    setProcesses(
      processes.map((process) =>
        process.id === processId
          ? {
              ...process,
              checklist: process.checklist.map((item) =>
                item.id === itemId
                  ? {
                      ...item,
                      status,
                      completed_date:
                        status === "completed"
                          ? new Date().toISOString()
                          : item.completed_date,
                    }
                  : item
              ),
            }
          : process
      )
    );
  };

  const getProgressPercentage = (checklist: ChecklistItem[]) => {
    const completed = checklist.filter(
      (item) => item.status === "completed"
    ).length;
    return (completed / checklist.length) * 100;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Onboarding & Offboarding
          </h1>
          <p className="text-muted-foreground">
            Manage employee lifecycle processes and checklists
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Process
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Process</DialogTitle>
              <DialogDescription>
                Start a new onboarding or offboarding process
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label
                    htmlFor="employee_name"
                    className="text-sm font-medium"
                  >
                    Employee Name
                  </label>
                  <Input
                    id="employee_name"
                    placeholder="Enter employee name"
                    value={newProcess.employee_name}
                    onChange={(e) =>
                      setNewProcess((prev) => ({
                        ...prev,
                        employee_name: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <label
                    htmlFor="employee_email"
                    className="text-sm font-medium"
                  >
                    Employee Email
                  </label>
                  <Input
                    id="employee_email"
                    type="email"
                    placeholder="Enter employee email"
                    value={newProcess.employee_email}
                    onChange={(e) =>
                      setNewProcess((prev) => ({
                        ...prev,
                        employee_email: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label htmlFor="type" className="text-sm font-medium">
                    Process Type
                  </label>
                  <Select
                    value={newProcess.type}
                    onValueChange={(value: any) =>
                      setNewProcess((prev) => ({
                        ...prev,
                        type: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="onboarding">
                        <div className="flex items-center gap-2">
                          <UserPlus className="h-4 w-4" />
                          Onboarding
                        </div>
                      </SelectItem>
                      <SelectItem value="offboarding">
                        <div className="flex items-center gap-2">
                          <UserMinus className="h-4 w-4" />
                          Offboarding
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <label htmlFor="department" className="text-sm font-medium">
                    Department
                  </label>
                  <Select
                    value={newProcess.department}
                    onValueChange={(value) =>
                      setNewProcess((prev) => ({
                        ...prev,
                        department: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label htmlFor="position" className="text-sm font-medium">
                    Position
                  </label>
                  <Input
                    id="position"
                    placeholder="Enter job title"
                    value={newProcess.position}
                    onChange={(e) =>
                      setNewProcess((prev) => ({
                        ...prev,
                        position: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="priority" className="text-sm font-medium">
                    Priority
                  </label>
                  <Select
                    value={newProcess.priority}
                    onValueChange={(value: any) =>
                      setNewProcess((prev) => ({
                        ...prev,
                        priority: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label htmlFor="start_date" className="text-sm font-medium">
                    Start Date
                  </label>
                  <Input
                    id="start_date"
                    type="date"
                    value={newProcess.start_date}
                    onChange={(e) =>
                      setNewProcess((prev) => ({
                        ...prev,
                        start_date: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <label
                    htmlFor="target_completion"
                    className="text-sm font-medium"
                  >
                    Target Completion
                  </label>
                  <Input
                    id="target_completion"
                    type="date"
                    value={newProcess.target_completion}
                    onChange={(e) =>
                      setNewProcess((prev) => ({
                        ...prev,
                        target_completion: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <label htmlFor="notes" className="text-sm font-medium">
                  Notes
                </label>
                <Textarea
                  id="notes"
                  placeholder="Add any notes about this process..."
                  value={newProcess.notes}
                  onChange={(e) =>
                    setNewProcess((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                />
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
                onClick={createProcess}
                disabled={
                  !newProcess.employee_name || !newProcess.employee_email
                }
              >
                Create Process
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Processes
            </CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProcesses}</div>
            <p className="text-xs text-muted-foreground">All processes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Onboarding</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {onboardingProcesses}
            </div>
            <p className="text-xs text-muted-foreground">New employees</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offboarding</CardTitle>
            <UserMinus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {offboardingProcesses}
            </div>
            <p className="text-xs text-muted-foreground">Departing employees</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {inProgressProcesses}
            </div>
            <p className="text-xs text-muted-foreground">Active processes</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Processes</CardTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search processes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="onboarding">Onboarding</SelectItem>
                  <SelectItem value="offboarding">Offboarding</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">
                  Loading processes...
                </p>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Timeline</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProcesses.map((process) => (
                  <TableRow key={process.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {process.employee_name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {process.employee_email}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {process.position}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(process.type)}
                        <Badge variant={getTypeBadgeVariant(process.type)}>
                          {process.type.charAt(0).toUpperCase() +
                            process.type.slice(1)}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-500" />
                        {process.department}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(process.status)}
                        <Badge variant={getStatusBadgeVariant(process.status)}>
                          {process.status
                            .replace("_", " ")
                            .charAt(0)
                            .toUpperCase() +
                            process.status.replace("_", " ").slice(1)}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm">
                          {
                            process.checklist.filter(
                              (item) => item.status === "completed"
                            ).length
                          }{" "}
                          / {process.checklist.length}
                        </div>
                        <Progress
                          value={getProgressPercentage(process.checklist)}
                          className="h-2"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>
                          Start:{" "}
                          {new Date(process.start_date).toLocaleDateString()}
                        </div>
                        <div className="text-muted-foreground">
                          Target:{" "}
                          {new Date(
                            process.target_completion
                          ).toLocaleDateString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedProcess(process);
                            setEditDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {process.status === "pending" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              updateProcessStatus(process.id, "in_progress")
                            }
                          >
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        )}
                        {process.status === "in_progress" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              updateProcessStatus(process.id, "completed")
                            }
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

      {/* Process Details Dialog */}
      {selectedProcess && (
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-[900px]">
            <DialogHeader>
              <DialogTitle>
                {selectedProcess.employee_name} - {selectedProcess.type}
              </DialogTitle>
              <DialogDescription>
                Process details and checklist management
              </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="checklist">Checklist</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Employee Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span>{selectedProcess.employee_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span>{selectedProcess.employee_email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-500" />
                        <span>{selectedProcess.department}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-gray-500" />
                        <span>{selectedProcess.position}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Process Details</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Type:</span>
                        <Badge
                          variant={getTypeBadgeVariant(selectedProcess.type)}
                          className="ml-2"
                        >
                          {selectedProcess.type}
                        </Badge>
                      </div>
                      <div>
                        <span className="font-medium">Status:</span>
                        <Badge
                          variant={getStatusBadgeVariant(
                            selectedProcess.status
                          )}
                          className="ml-2"
                        >
                          {selectedProcess.status.replace("_", " ")}
                        </Badge>
                      </div>
                      <div>
                        <span className="font-medium">Priority:</span>
                        <Badge
                          variant={getPriorityBadgeVariant(
                            selectedProcess.priority
                          )}
                          className="ml-2"
                        >
                          {selectedProcess.priority}
                        </Badge>
                      </div>
                      <div>
                        <span className="font-medium">Assigned to:</span>{" "}
                        {selectedProcess.assigned_to}
                      </div>
                      <div>
                        <span className="font-medium">Start Date:</span>{" "}
                        {new Date(
                          selectedProcess.start_date
                        ).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-medium">Target Completion:</span>{" "}
                        {new Date(
                          selectedProcess.target_completion
                        ).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Notes</h4>
                  <p className="text-sm">{selectedProcess.notes}</p>
                </div>
              </TabsContent>

              <TabsContent value="checklist" className="space-y-4">
                <div className="space-y-4">
                  {Object.entries(
                    selectedProcess.checklist.reduce((acc, item) => {
                      if (!acc[item.category]) acc[item.category] = [];
                      acc[item.category].push(item);
                      return acc;
                    }, {} as Record<string, ChecklistItem[]>)
                  ).map(([category, items]) => (
                    <Card key={category}>
                      <CardHeader>
                        <CardTitle className="text-sm">{category}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between p-3 border rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const newStatus =
                                      item.status === "completed"
                                        ? "pending"
                                        : "completed";
                                    updateChecklistItem(
                                      selectedProcess.id,
                                      item.id,
                                      newStatus
                                    );
                                  }}
                                >
                                  {item.status === "completed" ? (
                                    <CheckSquare className="h-4 w-4 text-green-600" />
                                  ) : (
                                    <Square className="h-4 w-4 text-gray-400" />
                                  )}
                                </Button>
                                <div>
                                  <p className="font-medium">{item.task}</p>
                                  <p className="text-sm text-gray-600">
                                    Assigned to: {item.assigned_to}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant={
                                    item.status === "completed"
                                      ? "default"
                                      : "secondary"
                                  }
                                >
                                  {item.status.replace("_", " ")}
                                </Badge>
                                {item.completed_date && (
                                  <span className="text-xs text-gray-500">
                                    {new Date(
                                      item.completed_date
                                    ).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="timeline" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Process Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div>
                          <p className="font-medium">Process started</p>
                          <p className="text-sm text-gray-600">
                            {new Date(
                              selectedProcess.start_date
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {selectedProcess.status !== "pending" && (
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <div>
                            <p className="font-medium">Process in progress</p>
                            <p className="text-sm text-gray-600">
                              Started working on checklist items
                            </p>
                          </div>
                        </div>
                      )}
                      {selectedProcess.status === "completed" && (
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <div>
                            <p className="font-medium">Process completed</p>
                            <p className="text-sm text-gray-600">
                              {selectedProcess.actual_completion &&
                                new Date(
                                  selectedProcess.actual_completion
                                ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
              >
                Close
              </Button>
              <Button>Edit Process</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default OnboardingOffboardingPage;
