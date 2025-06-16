// Analytics Types for Lumo Marketplace

export type TimeRange = '7d' | '30d' | '90d' | '1y';

export interface AnalyticsData {
  // Key metrics
  totalViews: number;
  viewsChange: number;
  totalInquiries: number;
  inquiriesChange: number;
  totalFavorites: number;
  favoritesChange: number;
  averageRating: number;
  ratingChange: number;
  
  // Business metrics
  activeListings: number;
  responseRate: number;
  responseRateChange: number;
  
  // Admin metrics
  totalUsers: number;
  usersChange: number;
  newSignups: number;
  signupsChange: number;
  
  // Chart data
  chartData: ChartDataPoint[];
  
  // Recent activity
  recentActivity: ActivityItem[];
}

export interface ChartDataPoint {
  label: string;
  value: number;
  date: string;
}

export interface ActivityItem {
  description: string;
  time: string;
  type: 'view' | 'inquiry' | 'favorite' | 'signup' | 'listing';
}

export interface MetricCard {
  title: string;
  value: string | number;
  change?: number;
  icon: string;
  color: string;
}

export interface AnalyticsFilters {
  timeRange: TimeRange;
  category?: string;
  location?: string;
  userType?: 'individual' | 'business';
}