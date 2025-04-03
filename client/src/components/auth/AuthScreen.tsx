import { useState } from 'react';
import { signInWithGoogle } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface AuthScreenProps {
  onLoginSuccess?: () => void;
}

const AuthScreen = ({ onLoginSuccess }: AuthScreenProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      await signInWithGoogle();
      
      // Note: The actual user data will be set by the AuthContext when the redirect completes
      // This is just a backup in case that doesn't happen for some reason
      setTimeout(() => {
        if (onLoginSuccess) {
          onLoginSuccess();
        }
      }, 2000);
    } catch (err) {
      console.error('Login error:', err);
      setError('Failed to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-[350px] shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome!</CardTitle>
          <CardDescription>Sign in to access your tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-center gap-2"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              {loading ? (
                <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"></span>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M15.545 6.558a9.42 9.42 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.689 7.689 0 0 1 5.352 2.082l-2.284 2.284A4.347 4.347 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.792 4.792 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.702 3.702 0 0 0 1.599-2.431H8v-3.08h7.545z" />
                </svg>
              )}
              Sign in with Google
            </Button>

            {error && (
              <div className="text-red-500 text-sm mt-2">{error}</div>
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