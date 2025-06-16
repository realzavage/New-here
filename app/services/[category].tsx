import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import ProviderCard from '@/components/ProviderCard';
import { getServiceProviders } from '@/lib/firestore';
import { Service } from '@/types/database';
import { ServiceProvider } from '@/types/provider';

export default function ServiceCategoryScreen() {
  const router = useRouter();
  const { category } = useLocalSearchParams();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const categoryMap: { [key: string]: string } = {
    construction: 'Construction',
    carpentry: 'Carpenter',
    bakery: 'Bakery',
    tailoring: 'Tailor',
    plumbing: 'Plumber',
    electrical: 'Electrician',
    painting: 'Painter',
    other: 'Other',
  };

  const categoryName = categoryMap[category as string] || 'Services';

  useEffect(() => {
    loadServiceProviders();
  }, [category]);

  const loadServiceProviders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get all service providers and filter by category
      const allServices = await getServiceProviders();
      
      let filteredServices: Service[];
      if (category === 'other') {
        // For "other", show providers that don't match the main categories
        const mainCategories = Object.values(categoryMap).slice(0, -1).map(cat => cat.toLowerCase());
        filteredServices = allServices.filter(service => 
          !mainCategories.some(cat => service.category.toLowerCase().includes(cat))
        );
      } else {
        // Filter by specific category
        filteredServices = allServices.filter(service => 
          service.category.toLowerCase().includes(categoryName.toLowerCase())
        );
      }
      
      setServices(filteredServices);
    } catch (err) {
      console.error('Error loading service providers:', err);
      setError('Failed to load service providers');
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#D97706" />
          <Text style={styles.loadingText}>Loading {categoryName.toLowerCase()} services...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadServiceProviders}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (services.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No providers found</Text>
          <Text style={styles.emptySubtitle}>
            We don't have any {categoryName.toLowerCase()} service providers yet.
          </Text>
        </View>
      );
    }

    return (
      <>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{categoryName} Services</Text>
          <Text style={styles.sectionSubtitle}>
            {services.length} provider{services.length !== 1 ? 's' : ''} found
          </Text>
        </View>

        {services.map((service) => {
          // Map Service to ServiceProvider interface for ProviderCard
          const provider: ServiceProvider = {
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
                console.log('Pressed provider:', service.name);
              }}
            />
          );
        })}
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.title}>{categoryName}</Text>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadServiceProviders}
            colors={['#D97706']}
            tintColor="#D97706"
          />
        }
      >
        {renderContent()}
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
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  scrollView: {
    flex: 1,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 22,
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
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#D97706',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  bottomSpacing: {
    height: 20,
  },
});