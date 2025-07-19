import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FolderKanban, Calendar, BarChart3 } from "lucide-react";
import ProjectsList from "./project-hub/ProjectsList";
import ProjectsKanban from "./project-hub/ProjectsKanban";
import ProjectsTimeline from "./project-hub/ProjectsTimeline";
import ProjectsAnalytics from "./project-hub/ProjectsAnalytics";
import CreateProjectDialog from "./project-hub/CreateProjectDialog";
import { useProjects } from "@/hooks/useProjects";

const ProjectHubModule = () => {
  const [activeTab, setActiveTab] = useState("list");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { data: projects = [] } = useProjects();

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white border-none shadow-xl">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <FolderKanban className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Project Hub</h1>
                <p className="text-blue-100 text-base font-normal mt-1">
                  Manage company-level projects, events, and campaigns (
                  {projects.length} projects)
                </p>
              </div>
            </CardTitle>
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Navigation Tabs */}
      <Card className="shadow-lg">
        <CardContent className="p-0">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-4 h-auto p-2 bg-gray-50">
              <TabsTrigger
                value="list"
                className="flex flex-col items-center gap-2 py-3 px-4 text-sm font-medium"
              >
                <FolderKanban className="h-5 w-5" />
                <span>Projects List</span>
              </TabsTrigger>
              <TabsTrigger
                value="kanban"
                className="flex flex-col items-center gap-2 py-3 px-4 text-sm font-medium"
              >
                <BarChart3 className="h-5 w-5" />
                <span>Kanban Board</span>
              </TabsTrigger>
              <TabsTrigger
                value="timeline"
                className="flex flex-col items-center gap-2 py-3 px-4 text-sm font-medium"
              >
                <Calendar className="h-5 w-5" />
                <span>Timeline View</span>
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="flex flex-col items-center gap-2 py-3 px-4 text-sm font-medium"
              >
                <BarChart3 className="h-5 w-5" />
                <span>Analytics</span>
              </TabsTrigger>
            </TabsList>

            <div className="p-6">
              <TabsContent value="list" className="space-y-6 mt-0">
                <ProjectsList />
              </TabsContent>

              <TabsContent value="kanban" className="space-y-6 mt-0">
                <ProjectsKanban />
              </TabsContent>

              <TabsContent value="timeline" className="space-y-6 mt-0">
                <ProjectsTimeline />
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6 mt-0">
                <ProjectsAnalytics />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* Create Project Dialog */}
      <CreateProjectDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
      />
    </div>
  );
};

export default ProjectHubModule;
