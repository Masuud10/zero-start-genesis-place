
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Validation Error",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Validation Error",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    console.log('🔐 LoginForm: Starting authentication process for:', email);

    try {
      let result;
      
      if (showSignUp) {
        console.log('🔐 LoginForm: Attempting sign up');
        result = await signUp(email, password, { 
          name: email.split('@')[0],
          role: 'parent' // Default role for new signups
        });
      } else {
        console.log('🔐 LoginForm: Attempting sign in');
        result = await signIn(email, password);
      }
      
      const { data, error } = result;
      
      if (error) {
        console.error('🔴 LoginForm: Authentication error:', error);
        
        let errorMessage = error.message || 'An unknown error occurred';
        
        // Handle specific error types with better user messages
        if (error.message?.includes('Invalid login credentials') || 
            error.message?.includes('invalid_credentials')) {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
        } else if (error.message?.includes('Email not confirmed')) {
          errorMessage = 'Please check your email and click the confirmation link before logging in.';
        } else if (error.message?.includes('User already registered')) {
          errorMessage = 'An account with this email already exists. Please sign in instead.';
          setShowSignUp(false);
        } else if (error.message?.includes('signup_disabled')) {
          errorMessage = 'New account registration is currently disabled. Please contact support.';
        } else if (error.message?.includes('weak_password')) {
          errorMessage = 'Password is too weak. Please use a stronger password with at least 6 characters.';
        } else if (error.message?.includes('rate_limit')) {
          errorMessage = 'Too many attempts. Please wait a few minutes before trying again.';
        } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        }
        
        toast({
          title: showSignUp ? "Sign up failed" : "Login failed",
          description: errorMessage,
          variant: "destructive",
        });
      } else if (data?.user) {
        console.log('✅ LoginForm: Authentication successful for user:', data.user.email);
        
        if (showSignUp) {
          toast({
            title: "Account created successfully!",
            description: data.user?.email_confirmed_at 
              ? "You can now use your account." 
              : "Please check your email to verify your account before logging in.",
          });
          
          // If email confirmation is required, switch to sign in mode
          if (!data.user?.email_confirmed_at) {
            setShowSignUp(false);
            setEmail('');
            setPassword('');
          }
        } else {
          toast({
            title: "Welcome back!",
            description: "Successfully logged into Elimisha school management system.",
          });
        }
      }
    } catch (error: any) {
      console.error('🔴 LoginForm: Unexpected error during authentication:', error);
      
      toast({
        title: "Authentication Error",
        description: "An unexpected error occurred. Please try again or contact support if the problem persists.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <img 
              src="/lovable-uploads/ae278d7f-ba0b-4bb3-b868-639625b0caf0.png" 
              alt="Elimisha Logo" 
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <div className="hidden w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
              <span className="text-2xl text-white">🎓</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Elimisha
          </h1>
          <p className="text-muted-foreground">
            School Management System
          </p>
        </div>

        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              {showSignUp ? 'Create Account' : 'Welcome Back'}
            </CardTitle>
            <CardDescription className="text-center">
              {showSignUp 
                ? 'Create a new account to get started with Elimisha' 
                : 'Enter your credentials to access your account'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value.trim())}
                  required
                  className="h-11"
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={showSignUp ? "Create a password (min. 6 characters)" : "Enter your password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11"
                  disabled={isLoading}
                  minLength={6}
                  autoComplete={showSignUp ? "new-password" : "current-password"}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transition-all duration-200 disabled:opacity-50"
                disabled={isLoading || !email || !password}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    {showSignUp ? "Creating account..." : "Signing in..."}
                  </>
                ) : (
                  showSignUp ? "Create Account" : "Sign In"
                )}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <Button 
                variant="link" 
                onClick={() => {
                  setShowSignUp(!showSignUp);
                  setEmail('');
                  setPassword('');
                }}
                className="text-sm text-muted-foreground hover:text-primary"
                disabled={isLoading}
              >
                {showSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
              </Button>
            </div>

            {/* Demo accounts for testing */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-2 font-medium">Demo Accounts (for testing):</p>
              <div className="text-xs text-gray-500 space-y-1">
                <div>Admin: admin@elimisha.com / password123</div>
                <div>Principal: principal@school.com / password123</div>
                <div>Teacher: teacher@school.com / password123</div>
                <div>Parent: parent@gmail.com / password123</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginForm;
