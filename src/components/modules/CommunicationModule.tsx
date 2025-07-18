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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAdminAuthContext } from "@/components/auth/AdminAuthProvider";
import {
  Megaphone,
  Send,
  Users,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Bell,
  Mail,
  Target,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";

const CommunicationModule: React.FC = () => {
  const { adminUser } = useAdminAuthContext();
  const [isCreating, setIsCreating] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<string>("");

  const announcements = [
    {
      id: "1",
      title: "System Maintenance Notice",
      content:
        "Scheduled maintenance will occur on Sunday, January 21st from 2:00 AM to 6:00 AM EST. During this time, the system will be temporarily unavailable.",
      type: "maintenance",
      priority: "high",
      target: "all_schools",
      status: "published",
      created_at: "2024-01-15",
      views: 156,
      recipients: 89,
    },
    {
      id: "2",
      title: "New Feature Release",
      content:
        "We're excited to announce the release of our new advanced analytics dashboard. This feature provides enhanced insights into student performance and school metrics.",
      type: "feature",
      priority: "medium",
      target: "all_schools",
      status: "published",
      created_at: "2024-01-14",
      views: 234,
      recipients: 89,
    },
    {
      id: "3",
      title: "Training Webinar Invitation",
      content:
        "Join us for a comprehensive training webinar on the new features. The session will be held on January 25th at 2:00 PM EST.",
      type: "training",
      priority: "medium",
      target: "principals",
      status: "draft",
      created_at: "2024-01-13",
      views: 0,
      recipients: 45,
    },
    {
      id: "4",
      title: "Security Update",
      content:
        "Important security updates have been implemented. Please ensure all users update their passwords within the next 30 days.",
      type: "security",
      priority: "high",
      target: "all_users",
      status: "published",
      created_at: "2024-01-12",
      views: 189,
      recipients: 156,
    },
  ];

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">High Priority</Badge>;
      case "medium":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Medium Priority
          </Badge>
        );
      case "low":
        return <Badge variant="outline">Low Priority</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "maintenance":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            Maintenance
          </Badge>
        );
      case "feature":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Feature
          </Badge>
        );
      case "training":
        return (
          <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
            Training
          </Badge>
        );
      case "security":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            Security
          </Badge>
        );
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="h-3 w-3 mr-1" />
            Published
          </Badge>
        );
      case "draft":
        return (
          <Badge variant="outline">
            <AlertCircle className="h-3 w-3 mr-1" />
            Draft
          </Badge>
        );
      case "scheduled":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            <Calendar className="h-3 w-3 mr-1" />
            Scheduled
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Communication Center
          </h2>
          <p className="text-muted-foreground">
            Manage announcements and communications across all schools
          </p>
        </div>
        <Button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2"
        >
          <Send className="h-4 w-4" />
          New Announcement
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Announcements
            </CardTitle>
            <Megaphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{announcements.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {announcements.filter((a) => a.status === "published").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Active announcements
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {announcements.reduce((sum, a) => sum + a.views, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Combined views</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recipients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {announcements.reduce((sum, a) => sum + a.recipients, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Total recipients</p>
          </CardContent>
        </Card>
      </div>

      {/* Create New Announcement */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Send className="h-5 w-5" />
              <span>Create New Announcement</span>
            </CardTitle>
            <CardDescription>
              Send a new announcement to schools and users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input placeholder="Enter announcement title..." />
              </div>
              <div>
                <label className="text-sm font-medium">Content</label>
                <Textarea
                  placeholder="Enter announcement content..."
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <select className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm">
                    <option value="general">General</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="feature">Feature</option>
                    <option value="training">Training</option>
                    <option value="security">Security</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <select className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Target Audience</label>
                  <select className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm">
                    <option value="all_schools">All Schools</option>
                    <option value="principals">Principals Only</option>
                    <option value="teachers">Teachers Only</option>
                    <option value="all_users">All Users</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button>
                  <Send className="h-4 w-4 mr-2" />
                  Send Announcement
                </Button>
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Announcements List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Megaphone className="h-5 w-5" />
            <span>Announcements ({announcements.length})</span>
          </CardTitle>
          <CardDescription>
            Manage and monitor all system announcements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <div
                key={announcement.id}
                className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold">{announcement.title}</h3>
                      {getPriorityBadge(announcement.priority)}
                      {getTypeBadge(announcement.type)}
                      {getStatusBadge(announcement.status)}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {announcement.content}
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>
                        Created: {formatDate(announcement.created_at)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Target className="h-3 w-3" />
                      <span>
                        Target: {announcement.target.replace("_", " ")}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye className="h-3 w-3" />
                      <span>{announcement.views} views</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-3 w-3" />
                      <span>{announcement.recipients} recipients</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CommunicationModule;
