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
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Login Failed',
        description: 'There was an error logging in with Google. Please try again.',
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