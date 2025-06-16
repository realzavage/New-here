import {
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  startAfter,
  endBefore
} from 'firebase/firestore';
import { db } from './firebase';
import { AnalyticsData, TimeRange, ChartDataPoint, ActivityItem } from '@/types/analytics';

// Get analytics data for a user or admin
export const getAnalyticsData = async (
  userId: string,
  timeRange: TimeRange
): Promise<AnalyticsData> => {
  try {
    const endDate = new Date();
    const startDate = getStartDate(timeRange);
    
    // Get user data to determine if admin
    const userDoc = await getDoc(doc(db, 'users', userId));
    const userData = userDoc.data();
    const isAdmin = userData?.userType === 'admin';
    
    // Get metrics based on user type
    if (isAdmin) {
      return await getAdminAnalytics(startDate, endDate, timeRange);
    } else {
      return await getBusinessAnalytics(userId, startDate, endDate, timeRange);
    }
  } catch (error) {
    console.error('Error getting analytics data:', error);
    throw error;
  }
};

// Get analytics for business users
const getBusinessAnalytics = async (
  userId: string,
  startDate: Date,
  endDate: Date,
  timeRange: TimeRange
): Promise<AnalyticsData> => {
  // Get user's products and services
  const [productsSnapshot, servicesSnapshot] = await Promise.all([
    getDocs(query(collection(db, 'products'), where('ownerId', '==', userId))),
    getDocs(query(collection(db, 'services'), where('providerId', '==', userId)))
  ]);
  
  const userItemIds = [
    ...productsSnapshot.docs.map(doc => doc.id),
    ...servicesSnapshot.docs.map(doc => doc.id)
  ];
  
  // Calculate metrics
  const totalViews = calculateTotalViews(productsSnapshot.docs, servicesSnapshot.docs);
  const totalInquiries = await calculateInquiries(userItemIds, startDate, endDate);
  const totalFavorites = await calculateFavorites(userItemIds, startDate, endDate);
  const averageRating = calculateAverageRating(productsSnapshot.docs, servicesSnapshot.docs);
  const activeListings = productsSnapshot.docs.filter(doc => doc.data().isAvailable).length +
                        servicesSnapshot.docs.filter(doc => doc.data().isActive).length;
  
  // Generate chart data
  const chartData = await generateChartData(userItemIds, startDate, endDate, timeRange);
  
  // Get recent activity
  const recentActivity = await getRecentActivity(userItemIds, 10);
  
  return {
    totalViews,
    viewsChange: 12, // Mock data - would calculate from historical data
    totalInquiries,
    inquiriesChange: 8,
    totalFavorites,
    favoritesChange: 15,
    averageRating,
    ratingChange: 0.2,
    activeListings,
    responseRate: 85, // Mock data
    responseRateChange: 5,
    totalUsers: 0, // Not applicable for business users
    usersChange: 0,
    newSignups: 0,
    signupsChange: 0,
    chartData,
    recentActivity
  };
};

// Get analytics for admin users
const getAdminAnalytics = async (
  startDate: Date,
  endDate: Date,
  timeRange: TimeRange
): Promise<AnalyticsData> => {
  // Get all platform data
  const [usersSnapshot, productsSnapshot, servicesSnapshot] = await Promise.all([
    getDocs(collection(db, 'users')),
    getDocs(collection(db, 'products')),
    getDocs(collection(db, 'services'))
  ]);
  
  const allItemIds = [
    ...productsSnapshot.docs.map(doc => doc.id),
    ...servicesSnapshot.docs.map(doc => doc.id)
  ];
  
  // Calculate platform metrics
  const totalUsers = usersSnapshot.size;
  const newSignups = usersSnapshot.docs.filter(doc => {
    const createdAt = doc.data().createdAt?.toDate();
    return createdAt && createdAt >= startDate && createdAt <= endDate;
  }).length;
  
  const totalViews = calculateTotalViews(productsSnapshot.docs, servicesSnapshot.docs);
  const totalInquiries = await calculateInquiries(allItemIds, startDate, endDate);
  const totalFavorites = await calculateFavorites(allItemIds, startDate, endDate);
  const averageRating = calculateAverageRating(productsSnapshot.docs, servicesSnapshot.docs);
  
  // Generate chart data
  const chartData = await generateChartData(allItemIds, startDate, endDate, timeRange);
  
  // Get recent activity
  const recentActivity = await getRecentActivity(allItemIds, 10);
  
  return {
    totalViews,
    viewsChange: 18,
    totalInquiries,
    inquiriesChange: 12,
    totalFavorites,
    favoritesChange: 22,
    averageRating,
    ratingChange: 0.1,
    activeListings: productsSnapshot.docs.filter(doc => doc.data().isAvailable).length +
                   servicesSnapshot.docs.filter(doc => doc.data().isActive).length,
    responseRate: 78, // Platform average
    responseRateChange: 3,
    totalUsers,
    usersChange: 25,
    newSignups,
    signupsChange: 15,
    chartData,
    recentActivity
  };
};

