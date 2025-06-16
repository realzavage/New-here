import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { ShoppingBag, Wrench, Hammer, ChefHat, Scissors, Droplets, Zap, Paintbrush, MoveHorizontal as MoreHorizontal, LogIn, ChevronRight, User, Database, MessageCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

interface CustomDrawerProps {
  onClose: () => void;
}

export default function CustomDrawer({ onClose }: CustomDrawerProps) {
  const router = useRouter();
  const { user } = useAuth();

  const serviceCategories = [
    { name: 'Construction', icon: Wrench, route: '/services/construction' },
    { name: 'Carpentry', icon: Hammer, route: '/services/carpentry' },
    { name: 'Bakery', icon: ChefHat, route: '/services/bakery' },
    { name: 'Tailoring', icon: Scissors, route: '/services/tailoring' },
    { name: 'Plumbing', icon: Droplets, route: '/services/plumbing' },
    { name: 'Electrical', icon: Zap, route: '/services/electrical' },
    { name: 'Painting', icon: Paintbrush, route: '/services/painting' },
    { name: 'Other Services', icon: MoreHorizontal, route: '/services/other' },
  ];

  const handleNavigation = (route: string) => {
    onClose();
    router.push(route as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.appName}>Lumo</Text>
          <Text style={styles.tagline}>Your Local Marketplace</Text>
          {user && (
            <View style={styles.userInfo}>
              <User size={16} color="#92400E" />
              <Text style={styles.userName}>{user.fullName}</Text>
            </View>
          )}
        </View>

        {/* Buy & Sell Section */}
        <TouchableOpacity 
          style={styles.mainMenuItem}
          onPress={() => handleNavigation('/buy-sell')}
          activeOpacity={0.7}
        >
          <View style={styles.menuItemContent}>
            <ShoppingBag size={24} color="#D97706" />
            <Text style={styles.mainMenuText}>Buy & Sell</Text>
          </View>
          <ChevronRight size={20} color="#9CA3AF" />
        </TouchableOpacity>

        {/* Messages Section */}
        {user && (
          <TouchableOpacity 
            style={styles.mainMenuItem}
            onPress={() => handleNavigation('/messages')}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemContent}>
              <MessageCircle size={24} color="#D97706" />
              <Text style={styles.mainMenuText}>Messages</Text>
            </View>
            <ChevronRight size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}

        {/* Service Providers Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Providers</Text>
          {serviceCategories.map((category, index) => (
            <TouchableOpacity
              key={index}
              style={styles.subMenuItem}
              onPress={() => handleNavigation(category.route)}
              activeOpacity={0.7}
            >
              <View style={styles.subMenuItemContent}>
                <category.icon size={20} color="#6B7280" />
                <Text style={styles.subMenuText}>{category.name}</Text>
              </View>
              <ChevronRight size={16} color="#D1D5DB" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Test Data Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Development</Text>
          <TouchableOpacity
            style={styles.subMenuItem}
            onPress={() => handleNavigation('/test-data')}
            activeOpacity={0.7}
          >
            <View style={styles.subMenuItemContent}>
              <Database size={20} color="#6B7280" />
              <Text style={styles.subMenuText}>Add Test Data</Text>
            </View>
            <ChevronRight size={16} color="#D1D5DB" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Auth Section */}
      <View style={styles.authSection}>
        {user ? (
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => {
              onClose();
              router.push('/(tabs)/profile');
            }}
            activeOpacity={0.8}
          >
            <User size={20} color="#D97706" />
            <Text style={styles.profileButtonText}>View Profile</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.authButton}
            onPress={() => handleNavigation('/auth/signup')}
            activeOpacity={0.8}
          >
            <LogIn size={20} color="#FFFFFF" />
            <Text style={styles.authButtonText}>Sign Up / Log In</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#FEF3C7',
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#D97706',
    marginBottom: 4,
  },
  tagline: {
    fontSize: 14,
    color: '#92400E',
    fontWeight: '500',
    marginBottom: 8,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  userName: {
    fontSize: 14,
    color: '#92400E',
    fontWeight: '600',
    marginLeft: 6,
  },
  mainMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mainMenuText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 16,
  },
  section: {
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
  subMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  subMenuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subMenuText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#374151',
    marginLeft: 12,
  },
  authSection: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  authButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D97706',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  authButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF3C7',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D97706',
  },
  profileButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D97706',
    marginLeft: 8,
  },
});