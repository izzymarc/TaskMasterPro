import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { setUser } from '@/store/slices/userSlice';
import { RootState } from '@/store';
import { logOut } from '@/lib/firebase';
import type { User } from '@shared/schema';

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  appUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const dispatch = useDispatch();
  const appUser = useSelector((state: RootState) => state.user.currentUser);
  const isLoading = useSelector((state: RootState) => state.user.loading);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);

      if (user && !appUser) {
        // User is logged in with Firebase but not in our app state
        dispatch(setUser({
          id: 1, // In a real app, you'd get this from your backend
          username: user.displayName || 'User',
          email: user.email || '',
          avatarUrl: user.photoURL || null,
          createdAt: new Date(),
          password: '' // We don't store this
        }));
      }
    });

    return () => unsubscribe();
  }, [dispatch, appUser]);

  const signOut = async () => {
    try {
      await logOut();
      // We'll let the AuthStateChanged listener handle clearing the user state
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value = {
    firebaseUser,
    appUser,
    isAuthenticated: !!appUser,
    isLoading,
    signOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};