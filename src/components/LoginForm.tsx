
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Info } from 'lucide-react';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [showSignUp, setShowSignUp] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const addDebugInfo = (message: string) => {
    console.log('🐛 DEBUG:', message);
    setDebugInfo(prev => [...prev.slice(-4), `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setDebugInfo([]);

    addDebugInfo(`Attempting to ${showSignUp ? 'sign up' : 'sign in'} with: ${email}`);

    try {
      let result;
      if (showSignUp) {
        addDebugInfo('Calling signUp function...');
        result = await signUp(email, password, { name: email.split('@')[0] });
      } else {
        addDebugInfo('Calling signIn function...');
        result = await signIn(email, password);
      }
      
      const { data, error } = result;
      
      if (error) {
        addDebugInfo(`Authentication error: ${error.message}`);
        console.error('🔴 Login error details:', error);
        
        let errorMessage = error.message;
        if (error.message === 'Invalid login credentials') {
          errorMessage = 'Invalid email or password. Please check your credentials or try signing up.';
        }
        
        toast({
          title: showSignUp ? "Sign up failed" : "Login failed",
          description: errorMessage,
          variant: "destructive",
        });
      } else if (data?.user) {
        addDebugInfo(`${showSignUp ? 'Sign up' : 'Login'} successful for: ${data.user.email}`);
        console.log('✅ Authentication successful:', data.user.email);
        
        if (showSignUp) {
          toast({
            title: "Account created!",
            description: "Please check your email to verify your account.",
          });
        } else {
          toast({
            title: "Welcome back!",
            description: "Successfully logged in to the school management system.",
          });
        }
      }
    } catch (error) {
      addDebugInfo(`Unexpected error: ${error}`);
      console.error('🔴 Unexpected login error:', error);
      
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };

  const fillDemoCredentials = (role: string) => {
    const credentials: Record<string, { email: string; password: string }> = {
      admin: { email: 'admin@edufam.com', password: 'password' },
      owner: { email: 'owner@school.com', password: 'password' },
      principal: { email: 'principal@school.com', password: 'password' },
      teacher: { email: 'teacher@school.com', password: 'password' },
      parent: { email: 'parent@school.com', password: 'password' },
      finance: { email: 'finance@school.com', password: 'password' }
    };

    const cred = credentials[role];
    if (cred) {
      setEmail(cred.email);
      setPassword(cred.password);
      addDebugInfo(`Filled demo credentials for ${role}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto gradient-academic rounded-2xl flex items-center justify-center mb-4 float-animation">
            <span className="text-2xl font-bold text-white">🎓</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            School Management
          </h1>
          <p className="text-muted-foreground">
            Secure access to academic records and attendance
          </p>
        </div>

        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              {showSignUp ? 'Sign up' : 'Sign in'}
            </CardTitle>
            <CardDescription className="text-center">
              {showSignUp 
                ? 'Create a new account to get started' 
                : 'Enter your credentials to access your account'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-11 gradient-academic text-white hover:opacity-90 transition-all duration-200"
                disabled={isLoading}
              >
                {isLoading ? (showSignUp ? "Creating account..." : "Signing in...") : (showSignUp ? "Sign up" : "Sign in")}
              </Button>
            </form>
            
            <div className="mt-4 text-center">
              <Button 
                variant="link" 
                onClick={() => setShowSignUp(!showSignUp)}
                className="text-sm"
              >
                {showSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
              </Button>
            </div>

            {!showSignUp && (
              <div className="mt-6 space-y-2 text-sm text-muted-foreground">
                <p className="font-medium">Demo Accounts (click to fill):</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'admin', label: 'Admin' },
                    { key: 'owner', label: 'School Owner' },
                    { key: 'principal', label: 'Principal' },
                    { key: 'teacher', label: 'Teacher' },
                    { key: 'parent', label: 'Parent' },
                    { key: 'finance', label: 'Finance' }
                  ].map(({ key, label }) => (
                    <Button
                      key={key}
                      variant="outline"
                      size="sm"
                      onClick={() => fillDemoCredentials(key)}
                      className="text-xs h-8"
                    >
                      {label}
                    </Button>
                  ))}
                </div>
                <p className="text-xs mt-2">Password for all demo accounts: password</p>
              </div>
            )}

            {debugInfo.length > 0 && (
              <Alert className="mt-4">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    <p className="font-medium">Debug Information:</p>
                    {debugInfo.map((info, index) => (
                      <p key={index} className="text-xs font-mono">{info}</p>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            )}
            
            <Alert className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <p className="text-xs">
                  <strong>Note:</strong> Demo accounts need to be created first. If login fails, try signing up with the demo credentials above, then sign in.
                </p>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginForm;
