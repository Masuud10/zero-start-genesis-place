
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Users, School, CreditCard, Settings, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

// Utility: List of admin features/tabs
const ADMIN_SECTIONS = [
  {
    key: "schools",
    icon: <School className="w-5 h-5 mr-1" />,
    label: "Schools",
    description: "Manage all schools registered in EduFam.",
    color: "bg-gradient-to-r from-emerald-500 to-blue-600"
  },
  {
    key: "users",
    icon: <Users className="w-5 h-5 mr-1" />,
    label: "Users",
    description: "Oversee all platform users and roles.",
    color: "bg-gradient-to-r from-blue-600 to-purple-600"
  },
  {
    key: "billing",
    icon: <CreditCard className="w-5 h-5 mr-1" />,
    label: "Billing",
    description: "Review and manage billing/subscription data.",
    color: "bg-gradient-to-r from-purple-600 to-pink-500"
  },
  {
    key: "system-settings",
    icon: <Settings className="w-5 h-5 mr-1" />,
    label: "System Settings",
    description: "Configure global platform settings.",
    color: "bg-gradient-to-r from-gray-400 to-gray-700"
  }
];

// Simple error banner
const ErrorBanner = ({ error }: { error: string }) =>
  <div className="p-3 bg-red-50 border border-red-200 rounded mb-4 text-red-700 font-medium">
    {error}
  </div>;

interface AdministrativeHubProps {
  onModalOpen: (type: string) => void;
  onUserCreated?: () => void;
}

const AdministrativeHub: React.FC<AdministrativeHubProps> = ({ onModalOpen, onUserCreated }) => {
  const [activeTab, setActiveTab] = useState("schools");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Helper: trigger modals with loading, success & error toasts
  const handleAction = async (key: string) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`[AdministrativeHub] Action triggered: ${key}`);
      
      // Simulate brief loading for UX
      await new Promise(resolve => setTimeout(resolve, 200));
      
      if (["schools", "users"].includes(key)) {
        onModalOpen(key);
        toast({ 
          title: "Success", 
          description: `Opened ${ADMIN_SECTIONS.find(s => s.key === key)?.label} management.`,
          variant: "default"
        });
      } else if (["billing", "system-settings"].includes(key)) {
        toast({ 
          title: "Coming Soon", 
          description: `${ADMIN_SECTIONS.find(s => s.key === key)?.label} feature is under development.`,
          variant: "default"
        });
      } else {
        throw new Error("Unknown action requested");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
      toast({ 
        title: "Error", 
        description: errorMessage,
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mt-3 shadow border-0">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Settings className="w-6 h-6 text-blue-500" />
          EduFam Admin Hub
        </CardTitle>
        <CardDescription>One-stop access to system administration features.</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Error and info feedback */}
        {error && <ErrorBanner error={error} />}

        {/* Tab nav */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
          <TabsList className="grid w-full grid-cols-4">
            {ADMIN_SECTIONS.map(s =>
              <TabsTrigger
                key={s.key}
                value={s.key}
                className="flex items-center px-2 text-xs sm:text-sm"
                data-testid={`hub-tab-${s.key}`}
              >
                {s.icon}
                <span className="hidden sm:inline ml-1">{s.label}</span>
              </TabsTrigger>
            )}
          </TabsList>
          {ADMIN_SECTIONS.map(s =>
            <TabsContent value={s.key} key={s.key} className="mt-4">
              <div className="p-4 border rounded-lg bg-gray-50/50">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`rounded-lg p-3 text-white ${s.color}`}>{s.icon}</div>
                  <div>
                    <div className="font-semibold text-lg">{s.label}</div>
                    <div className="text-sm text-gray-600">{s.description}</div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Button
                    onClick={() => handleAction(s.key)}
                    className="flex items-center"
                    disabled={loading}
                    variant="default"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        {s.icon}
                        Open {s.label}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AdministrativeHub;
