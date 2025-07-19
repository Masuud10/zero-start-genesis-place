
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Shield, Lock, AlertTriangle, Eye, Plus } from 'lucide-react';

interface SecurityPolicy {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  severity: 'low' | 'medium' | 'high';
  lastModified: string;
}

const SecuritySettings = () => {
  const [policies, setPolicies] = useState<SecurityPolicy[]>([
    {
      id: '1',
      name: 'Failed Login Attempts',
      description: 'Block IP after 5 failed login attempts within 15 minutes',
      isActive: true,
      severity: 'high',
      lastModified: '2024-01-15'
    },
    {
      id: '2',
      name: 'Password Complexity',
      description: 'Enforce strong password requirements for all users',
      isActive: true,
      severity: 'medium',
      lastModified: '2024-01-10'
    },
    {
      id: '3',
      name: 'Session Management',
      description: 'Auto-logout inactive sessions after 60 minutes',
      isActive: true,
      severity: 'medium',
      lastModified: '2024-01-12'
    }
  ]);

  const [isCreatePolicyOpen, setIsCreatePolicyOpen] = useState(false);
  const [newPolicy, setNewPolicy] = useState({
    name: '',
    description: '',
    severity: 'medium' as const
  });
  const { toast } = useToast();

  const handleCreatePolicy = () => {
    if (!newPolicy.name || !newPolicy.description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const policy: SecurityPolicy = {
      id: Date.now().toString(),
      ...newPolicy,
      isActive: true,
      lastModified: new Date().toISOString().split('T')[0]
    };

    setPolicies([...policies, policy]);
    setNewPolicy({ name: '', description: '', severity: 'medium' });
    setIsCreatePolicyOpen(false);

    toast({
      title: "Success",
      description: "Security policy created successfully",
    });
  };

  const togglePolicyStatus = (policyId: string) => {
    setPolicies(policies.map(policy => 
      policy.id === policyId ? { ...policy, isActive: !policy.isActive } : policy
    ));
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Policies</p>
                <p className="text-xl font-bold">{policies.filter(p => p.isActive).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Security Alerts</p>
                <p className="text-xl font-bold">3</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Lock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Failed Logins</p>
                <p className="text-xl font-bold">12</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Audit Logs</p>
                <p className="text-xl font-bold">1,247</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Security Policies</CardTitle>
          <Dialog open={isCreatePolicyOpen} onOpenChange={setIsCreatePolicyOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Policy
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Security Policy</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="policyName">Policy Name *</Label>
                  <Input
                    id="policyName"
                    value={newPolicy.name}
                    onChange={(e) => setNewPolicy({ ...newPolicy, name: e.target.value })}
                    placeholder="Enter policy name"
                  />
                </div>
                <div>
                  <Label htmlFor="policyDescription">Description *</Label>
                  <Textarea
                    id="policyDescription"
                    value={newPolicy.description}
                    onChange={(e) => setNewPolicy({ ...newPolicy, description: e.target.value })}
                    placeholder="Enter policy description"
                  />
                </div>
                <div>
                  <Label>Severity Level</Label>
                  <div className="flex gap-2 mt-2">
                    {['low', 'medium', 'high'].map((level) => (
                      <Button
                        key={level}
                        variant={newPolicy.severity === level ? "default" : "outline"}
                        size="sm"
                        onClick={() => setNewPolicy({ ...newPolicy, severity: level as any })}
                      >
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>
                <Button onClick={handleCreatePolicy} className="w-full">
                  Create Policy
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Policy Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Modified</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {policies.map((policy) => (
                <TableRow key={policy.id}>
                  <TableCell className="font-medium">{policy.name}</TableCell>
                  <TableCell>{policy.description}</TableCell>
                  <TableCell>
                    <Badge variant={getSeverityColor(policy.severity) as any}>
                      {policy.severity.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={policy.isActive ? "default" : "secondary"}>
                      {policy.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>{policy.lastModified}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => togglePolicyStatus(policy.id)}
                      >
                        {policy.isActive ? "Disable" : "Enable"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Access Control Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable IP Whitelisting</Label>
                  <p className="text-sm text-muted-foreground">Restrict access to specific IP addresses</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Require VPN for Admin Access</Label>
                  <p className="text-sm text-muted-foreground">Admin users must connect via VPN</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Audit Logging</Label>
                  <p className="text-sm text-muted-foreground">Log all user actions for compliance</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Real-time Security Monitoring</Label>
                  <p className="text-sm text-muted-foreground">Monitor for suspicious activities</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                <Input id="maxLoginAttempts" type="number" defaultValue="5" />
              </div>
              <div>
                <Label htmlFor="lockoutDuration">Account Lockout Duration (minutes)</Label>
                <Input id="lockoutDuration" type="number" defaultValue="15" />
              </div>
              <div>
                <Label htmlFor="backupRetention">Backup Retention Period (days)</Label>
                <Input id="backupRetention" type="number" defaultValue="30" />
              </div>
              <Button className="w-full">Save Security Settings</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecuritySettings;
