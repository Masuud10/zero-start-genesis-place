
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '../ui/button';

interface AuthErrorCardProps {
  title: string;
  description: string;
  details?: React.ReactNode;
}

const AuthErrorCard: React.FC<AuthErrorCardProps> = ({ title, description, details }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="border-red-200 bg-red-50 w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-red-600">{title}</CardTitle>
          <CardDescription className="text-red-500">{description}</CardDescription>
        </CardHeader>
        {details && (
          <CardContent>
            <div>{details}</div>
            <Button
              onClick={() => window.location.reload()}
              className="mt-4 w-full bg-red-600 text-white hover:bg-red-700"
            >
              Refresh Page
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default AuthErrorCard;
