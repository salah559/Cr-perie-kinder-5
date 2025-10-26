
import { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export function useSocialAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signInWithProvider = async (provider: 'google' | 'facebook') => {
    if (provider !== 'google') {
      setError('Only Google sign-in is currently supported');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const googleProvider = new GoogleAuthProvider();
      googleProvider.addScope('profile');
      googleProvider.addScope('email');
      
      // Use popup for better UX
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Get the ID token to send to backend
      const idToken = await user.getIdToken();
      
      // Send to backend for session creation
      const response = await fetch('/api/auth/firebase-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          idToken,
          email: user.email,
          name: user.displayName,
          photoURL: user.photoURL,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to authenticate with backend');
      }

      const userData = await response.json();
      setLoading(false);
      return userData;
    } catch (err: any) {
      console.error('Firebase auth error:', err);
      setError(err.message || 'Failed to sign in with Google');
      setLoading(false);
      throw err;
    }
  };

  return {
    signInWithProvider,
    loading,
    error,
  };
}
