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
import { useAdminAuthContext } from "@/components/auth/AdminAuthProvider";
import {
  Award,
  Download,
  Eye,
  Edit,
  Trash2,
  Plus,
  FileText,
  Users,
  Calendar,
  CheckCircle,
  AlertCircle,
  Loader2,
  Settings,
} from "lucide-react";

const CertificateModule: React.FC = () => {
  const { adminUser } = useAdminAuthContext();
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

  const templates = [
    {
      id: "1",
      name: "Academic Excellence Certificate",
      description: "Certificate for outstanding academic performance",
      type: "academic",
      status: "active",
      usage_count: 156,
      last_used: "2024-01-15",
      created_at: "2024-01-01",
    },
    {
      id: "2",
      name: "Completion Certificate",
      description: "Certificate for course completion",
      type: "completion",
      status: "active",
      usage_count: 89,
      last_used: "2024-01-14",
      created_at: "2024-01-01",
    },
    {
      id: "3",
      name: "Participation Certificate",
      description: "Certificate for event participation",
      type: "participation",
      status: "active",
      usage_count: 234,
      last_used: "2024-01-13",
      created_at: "2024-01-01",
    },
    {
      id: "4",
      name: "Leadership Certificate",
      description: "Certificate for leadership achievements",
      type: "leadership",
      status: "draft",
      usage_count: 0,
      last_used: null,
      created_at: "2024-01-10",
    },
  ];

  const recentCertificates = [
    {
      id: "1",
      student_name: "John Doe",
      school: "St. Mary's Academy",
      certificate_type: "Academic Excellence",
      generated: "2024-01-15 14:30",
      status: "generated",
    },
    {
      id: "2",
      student_name: "Jane Smith",
      school: "Bright Future School",
      certificate_type: "Completion",
      generated: "2024-01-15 12:15",
      status: "generated",
    },
    {
      id: "3",
      student_name: "Mike Johnson",
      school: "Excellence Academy",
      certificate_type: "Participation",
      generated: "2024-01-15 10:45",
      status: "pending",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </Badge>
        );
      case "draft":
        return (
          <Badge variant="outline">
            <AlertCircle className="h-3 w-3 mr-1" />
            Draft
          </Badge>
        );
      case "inactive":
        return <Badge variant="destructive">Inactive</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "academic":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            Academic
          </Badge>
        );
      case "completion":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Completion
          </Badge>
        );
      case "participation":
        return (
          <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
            Participation
          </Badge>
        );
      case "leadership":
        return (
          <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
            Leadership
          </Badge>
        );
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleGenerateCertificate = async (templateId: string) => {
    setIsGenerating(true);
    setSelectedTemplate(templateId);

    // Simulate certificate generation
    setTimeout(() => {
      setIsGenerating(false);
      setSelectedTemplate("");
    }, 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Certificate Management
          </h2>
          <p className="text-muted-foreground">
            Manage certificate templates and generate certificates
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Template
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Templates
            </CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{templates.length}</div>
            <p className="text-xs text-muted-foreground">
              Certificate templates
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Templates
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {templates.filter((t) => t.status === "active").length}
            </div>
            <p className="text-xs text-muted-foreground">Ready for use</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Generated
            </CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {templates.reduce((sum, t) => sum + t.usage_count, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Certificates issued</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">New certificates</p>
          </CardContent>
        </Card>
      </div>

      {/* Certificate Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="h-5 w-5" />
            <span>Certificate Templates</span>
          </CardTitle>
          <CardDescription>
            Manage and configure certificate templates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => {
              const isGenerating =
                selectedTemplate === template.id && isGenerating;

              return (
                <Card
                  key={template.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
                        <Award className="h-5 w-5 text-white" />
                      </div>
                      {getStatusBadge(template.status)}
                    </div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {template.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        {getTypeBadge(template.type)}
                        <span className="text-xs text-muted-foreground">
                          {template.usage_count} used
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Created: {formatDate(template.created_at)}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => handleGenerateCertificate(template.id)}
                          disabled={
                            isGenerating || template.status !== "active"
                          }
                        >
                          {isGenerating ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Download className="h-4 w-4 mr-2" />
                              Generate
                            </>
                          )}
                        </Button>
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Certificates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Recent Certificates</span>
          </CardTitle>
          <CardDescription>Recently generated certificates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentCertificates.map((certificate) => (
              <div
                key={certificate.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
                    <Award className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="font-medium">
                      {certificate.student_name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {certificate.school} • {certificate.certificate_type}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right text-sm text-muted-foreground">
                    <div>Generated: {certificate.generated}</div>
                    <div className="flex items-center space-x-1">
                      {certificate.status === "generated" ? (
                        <CheckCircle className="h-3 w-3 text-green-600" />
                      ) : (
                        <Loader2 className="h-3 w-3 animate-spin text-yellow-600" />
                      )}
                      <span className="capitalize">{certificate.status}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CertificateModule;
