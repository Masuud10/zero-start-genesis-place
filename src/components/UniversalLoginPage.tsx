import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Loader2, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { AuthService } from "@/services/authService";
import loginBackground from "@/assets/login-background.jpg";

function ForgotPasswordModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await AuthService.sendUniversalPasswordReset(email);

      if (result.success) {
        setMessage(
          "Password reset email sent successfully. Please check your inbox."
        );
        toast({
          title: "Reset Email Sent",
          description:
            "Please check your email for password reset instructions.",
        });
        setTimeout(() => {
          onClose();
          setEmail("");
          setMessage("");
        }, 3000);
      } else {
        setError(
          result.error || "Failed to send reset email. Please try again."
        );
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Reset Password
            </h3>
            <p className="text-sm text-gray-600">
              Enter your email to receive reset instructions
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">
                  {error}
                </AlertDescription>
              </Alert>
            )}
            {message && (
              <Alert className="border-green-200 bg-green-50">
                <AlertDescription className="text-green-700">
                  {message}
                </AlertDescription>
              </Alert>
            )}
            <div>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full px-4 py-3 border-0 bg-gray-50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200"
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-[#0047AB] hover:bg-[#003A8C] text-white"
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Sending...
                  </span>
                ) : (
                  "Send Reset Email"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function UniversalLoginForm() {
  const { signIn, isLoading, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // Load remembered email on component mount
  useEffect(() => {
    const rememberedEmail = AuthService.getRememberedEmail();
    const isRememberEnabled = AuthService.isRememberMeEnabled();
    
    if (rememberedEmail && isRememberEnabled) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  // Redirect to dashboard after successful authentication
  useEffect(() => {
    if (user && !isLoading) {
      console.log(
        "🔐 UniversalLoginForm: User authenticated, redirecting to dashboard"
      );
      navigate("/dashboard", { replace: true });
    }
  }, [user, isLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Use universal authentication that determines role automatically
      const result = await AuthService.authenticateUserUniversal(
        email.trim(),
        password
      );

      if (!result.success) {
        setError(result.error || "Login failed. Please try again.");
        return;
      }

      // Handle remember me functionality
      if (rememberMe) {
        AuthService.saveRememberedEmail(email.trim());
      } else {
        AuthService.clearRememberedEmail();
      }

      // Call the auth context signIn method with the validated user
      const authResult = await signIn({
        email: email.trim(),
        password,
        strictValidation: true,
      });

      if (authResult.error) {
        setError(authResult.error);
        return;
      }

      // Success message - redirect will be handled by useEffect
      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-gray-700">
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            required
            autoComplete="email"
            disabled={isLoading || isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="password"
            className="text-sm font-medium text-gray-700"
          >
            Password
          </Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            required
            autoComplete="current-password"
            disabled={isLoading || isSubmitting}
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <Checkbox
              id="remember-me"
              checked={rememberMe}
              onCheckedChange={(v) => setRememberMe(!!v)}
              className="rounded data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
            />
            <label 
              htmlFor="remember-me" 
              className="text-sm text-gray-600 cursor-pointer select-none"
            >
              Remember me
            </label>
          </div>
          <button
            type="button"
            onClick={() => setShowForgotPassword(true)}
            className="text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors font-medium text-left sm:text-right"
            disabled={isSubmitting}
          >
            Forgot password?
          </button>
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
            "Sign In"
          )}
        </Button>
      </form>

      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
      />
    </>
  );
}

const UniversalLoginPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-2 sm:p-4">
      <Card className="w-full max-w-6xl shadow-2xl rounded-2xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[500px] lg:min-h-[600px]">
          {/* Left Column - Branding/Image - Hidden on mobile, visible on lg+ */}
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
              <h2 className="text-2xl xl:text-3xl font-bold mb-4">
                Empowering Education in Kenya
              </h2>
              <p className="text-base xl:text-lg opacity-90">
                Modern school management system designed for the future of
                education.
              </p>
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="bg-white p-6 sm:p-8 lg:p-12 flex flex-col justify-center min-h-[500px]">
            {/* Mobile Logo - Only visible on small screens */}
            <div className="lg:hidden flex justify-center mb-6">
              <img
                src="/lovable-uploads/b42612dd-99c7-4d0b-94d0-fcf611535608.png"
                alt="Edufam Logo"
                className="h-10 w-auto"
              />
            </div>

            {/* Header */}
            <div className="mb-6 lg:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 text-center lg:text-left">
                Welcome to Edufam
              </h1>
              <p className="text-gray-600 text-base sm:text-lg text-center lg:text-left">
                Sign in to your dashboard
              </p>
            </div>

            {/* Login Form */}
            <div className="mb-6 lg:mb-8">
              <UniversalLoginForm />
            </div>

            {/* Footer */}
            <div className="text-center">
              <p className="text-sm text-gray-400">Powered by Edufam</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default UniversalLoginPage;
