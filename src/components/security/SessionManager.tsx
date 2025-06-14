
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Monitor, Smartphone, Tablet, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UserSession {
  id: string;
  session_token: string;
  ip_address: string;
  user_agent: string;
  expires_at: string;
  last_activity: string;
  is_active: boolean;
  created_at: string;
}

const SessionManager: React.FC = () => {
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchSessions = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('is_active', true)
        .order('last_activity', { ascending: false });

      if (error) {
        throw error;
      }

      setSessions(data || []);
    } catch (error: any) {
      console.error('Failed to fetch sessions:', error);
      toast({
        title: "Error",
        description: "Failed to load active sessions",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const terminateSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('user_sessions')
        .update({ is_active: false })
        .eq('id', sessionId);

      if (error) {
        throw error;
      }

      setSessions(sessions.filter(session => session.id !== sessionId));
      toast({
        title: "Success",
        description: "Session terminated successfully"
      });
    } catch (error: any) {
      console.error('Failed to terminate session:', error);
      toast({
        title: "Error",
        description: "Failed to terminate session",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const getDeviceIcon = (userAgent: string) => {
    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return <Smartphone className="h-4 w-4" />;
    }
    if (ua.includes('tablet') || ua.includes('ipad')) {
      return <Tablet className="h-4 w-4" />;
    }
    return <Monitor className="h-4 w-4" />;
  };

  const getDeviceType = (userAgent: string) => {
    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return 'Mobile';
    }
    if (ua.includes('tablet') || ua.includes('ipad')) {
      return 'Tablet';
    }
    return 'Desktop';
  };

  const isCurrentSession = (sessionToken: string) => {
    // In a real implementation, you would check against the current session token
    return false; // Placeholder
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Monitor className="h-5 w-5" />
          Active Sessions
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Loading sessions...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-600">No active sessions found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {getDeviceIcon(session.user_agent)}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {getDeviceType(session.user_agent)}
                      </span>
                      {isCurrentSession(session.session_token) && (
                        <Badge variant="default" className="text-xs">Current</Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      IP: {session.ip_address} • 
                      Last active: {new Date(session.last_activity).toLocaleString()}
                    </p>
                  </div>
                </div>
                {!isCurrentSession(session.session_token) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => terminateSession(session.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SessionManager;
