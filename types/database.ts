// Lumo Marketplace - TypeScript Database Types

export interface User {
  userId: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  userType: 'individual' | 'business';
  profileImageUrl?: string;
  location: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Business-specific fields
  businessName?: string;
  businessIdNumber?: string;
  businessCategory?: string;
  businessDescription?: string;
  
  // User preferences
  preferences: {
    notifications: boolean;
    publicProfile: boolean;
    language: 'en' | 'wo' | 'ff'; // English, Wolof, Fula
  };
  
  // Statistics
  stats: {
    totalProducts: number;
    totalServices: number;
    averageRating: number;
    totalReviews: number;
  };
}

export type ProductCategory = 
  | 'electronics' 
  | 'clothing' 
  | 'furniture' 
  | 'vehicles' 
  | 'food' 
  | 'books' 
  | 'home_garden' 
  | 'sports' 
  | 'other';

export type ProductCondition = 'new' | 'used' | 'like_new';

export interface Product {
  productId: string;
  ownerId: string;
  title: string;
  description: string;
  price: number; // In Gambian Dalasi (GMD)
  imageUrls: string[];
  category: ProductCategory;
  condition: ProductCondition;
  location: string;
  isAvailable: boolean;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Seller information (denormalized)
  seller: {
    name: string;
    type: 'individual' | 'business';
    rating: number;
    isVerified: boolean;
  };
  
  // Engagement metrics
  metrics: {
    views: number;
    favorites: number;
    inquiries: number;
  };
  
  // Search optimization
  tags: string[];
  searchKeywords: string[];
}

export type ServiceCategory = 
  | 'construction' 
  | 'carpentry' 
  | 'tailoring' 
  | 'plumbing' 
  | 'electrical' 
  | 'painting' 
  | 'hair_beauty' 
  | 'catering' 
  | 'cleaning' 
  | 'tutoring' 
  | 'transportation' 
  | 'other';

export interface Service {
  serviceId: string;
  providerId: string;
  businessName: string;
  category: ServiceCategory;
  description: string;
  location: string;
  imageUrls: string[];
  isActive: boolean;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Service details
  serviceDetails: {
    priceRange: {
      min: number;
      max: number;
      currency: 'GMD';
    };
    availability: string[];
    responseTime: string;
    serviceArea: string[];
  };
  
  // Provider information (denormalized)
  provider: {
    name: string;
    rating: number;
    totalReviews: number;
    yearsExperience: number;
    isVerified: boolean;
  };
  
  // Contact information
  contact: {
    phoneNumber: string;
    whatsapp?: string;
    email?: string;
  };
  
  // Portfolio
  portfolio: {
    completedJobs: number;
    certifications: string[];
    specializations: string[];
  };
}

export interface Review {
  reviewId: string;
  reviewerId: string;
  targetId: string; // productId or serviceId
  targetType: 'product' | 'service';
  rating: number; // 1-5 stars
  comment: string;
  imageUrls?: string[];
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Reviewer information (denormalized)
  reviewer: {
    name: string;
    profileImageUrl?: string;
    isVerified: boolean;
  };
  
  // Review metadata
  metadata: {
    helpfulVotes: number;
    reportCount: number;
    isHidden: boolean;
  };
}

export interface Conversation {
  conversationId: string;
  participants: string[]; // Array of user IDs
  relatedItemId?: string; // productId or serviceId
  relatedItemType?: 'product' | 'service';
  lastMessage: {
    text: string;
    senderId: string;
    timestamp: Date;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type MessageType = 'text' | 'image' | 'offer' | 'system';
export type OfferStatus = 'pending' | 'accepted' | 'rejected' | 'expired';

export interface Message {
  messageId: string;
  conversationId: string;
  senderId: string;
  text: string;
  imageUrls?: string[];
  messageType: MessageType;
  isRead: boolean;
  createdAt: Date;
  
  // For offer messages
  offer?: {
    amount: number;
    currency: 'GMD';
    status: OfferStatus;
  };
}

export interface Favorite {
  favoriteId: string;
  userId: string;
  itemId: string; // productId or serviceId
  itemType: 'product' | 'service';
  createdAt: Date;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  hasMore: boolean;
  nextCursor?: string;
}

// Search and filter types
export interface SearchFilters {
  category?: ProductCategory | ServiceCategory;
  location?: string;
  priceMin?: number;
  priceMax?: number;
  rating?: number;
  condition?: ProductCondition;
  userType?: 'individual' | 'business';
}

export interface SearchQuery {
  query: string;
  filters: SearchFilters;
  sortBy: 'relevance' | 'price_asc' | 'price_desc' | 'date_desc' | 'rating_desc';
  limit: number;
  cursor?: string;
}