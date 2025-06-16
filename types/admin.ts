// Admin Panel Types

export interface AdminStats {
  totalUsers: number;
  activeListings: number;
  pendingReviews: number;
  reportedContent: number;
  recentActivity: AdminActivity[];
}

export interface AdminActivity {
  description: string;
  time: string;
  type: 'info' | 'warning' | 'error';
}

export interface UserManagement {
  userId: string;
  email: string;
  fullName: string;
  userType: 'individual' | 'business';
  isVerified: boolean;
  createdAt: Date;
  lastActive: Date;
  status: 'active' | 'suspended' | 'banned';
}

export interface ContentModeration {
  itemId: string;
  itemType: 'product' | 'service' | 'review' | 'message';
  reportReason: string;
  reportedBy: string;
  reportedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
  moderatorNotes?: string;
}

export interface SystemSettings {
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  maxProductListings: number;
  maxServiceListings: number;
  featuredListingPrice: number;
  commissionRate: number;
}