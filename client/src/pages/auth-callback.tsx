import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { getRedirectResult } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function AuthCallback() {
  const [, setLocation] = useLocation();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    try {
      // Check for redirect result from Firebase
      const result = await getRedirectResult(auth);

      if (!result || !result.user) {
        throw new Error('No authentication result found');
      }

      const user = result.user;
      const idToken = await user.getIdToken();

      // Send the ID token to our backend
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
        throw new Error(errorData.error || 'Authentication failed');
      }

      // Redirect to dashboard
      setLocation('/dashboard');
    } catch (err: any) {
      console.error('Firebase callback error:', err);
      setError(err.message || 'Authentication failed');
      setTimeout(() => setLocation('/login'), 3000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20">
      <div className="text-center">
        {error ? (
          <div className="space-y-4">
            <div className="text-red-600 dark:text-red-400 text-lg font-medium">
              {error}
            </div>
            <p className="text-muted-foreground">Redirecting to login...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-lg font-medium">Completing sign in...</p>
          </div>
        )}
      </div>
    </div>
  );
}