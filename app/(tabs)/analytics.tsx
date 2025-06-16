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
  Dimensions
} from 'react-native';
import { ChartBar as BarChart3, TrendingUp, Users, ShoppingBag, MessageCircle, Star, Calendar, DollarSign, Eye, Heart, Phone } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useRoleBasedAccess } from '@/hooks/useRoleBasedAccess';
import { getAnalyticsData } from '@/lib/analytics';
import { AnalyticsData, TimeRange } from '@/types/analytics';

const { width } = Dimensions.get('window');

export default function AnalyticsScreen() {
  const { user } = useAuth();
  const { isBusiness, isAdmin } = useRoleBasedAccess();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('30d');

  useEffect(() => {
    if (user && (isBusiness || isAdmin)) {
      loadAnalyticsData();
    }
  }, [user, selectedTimeRange]);

  const loadAnalyticsData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await getAnalyticsData(user.userId, selectedTimeRange);
      setAnalyticsData(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadAnalyticsData();
  };

  const timeRanges: { label: string; value: TimeRange }[] = [
    { label: '7 Days', value: '7d' },
    { label: '30 Days', value: '30d' },
    { label: '90 Days', value: '90d' },
    { label: '1 Year', value: '1y' }
  ];

  const renderMetricCard = (
    title: string,
    value: string | number,
    icon: React.ReactNode,
    change?: number,
    color: string = '#D97706'
  ) => (
    <View style={[styles.metricCard, { borderLeftColor: color }]}>
      <View style={styles.metricHeader}>
        <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
          {icon}
        </View>
        <Text style={styles.metricTitle}>{title}</Text>
      </View>
      <Text style={styles.metricValue}>{value}</Text>
      {change !== undefined && (
        <View style={styles.changeContainer}>
          <TrendingUp 
            size={14} 
            color={change >= 0 ? '#10B981' : '#EF4444'} 
          />
          <Text style={[
            styles.changeText,
            { color: change >= 0 ? '#10B981' : '#EF4444' }
          ]}>
            {change >= 0 ? '+' : ''}{change}%
          </Text>
        </View>
      )}
    </View>
  );

  const renderChart = () => {
    if (!analyticsData?.chartData) return null;

    const maxValue = Math.max(...analyticsData.chartData.map(d => d.value));
    const chartHeight = 200;

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Performance Overview</Text>
        <View style={styles.chart}>
          {analyticsData.chartData.map((item, index) => {
            const barHeight = (item.value / maxValue) * (chartHeight - 40);
            return (
              <View key={index} style={styles.chartBar}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: barHeight,
                      backgroundColor: '#D97706'
                    }
                  ]}
                />
                <Text style={styles.chartLabel}>{item.label}</Text>
                <Text style={styles.chartValue}>{item.value}</Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  if (!user || (!isBusiness && !isAdmin)) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <BarChart3 size={64} color="#D1D5DB" />
          <Text style={styles.restrictedTitle}>Access Restricted</Text>
          <Text style={styles.restrictedSubtitle}>
            Analytics are only available for business accounts and administrators
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loading && !analyticsData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#D97706" />
          <Text style={styles.loadingText}>Loading analytics...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Analytics</Text>
        <Text style={styles.subtitle}>
          {isAdmin ? 'Platform Overview' : 'Business Insights'}
        </Text>
      </View>

      {/* Time Range Selector */}
      <View style={styles.timeRangeContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {timeRanges.map((range) => (
            <TouchableOpacity
              key={range.value}
              style={[
                styles.timeRangeButton,
                selectedTimeRange === range.value && styles.timeRangeButtonActive
              ]}
              onPress={() => setSelectedTimeRange(range.value)}
            >
              <Text style={[
                styles.timeRangeText,
                selectedTimeRange === range.value && styles.timeRangeTextActive
              ]}>
                {range.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
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
        {analyticsData ? (
          <>
            {/* Key Metrics */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Key Metrics</Text>
              <View style={styles.metricsGrid}>
                {renderMetricCard(
                  'Total Views',
                  analyticsData.totalViews.toLocaleString(),
                  <Eye size={20} color="#D97706" />,
                  analyticsData.viewsChange,
                  '#D97706'
                )}
                {renderMetricCard(
                  'Inquiries',
                  analyticsData.totalInquiries.toLocaleString(),
                  <MessageCircle size={20} color="#3B82F6" />,
                  analyticsData.inquiriesChange,
                  '#3B82F6'
                )}
                {renderMetricCard(
                  'Favorites',
                  analyticsData.totalFavorites.toLocaleString(),
                  <Heart size={20} color="#EF4444" />,
                  analyticsData.favoritesChange,
                  '#EF4444'
                )}
                {renderMetricCard(
                  'Avg. Rating',
                  analyticsData.averageRating.toFixed(1),
                  <Star size={20} color="#F59E0B" />,
                  analyticsData.ratingChange,
                  '#F59E0B'
                )}
              </View>
            </View>

            {/* Chart */}
            {renderChart()}

            {/* Business Metrics */}
            {isBusiness && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Business Performance</Text>
                <View style={styles.metricsGrid}>
                  {renderMetricCard(
                    'Active Listings',
                    analyticsData.activeListings.toLocaleString(),
                    <ShoppingBag size={20} color="#059669" />,
                    undefined,
                    '#059669'
                  )}
                  {renderMetricCard(
                    'Response Rate',
                    `${analyticsData.responseRate}%`,
                    <Phone size={20} color="#7C3AED" />,
                    analyticsData.responseRateChange,
                    '#7C3AED'
                  )}
                </View>
              </View>
            )}

            {/* Admin Metrics */}
            {isAdmin && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Platform Statistics</Text>
                <View style={styles.metricsGrid}>
                  {renderMetricCard(
                    'Total Users',
                    analyticsData.totalUsers.toLocaleString(),
                    <Users size={20} color="#059669" />,
                    analyticsData.usersChange,
                    '#059669'
                  )}
                  {renderMetricCard(
                    'New Signups',
                    analyticsData.newSignups.toLocaleString(),
                    <TrendingUp size={20} color="#7C3AED" />,
                    analyticsData.signupsChange,
                    '#7C3AED'
                  )}
                </View>
              </View>
            )}

            {/* Recent Activity */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              <View style={styles.activityContainer}>
                {analyticsData.recentActivity.map((activity, index) => (
                  <View key={index} style={styles.activityItem}>
                    <View style={styles.activityIcon}>
                      <Calendar size={16} color="#6B7280" />
                    </View>
                    <View style={styles.activityContent}>
                      <Text style={styles.activityText}>{activity.description}</Text>
                      <Text style={styles.activityTime}>{activity.time}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </>
        ) : (
          <View style={styles.centerContainer}>
            <BarChart3 size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No Data Available</Text>
            <Text style={styles.emptySubtitle}>
              Analytics data will appear here once you have activity
            </Text>
          </View>
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
  timeRangeContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  timeRangeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 12,
  },
  timeRangeButtonActive: {
    backgroundColor: '#D97706',
  },
  timeRangeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  timeRangeTextActive: {
    color: '#FFFFFF',
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
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  metricCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    margin: 8,
    width: (width - 64) / 2,
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
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  metricTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    flex: 1,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 8,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  chartContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 200,
  },
  chartBar: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    width: 20,
    borderRadius: 4,
    marginBottom: 8,
  },
  chartLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  chartValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
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
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 16,
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