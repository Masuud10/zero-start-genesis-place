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
} from "lucide-react";

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  position: string;
  type: "customer" | "prospect" | "partner" | "vendor";
  status: "active" | "inactive" | "lead";
  assigned_to: string;
  created_at: string;
  last_contact: string;
  notes: string;
  tags: string[];
  activities: Activity[];
  deals: Deal[];
}

interface Activity {
  id: string;
  type: "email" | "call" | "meeting" | "note" | "task";
  title: string;
  description: string;
  date: string;
  status: "completed" | "pending" | "cancelled";
}

interface Deal {
  id: string;
  title: string;
  value: number;
  stage:
    | "prospecting"
    | "qualification"
    | "proposal"
    | "negotiation"
    | "closed_won"
    | "closed_lost";
  probability: number;
  expected_close: string;
}

const CRMPage: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { toast } = useToast();

  const [newContact, setNewContact] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    position: "",
    type: "prospect" as const,
    status: "active" as const,
    assigned_to: "",
    notes: "",
  });

  const contactTypes = [
    { value: "customer", label: "Customer", icon: CheckCircle },
    { value: "prospect", label: "Prospect", icon: Target },
    { value: "partner", label: "Partner", icon: Users },
    { value: "vendor", label: "Vendor", icon: Building2 },
  ];

  const getTypeIcon = (type: string) => {
    const contactType = contactTypes.find((t) => t.value === type);
    return contactType ? (
      <contactType.icon className="h-4 w-4" />
    ) : (
      <User className="h-4 w-4" />
    );
  };

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case "customer":
        return "default" as const;
      case "prospect":
        return "secondary" as const;
      case "partner":
        return "outline" as const;
      case "vendor":
        return "outline" as const;
      default:
        return "outline" as const;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default" as const;
      case "inactive":
        return "secondary" as const;
      case "lead":
        return "outline" as const;
      default:
        return "outline" as const;
    }
  };

  // Mock data for demonstration
  useEffect(() => {
    const mockContacts: Contact[] = [
      {
        id: "1",
        name: "Sarah Johnson",
        email: "sarah.johnson@brightacademy.edu",
        phone: "+254-700-123-456",
        company: "Bright Academy",
        position: "Principal",
        type: "customer",
        status: "active",
        assigned_to: "John Smith",
        created_at: "2023-06-15",
        last_contact: "2024-01-20",
        notes:
          "Very satisfied with our platform. Interested in additional features.",
        tags: ["education", "principal", "satisfied"],
        activities: [
          {
            id: "1",
            type: "call",
            title: "Follow-up call",
            description: "Discussed new features and upcoming renewal",
            date: "2024-01-20",
            status: "completed",
          },
          {
            id: "2",
            type: "email",
            title: "Feature update",
            description: "Sent information about new reporting features",
            date: "2024-01-18",
            status: "completed",
          },
        ],
        deals: [
          {
            id: "1",
            title: "Platform Renewal",
            value: 5000,
            stage: "closed_won",
            probability: 100,
            expected_close: "2024-02-01",
          },
        ],
      },
      {
        id: "2",
        name: "Michael Chen",
        email: "mchen@excellence.edu",
        phone: "+254-700-234-567",
        company: "Excellence School",
        position: "IT Director",
        type: "prospect",
        status: "active",
        assigned_to: "Jane Doe",
        created_at: "2024-01-18",
        last_contact: "2024-01-22",
        notes:
          "Looking for digital transformation solutions. Technical requirements discussed.",
        tags: ["IT", "digital", "technical"],
        activities: [
          {
            id: "3",
            type: "meeting",
            title: "Product demo",
            description: "Demonstrated platform features and capabilities",
            date: "2024-01-22",
            status: "completed",
          },
        ],
        deals: [
          {
            id: "2",
            title: "Digital Transformation",
            value: 8000,
            stage: "proposal",
            probability: 75,
            expected_close: "2024-03-15",
          },
        ],
      },
      {
        id: "3",
        name: "Lisa Park",
        email: "lisa.park@innovationschool.edu",
        phone: "+254-700-345-678",
        company: "Innovation School",
        position: "Administrator",
        type: "prospect",
        status: "lead",
        assigned_to: "John Smith",
        created_at: "2024-01-25",
        last_contact: "2024-01-25",
        notes:
          "Referred by existing customer. Very interested in our platform.",
        tags: ["referral", "interested", "new"],
        activities: [
          {
            id: "4",
            type: "call",
            title: "Initial contact",
            description: "Introduced our platform and scheduled demo",
            date: "2024-01-25",
            status: "completed",
          },
        ],
        deals: [
          {
            id: "3",
            title: "Platform Implementation",
            value: 6000,
            stage: "qualification",
            probability: 50,
            expected_close: "2024-04-01",
          },
        ],
      },
    ];

    setContacts(mockContacts);
    setLoading(false);
  }, []);

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || contact.type === typeFilter;
    const matchesStatus =
      statusFilter === "all" || contact.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const totalContacts = contacts.length;
  const customers = contacts.filter(
    (contact) => contact.type === "customer"
  ).length;
  const prospects = contacts.filter(
    (contact) => contact.type === "prospect"
  ).length;
  const totalDeals = contacts.reduce(
    (sum, contact) => sum + contact.deals.length,
    0
  );
  const totalDealValue = contacts.reduce(
    (sum, contact) =>
      sum + contact.deals.reduce((dealSum, deal) => dealSum + deal.value, 0),
    0
  );

  const createContact = () => {
    const contact: Contact = {
      id: Date.now().toString(),
      ...newContact,
      created_at: new Date().toISOString(),
      last_contact: new Date().toISOString(),
      tags: [],
      activities: [],
      deals: [],
    };

    setContacts([...contacts, contact]);
    setCreateDialogOpen(false);
    setNewContact({
      name: "",
      email: "",
      phone: "",
      company: "",
      position: "",
      type: "prospect",
      status: "active",
      assigned_to: "",
      notes: "",
    });
    toast({
      title: "Success",
      description: "Contact created successfully",
    });
  };

  const addActivity = (contactId: string, activity: Omit<Activity, "id">) => {
    const newActivity: Activity = {
      ...activity,
      id: Date.now().toString(),
    };

    setContacts(
      contacts.map((contact) =>
        contact.id === contactId
          ? {
              ...contact,
              activities: [...contact.activities, newActivity],
              last_contact: new Date().toISOString(),
            }
          : contact
      )
    );
    toast({
      title: "Activity Added",
      description: "New activity logged successfully",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Customer Relationship Management
          </h1>
          <p className="text-muted-foreground">
            Manage contacts, track activities, and nurture relationships
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Contact
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Contact</DialogTitle>
              <DialogDescription>
                Add a new contact to your CRM
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
                    value={newContact.name}
                    onChange={(e) =>
                      setNewContact((prev) => ({
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
                    value={newContact.email}
                    onChange={(e) =>
                      setNewContact((prev) => ({
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
                    value={newContact.phone}
                    onChange={(e) =>
                      setNewContact((prev) => ({
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
                    value={newContact.company}
                    onChange={(e) =>
                      setNewContact((prev) => ({
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
                    value={newContact.position}
                    onChange={(e) =>
                      setNewContact((prev) => ({
                        ...prev,
                        position: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="type" className="text-sm font-medium">
                    Type
                  </label>
                  <Select
                    value={newContact.type}
                    onValueChange={(value: any) =>
                      setNewContact((prev) => ({
                        ...prev,
                        type: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {contactTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <type.icon className="h-4 w-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <label htmlFor="notes" className="text-sm font-medium">
                  Notes
                </label>
                <Textarea
                  id="notes"
                  placeholder="Add any notes about this contact..."
                  value={newContact.notes}
                  onChange={(e) =>
                    setNewContact((prev) => ({
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
                onClick={createContact}
                disabled={!newContact.name || !newContact.email}
              >
                Add Contact
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
              Total Contacts
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalContacts}</div>
            <p className="text-xs text-muted-foreground">All contacts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{customers}</div>
            <p className="text-xs text-muted-foreground">
              {totalContacts > 0
                ? ((customers / totalContacts) * 100).toFixed(1)
                : 0}
              % of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prospects</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{prospects}</div>
            <p className="text-xs text-muted-foreground">
              {totalContacts > 0
                ? ((prospects / totalContacts) * 100).toFixed(1)
                : 0}
              % of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Deal Value
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              ${totalDealValue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalDeals} active deals
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Contacts</CardTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search contacts..."
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
                  <SelectItem value="customer">Customer</SelectItem>
                  <SelectItem value="prospect">Prospect</SelectItem>
                  <SelectItem value="partner">Partner</SelectItem>
                  <SelectItem value="vendor">Vendor</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="lead">Lead</SelectItem>
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
                  Loading contacts...
                </p>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contact</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Contact</TableHead>
                  <TableHead>Deals</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContacts.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{contact.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {contact.email}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {contact.position}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-500" />
                        {contact.company}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(contact.type)}
                        <Badge variant={getTypeBadgeVariant(contact.type)}>
                          {contact.type.charAt(0).toUpperCase() +
                            contact.type.slice(1)}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(contact.status)}>
                        {contact.status.charAt(0).toUpperCase() +
                          contact.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {new Date(contact.last_contact).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <span className="font-medium">
                          {contact.deals.length}
                        </span>{" "}
                        deals
                      </div>
                      <div className="text-xs text-muted-foreground">
                        $
                        {contact.deals
                          .reduce((sum, deal) => sum + deal.value, 0)
                          .toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedContact(contact);
                            setEditDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MessageSquare className="h-4 w-4" />
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

      {/* Contact Details Dialog */}
      {selectedContact && (
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-[900px]">
            <DialogHeader>
              <DialogTitle>{selectedContact.name}</DialogTitle>
              <DialogDescription>
                Contact details, activities, and deals
              </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="activities">Activities</TabsTrigger>
                <TabsTrigger value="deals">Deals</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Contact Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span>{selectedContact.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span>{selectedContact.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-500" />
                        <span>{selectedContact.company}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span>{selectedContact.position}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Contact Details</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Type:</span>
                        <Badge
                          variant={getTypeBadgeVariant(selectedContact.type)}
                          className="ml-2"
                        >
                          {selectedContact.type}
                        </Badge>
                      </div>
                      <div>
                        <span className="font-medium">Status:</span>
                        <Badge
                          variant={getStatusBadgeVariant(
                            selectedContact.status
                          )}
                          className="ml-2"
                        >
                          {selectedContact.status}
                        </Badge>
                      </div>
                      <div>
                        <span className="font-medium">Assigned to:</span>{" "}
                        {selectedContact.assigned_to}
                      </div>
                      <div>
                        <span className="font-medium">Created:</span>{" "}
                        {new Date(
                          selectedContact.created_at
                        ).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="activities" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Recent Activities</h4>
                  <Button size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Activity
                  </Button>
                </div>
                <div className="space-y-3">
                  {selectedContact.activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center gap-3 p-3 border rounded-lg"
                    >
                      <div className="p-2 bg-blue-100 rounded-full">
                        <Activity className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{activity.title}</p>
                        <p className="text-sm text-gray-600">
                          {activity.description}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(activity.date).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge
                        variant={
                          activity.status === "completed"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {activity.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="deals" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Active Deals</h4>
                  <Button size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Deal
                  </Button>
                </div>
                <div className="space-y-3">
                  {selectedContact.deals.map((deal) => (
                    <div key={deal.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium">{deal.title}</h5>
                        <Badge variant="outline">
                          ${deal.value.toLocaleString()}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Stage:</span>
                          <div className="font-medium capitalize">
                            {deal.stage.replace("_", " ")}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Probability:</span>
                          <div className="font-medium">{deal.probability}%</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Expected Close:</span>
                          <div className="font-medium">
                            {new Date(deal.expected_close).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <Progress value={deal.probability} className="mt-2" />
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="notes" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{selectedContact.notes}</p>
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
              <Button>Edit Contact</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default CRMPage;
