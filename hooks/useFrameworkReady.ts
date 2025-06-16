import { useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

declare global {
  interface Window {
    frameworkReady?: () => void;
  }
}

export function useFrameworkReady() {
  useEffect(() => {
    // Initialize Firebase Auth listener to ensure auth is ready
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Firebase Auth initialized:', user ? 'User signed in' : 'No user');
      window.frameworkReady?.();
    });

    return () => unsubscribe();
  }, []);
}
