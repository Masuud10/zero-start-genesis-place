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
  BarChart3,
  Users,
  Calendar,
  Target,
  TrendingUp,
  TrendingDown,
  Mail,
  MessageSquare,
  Globe,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Play,
  Pause,
  Stop,
  Copy,
  Share2,
  Filter,
  Search,
  Download,
  RefreshCw,
} from "lucide-react";

interface Campaign {
  id: string;
  name: string;
  description: string;
  type: "email" | "social" | "sms" | "webinar" | "event";
  status: "draft" | "active" | "paused" | "completed" | "cancelled";
  target_audience: string;
  budget: number;
  spent: number;
  start_date: string;
  end_date: string;
  created_at: string;
  metrics: {
    impressions: number;
    clicks: number;
    conversions: number;
    leads: number;
    revenue: number;
    ctr: number;
    cpc: number;
    roas: number;
  };
}

const CampaignManagementPage: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { toast } = useToast();

  const [newCampaign, setNewCampaign] = useState({
    name: "",
    description: "",
    type: "email" as const,
    target_audience: "",
    budget: 0,
    start_date: "",
    end_date: "",
  });

  const campaignTypes = [
    { value: "email", label: "Email Campaign", icon: Mail },
    { value: "social", label: "Social Media", icon: Globe },
    { value: "sms", label: "SMS Campaign", icon: MessageSquare },
    { value: "webinar", label: "Webinar", icon: Users },
    { value: "event", label: "Event", icon: Calendar },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <Play className="h-4 w-4 text-green-600" />;
      case "paused":
        return <Pause className="h-4 w-4 text-yellow-600" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default" as const;
      case "paused":
        return "secondary" as const;
      case "completed":
        return "outline" as const;
      case "cancelled":
        return "destructive" as const;
      default:
        return "outline" as const;
    }
  };

  const getTypeIcon = (type: string) => {
    const campaignType = campaignTypes.find((t) => t.value === type);
    return campaignType ? (
      <campaignType.icon className="h-4 w-4" />
    ) : (
      <Target className="h-4 w-4" />
    );
  };

  // Mock data for demonstration
  useEffect(() => {
    const mockCampaigns: Campaign[] = [
      {
        id: "1",
        name: "Back to School Email Campaign",
        description: "Promoting our school management features to new schools",
        type: "email",
        status: "active",
        target_audience: "New schools, Principals",
        budget: 5000,
        spent: 3200,
        start_date: "2024-01-15",
        end_date: "2024-02-15",
        created_at: "2024-01-10",
        metrics: {
          impressions: 15000,
          clicks: 1200,
          conversions: 45,
          leads: 38,
          revenue: 12500,
          ctr: 8.0,
          cpc: 2.67,
          roas: 3.91,
        },
      },
      {
        id: "2",
        name: "Social Media Awareness",
        description: "Building brand awareness on social platforms",
        type: "social",
        status: "active",
        target_audience: "Education sector, Teachers",
        budget: 3000,
        spent: 1800,
        start_date: "2024-01-20",
        end_date: "2024-03-20",
        created_at: "2024-01-18",
        metrics: {
          impressions: 25000,
          clicks: 800,
          conversions: 25,
          leads: 20,
          revenue: 7500,
          ctr: 3.2,
          cpc: 2.25,
          roas: 4.17,
        },
      },
      {
        id: "3",
        name: "SMS Reminder Campaign",
        description: "Sending payment reminders to existing customers",
        type: "sms",
        status: "completed",
        target_audience: "Existing customers",
        budget: 1000,
        spent: 950,
        start_date: "2024-01-01",
        end_date: "2024-01-31",
        created_at: "2023-12-28",
        metrics: {
          impressions: 5000,
          clicks: 1200,
          conversions: 180,
          leads: 0,
          revenue: 45000,
          ctr: 24.0,
          cpc: 0.79,
          roas: 47.37,
        },
      },
    ];

    setCampaigns(mockCampaigns);
    setLoading(false);
  }, []);

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch =
      campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || campaign.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalBudget = campaigns.reduce(
    (sum, campaign) => sum + campaign.budget,
    0
  );
  const totalSpent = campaigns.reduce(
    (sum, campaign) => sum + campaign.spent,
    0
  );
  const totalRevenue = campaigns.reduce(
    (sum, campaign) => sum + campaign.metrics.revenue,
    0
  );
  const activeCampaigns = campaigns.filter(
    (campaign) => campaign.status === "active"
  ).length;

  const createCampaign = () => {
    const campaign: Campaign = {
      id: Date.now().toString(),
      ...newCampaign,
      status: "draft",
      created_at: new Date().toISOString(),
      metrics: {
        impressions: 0,
        clicks: 0,
        conversions: 0,
        leads: 0,
        revenue: 0,
        ctr: 0,
        cpc: 0,
        roas: 0,
      },
    };

    setCampaigns([...campaigns, campaign]);
    setCreateDialogOpen(false);
    setNewCampaign({
      name: "",
      description: "",
      type: "email",
      target_audience: "",
      budget: 0,
      start_date: "",
      end_date: "",
    });
    toast({
      title: "Success",
      description: "Campaign created successfully",
    });
  };

  const updateCampaignStatus = (id: string, status: Campaign["status"]) => {
    setCampaigns(
      campaigns.map((campaign) =>
        campaign.id === id ? { ...campaign, status } : campaign
      )
    );
    toast({
      title: "Status Updated",
      description: `Campaign status changed to ${status}`,
    });
  };

  const duplicateCampaign = (campaign: Campaign) => {
    const duplicated: Campaign = {
      ...campaign,
      id: Date.now().toString(),
      name: `${campaign.name} (Copy)`,
      status: "draft",
      created_at: new Date().toISOString(),
      metrics: {
        impressions: 0,
        clicks: 0,
        conversions: 0,
        leads: 0,
        revenue: 0,
        ctr: 0,
        cpc: 0,
        roas: 0,
      },
    };
    setCampaigns([...campaigns, duplicated]);
    toast({
      title: "Campaign Duplicated",
      description: "Campaign has been duplicated successfully",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Campaign Management
          </h1>
          <p className="text-muted-foreground">
            Create, track, and analyze marketing campaigns
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Campaign</DialogTitle>
              <DialogDescription>
                Set up a new marketing campaign
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="campaign_name" className="text-sm font-medium">
                  Campaign Name
                </label>
                <Input
                  id="campaign_name"
                  placeholder="Enter campaign name"
                  value={newCampaign.name}
                  onChange={(e) =>
                    setNewCampaign((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Description
                </label>
                <Textarea
                  id="description"
                  placeholder="Describe your campaign"
                  value={newCampaign.description}
                  onChange={(e) =>
                    setNewCampaign((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label htmlFor="type" className="text-sm font-medium">
                    Campaign Type
                  </label>
                  <Select
                    value={newCampaign.type}
                    onValueChange={(value: any) =>
                      setNewCampaign((prev) => ({
                        ...prev,
                        type: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {campaignTypes.map((type) => (
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
                <div className="grid gap-2">
                  <label htmlFor="budget" className="text-sm font-medium">
                    Budget
                  </label>
                  <Input
                    id="budget"
                    type="number"
                    placeholder="0.00"
                    value={newCampaign.budget}
                    onChange={(e) =>
                      setNewCampaign((prev) => ({
                        ...prev,
                        budget: parseFloat(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <label
                  htmlFor="target_audience"
                  className="text-sm font-medium"
                >
                  Target Audience
                </label>
                <Input
                  id="target_audience"
                  placeholder="e.g., New schools, Principals"
                  value={newCampaign.target_audience}
                  onChange={(e) =>
                    setNewCampaign((prev) => ({
                      ...prev,
                      target_audience: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label htmlFor="start_date" className="text-sm font-medium">
                    Start Date
                  </label>
                  <Input
                    id="start_date"
                    type="date"
                    value={newCampaign.start_date}
                    onChange={(e) =>
                      setNewCampaign((prev) => ({
                        ...prev,
                        start_date: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="end_date" className="text-sm font-medium">
                    End Date
                  </label>
                  <Input
                    id="end_date"
                    type="date"
                    value={newCampaign.end_date}
                    onChange={(e) =>
                      setNewCampaign((prev) => ({
                        ...prev,
                        end_date: e.target.value,
                      }))
                    }
                  />
                </div>
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
                onClick={createCampaign}
                disabled={!newCampaign.name || !newCampaign.description}
              >
                Create Campaign
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalBudget.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">All campaigns</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ${totalSpent.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {((totalSpent / totalBudget) * 100).toFixed(1)}% of budget
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              ROAS: {(totalRevenue / totalSpent).toFixed(2)}x
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Campaigns
            </CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {activeCampaigns}
            </div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Campaigns</CardTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search campaigns..."
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
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
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
                  Loading campaigns...
                </p>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCampaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{campaign.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {campaign.description}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {campaign.target_audience}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(campaign.type)}
                        <span className="capitalize">{campaign.type}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(campaign.status)}
                        <Badge variant={getStatusBadgeVariant(campaign.status)}>
                          {campaign.status.charAt(0).toUpperCase() +
                            campaign.status.slice(1)}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          ${campaign.spent.toLocaleString()} / $
                          {campaign.budget.toLocaleString()}
                        </div>
                        <Progress
                          value={(campaign.spent / campaign.budget) * 100}
                          className="h-2 mt-1"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm">
                          <span className="font-medium">
                            {campaign.metrics.conversions}
                          </span>{" "}
                          conversions
                        </div>
                        <div className="text-sm text-muted-foreground">
                          ROAS: {campaign.metrics.roas.toFixed(2)}x
                        </div>
                        <div className="text-sm text-muted-foreground">
                          CTR: {campaign.metrics.ctr.toFixed(1)}%
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedCampaign(campaign);
                            setEditDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => duplicateCampaign(campaign)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        {campaign.status === "active" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              updateCampaignStatus(campaign.id, "paused")
                            }
                          >
                            <Pause className="h-4 w-4" />
                          </Button>
                        )}
                        {campaign.status === "paused" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              updateCampaignStatus(campaign.id, "active")
                            }
                          >
                            <Play className="h-4 w-4" />
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

      {/* Campaign Details Dialog */}
      {selectedCampaign && (
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>{selectedCampaign.name}</DialogTitle>
              <DialogDescription>
                Campaign details and performance metrics
              </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="metrics">Metrics</TabsTrigger>
                <TabsTrigger value="audience">Audience</TabsTrigger>
                <TabsTrigger value="content">Content</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Campaign Details</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Type:</span>{" "}
                        {selectedCampaign.type}
                      </div>
                      <div>
                        <span className="font-medium">Status:</span>{" "}
                        {selectedCampaign.status}
                      </div>
                      <div>
                        <span className="font-medium">Start Date:</span>{" "}
                        {new Date(
                          selectedCampaign.start_date
                        ).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-medium">End Date:</span>{" "}
                        {new Date(
                          selectedCampaign.end_date
                        ).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Budget & Spending</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Budget:</span> $
                        {selectedCampaign.budget.toLocaleString()}
                      </div>
                      <div>
                        <span className="font-medium">Spent:</span> $
                        {selectedCampaign.spent.toLocaleString()}
                      </div>
                      <div>
                        <span className="font-medium">Remaining:</span> $
                        {(
                          selectedCampaign.budget - selectedCampaign.spent
                        ).toLocaleString()}
                      </div>
                      <Progress
                        value={
                          (selectedCampaign.spent / selectedCampaign.budget) *
                          100
                        }
                        className="h-2"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="metrics" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">
                        Performance Metrics
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span>Impressions:</span>
                        <span className="font-medium">
                          {selectedCampaign.metrics.impressions.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Clicks:</span>
                        <span className="font-medium">
                          {selectedCampaign.metrics.clicks.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Conversions:</span>
                        <span className="font-medium">
                          {selectedCampaign.metrics.conversions}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Leads:</span>
                        <span className="font-medium">
                          {selectedCampaign.metrics.leads}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">
                        Financial Metrics
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span>Revenue:</span>
                        <span className="font-medium text-green-600">
                          ${selectedCampaign.metrics.revenue.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>CTR:</span>
                        <span className="font-medium">
                          {selectedCampaign.metrics.ctr.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>CPC:</span>
                        <span className="font-medium">
                          ${selectedCampaign.metrics.cpc.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>ROAS:</span>
                        <span className="font-medium">
                          {selectedCampaign.metrics.roas.toFixed(2)}x
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="audience" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Target Audience</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      {selectedCampaign.target_audience}
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="content" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Campaign Content</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{selectedCampaign.description}</p>
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
              <Button>Edit Campaign</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default CampaignManagementPage;
