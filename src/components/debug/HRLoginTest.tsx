import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const HRLoginTest: React.FC = () => {
  const [email, setEmail] = useState('hr@edufam.com');
  const [password, setPassword] = useState('HRPassword123!');
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<string>('');
  const { signIn } = useAuth();

  const testDirectLogin = async () => {
    setIsLoading(true);
    setTestResult('Testing direct Supabase auth...');
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        setTestResult(`❌ Direct auth failed: ${error.message}`);
      } else {
        setTestResult(`✅ Direct auth successful: ${data.user?.email}, Role: ${data.user?.user_metadata?.role}`);
        
        // Test profile fetch
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
          
        if (profileError) {
          setTestResult(prev => prev + `\n❌ Profile fetch failed: ${profileError.message}`);
        } else {
          setTestResult(prev => prev + `\n✅ Profile found: ${profile.name}, Role: ${profile.role}, School: ${profile.school_id}`);
        }
      }
    } catch (err) {
      setTestResult(`❌ Exception: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testAuthContext = async () => {
    setIsLoading(true);
    setTestResult('Testing auth context sign in...');
    
    try {
      const result = await signIn({
        email,
        password,
        strictValidation: true
      });
      
      if (result.error) {
        setTestResult(`❌ Auth context failed: ${result.error}`);
      } else {
        setTestResult(`✅ Auth context successful!`);
      }
    } catch (err) {
      setTestResult(`❌ Exception: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>HR Login Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="hr@edufam.com"
          />
        </div>
        
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="HRPassword123!"
          />
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={testDirectLogin} 
            disabled={isLoading}
            variant="outline"
          >
            Test Direct Auth
          </Button>
          <Button 
            onClick={testAuthContext} 
            disabled={isLoading}
          >
            Test Auth Context
          </Button>
        </div>
        
        {testResult && (
          <Alert>
            <AlertDescription>
              <pre className="whitespace-pre-wrap text-xs">{testResult}</pre>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default HRLoginTest;