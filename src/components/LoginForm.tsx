import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Lock, Mail, AlertTriangle, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSecureAuth } from "@/hooks/useSecureAuth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import SecurityCaptcha from "@/components/security/SecurityCaptcha";

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [securityWarning, setSecurityWarning] = useState("");
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const { secureSignIn, isLoading, csrfToken } = useSecureAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setSecurityWarning("Please fill in all fields");
      return;
    }

    if (!captchaVerified) {
      setSecurityWarning("Please complete the security verification");
      return;
    }

    try {
      setSecurityWarning("");
      const { data, error } = await secureSignIn(email, password, csrfToken);

      if (error) {
        setSecurityWarning(error.message);
        // Reset captcha on failed login
        setCaptchaVerified(false);
        return;
      }

      if (data?.user) {
        toast({
          title: "Login Successful",
          description: "Welcome back! Loading your dashboard…",
        });
        // DO NOT reload or redirect here. Let the global auth observer and root AppContent handle dashboard routing.
      }
    } catch (error: any) {
      setSecurityWarning(error.message || "Login failed. Please try again.");
      setCaptchaVerified(false);
    }
  };

  // Store CSRF token in session storage
  React.useEffect(() => {
    if (csrfToken) {
      sessionStorage.setItem("csrf_token", csrfToken);
    }
  }, [csrfToken]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <Lock className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome Back!</CardTitle>
          <p className="text-gray-600">Sign in to your EduFam account</p>
        </CardHeader>
        <CardContent>
          {securityWarning && (
            <Alert className="mb-4 border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                {securityWarning}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-700"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="pl-10"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="pl-10 pr-10"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <SecurityCaptcha
              onVerify={setCaptchaVerified}
              disabled={isLoading}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !captchaVerified}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing In...
                </div>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <div className="flex items-center justify-center space-x-1 text-xs text-green-600">
              <Shield className="h-3 w-3" />
              <span>Protected by enterprise-grade security</span>
            </div>
            <p className="text-xs text-gray-500">
              SSL encrypted • Rate limited • Audit logged
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
