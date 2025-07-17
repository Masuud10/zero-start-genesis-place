import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuthContext } from '@/components/auth/AdminAuthProvider';
import Lottie from 'lottie-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff, GraduationCap, Shield, Database, TrendingUp } from 'lucide-react';

// Professional data analytics animation
const animationData = {
  "v": "5.9.1",
  "fr": 30,
  "ip": 0,
  "op": 180,
  "w": 500,
  "h": 500,
  "nm": "Network Analytics",
  "ddd": 0,
  "assets": [],
  "layers": [
    {
      "ddd": 0,
      "ind": 1,
      "ty": 4,
      "nm": "Outer Ring",
      "sr": 1,
      "ks": {
        "o": { "a": 0, "k": 100 },
        "r": { "a": 1, "k": [
          { "i": { "x": [0.833], "y": [0.833] }, "o": { "x": [0.167], "y": [0.167] }, "t": 0, "s": [0] },
          { "t": 180, "s": [360] }
        ]},
        "p": { "a": 0, "k": [250, 250, 0] },
        "a": { "a": 0, "k": [0, 0, 0] },
        "s": { "a": 0, "k": [100, 100, 100] }
      },
      "ao": 0,
      "shapes": [
        {
          "ty": "gr",
          "it": [
            {
              "d": 1,
              "ty": "el",
              "s": { "a": 0, "k": [180, 180] },
              "p": { "a": 0, "k": [0, 0] }
            },
            {
              "ty": "st",
              "c": { "a": 0, "k": [0.2, 0.6, 1, 1] },
              "o": { "a": 0, "k": 80 },
              "w": { "a": 0, "k": 2 }
            },
            {
              "ty": "tr",
              "p": { "a": 0, "k": [0, 0] },
              "a": { "a": 0, "k": [0, 0] },
              "s": { "a": 0, "k": [100, 100] },
              "r": { "a": 0, "k": 0 },
              "o": { "a": 0, "k": 100 }
            }
          ]
        }
      ],
      "ip": 0,
      "op": 180,
      "st": 0,
      "bm": 0
    },
    {
      "ddd": 0,
      "ind": 2,
      "ty": 4,
      "nm": "Inner Ring",
      "sr": 1,
      "ks": {
        "o": { "a": 0, "k": 100 },
        "r": { "a": 1, "k": [
          { "i": { "x": [0.833], "y": [0.833] }, "o": { "x": [0.167], "y": [0.167] }, "t": 0, "s": [360] },
          { "t": 180, "s": [0] }
        ]},
        "p": { "a": 0, "k": [250, 250, 0] },
        "a": { "a": 0, "k": [0, 0, 0] },
        "s": { "a": 0, "k": [100, 100, 100] }
      },
      "ao": 0,
      "shapes": [
        {
          "ty": "gr",
          "it": [
            {
              "d": 1,
              "ty": "el",
              "s": { "a": 0, "k": [120, 120] },
              "p": { "a": 0, "k": [0, 0] }
            },
            {
              "ty": "st",
              "c": { "a": 0, "k": [0.1, 0.8, 0.6, 1] },
              "o": { "a": 0, "k": 90 },
              "w": { "a": 0, "k": 3 }
            },
            {
              "ty": "tr",
              "p": { "a": 0, "k": [0, 0] },
              "a": { "a": 0, "k": [0, 0] },
              "s": { "a": 0, "k": [100, 100] },
              "r": { "a": 0, "k": 0 },
              "o": { "a": 0, "k": 100 }
            }
          ]
        }
      ],
      "ip": 0,
      "op": 180,
      "st": 0,
      "bm": 0
    },
    {
      "ddd": 0,
      "ind": 3,
      "ty": 4,
      "nm": "Center",
      "sr": 1,
      "ks": {
        "o": { "a": 1, "k": [
          { "i": { "x": [0.833], "y": [0.833] }, "o": { "x": [0.167], "y": [0.167] }, "t": 0, "s": [50] },
          { "i": { "x": [0.833], "y": [0.833] }, "o": { "x": [0.167], "y": [0.167] }, "t": 90, "s": [100] },
          { "t": 180, "s": [50] }
        ]},
        "r": { "a": 0, "k": 0 },
        "p": { "a": 0, "k": [250, 250, 0] },
        "a": { "a": 0, "k": [0, 0, 0] },
        "s": { "a": 0, "k": [100, 100, 100] }
      },
      "ao": 0,
      "shapes": [
        {
          "ty": "gr",
          "it": [
            {
              "d": 1,
              "ty": "el",
              "s": { "a": 0, "k": [60, 60] },
              "p": { "a": 0, "k": [0, 0] }
            },
            {
              "ty": "fl",
              "c": { "a": 0, "k": [0.3, 0.7, 1, 1] },
              "o": { "a": 0, "k": 100 }
            },
            {
              "ty": "tr",
              "p": { "a": 0, "k": [0, 0] },
              "a": { "a": 0, "k": [0, 0] },
              "s": { "a": 0, "k": [100, 100] },
              "r": { "a": 0, "k": 0 },
              "o": { "a": 0, "k": 100 }
            }
          ]
        }
      ],
      "ip": 0,
      "op": 180,
      "st": 0,
      "bm": 0
    }
  ]
};

const AdminLandingPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, adminUser, isLoading, error } = useAdminAuthContext();
  const [submitLoading, setSubmitLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      return;
    }

    setSubmitLoading(true);
    try {
      await signIn(email, password);
    } catch (err) {
      console.error('Login error:', err);
    } finally {
      setSubmitLoading(false);
    }
  };

  // Redirect to dashboard if authenticated
  if (adminUser) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Column - Dark with Animation */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 relative overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 border border-white/20 rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-24 h-24 border border-white/20 rounded-full animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/4 w-16 h-16 border border-white/20 rounded-full animate-pulse delay-500"></div>
          <div className="absolute top-1/4 right-1/3 w-20 h-20 border border-white/20 rounded-full animate-pulse delay-700"></div>
        </div>
        
        {/* Floating Icons */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-1/4 animate-float">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-blue-300" />
            </div>
          </div>
          <div className="absolute bottom-32 left-1/4 animate-float delay-1000">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
              <Database className="w-6 h-6 text-emerald-300" />
            </div>
          </div>
          <div className="absolute top-1/3 left-12 animate-float delay-500">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-300" />
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-white">
          {/* Logo and Branding */}
          <div className="mb-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-400 to-emerald-400 rounded-3xl flex items-center justify-center mb-6 mx-auto shadow-2xl">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
              EduFam
            </h1>
            <p className="text-2xl text-slate-300 font-medium mb-2">
              Company Administration Portal
            </p>
            <div className="w-16 h-0.5 bg-gradient-to-r from-blue-400 to-emerald-400 mx-auto"></div>
          </div>

          {/* Animation */}
          <div className="w-80 h-80 mb-8">
            <Lottie
              animationData={animationData}
              loop={true}
              className="w-full h-full drop-shadow-lg"
            />
          </div>

          {/* Tagline */}
          <div className="text-center max-w-md">
            <h2 className="text-3xl font-semibold mb-6 text-white">
              Manage. Monitor. Excel.
            </h2>
            <p className="text-slate-300 text-lg leading-relaxed mb-8">
              Your command center for overseeing educational excellence across all partner schools.
            </p>
            
            {/* Features List */}
            <div className="text-left space-y-3">
              <div className="flex items-center text-slate-300">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                <span>Real-time school analytics</span>
              </div>
              <div className="flex items-center text-slate-300">
                <div className="w-2 h-2 bg-emerald-400 rounded-full mr-3"></div>
                <span>Comprehensive user management</span>
              </div>
              <div className="flex items-center text-slate-300">
                <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                <span>Business intelligence dashboard</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary/80 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <GraduationCap className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">EduFam Admin</h1>
          </div>

          {/* Header */}
          <div className="text-center">
            <h2 className="text-4xl font-bold text-foreground mb-3">
              EduFam Mission Control
            </h2>
            <p className="text-muted-foreground text-lg">
              Sign in to manage the platform
            </p>
            <div className="w-12 h-0.5 bg-gradient-to-r from-primary to-primary/60 mx-auto mt-4"></div>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="animate-fade-in border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-foreground">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@edufam.com"
                required
                disabled={isLoading}
                className="h-12 text-base border-2 focus:border-primary transition-colors"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-foreground">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your secure password"
                  required
                  disabled={isLoading}
                  className="h-12 text-base pr-12 border-2 focus:border-primary transition-colors"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <Eye className="h-5 w-5 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-14 text-base font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-200"
              disabled={submitLoading || isLoading || !email || !password}
            >
              {(submitLoading || isLoading) ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-5 w-5" />
                  Sign In Securely
                </>
              )}
            </Button>
          </form>

          {/* Security Notice */}
          <div className="text-center text-sm text-muted-foreground bg-muted/30 p-6 rounded-xl border">
            <div className="flex items-center justify-center mb-2">
              <Shield className="w-5 h-5 mr-2 text-primary" />
              <span className="font-semibold text-foreground">Secure Access Portal</span>
            </div>
            <p>This area is restricted to authorized EduFam administrators only.</p>
            <p className="mt-1 text-xs">All access attempts are logged and monitored.</p>
          </div>

          {/* Footer */}
          <div className="text-center pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground">
              © 2025 EduFam Technologies. All Rights Reserved.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Proudly serving educational institutions across Kenya
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLandingPage;