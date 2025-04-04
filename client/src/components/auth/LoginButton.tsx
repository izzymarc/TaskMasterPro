import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { signInWithGoogle } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { LogIn } from 'lucide-react';

interface LoginButtonProps {
  className?: string;
}

export const LoginButton = ({ className }: LoginButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      await signInWithGoogle();
      // The auth state change will be handled by the AuthContext
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Provide more specific error messages based on the error code
      let errorMessage = 'There was an error logging in with Google. Please try again.';
      
      if (error.code === 'auth/configuration-not-found') {
        errorMessage = 'Firebase authentication is not properly configured. Please ensure Firebase is set up correctly.';
      } else if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-in was cancelled. Please try again.';
      } else if (error.code) {
        errorMessage = `Authentication error (${error.code}): ${error.message}`;
      }
      
      toast({
        title: 'Login Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleLogin} 
      className={className}
      disabled={isLoading}
    >
      {isLoading ? (
        <span className="flex items-center">
          <span className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></span>
          Signing In...
        </span>
      ) : (
        <span className="flex items-center">
          <LogIn className="mr-2 h-4 w-4" />
          Login with Google
        </span>
      )}
    </Button>
  );
};

export default LoginButton;