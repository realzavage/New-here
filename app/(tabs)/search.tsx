import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { Search as SearchIcon, Filter } from 'lucide-react-native';
import ProviderCard from '@/components/ProviderCard';
import ProductCard from '@/components/ProductCard';
import { searchServiceProviders, searchProducts } from '@/lib/firestore';
import { ServiceProvider, Product } from '@/lib/firestore';

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (searchQuery.trim().length > 2) {
      performSearch();
    } else {
      setProviders([]);
      setProducts([]);
      setHasSearched(false);
    }
  }, [searchQuery]);

  const performSearch = async () => {
    if (searchQuery.trim().length < 3) return;

    setLoading(true);
    try {
      const [serviceResults, productResults] = await Promise.all([
        searchServiceProviders(searchQuery),
        searchProducts(searchQuery)
      ]);
      
      setProviders(serviceResults);
      setProducts(productResults);
      setHasSearched(true);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalResults = providers.length + products.length;

  const renderResults = () => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#D97706" />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      );
    }

    if (!hasSearched) {
      return (
        <View style={styles.placeholderContainer}>
          <SearchIcon size={64} color="#D1D5DB" />
          <Text style={styles.placeholderTitle}>Find the perfect service</Text>
          <Text style={styles.placeholderSubtitle}>
            Search by service type, provider name, or location
          </Text>
        </View>
      );
    }

    if (totalResults === 0) {
      return (
        <View style={styles.centerContainer}>
          <SearchIcon size={64} color="#D1D5DB" />
          <Text style={styles.noResultsTitle}>No results found</Text>
          <Text style={styles.noResultsSubtitle}>
            Try adjusting your search terms or browse our categories
          </Text>
        </View>
      );
    }

    return (
      <>
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsText}>
            {totalResults} result{totalResults !== 1 ? 's' : ''} found
          </Text>
        </View>

        {/* Service Providers */}
        {providers.length > 0 && (
          <>
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryTitle}>Service Providers</Text>
            </View>
            {providers.map((provider) => (
              <ProviderCard
                key={provider.id}
                provider={{
                  id: provider.id,
                  name: provider.name,
                  category: provider.category,
                  location: provider.location,
                  rating: provider.rating,
                  description: provider.description,
                  imageUrl: provider.imageUrl,
                  reviewCount: provider.reviewCount,
                }}
                onPress={() => {
                  console.log('Pressed provider:', provider.name);
                }}
              />
            ))}
          </>
        )}

        {/* Products */}
        {products.length > 0 && (
          <>
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryTitle}>Products</Text>
            </View>
            {products.map((product) => (
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
                  console.log('Pressed product:', product.name);
                }}
              />
            ))}
          </>
        )}
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Search Services</Text>
        
        {/* Search Input */}
        <View style={styles.searchContainer}>
          <SearchIcon size={20} color="#6B7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for services, providers, or locations..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
          <Filter size={20} color="#6B7280" style={styles.filterIcon} />
        </View>
      </View>

      {/* Results */}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={performSearch}
            colors={['#D97706']}
            tintColor="#D97706"
          />
        }
      >
        {renderResults()}
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
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  filterIcon: {
    marginLeft: 12,
  },
  scrollView: {
    flex: 1,
  },
  resultsHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  resultsText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  categoryHeader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingTop: 80,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
  },
  placeholderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingTop: 80,
  },
  placeholderTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  placeholderSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  noResultsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  noResultsSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  bottomSpacing: {
    height: 20,
  },
});