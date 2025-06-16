import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { AdminStats, AdminActivity } from '@/types/admin';

// Get admin statistics
export const getAdminStats = async (): Promise<AdminStats> => {
  try {
    // Get all collections data
    const [usersSnapshot, productsSnapshot, servicesSnapshot] = await Promise.all([
      getDocs(collection(db, 'users')),
      getDocs(collection(db, 'products')),
      getDocs(collection(db, 'services'))
    ]);

    // Calculate stats
    const totalUsers = usersSnapshot.size;
    const activeProducts = productsSnapshot.docs.filter(doc => doc.data().isAvailable).length;
    const activeServices = servicesSnapshot.docs.filter(doc => doc.data().isActive).length;
    const activeListings = activeProducts + activeServices;

    // Mock data for pending reviews and reported content
    const pendingReviews = Math.floor(Math.random() * 15) + 5;
    const reportedContent = Math.floor(Math.random() * 8);

    // Generate recent activity
    const recentActivity: AdminActivity[] = [
      {
        description: 'New business account registered',
        time: '2 hours ago',
        type: 'info'
      },
      {
        description: 'Product listing reported for inappropriate content',
        time: '4 hours ago',
        type: 'warning'
      },
      {
        description: 'Service provider verification completed',
        time: '6 hours ago',
        type: 'info'
      },
      {
        description: 'Multiple failed login attempts detected',
        time: '8 hours ago',
        type: 'warning'
      },
      {
        description: 'Database backup completed successfully',
        time: '12 hours ago',
        type: 'info'
      }
    ];

    return {
      totalUsers,
      activeListings,
      pendingReviews,
      reportedContent,
      recentActivity
    };
  } catch (error) {
    console.error('Error getting admin stats:', error);
    throw error;
  }
};

// Get users for management
export const getUsers = async (limit: number = 50) => {
  try {
    const q = query(
      collection(db, 'users'),
      orderBy('createdAt', 'desc'),
      limit(limit)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      userId: doc.id,
      ...doc.data(),
      createdAt: (doc.data().createdAt as Timestamp)?.toDate() || new Date(),
      updatedAt: (doc.data().updatedAt as Timestamp)?.toDate() || new Date()
    }));
  } catch (error) {
    console.error('Error getting users:', error);
    return [];
  }
};

// Get reported content
export const getReportedContent = async () => {
  try {
    // This would query a reports collection in a real implementation
    // For now, return mock data
    return [
      {
        itemId: 'product_123',
        itemType: 'product' as const,
        reportReason: 'Inappropriate content',
        reportedBy: 'user_456',
        reportedAt: new Date(),
        status: 'pending' as const
      },
      {
        itemId: 'service_789',
        itemType: 'service' as const,
        reportReason: 'Spam',
        reportedBy: 'user_101',
        reportedAt: new Date(),
        status: 'pending' as const
      }
    ];
  } catch (error) {
    console.error('Error getting reported content:', error);
    return [];
  }
};

// Update user status
export const updateUserStatus = async (userId: string, status: 'active' | 'suspended' | 'banned') => {
  try {
    // Implementation would update user status in Firestore
    console.log(`Updating user ${userId} status to ${status}`);
    return { success: true };
  } catch (error) {
    console.error('Error updating user status:', error);
    return { success: false, error: error.message };
  }
};

// Moderate content
export const moderateContent = async (
  itemId: string,
  action: 'approve' | 'reject',
  moderatorNotes?: string
) => {
  try {
    // Implementation would update content moderation status
    console.log(`Moderating content ${itemId}: ${action}`);
    return { success: true };
  } catch (error) {
    console.error('Error moderating content:', error);
    return { success: false, error: error.message };
  }
};