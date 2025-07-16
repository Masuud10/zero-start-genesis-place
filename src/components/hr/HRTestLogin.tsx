import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Shield } from "lucide-react";

const HRTestLogin: React.FC = () => {
  const handleTestLogin = async () => {
    // Mock login for HR role to test the sidebar
    console.log("🧪 Test HR Login - This would log in as HR user");
    
    // In a real app, this would authenticate the user
    // For testing, we can simulate the login process
    window.location.href = "/login?role=hr";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">HR Dashboard Access</CardTitle>
          <CardDescription>
            Test the HR dashboard and sidebar features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                HR Features Available:
              </span>
            </div>
            <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1 ml-6">
              <li>• Staff Management - Full CRUD</li>
              <li>• HR Reports - Professional generation</li>
              <li>• HR Analytics - Real-time data</li>
              <li>• Payroll Management - Salary tracking</li>
              <li>• Attendance Monitoring - Staff tracking</li>
              <li>• User Management - System users</li>
            </ul>
          </div>
          
          <Button 
            onClick={handleTestLogin}
            className="w-full"
            size="lg"
          >
            Test HR Dashboard
          </Button>
          
          <p className="text-xs text-muted-foreground text-center">
            This will simulate HR user login to showcase the sidebar features
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default HRTestLogin;