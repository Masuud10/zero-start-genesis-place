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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { FeatureFlagsService } from "@/services/advancedFeaturesService";
import { FeatureFlag, CreateFeatureFlagForm } from "@/types/advanced-features";
import {
  Plus,
  Settings,
  Globe,
  Building2,
  User,
  ToggleLeft,
  ToggleRight,
  Edit,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react";

const FeatureFlagManagementPage: React.FC = () => {
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingFlag, setEditingFlag] = useState<FeatureFlag | null>(null);
  const { toast } = useToast();

  const [newFlag, setNewFlag] = useState<CreateFeatureFlagForm>({
    flag_name: "",
    flag_description: "",
    is_enabled: false,
    target_scope: "global",
    target_schools: [],
    target_users: [],
  });

  const getScopeIcon = (scope: string) => {
    switch (scope) {
      case "global":
        return <Globe className="h-4 w-4" />;
      case "school_specific":
        return <Building2 className="h-4 w-4" />;
      case "user_specific":
        return <User className="h-4 w-4" />;
      default:
        return <Settings className="h-4 w-4" />;
    }
  };

  const getScopeBadgeVariant = (scope: string) => {
    switch (scope) {
      case "global":
        return "default" as const;
      case "school_specific":
        return "secondary" as const;
      case "user_specific":
        return "outline" as const;
      default:
        return "outline" as const;
    }
  };

  const fetchFeatureFlags = async () => {
    try {
      setLoading(true);
      const response = await FeatureFlagsService.getFeatureFlags();

      if (response.success) {
        setFeatureFlags(response.data);
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to fetch feature flags",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching feature flags:", error);
      toast({
        title: "Error",
        description: "Failed to fetch feature flags",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createFeatureFlag = async () => {
    try {
      const response = await FeatureFlagsService.createFeatureFlag(newFlag);

      if (response.success) {
        toast({
          title: "Success",
          description: "Feature flag created successfully",
        });
        setCreateDialogOpen(false);
        setNewFlag({
          flag_name: "",
          flag_description: "",
          is_enabled: false,
          target_scope: "global",
          target_schools: [],
          target_users: [],
        });
        fetchFeatureFlags();
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to create feature flag",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating feature flag:", error);
      toast({
        title: "Error",
        description: "Failed to create feature flag",
        variant: "destructive",
      });
    }
  };

  const toggleFeatureFlag = async (id: number, isEnabled: boolean) => {
    try {
      const response = await FeatureFlagsService.updateFeatureFlag(
        id,
        isEnabled
      );

      if (response.success) {
        toast({
          title: "Success",
          description: `Feature flag ${
            isEnabled ? "enabled" : "disabled"
          } successfully`,
        });
        fetchFeatureFlags();
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to update feature flag",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating feature flag:", error);
      toast({
        title: "Error",
        description: "Failed to update feature flag",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchFeatureFlags();
  }, []);

  const enabledFlagsCount = featureFlags.filter(
    (flag) => flag.is_enabled
  ).length;
  const totalFlagsCount = featureFlags.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Feature Flag Management
          </h1>
          <p className="text-muted-foreground">
            Control feature availability across the platform
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Flag
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create Feature Flag</DialogTitle>
              <DialogDescription>
                Add a new feature flag to control feature availability
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="flag_name" className="text-sm font-medium">
                  Flag Name
                </label>
                <Input
                  id="flag_name"
                  placeholder="e.g., beta_features"
                  value={newFlag.flag_name}
                  onChange={(e) =>
                    setNewFlag((prev) => ({
                      ...prev,
                      flag_name: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <label
                  htmlFor="flag_description"
                  className="text-sm font-medium"
                >
                  Description
                </label>
                <Textarea
                  id="flag_description"
                  placeholder="Describe what this feature flag controls"
                  value={newFlag.flag_description}
                  onChange={(e) =>
                    setNewFlag((prev) => ({
                      ...prev,
                      flag_description: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="target_scope" className="text-sm font-medium">
                  Target Scope
                </label>
                <Select
                  value={newFlag.target_scope}
                  onValueChange={(value) =>
                    setNewFlag((prev) => ({
                      ...prev,
                      target_scope: value as any,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="global">Global</SelectItem>
                    <SelectItem value="school_specific">
                      School Specific
                    </SelectItem>
                    <SelectItem value="user_specific">User Specific</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_enabled"
                  checked={newFlag.is_enabled}
                  onCheckedChange={(checked) =>
                    setNewFlag((prev) => ({ ...prev, is_enabled: checked }))
                  }
                />
                <label htmlFor="is_enabled" className="text-sm font-medium">
                  Enabled by default
                </label>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={createFeatureFlag} disabled={!newFlag.flag_name}>
                Create Flag
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Flags</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFlagsCount}</div>
            <p className="text-xs text-muted-foreground">
              Feature flags configured
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Flags</CardTitle>
            <ToggleRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {enabledFlagsCount}
            </div>
            <p className="text-xs text-muted-foreground">Currently enabled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Inactive Flags
            </CardTitle>
            <ToggleLeft className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">
              {totalFlagsCount - enabledFlagsCount}
            </div>
            <p className="text-xs text-muted-foreground">Currently disabled</p>
          </CardContent>
        </Card>
      </div>

      {/* Feature Flags List */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Flags</CardTitle>
          <CardDescription>
            Manage feature availability and rollout
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">
                  Loading feature flags...
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {featureFlags.map((flag) => (
                <div
                  key={flag.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {flag.is_enabled ? (
                        <Eye className="h-5 w-5 text-green-500" />
                      ) : (
                        <EyeOff className="h-5 w-5 text-gray-500" />
                      )}
                      <div>
                        <h3 className="font-medium">{flag.flag_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {flag.flag_description || "No description provided"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {getScopeIcon(flag.target_scope)}
                      <Badge variant={getScopeBadgeVariant(flag.target_scope)}>
                        {flag.target_scope
                          .replace("_", " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch
                        checked={flag.is_enabled}
                        onCheckedChange={(checked) =>
                          toggleFeatureFlag(flag.id, checked)
                        }
                      />
                      <span className="text-sm font-medium">
                        {flag.is_enabled ? "Enabled" : "Disabled"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingFlag(flag)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {featureFlags.length === 0 && (
                <div className="text-center py-8">
                  <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No feature flags configured</p>
                  <p className="text-sm text-gray-400">
                    Create your first feature flag to get started
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {editingFlag && (
        <Dialog open={!!editingFlag} onOpenChange={() => setEditingFlag(null)}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Feature Flag</DialogTitle>
              <DialogDescription>
                Update feature flag settings
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Flag Name</label>
                <Input value={editingFlag.flag_name} disabled />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={editingFlag.flag_description || ""}
                  onChange={(e) =>
                    setEditingFlag((prev) =>
                      prev
                        ? { ...prev, flag_description: e.target.value }
                        : null
                    )
                  }
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Target Scope</label>
                <Select value={editingFlag.target_scope} disabled>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="global">Global</SelectItem>
                    <SelectItem value="school_specific">
                      School Specific
                    </SelectItem>
                    <SelectItem value="user_specific">User Specific</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={editingFlag.is_enabled}
                  onCheckedChange={(checked) =>
                    setEditingFlag((prev) =>
                      prev ? { ...prev, is_enabled: checked } : null
                    )
                  }
                />
                <label className="text-sm font-medium">Enabled</label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingFlag(null)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (editingFlag) {
                    toggleFeatureFlag(editingFlag.id, editingFlag.is_enabled);
                    setEditingFlag(null);
                  }
                }}
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default FeatureFlagManagementPage;
