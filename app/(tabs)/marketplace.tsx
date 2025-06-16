import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import { ShoppingBag, Plus, TrendingUp, Users, Star, MessageCircle, Settings, ChartBar as BarChart3 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useRoleBasedAccess } from '@/hooks/useRoleBasedAccess';
import { getProducts, getServiceProviders } from '@/lib/firestore';
import { Product, ServiceProvider } from '@/lib/firestore';
import ProductCard from '@/components/ProductCard';
import ProviderCard from '@/components/ProviderCard';

export default function MarketplaceScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { isBusiness, isAdmin } = useRoleBasedAccess();
  const [userProducts, setUserProducts] = useState<Product[]>([]);
  const [userServices, setUserServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      if (isBusiness) {
        // Load user's products and services
        const [products, services] = await Promise.all([
          getProducts(),
          getServiceProviders()
        ]);
        
        // Filter by user's items (in a real app, you'd have proper user filtering)
        setUserProducts(products.slice(0, 3)); // Mock user products
        setUserServices(services.slice(0, 2)); // Mock user services
      } else {
        // For individual users, show general marketplace
        const products = await getProducts();
        setUserProducts(products.slice(0, 5));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadUserData();
  };

  const handleAddProduct = () => {
    Alert.alert(
      'Add Product',
      'Product creation feature coming soon!',
      [{ text: 'OK' }]
    );
  };

  const handleAddService = () => {
    Alert.alert(
      'Add Service',
      'Service creation feature coming soon!',
      [{ text: 'OK' }]
    );
  };

  const renderBusinessDashboard = () => (
    <>
      {/* Business Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Business Overview</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <TrendingUp size={24} color="#10B981" />
            </View>
            <Text style={styles.statValue}>4.8</Text>
            <Text style={styles.statLabel}>Avg Rating</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <MessageCircle size={24} color="#3B82F6" />
            </View>
            <Text style={styles.statValue}>23</Text>
            <Text style={styles.statLabel}>Inquiries</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Users size={24} color="#F59E0B" />
            </View>
            <Text style={styles.statValue}>156</Text>
            <Text style={styles.statLabel}>Views</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={handleAddProduct}>
            <Plus size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Add Product</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleAddService}>
            <Plus size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Add Service</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* My Services */}
      {userServices.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Services</Text>
            <TouchableOpacity onPress={() => {}}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          {userServices.map((service) => {
            const provider = {
              id: service.serviceId,
              name: service.name,
              category: service.category,
              location: service.location,
              rating: service.provider?.rating || 0,
              description: service.description,
              imageUrl: service.imageUrl,
              reviewCount: service.provider?.totalReviews || 0,
            };

            return (
              <ProviderCard
                key={service.serviceId}
                provider={provider}
                onPress={() => {
                  console.log('Edit service:', service.name);
                }}
              />
            );
          })}
        </View>
      )}

      {/* My Products */}
      {userProducts.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Products</Text>
            <TouchableOpacity onPress={() => {}}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          {userProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={{
                id: product.id,
                name: product.name,
                price: product.price,
                category: product.category,
                location: product.location,
                description: product.description,
                imageUrl: product.imageUrl,
                seller: product.seller,
                condition: product.condition,
              }}
              onPress={() => {
                console.log('Edit product:', product.name);
              }}
            />
          ))}
        </View>
      )}
    </>
  );

  const renderIndividualMarketplace = () => (
    <>
      {/* Browse Categories */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Browse Marketplace</Text>
        <View style={styles.categoriesContainer}>
          <TouchableOpacity 
            style={styles.categoryCard}
            onPress={() => router.push('/buy-sell')}
          >
            <ShoppingBag size={32} color="#D97706" />
            <Text style={styles.categoryTitle}>Buy & Sell</Text>
            <Text style={styles.categorySubtitle}>Find great deals</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.categoryCard}
            onPress={() => router.push('/services/construction')}
          >
            <Settings size={32} color="#3B82F6" />
            <Text style={styles.categoryTitle}>Services</Text>
            <Text style={styles.categorySubtitle}>Find professionals</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Featured Products */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Products</Text>
          <TouchableOpacity onPress={() => router.push('/buy-sell')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        {userProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={{
              id: product.id,
              name: product.name,
              price: product.price,
              category: product.category,
              location: product.location,
              description: product.description,
              imageUrl: product.imageUrl,
              seller: product.seller,
              condition: product.condition,
            }}
            onPress={() => {
              console.log('View product:', product.name);
            }}
          />
        ))}
      </View>
    </>
  );

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ShoppingBag size={64} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>Welcome to Lumo</Text>
          <Text style={styles.emptySubtitle}>
            Sign in to access your marketplace
          </Text>
          <TouchableOpacity
            style={styles.signInButton}
            onPress={() => router.push('/auth/login')}
          >
            <Text style={styles.signInButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>
          {isBusiness ? 'My Business' : 'Marketplace'}
        </Text>
        <Text style={styles.subtitle}>
          {isBusiness 
            ? 'Manage your products and services' 
            : 'Discover local products and services'
          }
        </Text>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#D97706']}
            tintColor="#D97706"
          />
        }
      >
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#D97706" />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        ) : isBusiness ? (
          renderBusinessDashboard()
        ) : (
          renderIndividualMarketplace()
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D97706',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D97706',
    paddingVertical: 14,
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
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  categoriesContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  categoryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 12,
    marginBottom: 4,
  },
  categorySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 80,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  signInButton: {
    backgroundColor: '#D97706',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  signInButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  bottomSpacing: {
    height: 20,
  },
});