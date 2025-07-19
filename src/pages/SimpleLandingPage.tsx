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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card className="shadow-lg">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Crown className="h-8 w-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">
                  EduFam Admin
                </h1>
              </div>
              <p className="text-gray-600">
                Administrative Access Portal
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
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500 flex items-center justify-center">
                <Shield className="h-3 w-3 mr-1" />
                Secure Admin Access
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SimpleLandingPage;