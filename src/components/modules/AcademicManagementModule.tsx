import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  UserPlus,
  ArrowUpDown,
  Users,
  TrendingUp,
  Archive,
  GraduationCap,
  Calendar,
  School,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSchoolScopedData } from "@/hooks/useSchoolScopedData";

// Import sub-components
import StudentPromotionTab from "./academic-management/StudentPromotionTab";
import StudentInformationTab from "./academic-management/StudentInformationTab";
import TransferManagementTab from "./academic-management/TransferManagementTab";
import ExitManagementTab from "./academic-management/ExitManagementTab";

const AcademicManagementModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState("student-promotion");
  const { user } = useAuth();
  const { schoolId, isReady } = useSchoolScopedData();

  // Check if user has access to academic management
  if (!user || user.role !== "principal") {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Access Restricted</h3>
            <p className="text-muted-foreground">
              Only principals can access Academic Management features.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isReady) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            Loading Academic Management...
          </p>
        </div>
      </div>
    );
  }

  if (!schoolId) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <School className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              School Assignment Required
            </h3>
            <p className="text-muted-foreground">
              You need to be assigned to a school to access Academic Management.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Academic Management
          </h1>
        </div>
        <Badge
          variant="outline"
          className="bg-blue-50 text-blue-700 border-blue-200"
        >
          Principal Access
        </Badge>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <ArrowUpDown className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-green-600 font-medium">
                  Student Promotion
                </p>
                <p className="text-xs text-green-500">Bulk class promotions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-purple-600 font-medium">
                  Student Information
                </p>
                <p className="text-xs text-purple-500">View & manage records</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-orange-600 font-medium">
                  Transfer Management
                </p>
                <p className="text-xs text-orange-500">
                  Class & stream transfers
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Card>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger
                value="student-promotion"
                className="flex items-center gap-2"
              >
                <ArrowUpDown className="h-4 w-4" />
                <span className="hidden sm:inline">Promotion</span>
              </TabsTrigger>
              <TabsTrigger
                value="student-information"
                className="flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Information</span>
              </TabsTrigger>
              <TabsTrigger
                value="transfer-management"
                className="flex items-center gap-2"
              >
                <TrendingUp className="h-4 w-4" />
                <span className="hidden sm:inline">Transfers</span>
              </TabsTrigger>
              <TabsTrigger
                value="exit-management"
                className="flex items-center gap-2"
              >
                <Archive className="h-4 w-4" />
                <span className="hidden sm:inline">Exit</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="student-promotion">
              <StudentPromotionTab />
            </TabsContent>

            <TabsContent value="student-information">
              <StudentInformationTab />
            </TabsContent>

            <TabsContent value="transfer-management">
              <TransferManagementTab />
            </TabsContent>

            <TabsContent value="exit-management">
              <ExitManagementTab />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AcademicManagementModule;
