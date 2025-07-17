import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Shield, Building } from "lucide-react";
import { useAdminAuthContext } from "@/components/auth/AdminAuthProvider";
import { useToast } from "@/hooks/use-toast";
import loginBackground from "@/assets/login-background.jpg";

interface AdminLoginFormProps {
  onSuccess: () => void;
}

function AdminLoginForm({ onSuccess }: AdminLoginFormProps) {
  const { signIn, isLoading, user, adminUser, error } = useAdminAuthContext();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Redirect if already authenticated
  useEffect(() => {
    if (user && adminUser && !isLoading) {
      console.log("🔐 AdminLoginForm: Already authenticated, redirecting to dashboard");
      navigate("/dashboard", { replace: true });
    }
  }, [user, adminUser, isLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (!email || !password) {
      setLoginError("Please enter both email and password.");
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("🔐 AdminLoginForm: Attempting admin login for:", email);
      const result = await signIn(email.trim(), password);

      if (result.error) {
        setLoginError(result.error);
        toast({
          title: "Login Failed",
          description: result.error,
          variant: "destructive",
        });
        return;
      }

      // Success
      toast({
        title: "Login Successful",
        description: "Welcome to the EduFam Admin Dashboard!",
      });
      
      onSuccess();
    } catch (error) {
      const errorMessage = "An unexpected error occurred. Please try again.";
      setLoginError(errorMessage);
      toast({
        title: "Login Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayError = loginError || error;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {displayError && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-700">
            {displayError}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-gray-700">
          Admin Email Address
        </label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          placeholder="Enter your admin email"
          required
          autoComplete="email"
          disabled={isLoading || isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium text-gray-700">
          Password
        </label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          placeholder="Enter your password"
          required
          autoComplete="current-password"
          disabled={isLoading || isSubmitting}
        />
      </div>

      <Button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-semibold transition-colors duration-200"
        disabled={isLoading || isSubmitting}
      >
        {isLoading || isSubmitting ? (
          <span className="flex items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Signing in...
          </span>
        ) : (
          <span className="flex items-center justify-center">
            <Shield className="h-4 w-4 mr-2" />
            Sign In to Admin Dashboard
          </span>
        )}
      </Button>
    </form>
  );
}

const AdminLandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, adminUser, isLoading } = useAdminAuthContext();

  // Check if already authenticated
  useEffect(() => {
    if (user && adminUser && !isLoading) {
      console.log("🔐 AdminLandingPage: User already authenticated, redirecting");
      navigate("/dashboard", { replace: true });
    }
  }, [user, adminUser, isLoading, navigate]);

  const handleLoginSuccess = () => {
    console.log("🔐 AdminLandingPage: Login successful, navigating to dashboard");
    navigate("/dashboard", { replace: true });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-2 sm:p-4">
      <Card className="w-full max-w-6xl shadow-2xl rounded-2xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[500px] lg:min-h-[600px]">
          {/* Left Column - Branding/Image */}
          <div
            className="hidden lg:flex relative bg-cover bg-center bg-no-repeat flex-col justify-between p-6 xl:p-8 text-white"
            style={{
              backgroundImage: `linear-gradient(rgba(0, 71, 171, 0.7), rgba(0, 58, 140, 0.7)), url(${loginBackground})`,
            }}
          >
            {/* Logo at top */}
            <div className="flex items-center">
              <img
                src="/lovable-uploads/b42612dd-99c7-4d0b-94d0-fcf611535608.png"
                alt="Edufam Logo"
                className="h-10 xl:h-12 w-auto"
              />
            </div>

            {/* Content at bottom */}
            <div>
              <div className="flex items-center mb-4">
                <Building className="h-8 w-8 mr-3" />
                <h2 className="text-2xl xl:text-3xl font-bold">
                  Admin Dashboard
                </h2>
              </div>
              <p className="text-base xl:text-lg opacity-90">
                Secure access to EduFam's administrative tools and analytics.
                Monitor schools, manage users, and oversee system operations.
              </p>
            </div>
          </div>

          {/* Right Column - Admin Login Form */}
          <div className="bg-white p-6 sm:p-8 lg:p-12 flex flex-col justify-center min-h-[500px]">
            {/* Mobile Logo */}
            <div className="lg:hidden flex justify-center mb-6">
              <img
                src="/lovable-uploads/b42612dd-99c7-4d0b-94d0-fcf611535608.png"
                alt="Edufam Logo"
                className="h-10 w-auto"
              />
            </div>

            {/* Header */}
            <div className="mb-6 lg:mb-8">
              <div className="flex items-center justify-center lg:justify-start mb-3">
                <Shield className="h-6 w-6 text-blue-600 mr-2" />
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Admin Access
                </h1>
              </div>
              <p className="text-gray-600 text-base sm:text-lg text-center lg:text-left">
                Sign in to your admin dashboard
              </p>
              <div className="mt-2 text-center lg:text-left">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <Shield className="h-3 w-3 mr-1" />
                  Restricted Access
                </span>
              </div>
            </div>

            {/* Admin Login Form */}
            <div className="mb-6 lg:mb-8">
              <AdminLoginForm onSuccess={handleLoginSuccess} />
            </div>

            {/* Footer */}
            <div className="text-center">
              <p className="text-sm text-gray-400">
                EduFam Administration Portal
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Authorized personnel only
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminLandingPage;