import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { setUser, clearUser, setError as setUserError } from '@/store/slices/userSlice';
import { RootState } from '@/store';
import { logOut } from '@/lib/firebase';
import type { User } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  appUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
  authError: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const appUser = useSelector((state: RootState) => state.user.currentUser);
  const isLoading = useSelector((state: RootState) => state.user.loading);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth, 
      (user) => {
        setFirebaseUser(user);
        setAuthError(null);

        if (user && !appUser) {
          // User is logged in with Firebase but not in our app state
          try {
            dispatch(setUser({
              id: 1, // In a real app, you'd get this from your backend
              username: user.displayName || 'User',
              email: user.email || '',
              avatarUrl: user.photoURL || null,
              createdAt: new Date(),
              password: '' // We don't store this
            }));
          } catch (error) {
            const errorMessage = (error as Error).message;
            console.error('Error setting user:', error);
            setAuthError(errorMessage);
            dispatch(setUserError(errorMessage));
            
            toast({
              title: "Authentication Error",
              description: "There was a problem with your account. Please try logging in again.",
              variant: "destructive"
            });
          }
        } else if (!user && appUser) {
          // User logged out
          dispatch(clearUser());
        }
      },
      (error) => {
        const errorMessage = error.message;
        console.error('Firebase auth state change error:', error);
        setAuthError(errorMessage);
        dispatch(setUserError(errorMessage));
        
        toast({
          title: "Authentication Error",
          description: "There was a problem with your authentication. Please try logging in again.",
          variant: "destructive"
        });
      }
    );

    return () => unsubscribe();
  }, [dispatch, appUser, toast]);

  const signOut = async () => {
    try {
      await logOut();
      // We'll let the AuthStateChanged listener handle clearing the user state
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
    } catch (error) {
      const errorMessage = (error as Error).message;
      console.error('Error signing out:', error);
      setAuthError(errorMessage);
      
      toast({
        title: "Sign Out Error",
        description: "There was a problem signing out. Please try again.",
        variant: "destructive"
      });
    }
  };

  const value = {
    firebaseUser,
    appUser,
    isAuthenticated: !!appUser,
    isLoading,
    signOut,
    authError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Export hook for using auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}