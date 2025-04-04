import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LoginButton } from '@/components/auth/LoginButton';
import { useAuth } from '@/contexts/AuthContext';

interface AuthScreenProps {
  onLoginSuccess?: () => void;
}

const AuthScreen = ({ onLoginSuccess }: AuthScreenProps) => {
  const { isLoading, authError } = useAuth();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-[350px] shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome!</CardTitle>
          <CardDescription>Sign in to access your tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <LoginButton 
              className="w-full"
            />

            {(error || authError) && (
              <div className="text-red-500 text-sm mt-2">{error || authError}</div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-gray-500">
          <p>Your data is securely stored</p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AuthScreen;