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
  ArrowRight,
  Filter,
  Search,
  Download,
  RefreshCw,
  MessageSquare,
  Star,
  Target,
  TrendingUp,
  Users,
  DollarSign,
} from "lucide-react";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  position: string;
  source: string;
  status:
    | "new"
    | "contacted"
    | "qualified"
    | "proposal"
    | "negotiation"
    | "won"
    | "lost";
  priority: "low" | "medium" | "high";
  assigned_to: string;
  created_at: string;
  last_contact: string;
  notes: string;
  value: number;
  tags: string[];
}

const LeadManagementPage: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const { toast } = useToast();

  const [newLead, setNewLead] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    position: "",
    source: "",
    priority: "medium" as const,
    assigned_to: "",
    notes: "",
    value: 0,
  });

  const leadSources = [
    "Website",
    "Social Media",
    "Email Campaign",
    "Referral",
    "Trade Show",
    "Cold Call",
    "Advertisement",
    "Other",
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "new":
        return <Clock className="h-4 w-4 text-blue-600" />;
      case "contacted":
        return <MessageSquare className="h-4 w-4 text-yellow-600" />;
      case "qualified":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "proposal":
        return <Target className="h-4 w-4 text-purple-600" />;
      case "negotiation":
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case "won":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "lost":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "new":
        return "secondary" as const;
      case "contacted":
        return "outline" as const;
      case "qualified":
        return "default" as const;
      case "proposal":
        return "secondary" as const;
      case "negotiation":
        return "outline" as const;
      case "won":
        return "default" as const;
      case "lost":
        return "destructive" as const;
      default:
        return "outline" as const;
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
    const mockLeads: Lead[] = [
      {
        id: "1",
        name: "Sarah Johnson",
        email: "sarah.johnson@brightacademy.edu",
        phone: "+254-700-123-456",
        company: "Bright Academy",
        position: "Principal",
        source: "Website",
        status: "qualified",
        priority: "high",
        assigned_to: "John Smith",
        created_at: "2024-01-15",
        last_contact: "2024-01-20",
        notes:
          "Interested in school management features. Follow up scheduled for next week.",
        value: 5000,
        tags: ["education", "principal", "interested"],
      },
      {
        id: "2",
        name: "Michael Chen",
        email: "mchen@excellence.edu",
        phone: "+254-700-234-567",
        company: "Excellence School",
        position: "IT Director",
        source: "Email Campaign",
        status: "contacted",
        priority: "medium",
        assigned_to: "Jane Doe",
        created_at: "2024-01-18",
        last_contact: "2024-01-22",
        notes:
          "Looking for digital transformation solutions. Technical requirements discussed.",
        value: 8000,
        tags: ["IT", "digital", "technical"],
      },
      {
        id: "3",
        name: "Lisa Park",
        email: "lisa.park@innovationschool.edu",
        phone: "+254-700-345-678",
        company: "Innovation School",
        position: "Administrator",
        source: "Referral",
        status: "new",
        priority: "high",
        assigned_to: "John Smith",
        created_at: "2024-01-25",
        last_contact: "2024-01-25",
        notes:
          "Referred by existing customer. Very interested in our platform.",
        value: 6000,
        tags: ["referral", "interested", "new"],
      },
      {
        id: "4",
        name: "David Wilson",
        email: "dwilson@legacy.edu",
        phone: "+254-700-456-789",
        company: "Legacy Academy",
        position: "Head of Operations",
        source: "Social Media",
        status: "proposal",
        priority: "medium",
        assigned_to: "Jane Doe",
        created_at: "2024-01-10",
        last_contact: "2024-01-23",
        notes: "Proposal sent. Waiting for budget approval from board.",
        value: 12000,
        tags: ["proposal", "budget", "board"],
      },
      {
        id: "5",
        name: "Emma Thompson",
        email: "emma.thompson@future.edu",
        phone: "+254-700-567-890",
        company: "Future School",
        position: "Director",
        source: "Trade Show",
        status: "negotiation",
        priority: "high",
        assigned_to: "John Smith",
        created_at: "2024-01-05",
        last_contact: "2024-01-24",
        notes: "Negotiating contract terms. Close to closing.",
        value: 15000,
        tags: ["negotiation", "contract", "closing"],
      },
    ];

    setLeads(mockLeads);
    setLoading(false);
  }, []);

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || lead.status === statusFilter;
    const matchesPriority =
      priorityFilter === "all" || lead.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const totalLeads = leads.length;
  const newLeads = leads.filter((lead) => lead.status === "new").length;
  const qualifiedLeads = leads.filter(
    (lead) => lead.status === "qualified"
  ).length;
  const totalValue = leads.reduce((sum, lead) => sum + lead.value, 0);

  const createLead = () => {
    const lead: Lead = {
      id: Date.now().toString(),
      ...newLead,
      status: "new",
      created_at: new Date().toISOString(),
      last_contact: new Date().toISOString(),
      tags: [],
    };

    setLeads([...leads, lead]);
    setCreateDialogOpen(false);
    setNewLead({
      name: "",
      email: "",
      phone: "",
      company: "",
      position: "",
      source: "",
      priority: "medium",
      assigned_to: "",
      notes: "",
      value: 0,
    });
    toast({
      title: "Success",
      description: "Lead created successfully",
    });
  };

  const updateLeadStatus = (id: string, status: Lead["status"]) => {
    setLeads(
      leads.map((lead) =>
        lead.id === id
          ? { ...lead, status, last_contact: new Date().toISOString() }
          : lead
      )
    );
    toast({
      title: "Status Updated",
      description: `Lead status changed to ${status}`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "text-blue-600";
      case "contacted":
        return "text-yellow-600";
      case "qualified":
        return "text-green-600";
      case "proposal":
        return "text-purple-600";
      case "negotiation":
        return "text-orange-600";
      case "won":
        return "text-green-600";
      case "lost":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lead Management</h1>
          <p className="text-muted-foreground">
            Capture, track, and convert leads into customers
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Lead
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Lead</DialogTitle>
              <DialogDescription>
                Capture a new lead from any source
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Full Name
                  </label>
                  <Input
                    id="name"
                    placeholder="Enter full name"
                    value={newLead.name}
                    onChange={(e) =>
                      setNewLead((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email address"
                    value={newLead.email}
                    onChange={(e) =>
                      setNewLead((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label htmlFor="phone" className="text-sm font-medium">
                    Phone
                  </label>
                  <Input
                    id="phone"
                    placeholder="Enter phone number"
                    value={newLead.phone}
                    onChange={(e) =>
                      setNewLead((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="company" className="text-sm font-medium">
                    Company
                  </label>
                  <Input
                    id="company"
                    placeholder="Enter company name"
                    value={newLead.company}
                    onChange={(e) =>
                      setNewLead((prev) => ({
                        ...prev,
                        company: e.target.value,
                      }))
                    }
                  />
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
                    value={newLead.position}
                    onChange={(e) =>
                      setNewLead((prev) => ({
                        ...prev,
                        position: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="source" className="text-sm font-medium">
                    Source
                  </label>
                  <Select
                    value={newLead.source}
                    onValueChange={(value) =>
                      setNewLead((prev) => ({
                        ...prev,
                        source: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      {leadSources.map((source) => (
                        <SelectItem key={source} value={source}>
                          {source}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label htmlFor="priority" className="text-sm font-medium">
                    Priority
                  </label>
                  <Select
                    value={newLead.priority}
                    onValueChange={(value: any) =>
                      setNewLead((prev) => ({
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
                <div className="grid gap-2">
                  <label htmlFor="value" className="text-sm font-medium">
                    Estimated Value
                  </label>
                  <Input
                    id="value"
                    type="number"
                    placeholder="0.00"
                    value={newLead.value}
                    onChange={(e) =>
                      setNewLead((prev) => ({
                        ...prev,
                        value: parseFloat(e.target.value) || 0,
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
                  placeholder="Add any notes about this lead..."
                  value={newLead.notes}
                  onChange={(e) =>
                    setNewLead((prev) => ({
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
                onClick={createLead}
                disabled={!newLead.name || !newLead.email}
              >
                Add Lead
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLeads}</div>
            <p className="text-xs text-muted-foreground">All leads</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Leads</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{newLeads}</div>
            <p className="text-xs text-muted-foreground">
              {totalLeads > 0 ? ((newLeads / totalLeads) * 100).toFixed(1) : 0}%
              of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Qualified Leads
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {qualifiedLeads}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalLeads > 0
                ? ((qualifiedLeads / totalLeads) * 100).toFixed(1)
                : 0}
              % of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              ${totalValue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Pipeline value</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Leads</CardTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search leads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="proposal">Proposal</SelectItem>
                  <SelectItem value="negotiation">Negotiation</SelectItem>
                  <SelectItem value="won">Won</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
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
                <p className="mt-2 text-sm text-gray-600">Loading leads...</p>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lead</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Last Contact</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{lead.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {lead.email}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {lead.position}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-500" />
                        {lead.company}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{lead.source}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(lead.status)}
                        <Badge variant={getStatusBadgeVariant(lead.status)}>
                          {lead.status.charAt(0).toUpperCase() +
                            lead.status.slice(1)}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPriorityBadgeVariant(lead.priority)}>
                        {lead.priority.charAt(0).toUpperCase() +
                          lead.priority.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        ${lead.value.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {new Date(lead.last_contact).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedLead(lead);
                            setEditDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const statuses: Lead["status"][] = [
                              "new",
                              "contacted",
                              "qualified",
                              "proposal",
                              "negotiation",
                              "won",
                              "lost",
                            ];
                            const currentIndex = statuses.indexOf(lead.status);
                            const nextStatus =
                              statuses[
                                Math.min(currentIndex + 1, statuses.length - 1)
                              ];
                            updateLeadStatus(lead.id, nextStatus);
                          }}
                        >
                          <ArrowRight className="h-4 w-4" />
                        </Button>
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

      {/* Lead Details Dialog */}
      {selectedLead && (
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>{selectedLead.name}</DialogTitle>
              <DialogDescription>
                Lead details and interaction history
              </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="interactions">Interactions</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Contact Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span>{selectedLead.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span>{selectedLead.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-500" />
                        <span>{selectedLead.company}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span>{selectedLead.position}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Lead Details</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Source:</span>{" "}
                        {selectedLead.source}
                      </div>
                      <div>
                        <span className="font-medium">Status:</span>
                        <Badge
                          variant={getStatusBadgeVariant(selectedLead.status)}
                          className="ml-2"
                        >
                          {selectedLead.status}
                        </Badge>
                      </div>
                      <div>
                        <span className="font-medium">Priority:</span>
                        <Badge
                          variant={getPriorityBadgeVariant(
                            selectedLead.priority
                          )}
                          className="ml-2"
                        >
                          {selectedLead.priority}
                        </Badge>
                      </div>
                      <div>
                        <span className="font-medium">Value:</span> $
                        {selectedLead.value.toLocaleString()}
                      </div>
                      <div>
                        <span className="font-medium">Assigned to:</span>{" "}
                        {selectedLead.assigned_to}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="interactions" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">
                      Recent Interactions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                        <MessageSquare className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium">Email sent</p>
                          <p className="text-sm text-gray-600">
                            Follow-up email sent regarding proposal
                          </p>
                          <p className="text-xs text-gray-500">2 hours ago</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                        <Phone className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium">Phone call</p>
                          <p className="text-sm text-gray-600">
                            Discussed technical requirements and timeline
                          </p>
                          <p className="text-xs text-gray-500">1 day ago</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notes" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{selectedLead.notes}</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="timeline" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Lead Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div>
                          <p className="font-medium">Lead created</p>
                          <p className="text-sm text-gray-600">
                            {new Date(
                              selectedLead.created_at
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <div>
                          <p className="font-medium">First contact</p>
                          <p className="text-sm text-gray-600">
                            {new Date(
                              selectedLead.last_contact
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
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
              <Button>Edit Lead</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default LeadManagementPage;
