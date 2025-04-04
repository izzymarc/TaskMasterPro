import { useEffect } from 'react';
import { getAuth, getRedirectResult } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { useDispatch } from 'react-redux';
import { setUser } from '@/store/slices/userSlice';

export const AuthRedirectHandler = () => {
  const { toast } = useToast();
  const dispatch = useDispatch();
  const auth = getAuth();

  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        
        if (result) {
          const user = result.user;
          console.log('Successfully signed in:', user);
          
          // In a real app, this would be replaced with a backend call
          // to get the actual user data and permissions
          dispatch(setUser({
            id: 1, // Would come from the backend
            username: user.displayName || 'User',
            email: user.email || '',
            avatarUrl: user.photoURL || null,
            createdAt: new Date(),
            password: '' // We don't store passwords with OAuth
          }));
          
          toast({
            title: "Login Successful",
            description: `Welcome back, ${user.displayName || 'User'}!`,
          });
        }
      } catch (error: any) {
        console.error('Error processing redirect result:', error);
        
        // Provide more specific error messages based on the error code
        let errorMessage = "There was a problem with your sign-in. Please try again.";
        
        if (error.code === 'auth/configuration-not-found') {
          console.error('Firebase Auth Configuration Error:', error);
          errorMessage = 'The Firebase project is not properly configured for authentication. Please ensure Firebase is set up correctly in the Firebase Console.';
        } else if (error.code) {
          errorMessage = `Authentication error (${error.code}): ${error.message}`;
        }
        
        toast({
          title: "Authentication Error",
          description: errorMessage,
          variant: "destructive"
        });
      }
    };

    handleRedirectResult();
  }, [toast, dispatch]);

  return null; // This component doesn't render anything
};

export default AuthRedirectHandler;