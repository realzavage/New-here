import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { ArrowLeft, Database, Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { addSampleData } from '@/lib/firestore';

export default function TestDataScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleAddSampleData = async () => {
    Alert.alert(
      'Add Sample Data',
      'This will add sample service providers and products to your Firestore database. Continue?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Add Data',
          onPress: async () => {
            setLoading(true);
            try {
              await addSampleData();
              Alert.alert(
                'Success!',
                'Sample data has been added to your database. You can now see service providers and products in the app.',
                [
                  {
                    text: 'OK',
                    onPress: () => router.push('/(tabs)'),
                  },
                ]
              );
            } catch (error) {
              Alert.alert('Error', 'Failed to add sample data. Please check your Firebase configuration.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
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
        <Text style={styles.title}>Test Data</Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Database size={64} color="#D97706" />
          </View>

          <Text style={styles.mainTitle}>Add Sample Data</Text>
          <Text style={styles.subtitle}>
            Add sample service providers and products to test the app functionality
          </Text>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>What will be added:</Text>
            <Text style={styles.infoItem}>• 3 Sample service providers (Tailor, Carpenter, Hair Stylist)</Text>
            <Text style={styles.infoItem}>• 2 Sample products (Traditional dress, Dining table)</Text>
            <Text style={styles.infoItem}>• Realistic ratings and review counts</Text>
            <Text style={styles.infoItem}>• High-quality placeholder images</Text>
          </View>

          <TouchableOpacity
            style={[styles.addButton, loading && styles.addButtonDisabled]}
            onPress={handleAddSampleData}
            activeOpacity={0.8}
            disabled={loading}
          >
            <Plus size={20} color="#FFFFFF" />
            <Text style={styles.addButtonText}>
              {loading ? 'Adding Sample Data...' : 'Add Sample Data'}
            </Text>
          </TouchableOpacity>

          <View style={styles.noteBox}>
            <Text style={styles.noteTitle}>Note:</Text>
            <Text style={styles.noteText}>
              Make sure your Firebase project is properly configured and the Firestore database is set up with the correct security rules.
            </Text>
          </View>
        </View>
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
  content: {
    padding: 24,
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  infoBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    width: '100%',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  infoItem: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 6,
    lineHeight: 20,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D97706',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  addButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  noteBox: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F59E0B',
    width: '100%',
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 6,
  },
  noteText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
});