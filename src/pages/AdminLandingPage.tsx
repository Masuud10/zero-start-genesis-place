import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Shield, Building, Crown } from "lucide-react";
import { useConsolidatedAuth } from "@/hooks/useConsolidatedAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Lottie from "lottie-react";

// Tree growing animation data
const treeGrowingAnimation = {
  v: "5.7.6",
  ip: 0,
  op: 300,
  w: 512,
  h: 512,
  nm: "Tree Growing",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Tree Base",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [256, 400] },
        a: { a: 0, k: [0, 0] },
        s: {
          a: 1,
          k: [
            {
              i: { x: [0.833], y: [0.833] },
              o: { x: [0.167], y: [0.167] },
              t: 0,
              s: [20],
            },
            { t: 150, s: [100] },
          ],
        },
      },
      shapes: [
        {
          ty: "gr",
          it: [
            {
              ty: "rc",
              p: { a: 0, k: [0, 0] },
              s: { a: 0, k: [30, 80] },
              r: { a: 0, k: 8 },
            },
            {
              ty: "fl",
              c: { a: 0, k: [0.4, 0.2, 0.1, 1] },
            },
          ],
        },
      ],
    },
    {
      ddd: 0,
      ind: 2,
      ty: 4,
      nm: "Tree Crown",
      sr: 1,
      ks: {
        o: {
          a: 1,
          k: [
            {
              i: { x: [0.833], y: [0.833] },
              o: { x: [0.167], y: [0.167] },
              t: 80,
              s: [0],
            },
            { t: 220, s: [100] },
          ],
        },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [256, 320] },
        a: { a: 0, k: [0, 0] },
        s: {
          a: 1,
          k: [
            {
              i: { x: [0.833], y: [0.833] },
              o: { x: [0.167], y: [0.167] },
              t: 80,
              s: [10],
            },
            { t: 220, s: [120] },
          ],
        },
      },
      shapes: [
        {
          ty: "gr",
          it: [
            {
              ty: "el",
              p: { a: 0, k: [0, 0] },
              s: { a: 0, k: [100, 80] },
            },
            {
              ty: "fl",
              c: { a: 0, k: [0.2, 0.7, 0.3, 1] },
            },
          ],
        },
      ],
    },
  ],
  meta: {
    g: "Lovable Generated Tree Animation",
  },
};

interface AdminLoginFormProps {
  onSuccess: () => void;
}

function AdminLoginForm({ onSuccess }: AdminLoginFormProps) {
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
      console.log(
        "🔐 AdminLoginForm: Already authenticated, redirecting to dashboard"
      );
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
      console.log("🔐 AdminLoginForm: Attempting admin login for:", email);
      const result = await signIn(email.trim(), password);

      if (result.error) {
        setLoginError(result.error);
        toast({
          title: "Admin Login Failed",
          description: result.error,
          variant: "destructive",
        });
        return;
      }

      // Success
      toast({
        title: "Admin Login Successful",
        description: "Welcome to the EduFam Admin Dashboard!",
      });

      onSuccess();
    } catch (error) {
      const errorMessage = "An unexpected error occurred. Please try again.";
      setLoginError(errorMessage);
      toast({
        title: "Admin Login Error",
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
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setEmail(e.target.value)
          }
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          placeholder="Enter your admin email"
          required
          autoComplete="email"
          disabled={isLoading || isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium text-gray-700">
          Admin Password
        </label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setPassword(e.target.value)
          }
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          placeholder="Enter your admin password"
          required
          autoComplete="current-password"
          disabled={isLoading || isSubmitting}
        />
      </div>

      <Button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isLoading || isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing In...
          </>
        ) : (
          "Admin Sign In"
        )}
      </Button>
    </form>
  );
}

const AdminLandingPage: React.FC = () => {
  const [currentTime, setCurrentTime] = useState<string>("");
  const [studentCount, setStudentCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getNairobiTime = () => {
      const now = new Date();
      const nairobiTime = new Intl.DateTimeFormat("en-US", {
        timeZone: "Africa/Nairobi",
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }).format(now);
      setCurrentTime(nairobiTime);
    };

    getNairobiTime();
    const interval = setInterval(getNairobiTime, 1000);

    const fetchStudentCount = async () => {
      try {
        const { count, error } = await supabase
          .from("students")
          .select("*", { count: "exact", head: true });

        if (error) {
          console.error("Error fetching student count:", error);
        } else {
          setStudentCount(count || 0);
        }
      } catch (error) {
        console.error("Error fetching student count:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudentCount();

    return () => clearInterval(interval);
  }, []);

  const handleLoginSuccess = () => {
    // This will be handled by the useEffect in AdminLoginForm
    console.log("Admin login successful, redirecting...");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Login Form */}
        <div className="space-y-8">
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start space-x-2 mb-4">
              <Crown className="h-8 w-8 text-yellow-600" />
              <h1 className="text-3xl font-bold text-gray-900">
                EduFam Admin Portal
              </h1>
            </div>
            <p className="text-lg text-gray-600 mb-2">
              Administrative Dashboard Access
            </p>
            <p className="text-sm text-gray-500">
              Restricted access for authorized administrative personnel only
            </p>
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800 font-medium">
                ⚠️ Admin Access Only
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                This portal is restricted to authorized administrative users.
                School users should use their respective school portals.
              </p>
            </div>
          </div>

          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8">
              <AdminLoginForm onSuccess={handleLoginSuccess} />
            </CardContent>
          </Card>

          <div className="text-center lg:text-left">
            <p className="text-xs text-gray-500">
              Protected by enterprise-grade security protocols
            </p>
          </div>
        </div>

        {/* Right Side - Stats and Animation */}
        <div className="space-y-6">
          <div className="text-center">
            <div className="mb-6">
              <Lottie
                animationData={treeGrowingAnimation}
                loop={true}
                style={{ width: 200, height: 200 }}
                className="mx-auto"
              />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Administrative Control Center
            </h2>
            <p className="text-gray-600 mb-6">
              Comprehensive system management and oversight
            </p>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {isLoading ? (
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    ) : (
                      studentCount.toLocaleString()
                    )}
                  </div>
                  <div className="text-sm text-blue-700">Total Students</div>
                </CardContent>
              </Card>

              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    <Building className="h-6 w-6 mx-auto mb-1" />
                  </div>
                  <div className="text-sm text-green-700">Managed Schools</div>
                </CardContent>
              </Card>
            </div>

            {/* Current Time */}
            <Card className="bg-gray-50 border-gray-200">
              <CardContent className="p-4 text-center">
                <div className="text-sm text-gray-600 mb-1">
                  System Time (Nairobi)
                </div>
                <div className="text-lg font-mono text-gray-800">
                  {currentTime}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLandingPage;
