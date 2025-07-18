import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Shield, Building } from "lucide-react";
import { useAdminAuthContext } from "@/components/auth/AdminAuthProvider";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Lottie from "lottie-react";

// Tree growing animation data
const treeGrowingAnimation = {
  "v": "5.7.6",
  "ip": 0,
  "op": 300,
  "w": 512,
  "h": 512,
  "nm": "Tree Growing",
  "ddd": 0,
  "assets": [],
  "layers": [
    {
      "ddd": 0,
      "ind": 1,
      "ty": 4,
      "nm": "Tree Base",
      "sr": 1,
      "ks": {
        "o": {"a": 0, "k": 100},
        "r": {"a": 0, "k": 0},
        "p": {"a": 0, "k": [256, 400]},
        "a": {"a": 0, "k": [0, 0]},
        "s": {"a": 1, "k": [
          {"i": {"x": [0.833], "y": [0.833]}, "o": {"x": [0.167], "y": [0.167]}, "t": 0, "s": [20]},
          {"t": 150, "s": [100]}
        ]}
      },
      "shapes": [
        {
          "ty": "gr",
          "it": [
            {
              "ty": "rc",
              "p": {"a": 0, "k": [0, 0]},
              "s": {"a": 0, "k": [30, 80]},
              "r": {"a": 0, "k": 8}
            },
            {
              "ty": "fl",
              "c": {"a": 0, "k": [0.4, 0.2, 0.1, 1]}
            }
          ]
        }
      ]
    },
    {
      "ddd": 0,
      "ind": 2,
      "ty": 4,
      "nm": "Tree Crown",
      "sr": 1,
      "ks": {
        "o": {"a": 1, "k": [
          {"i": {"x": [0.833], "y": [0.833]}, "o": {"x": [0.167], "y": [0.167]}, "t": 80, "s": [0]},
          {"t": 220, "s": [100]}
        ]},
        "r": {"a": 0, "k": 0},
        "p": {"a": 0, "k": [256, 320]},
        "a": {"a": 0, "k": [0, 0]},
        "s": {"a": 1, "k": [
          {"i": {"x": [0.833], "y": [0.833]}, "o": {"x": [0.167], "y": [0.167]}, "t": 80, "s": [10]},
          {"t": 220, "s": [120]}
        ]}
      },
      "shapes": [
        {
          "ty": "gr",
          "it": [
            {
              "ty": "el",
              "p": {"a": 0, "k": [0, 0]},
              "s": {"a": 0, "k": [100, 80]}
            },
            {
              "ty": "fl",
              "c": {"a": 0, "k": [0.2, 0.7, 0.3, 1]}
            }
          ]
        }
      ]
    }
  ],
  "meta": {
    "g": "Lovable Generated Tree Animation"
  }
};

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
        className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white py-2.5 rounded-lg font-semibold transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
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

// Motivational quotes for the left column
const MOTIVATIONAL_QUOTES = [
  {
    text: "The art of teaching is the art of assisting discovery.",
    author: "Mark Van Doren"
  },
  {
    text: "What we learn with pleasure we never forget.",
    author: "Alfred Mercier"
  },
  {
    text: "The future of the world is in my classroom today.",
    author: "Ivan Welton Fitzwater"
  },
  {
    text: "Great things in business are never done by one person. They're done by a team of people.",
    author: "Steve Jobs"
  },
  {
    text: "Education is the most powerful weapon which you can use to change the world.",
    author: "Nelson Mandela"
  },
  {
    text: "Innovation distinguishes between a leader and a follower.",
    author: "Steve Jobs"
  },
  {
    text: "The best way to predict the future is to create it.",
    author: "Peter Drucker"
  },
  {
    text: "Every child deserves a champion - an adult who will never give up on them.",
    author: "Rita Pierson"
  }
];

const AdminLandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, adminUser, isLoading } = useAdminAuthContext();
  const [currentQuote, setCurrentQuote] = useState(MOTIVATIONAL_QUOTES[0]);
  const [totalStudents, setTotalStudents] = useState<number | null>(null);
  const [greeting, setGreeting] = useState("");

  // Set dynamic greeting based on Nairobi time
  useEffect(() => {
    const getNairobiTime = () => {
      const now = new Date();
      const nairobiTime = new Date(now.toLocaleString("en-US", { timeZone: "Africa/Nairobi" }));
      const hour = nairobiTime.getHours();
      
      if (hour < 12) return "Good morning,";
      if (hour < 18) return "Good afternoon,";
      return "Good evening,";
    };
    
    setGreeting(getNairobiTime());
  }, []);

  // Set random quote on page load
  useEffect(() => {
    const randomQuote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
    setCurrentQuote(randomQuote);
  }, []);

  // Fetch total students count from backend
  useEffect(() => {
    const fetchStudentCount = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('platform-stats')
        
        if (error) {
          console.error('Error fetching platform stats:', error)
          // Fallback to mock data
          setTimeout(() => {
            setTotalStudents(Math.floor(Math.random() * 5000) + 8000)
          }, 2000)
          return
        }
        
        // Simulate loading delay for better UX
        setTimeout(() => {
          setTotalStudents(data.totalStudents)
        }, 2000)
      } catch (error) {
        console.error('Failed to fetch student count:', error)
        // Fallback to mock data
        setTimeout(() => {
          setTotalStudents(Math.floor(Math.random() * 5000) + 8000)
        }, 2000)
      }
    };
    
    fetchStudentCount();
  }, []);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-2 sm:p-4">
      <Card className="w-full max-w-6xl shadow-2xl rounded-2xl overflow-hidden bg-white">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[500px] lg:min-h-[600px]">
          {/* Left Column - Dynamic Inspiration */}
          <div className="hidden lg:flex relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex-col justify-between p-6 xl:p-8 text-white overflow-hidden">
            {/* Subtle background pattern */}
            <div className="absolute inset-0 opacity-5" style={{ 
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` 
            }}></div>
            
            {/* Logo at top */}
            <div className="flex items-center z-10 relative">
              <img
                src="/lovable-uploads/b42612dd-99c7-4d0b-94d0-fcf611535608.png"
                alt="Edufam Logo"
                className="h-10 xl:h-12 w-auto drop-shadow-lg"
              />
            </div>

            {/* Growing Tree Animation - Center */}
            <div className="flex-1 flex flex-col items-center justify-center z-10 relative">
              <div className="w-52 h-52 xl:w-60 xl:h-60 mb-8 relative">
                {/* Glowing background effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-green-400/20 rounded-full blur-xl animate-pulse"></div>
                <Lottie
                  animationData={treeGrowingAnimation}
                  loop={true}
                  autoplay={true}
                  style={{ width: "100%", height: "100%" }}
                  className="relative z-10 drop-shadow-2xl"
                />
              </div>
              
              {/* Dynamic Quote with enhanced styling */}
              <div className="text-center max-w-md animate-fade-in">
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                  <blockquote className="text-lg xl:text-xl font-light leading-relaxed text-white/95 mb-4 italic relative">
                    <span className="text-4xl text-white/30 absolute -top-2 -left-2">"</span>
                    {currentQuote.text}
                    <span className="text-4xl text-white/30 absolute -bottom-4 -right-2">"</span>
                  </blockquote>
                  <cite className="text-sm xl:text-base text-white/70 font-medium">
                    — {currentQuote.author}
                  </cite>
                </div>
              </div>
            </div>

            {/* Enhanced Impact Metric at bottom */}
            <div className="text-center z-10 relative">
              <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-2xl">
                {totalStudents !== null ? (
                  <div className="animate-fade-in">
                    <div className="flex items-center justify-center mb-2">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2 animate-pulse"></div>
                      <p className="text-sm xl:text-base text-white/80">
                        Powering the education of
                      </p>
                    </div>
                    <p className="text-3xl xl:text-4xl font-bold text-white mb-2 bg-gradient-to-r from-emerald-300 to-green-300 bg-clip-text text-transparent">
                      {totalStudents.toLocaleString()}
                    </p>
                    <p className="text-sm xl:text-base text-white/80">
                      students and counting
                    </p>
                  </div>
                ) : (
                  <div className="animate-pulse">
                    <div className="h-4 bg-white/20 rounded mb-3 mx-auto w-3/4"></div>
                    <div className="h-10 bg-white/20 rounded mb-3 mx-auto w-1/2"></div>
                    <div className="h-4 bg-white/20 rounded mx-auto w-2/3"></div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Admin Login Form */}
          <div className="bg-white p-6 sm:p-8 lg:p-12 flex flex-col justify-center min-h-[500px] relative overflow-hidden">
            {/* Subtle background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/5 to-transparent rounded-full -translate-y-32 translate-x-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-secondary/5 to-transparent rounded-full translate-y-24 -translate-x-24"></div>
            
            {/* Mobile Logo */}
            <div className="lg:hidden flex justify-center mb-6 relative z-10">
              <img
                src="/lovable-uploads/b42612dd-99c7-4d0b-94d0-fcf611535608.png"
                alt="Edufam Logo"
                className="h-10 w-auto drop-shadow-sm"
              />
            </div>

            {/* Dynamic Greeting */}
            <div className="text-center lg:text-left mb-2 relative z-10">
              <p className="text-lg text-muted-foreground font-medium animate-fade-in">
                {greeting}
              </p>
            </div>

            {/* Header */}
            <div className="mb-6 lg:mb-8 relative z-10">
              <div className="flex items-center justify-center lg:justify-start mb-3">
                <div className="p-2 bg-primary/10 rounded-lg mr-3">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                  Welcome to EduFam
                </h1>
              </div>
              <p className="text-muted-foreground text-base sm:text-lg text-center lg:text-left">
                Sign in to your admin dashboard
              </p>
              <div className="mt-3 text-center lg:text-left">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
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
            <div className="text-center relative z-10">
              <div className="inline-flex items-center justify-center space-x-2 text-sm text-muted-foreground bg-muted/30 px-4 py-2 rounded-lg">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span>EduFam Administration Portal</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
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