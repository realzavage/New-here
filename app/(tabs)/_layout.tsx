import { Tabs } from 'expo-router';
import { Chrome as Home, Search, User, BarChart3, Settings, ShoppingBag } from 'lucide-react-native';
import { useRoleBasedAccess } from '@/hooks/useRoleBasedAccess';

export default function TabLayout() {
  const { role, isAdmin, isBusiness } = useRoleBasedAccess();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#D97706',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          paddingTop: 8,
          paddingBottom: 8,
          height: 65,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ size, color }) => (
            <Home size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ size, color }) => (
            <Search size={size} color={color} />
          ),
        }}
      />
      
      {/* Business Analytics Tab - Only for business users and admins */}
      {(isBusiness || isAdmin) && (
        <Tabs.Screen
          name="analytics"
          options={{
            title: 'Analytics',
            tabBarIcon: ({ size, color }) => (
              <BarChart3 size={size} color={color} />
            ),
          }}
        />
      )}

      {/* Marketplace Tab - Enhanced for business users */}
      <Tabs.Screen
        name="marketplace"
        options={{
          title: isBusiness ? 'My Business' : 'Marketplace',
          tabBarIcon: ({ size, color }) => (
            <ShoppingBag size={size} color={color} />
          ),
        }}
      />

      {/* Admin Settings Tab - Only for admins */}
      {isAdmin && (
        <Tabs.Screen
          name="admin"
          options={{
            title: 'Admin',
            tabBarIcon: ({ size, color }) => (
              <Settings size={size} color={color} />
            ),
          }}
        />
      )}

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ size, color }) => (
            <User size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}