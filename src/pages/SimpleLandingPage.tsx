import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Shield, Crown } from "lucide-react";
import { useConsolidatedAuth } from "@/hooks/useConsolidatedAuth";
import { useToast } from "@/hooks/use-toast";

const SimpleLandingPage: React.FC = () => {
  const { signIn, isLoading, user, error } = useConsolidatedAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !isLoading) {
      navigate("/", { replace: true });
    }
  }, [user, isLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (!email || !password) {
      setLoginError("Please enter both email and password.");
      return;
    }

    setIsSubmitting(true);

    try {
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

      toast({
        title: "Login Successful",
        description: "Welcome to EduFam Admin!",
      });
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100">
      <div className="flex min-h-screen">
        {/* Left Column - Animations and Admin Features */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-12 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 relative overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0">
            <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
            <div className="absolute top-1/4 right-16 w-16 h-16 bg-white/20 rounded-full animate-bounce delay-300"></div>
            <div className="absolute bottom-1/3 left-1/4 w-12 h-12 bg-white/15 rounded-full animate-pulse delay-500"></div>
            <div className="absolute bottom-20 right-20 w-24 h-24 bg-white/10 rounded-full animate-bounce delay-700"></div>
          </div>
          
          {/* Main Content */}
          <div className="relative z-10 text-center text-white">
            <div className="mb-8 animate-fade-in">
              <Crown className="h-24 w-24 mx-auto mb-6 text-yellow-300 animate-pulse" />
              <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-300 to-white bg-clip-text text-transparent">
                EduFam Admin
              </h1>
              <p className="text-xl text-blue-100 mb-8">
                Powerful School Management Platform
              </p>
            </div>
            
            {/* Feature Cards */}
            <div className="space-y-6 animate-slide-in-right">
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20">
                <div className="flex items-center space-x-3">
                  <Shield className="h-6 w-6 text-green-300" />
                  <span className="text-sm font-medium">Advanced Security & Role Management</span>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20">
                <div className="flex items-center space-x-3">
                  <Crown className="h-6 w-6 text-yellow-300" />
                  <span className="text-sm font-medium">Super Admin Dashboard</span>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20">
                <div className="flex items-center space-x-3">
                  <Loader2 className="h-6 w-6 text-blue-300 animate-spin" />
                  <span className="text-sm font-medium">Real-time Analytics</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="max-w-md w-full">
            <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
              <CardContent className="p-10">
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center space-x-2 mb-4">
                    <Crown className="h-8 w-8 text-blue-600" />
                    <h2 className="text-2xl font-bold text-gray-900">
                      Admin Login
                    </h2>
                  </div>
                  <p className="text-gray-600">
                    Access your administrative dashboard
                  </p>
                </div>

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
                      Email Address
                    </label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      disabled={isLoading || isSubmitting}
                      className="h-12 text-base"
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
                      placeholder="Enter your password"
                      required
                      disabled={isLoading || isSubmitting}
                      className="h-12 text-base"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 text-base bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    disabled={isLoading || isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      "Sign In to Dashboard"
                    )}
                  </Button>
                </form>

                <div className="mt-8 text-center">
                  <p className="text-xs text-gray-500 flex items-center justify-center">
                    <Shield className="h-3 w-3 mr-1" />
                    Secure Administrative Access
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleLandingPage;