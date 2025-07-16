import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  MessageSquare,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Users,
  AlertTriangle,
  Info,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { useAdminCommunications } from "@/hooks/useAdminCommunications";
import {
  AdminCommunication,
  AdminCommunicationCreate,
} from "@/types/communications";
import { format } from "date-fns";

const AdminCommunicationsManager: React.FC = () => {
  const {
    allCommunications,
    stats,
    createCommunication,
    updateCommunication,
    deleteCommunication,
    isCreating,
    isUpdating,
    isDeleting,
    isLoadingAll,
    isLoadingStats,
  } = useAdminCommunications();

  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<AdminCommunicationCreate>({
    title: "",
    message: "",
    target_roles: [],
    priority: "medium",
    dismissible: true,
  });

  const availableRoles = [
    { value: "teacher", label: "Teachers" },
    { value: "principal", label: "Principals" },
    { value: "school_owner", label: "School Directors" },
    { value: "finance_officer", label: "Finance Officers" },
    { value: "parent", label: "Parents" },
    { value: "edufam_admin", label: "EduFam Admins" },
  ];

  const priorityOptions = [
    { value: "low", label: "Low", icon: CheckCircle, color: "text-green-600" },
    { value: "medium", label: "Medium", icon: Info, color: "text-yellow-600" },
    {
      value: "high",
      label: "High",
      icon: AlertTriangle,
      color: "text-red-600",
    },
  ];

  const handleCreateNew = () => {
    setIsCreatingNew(true);
    setEditingId(null);
    setFormData({
      title: "",
      message: "",
      target_roles: [],
      priority: "medium",
      dismissible: true,
    });
  };

  const handleEdit = (communication: AdminCommunication) => {
    setEditingId(communication.id);
    setIsCreatingNew(false);
    setFormData({
      title: communication.title,
      message: communication.message,
      target_roles: communication.target_roles,
      priority: communication.priority,
      dismissible: communication.dismissible,
    });
  };

  const handleCancel = () => {
    setIsCreatingNew(false);
    setEditingId(null);
    setFormData({
      title: "",
      message: "",
      target_roles: [],
      priority: "medium",
      dismissible: true,
    });
  };

  const handleSubmit = async () => {
    if (
      !formData.title.trim() ||
      !formData.message.trim() ||
      formData.target_roles.length === 0
    ) {
      return;
    }

    if (isCreatingNew) {
      await createCommunication(formData);
      handleCancel();
    } else if (editingId) {
      await updateCommunication({ id: editingId, updates: formData });
      handleCancel();
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this communication?")) {
      await deleteCommunication(id);
    }
  };

  const toggleRole = (role: string) => {
    setFormData((prev) => ({
      ...prev,
      target_roles: prev.target_roles.includes(role)
        ? prev.target_roles.filter((r) => r !== role)
        : [...prev.target_roles, role],
    }));
  };

  const getPriorityIcon = (priority: string) => {
    const option = priorityOptions.find((p) => p.value === priority);
    if (!option) return null;
    const Icon = option.icon;
    return <Icon className={`h-4 w-4 ${option.color}`} />;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Admin Communications
          </h2>
          <p className="text-gray-600">
            Manage system-wide communications for all users
          </p>
        </div>
        <Button onClick={handleCreateNew} disabled={isCreatingNew}>
          <Plus className="h-4 w-4 mr-2" />
          New Communication
        </Button>
      </div>

      {/* Statistics */}
      {!isLoadingStats && stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Active</p>
                  <p className="text-2xl font-bold">{stats.active}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm text-gray-600">Expired</p>
                  <p className="text-2xl font-bold">{stats.expired}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">High Priority</p>
                  <p className="text-2xl font-bold">{stats.byPriority.high}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Create/Edit Form */}
      {(isCreatingNew || editingId) && (
        <Card>
          <CardHeader>
            <CardTitle>
              {isCreatingNew
                ? "Create New Communication"
                : "Edit Communication"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Enter communication title"
              />
            </div>

            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, message: e.target.value }))
                }
                placeholder="Enter communication message"
                rows={4}
              />
            </div>

            <div>
              <Label>Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: "low" | "medium" | "high") =>
                  setFormData((prev) => ({ ...prev, priority: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        {getPriorityIcon(option.value)}
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Target Roles</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                {availableRoles.map((role) => (
                  <div key={role.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={role.value}
                      checked={formData.target_roles.includes(role.value)}
                      onCheckedChange={() => toggleRole(role.value)}
                    />
                    <Label htmlFor={role.value} className="text-sm">
                      {role.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="dismissible"
                checked={formData.dismissible}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    dismissible: checked as boolean,
                  }))
                }
              />
              <Label htmlFor="dismissible">
                Users can dismiss this message
              </Label>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSubmit}
                disabled={
                  isCreating ||
                  isUpdating ||
                  !formData.title.trim() ||
                  !formData.message.trim() ||
                  formData.target_roles.length === 0
                }
              >
                {isCreating || isUpdating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isCreating ? "Creating..." : "Updating..."}
                  </>
                ) : isCreatingNew ? (
                  "Create Communication"
                ) : (
                  "Update Communication"
                )}
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Communications List */}
      <Card>
        <CardHeader>
          <CardTitle>All Communications</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingAll ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : allCommunications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No communications created yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {allCommunications.map((communication) => (
                <div
                  key={communication.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getPriorityIcon(communication.priority)}
                        <h3 className="font-medium">{communication.title}</h3>
                        <Badge
                          variant="outline"
                          className={getPriorityColor(communication.priority)}
                        >
                          {communication.priority}
                        </Badge>
                        {!communication.is_active && (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                        {communication.dismissible && (
                          <Badge variant="outline">Dismissible</Badge>
                        )}
                      </div>

                      <p className="text-sm text-gray-600 mb-2">
                        {communication.message}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>{communication.target_roles.join(", ")}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {format(
                              new Date(communication.created_at),
                              "MMM dd, yyyy HH:mm"
                            )}
                          </span>
                        </div>
                        {communication.expires_at && (
                          <div className="flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            <span>
                              Expires:{" "}
                              {format(
                                new Date(communication.expires_at),
                                "MMM dd, yyyy"
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(communication)}
                        disabled={editingId === communication.id}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(communication.id)}
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCommunicationsManager;