// Helper functions
const getStartDate = (timeRange: TimeRange): Date => {
  const now = new Date();
  switch (timeRange) {
    case '7d':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case '30d':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case '90d':
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    case '1y':
      return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    default:
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
};

const calculateTotalViews = (productDocs: any[], serviceDocs: any[]): number => {
  const productViews = productDocs.reduce((sum, doc) => sum + (doc.data().metrics?.views || 0), 0);
  const serviceViews = serviceDocs.reduce((sum, doc) => sum + (doc.data().metrics?.views || 0), 0);
  return productViews + serviceViews;
};

const calculateInquiries = async (itemIds: string[], startDate: Date, endDate: Date): Promise<number> => {
  if (itemIds.length === 0) return 0;
  
  try {
    // This would query conversations related to the items
    // For now, return mock data
    return Math.floor(Math.random() * 50) + 10;
  } catch (error) {
    console.error('Error calculating inquiries:', error);
    return 0;
  }
};

const calculateFavorites = async (itemIds: string[], startDate: Date, endDate: Date): Promise<number> => {
  if (itemIds.length === 0) return 0;
  
  try {
    // This would query favorites for the items
    // For now, return mock data
    return Math.floor(Math.random() * 30) + 5;
  } catch (error) {
    console.error('Error calculating favorites:', error);
    return 0;
  }
};

const calculateAverageRating = (productDocs: any[], serviceDocs: any[]): number => {
  const allRatings = [
    ...productDocs.map(doc => doc.data().seller?.rating || 0),
    ...serviceDocs.map(doc => doc.data().provider?.rating || 0)
  ].filter(rating => rating > 0);
  
  if (allRatings.length === 0) return 0;
  
  const sum = allRatings.reduce((acc, rating) => acc + rating, 0);
  return sum / allRatings.length;
};

const generateChartData = async (
  itemIds: string[],
  startDate: Date,
  endDate: Date,
  timeRange: TimeRange
): Promise<ChartDataPoint[]> => {
  // Generate mock chart data based on time range
  const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
  const interval = days <= 7 ? 1 : days <= 30 ? 7 : days <= 90 ? 30 : 90;
  
  const chartData: ChartDataPoint[] = [];
  const now = new Date();
  
  for (let i = days; i >= 0; i -= interval) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const label = days <= 7 ? 
      date.toLocaleDateString([], { weekday: 'short' }) :
      days <= 30 ?
      date.toLocaleDateString([], { month: 'short', day: 'numeric' }) :
      date.toLocaleDateString([], { month: 'short' });
    
    chartData.push({
      label,
      value: Math.floor(Math.random() * 100) + 20,
      date: date.toISOString()
    });
  }
  
  return chartData;
};

const getRecentActivity = async (itemIds: string[], limit: number): Promise<ActivityItem[]> => {
  // Generate mock recent activity
  const activities: ActivityItem[] = [
    {
      description: 'New inquiry received for Traditional Dress',
      time: '2 hours ago',
      type: 'inquiry'
    },
    {
      description: 'Product added to favorites',
      time: '4 hours ago',
      type: 'favorite'
    },
    {
      description: 'Service listing viewed 15 times',
      time: '6 hours ago',
      type: 'view'
    },
    {
      description: 'New customer signed up',
      time: '1 day ago',
      type: 'signup'
    },
    {
      description: 'Dining table listing updated',
      time: '2 days ago',
      type: 'listing'
    }
  ];
  
  return activities.slice(0, limit);
};