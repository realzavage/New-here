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
import { Settings, Users, Shield, ChartBar as BarChart3, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle, Circle as XCircle, Eye, MessageSquare, Database } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useRoleBasedAccess } from '@/hooks/useRoleBasedAccess';
import { getAdminStats } from '@/lib/admin';
import { AdminStats } from '@/types/admin';

export default function AdminScreen() {
  const { user } = useAuth();
  const { isAdmin } = useRoleBasedAccess();
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user && isAdmin) {
      loadAdminStats();
    }
  }, [user, isAdmin]);

  const loadAdminStats = async () => {
    try {
      setLoading(true);
      const stats = await getAdminStats();
      setAdminStats(stats);
    } catch (error) {
      console.error('Error loading admin stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadAdminStats();
  };

  const handleUserManagement = () => {
    Alert.alert(
      'User Management',
      'User management interface coming soon!',
      [{ text: 'OK' }]
    );
  };

  const handleContentModeration = () => {
    Alert.alert(
      'Content Moderation',
      'Content moderation tools coming soon!',
      [{ text: 'OK' }]
    );
  };

  const handleSystemSettings = () => {
    Alert.alert(
      'System Settings',
      'System configuration panel coming soon!',
      [{ text: 'OK' }]
    );
  };

  const renderStatCard = (
    title: string,
    value: string | number,
    icon: React.ReactNode,
    color: string = '#D97706',
    status?: 'good' | 'warning' | 'error'
  ) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statHeader}>
        <View style={[styles.statIconContainer, { backgroundColor: `${color}20` }]}>
          {icon}
        </View>
        {status && (
          <View style={styles.statusIndicator}>
            {status === 'good' && <CheckCircle size={16} color="#10B981" />}
            {status === 'warning' && <AlertTriangle size={16} color="#F59E0B" />}
            {status === 'error' && <XCircle size={16} color="#EF4444" />}
          </View>
        )}
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );

  const renderActionCard = (
    title: string,
    description: string,
    icon: React.ReactNode,
    onPress: () => void,
    color: string = '#D97706'
  ) => (
    <TouchableOpacity
      style={styles.actionCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.actionIconContainer, { backgroundColor: `${color}20` }]}>
        {icon}
      </View>
      <View style={styles.actionContent}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionDescription}>{description}</Text>
      </View>
    </TouchableOpacity>
  );

  if (!user || !isAdmin) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Shield size={64} color="#D1D5DB" />
          <Text style={styles.restrictedTitle}>Admin Access Required</Text>
          <Text style={styles.restrictedSubtitle}>
            This section is only available to administrators
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Admin Panel</Text>
        <Text style={styles.subtitle}>
          Platform management and oversight
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
            <Text style={styles.loadingText}>Loading admin data...</Text>
          </View>
        ) : (
          <>
            {/* Platform Stats */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Platform Overview</Text>
              <View style={styles.statsGrid}>
                {adminStats && (
                  <>
                    {renderStatCard(
                      'Total Users',
                      adminStats.totalUsers.toLocaleString(),
                      <Users size={20} color="#3B82F6" />,
                      '#3B82F6',
                      'good'
                    )}
                    {renderStatCard(
                      'Active Listings',
                      adminStats.activeListings.toLocaleString(),
                      <BarChart3 size={20} color="#10B981" />,
                      '#10B981',
                      'good'
                    )}
                    {renderStatCard(
                      'Pending Reviews',
                      adminStats.pendingReviews.toLocaleString(),
                      <Eye size={20} color="#F59E0B" />,
                      '#F59E0B',
                      adminStats.pendingReviews > 10 ? 'warning' : 'good'
                    )}
                    {renderStatCard(
                      'Reported Content',
                      adminStats.reportedContent.toLocaleString(),
                      <AlertTriangle size={20} color="#EF4444" />,
                      '#EF4444',
                      adminStats.reportedContent > 0 ? 'error' : 'good'
                    )}
                  </>
                )}
              </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Management Tools</Text>
              <View style={styles.actionsContainer}>
                {renderActionCard(
                  'User Management',
                  'Manage user accounts, permissions, and verification',
                  <Users size={24} color="#3B82F6" />,
                  handleUserManagement,
                  '#3B82F6'
                )}
                {renderActionCard(
                  'Content Moderation',
                  'Review reported content and manage platform safety',
                  <Shield size={24} color="#EF4444" />,
                  handleContentModeration,
                  '#EF4444'
                )}
                {renderActionCard(
                  'System Settings',
                  'Configure platform settings and features',
                  <Settings size={24} color="#6B7280" />,
                  handleSystemSettings,
                  '#6B7280'
                )}
                {renderActionCard(
                  'Analytics Dashboard',
                  'View detailed platform analytics and insights',
                  <BarChart3 size={24} color="#10B981" />,
                  () => {}, // Analytics is already available in the analytics tab
                  '#10B981'
                )}
              </View>
            </View>

            {/* Recent Activity */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              <View style={styles.activityContainer}>
                {adminStats?.recentActivity.map((activity, index) => (
                  <View key={index} style={styles.activityItem}>
                    <View style={styles.activityIcon}>
                      <MessageSquare size={16} color="#6B7280" />
                    </View>
                    <View style={styles.activityContent}>
                      <Text style={styles.activityText}>{activity.description}</Text>
                      <Text style={styles.activityTime}>{activity.time}</Text>
                    </View>
                    <View style={[
                      styles.activityStatus,
                      { backgroundColor: activity.type === 'warning' ? '#FEF3C7' : '#ECFDF5' }
                    ]}>
                      <Text style={[
                        styles.activityStatusText,
                        { color: activity.type === 'warning' ? '#92400E' : '#065F46' }
                      ]}>
                        {activity.type}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* System Health */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>System Health</Text>
              <View style={styles.healthContainer}>
                <View style={styles.healthItem}>
                  <Database size={20} color="#10B981" />
                  <Text style={styles.healthLabel}>Database</Text>
                  <View style={styles.healthStatus}>
                    <View style={[styles.healthDot, { backgroundColor: '#10B981' }]} />
                    <Text style={styles.healthText}>Healthy</Text>
                  </View>
                </View>
                <View style={styles.healthItem}>
                  <Shield size={20} color="#10B981" />
                  <Text style={styles.healthLabel}>Security</Text>
                  <View style={styles.healthStatus}>
                    <View style={[styles.healthDot, { backgroundColor: '#10B981' }]} />
                    <Text style={styles.healthText}>Secure</Text>
                  </View>
                </View>
                <View style={styles.healthItem}>
                  <BarChart3 size={20} color="#F59E0B" />
                  <Text style={styles.healthLabel}>Performance</Text>
                  <View style={styles.healthStatus}>
                    <View style={[styles.healthDot, { backgroundColor: '#F59E0B' }]} />
                    <Text style={styles.healthText}>Good</Text>
                  </View>
                </View>
              </View>
            </View>
          </>
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    margin: 8,
    width: '45%',
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusIndicator: {
    padding: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  actionsContainer: {
    gap: 12,
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
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
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  activityContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  activityStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activityStatusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  healthContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  healthItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  healthLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 12,
    flex: 1,
  },
  healthStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  healthDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  healthText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
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
  restrictedTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  restrictedSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  bottomSpacing: {
    height: 20,
  },
});