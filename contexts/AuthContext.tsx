import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChange, getCurrentUser } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      console.log('Refreshing user data...');
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      console.log('User data refreshed:', currentUser ? 'User found' : 'No user');
    } catch (error) {
      console.error('Error refreshing user:', error);
      setUser(null);
    }
  };

  useEffect(() => {
    console.log('Setting up auth state listener...');
    
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      console.log('Auth state changed:', firebaseUser ? 'User signed in' : 'User signed out');
      
      if (firebaseUser) {
        // User is signed in
        await refreshUser();
      } else {
        // User is signed out
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      console.log('Cleaning up auth state listener');
      unsubscribe();
    };
  }, []);

  const value = {
    user,
    loading,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};