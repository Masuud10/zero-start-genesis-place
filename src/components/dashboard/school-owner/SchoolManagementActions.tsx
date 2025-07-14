import React from "react";
import { Button } from "@/components/ui/button";
import {
  Users,
  DollarSign,
  BarChart3,
  Settings,
  FileText,
  Calendar,
  Award,
  Megaphone,
  Headphones,
  MessageSquare,
} from "lucide-react";
import { useNavigation } from "@/contexts/NavigationContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SchoolManagementActionsProps {
  onAction?: (action: string) => void; // Keep for backward compatibility
}

const SchoolManagementActions: React.FC<SchoolManagementActionsProps> = ({
  onAction,
}) => {
  const { setActiveSection } = useNavigation();
  const { user } = useAuth();

  const handleActionClick = (action: string) => {
    console.log("🏫 School Management Action:", action);

    // Call the callback for backward compatibility
    if (onAction) {
      onAction(action);
    }

    // Navigate to the appropriate section
    setActiveSection(action);
  };

  // Define actions based on user role
  const getManagementActions = () => {
    const baseActions = [
      {
        id: "students",
        label: "Student Management",
        icon: Users,
        description: "Manage enrollments & student data",
        color: "bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700",
      },
      {
        id: "users",
        label: "Staff Management",
        icon: Users,
        description: "Manage teachers & staff",
        color: "bg-green-50 hover:bg-green-100 border-green-200 text-green-700",
      },
      {
        id: "finance",
        label: "Financial Overview",
        icon: DollarSign,
        description: "Revenue & expenses tracking",
        color:
          "bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-700",
      },
      {
        id: "analytics",
        label: "School Analytics",
        icon: BarChart3,
        description: "Performance metrics & insights",
        color:
          "bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700",
      },
      {
        id: "timetable",
        label: "Timetable Viewer",
        icon: Calendar,
        description: "View published timetables",
        color:
          "bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-700",
      },
      {
        id: "certificates",
        label: "View Certificates",
        icon: Award,
        description: "Student certificates & awards",
        color:
          "bg-yellow-50 hover:bg-yellow-100 border-yellow-200 text-yellow-700",
      },
      {
        id: "announcements",
        label: "Announcements",
        icon: Megaphone,
        description: "School communications",
        color: "bg-cyan-50 hover:bg-cyan-100 border-cyan-200 text-cyan-700",
      },
      {
        id: "reports",
        label: "Reports",
        icon: FileText,
        description: "Generate & export reports",
        color:
          "bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-700",
      },
      {
        id: "support",
        label: "Support Tickets",
        icon: Headphones,
        description: "Submit & track support",
        color: "bg-red-50 hover:bg-red-100 border-red-200 text-red-700",
      },
      {
        id: "messages",
        label: "Messages",
        icon: MessageSquare,
        description: "Internal communications",
        color: "bg-pink-50 hover:bg-pink-100 border-pink-200 text-pink-700",
      },
      {
        id: "settings",
        label: "School Settings",
        icon: Settings,
        description: "Configure school settings",
        color: "bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700",
      },
    ];

    return baseActions;
  };

  const managementActions = getManagementActions();

  return (
    <TooltipProvider>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {managementActions.map((action) => (
          <Tooltip key={action.id}>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                className={`h-32 flex-col gap-3 p-4 transition-all duration-200 border-2 ${action.color}`}
                onClick={() => handleActionClick(action.id)}
              >
                <action.icon className="h-8 w-8" />
                <div className="text-center">
                  <div className="font-semibold text-sm">{action.label}</div>
                  <div className="text-xs opacity-75 mt-1">
                    {action.description}
                  </div>
                </div>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Click to access {action.label.toLowerCase()}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
};

export default SchoolManagementActions;
