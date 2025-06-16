import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, Modal, ActivityIndicator, RefreshControl } from 'react-native';
import { MapPin, Menu } from 'lucide-react-native';
import ProviderCard from '@/components/ProviderCard';
import CustomDrawer from '@/components/CustomDrawer';
import { getServiceProviders } from '@/lib/firestore';
import { Service } from '@/types/database';
import { ServiceProvider } from '@/types/provider';

export default function HomeScreen() {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadServiceProviders();
  }, []);

  const loadServiceProviders = async () => {
    try {
      setLoading(true);
      setError(null);
      const serviceProviders = await getServiceProviders();
      setServices(serviceProviders);
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
          <Text style={styles.loadingText}>Loading service providers...</Text>
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
        <View style={styles.centerContainer}>
          <Text style={styles.emptyTitle}>No Service Providers</Text>
          <Text style={styles.emptySubtitle}>
            Be the first to add your service to Lumo!
          </Text>
        </View>
      );
    }

    return (
      <>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Service Providers</Text>
          <Text style={styles.sectionSubtitle}>
            Discover trusted professionals in your area
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
          style={styles.menuButton}
          onPress={() => setDrawerVisible(true)}
          activeOpacity={0.7}
        >
          <Menu size={24} color="#1F2937" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.title}>Lumo</Text>
          <View style={styles.locationContainer}>
            <MapPin size={16} color="#6B7280" />
            <Text style={styles.locationText}>The Gambia</Text>
          </View>
        </View>
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

      {/* Drawer Modal */}
      <Modal
        visible={drawerVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setDrawerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackground}
            activeOpacity={1}
            onPress={() => setDrawerVisible(false)}
          />
          <View style={styles.drawerContainer}>
            <CustomDrawer onClose={() => setDrawerVisible(false)} />
          </View>
        </View>
      </Modal>
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
  menuButton: {
    padding: 8,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#D97706',
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
    fontWeight: '500',
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
  modalOverlay: {
    flex: 1,
    flexDirection: 'row',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawerContainer: {
    width: '80%',
    maxWidth: 320,
  },
});