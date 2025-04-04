import { useState } from 'react';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut } from 'lucide-react';

interface LogoutButtonProps {
  asDropdownItem?: boolean;
  className?: string;
}

export const LogoutButton = ({ asDropdownItem = false, className }: LogoutButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { signOut } = useAuth();

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await signOut();
      // The auth state change will be handled by the AuthContext
    } catch (error) {
      console.error('Logout error:', error);
      // Error handling is done in the AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  if (asDropdownItem) {
    return (
      <DropdownMenuItem
        onClick={handleLogout}
        disabled={isLoading}
        className="text-red-500 focus:text-red-500 focus:bg-red-50"
      >
        {isLoading ? 'Signing Out...' : 'Logout'}
      </DropdownMenuItem>
    );
  }

  return (
    <Button
      variant="outline"
      onClick={handleLogout}
      className={className}
      disabled={isLoading}
    >
      {isLoading ? (
        <span className="flex items-center">
          <span className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-current rounded-full"></span>
          Signing Out...
        </span>
      ) : (
        <span className="flex items-center">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </span>
      )}
    </Button>
  );
};

export default LogoutButton;