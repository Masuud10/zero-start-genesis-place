import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, Eye, EyeOff, Loader2, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isValidToken, setIsValidToken] = useState(false);
  const [isCheckingToken, setIsCheckingToken] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const checkResetToken = async () => {
      try {
        // Check if we have a valid session with recovery token
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Reset password: Session error:", error);
          setError(
            "Invalid or expired reset link. Please request a new password reset."
          );
          setIsValidToken(false);
          return;
        }

        if (!session) {
          setError(
            "Invalid or expired reset link. Please request a new password reset."
          );
          setIsValidToken(false);
          return;
        }

        // Check if this is a recovery session
        if (session.user.app_metadata?.provider === "email") {
          setIsValidToken(true);
        } else {
          setError("Invalid reset link. Please request a new password reset.");
          setIsValidToken(false);
        }
      } catch (error) {
        console.error("Reset password: Token check error:", error);
        setError("Unable to validate reset link. Please try again.");
        setIsValidToken(false);
      } finally {
        setIsCheckingToken(false);
      }
    };

    checkResetToken();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!password || !confirmPassword) {
      setError("Please enter both password fields.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        console.error("Reset password: Update error:", error);
        setError(
          error.message || "Failed to update password. Please try again."
        );
        return;
      }

      setIsSuccess(true);
      toast({
        title: "Password Updated",
        description:
          "Your password has been successfully updated. You can now log in with your new password.",
      });

      // Redirect to login after a short delay
      setTimeout(() => {
        window.location.href = "/login";
      }, 3000);
    } catch (error) {
      console.error("Reset password: Exception:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCheckingToken) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-[#F5F6FA] p-4">
        <Card className="w-full max-w-md mx-auto shadow-xl border-0">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Validating reset link...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-[#F5F6FA] p-4">
        <Card className="w-full max-w-md mx-auto shadow-xl border-0">
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Password Updated!
            </h2>
            <p className="text-gray-600 mb-4">
              Your password has been successfully updated. You will be
              redirected to the login page shortly.
            </p>
            <Button
              onClick={() => (window.location.href = "/login")}
              className="bg-[#1A237E] hover:bg-blue-900"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-[#F5F6FA] p-4">
        <Card className="w-full max-w-md mx-auto shadow-xl border-0">
          <CardContent className="p-8 text-center">
            <Alert className="border-red-200 bg-red-50 mb-4">
              <AlertDescription className="text-red-700">
                {error}
              </AlertDescription>
            </Alert>
            <Button
              onClick={() => (window.location.href = "/login")}
              className="bg-[#1A237E] hover:bg-blue-900"
            >
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#F5F6FA] p-4">
      <div className="flex flex-col items-center mb-8">
        <img
          src="/edufam-logo.svg"
          alt="EduFam Platform"
          className="w-32 h-auto mb-4"
        />
        <h1 className="text-2xl font-bold text-gray-800">
          Reset Your Password
        </h1>
        <p className="text-gray-600 mt-2">Enter your new password below</p>
      </div>

      <Card className="w-full max-w-md mx-auto shadow-xl border-0">
        <CardHeader>
          <CardTitle className="text-center">Create New Password</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <div>
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-700"
              >
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your new password"
                  className="pl-10 pr-10"
                  required
                  minLength={8}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={isSubmitting}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Password must be at least 8 characters long
              </p>
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="text-sm font-medium text-gray-700"
              >
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  className="pl-10 pr-10"
                  required
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={isSubmitting}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#1A237E] hover:bg-blue-900"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Updating Password...
                </span>
              ) : (
                "Update Password"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="mt-8 text-sm text-gray-500 text-center">
        <p>
          &copy; {new Date().getFullYear()} EduFam Platform. All rights
          reserved.
        </p>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
