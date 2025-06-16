import { Redirect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function Index() {
  const { user } = useAuth();

  // If user is authenticated, redirect to tabs, otherwise to auth
  return <Redirect href={user ? "/(tabs)" : "/auth"} />;
} 