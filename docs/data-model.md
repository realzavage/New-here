# Lumo Marketplace - Data Model & Firebase Schema

## Overview
This document outlines the complete data model for Lumo, a marketplace app for The Gambia that connects individuals and businesses for buying, selling, and service provision.

## Core Entities

### 1. Users Collection
Stores both individual users and business accounts with role-based access.

```typescript
interface User {
  userId: string;           // Auto-generated document ID
  email: string;           // Unique identifier
  fullName: string;        // Display name
  phoneNumber?: string;    // Contact information
  userType: 'individual' | 'business';
  profileImageUrl?: string;
  location: string;        // City/Area in The Gambia
  isVerified: boolean;     // Account verification status
  createdAt: Timestamp;
  updatedAt: Timestamp;
  
  // Business-specific fields (only when userType === 'business')
  businessName?: string;
  businessIdNumber?: string;
  businessCategory?: string;
  businessDescription?: string;
  
  // User preferences and settings
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
```

### 2. Products Collection
Marketplace items for sale with business rules enforcement.

```typescript
interface Product {
  productId: string;       // Auto-generated document ID
  ownerId: string;         // Reference to users collection
  title: string;
  description: string;
  price: number;           // In Gambian Dalasi (GMD)
  imageUrls: string[];     // Array of image URLs
  category: ProductCategory;
  condition: 'new' | 'used' | 'like_new';
  location: string;        // Specific location in The Gambia
  isAvailable: boolean;
  isFeatured: boolean;     // For promoted listings
  createdAt: Timestamp;
  updatedAt: Timestamp;
  
  // Seller information (denormalized for performance)
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
  
  // Search and filtering
  tags: string[];          // For better search functionality
  searchKeywords: string[]; // Auto-generated from title/description
}

type ProductCategory = 
  | 'electronics' 
  | 'clothing' 
  | 'furniture' 
  | 'vehicles' 
  | 'food' 
  | 'books' 
  | 'home_garden' 
  | 'sports' 
  | 'other';
```

### 3. Services Collection
Service provider profiles and offerings.

```typescript
interface Service {
  serviceId: string;       // Auto-generated document ID
  providerId: string;      // Reference to users collection
  businessName: string;    // Display name for the service
  category: ServiceCategory;
  description: string;
  location: string;        // Service area
  imageUrls: string[];     // Portfolio/business images
  isActive: boolean;
  isFeatured: boolean;     // For promoted services
  createdAt: Timestamp;
  updatedAt: Timestamp;
  
  // Service details
  serviceDetails: {
    priceRange: {
      min: number;
      max: number;
      currency: 'GMD';
    };
    availability: string[];  // Days of the week
    responseTime: string;    // e.g., "Within 2 hours"
    serviceArea: string[];   // Areas they serve
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
  
  // Portfolio and credentials
  portfolio: {
    completedJobs: number;
    certifications: string[];
    specializations: string[];
  };
}

type ServiceCategory = 
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
```

### 4. Reviews Collection
User reviews and ratings for products and services.

```typescript
interface Review {
  reviewId: string;        // Auto-generated document ID
  reviewerId: string;      // Reference to users collection
  targetId: string;        // productId or serviceId
  targetType: 'product' | 'service';
  rating: number;          // 1-5 stars
  comment: string;
  imageUrls?: string[];    // Optional review images
  isVerified: boolean;     // Verified purchase/service
  createdAt: Timestamp;
  updatedAt: Timestamp;
  
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
```

### 5. Conversations Collection
Chat/messaging between users for inquiries and negotiations.

```typescript
interface Conversation {
  conversationId: string;  // Auto-generated document ID
  participants: string[];  // Array of user IDs
  relatedItemId?: string;  // productId or serviceId
  relatedItemType?: 'product' | 'service';
  lastMessage: {
    text: string;
    senderId: string;
    timestamp: Timestamp;
  };
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface Message {
  messageId: string;       // Auto-generated document ID
  conversationId: string;  // Reference to conversations collection
  senderId: string;        // Reference to users collection
  text: string;
  imageUrls?: string[];
  messageType: 'text' | 'image' | 'offer' | 'system';
  isRead: boolean;
  createdAt: Timestamp;
  
  // For offer messages
  offer?: {
    amount: number;
    currency: 'GMD';
    status: 'pending' | 'accepted' | 'rejected' | 'expired';
  };
}
```

### 6. Favorites Collection
User's saved products and services.

```typescript
interface Favorite {
  favoriteId: string;      // Auto-generated document ID
  userId: string;          // Reference to users collection
  itemId: string;          // productId or serviceId
  itemType: 'product' | 'service';
  createdAt: Timestamp;
}
```

## Business Rules & Constraints

### Product Listing Limits
- **Individuals**: Maximum 100 active product listings
- **Businesses**: Unlimited product listings
- **Implementation**: Use Firestore security rules and cloud functions

### User Verification
- Email verification required for all users
- Phone number verification for business accounts
- Manual verification for featured listings

### Content Moderation
- Automated keyword filtering for inappropriate content
- User reporting system for community moderation
- Admin review queue for flagged content

## Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if resource.data.preferences.publicProfile == true;
    }
    
    // Products are publicly readable, owner can write
    match /products/{productId} {
      allow read: if true;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.ownerId &&
        validateProductLimit();
      allow update, delete: if request.auth != null && 
        request.auth.uid == resource.data.ownerId;
    }
    
    // Services are publicly readable, provider can write
    match /services/{serviceId} {
      allow read: if true;
      allow create, update, delete: if request.auth != null && 
        request.auth.uid == resource.data.providerId;
    }
    
    // Reviews can be created by authenticated users, read by all
    match /reviews/{reviewId} {
      allow read: if true;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.reviewerId &&
        !hasExistingReview();
      allow update, delete: if request.auth != null && 
        request.auth.uid == resource.data.reviewerId;
    }
    
    // Helper functions
    function validateProductLimit() {
      let userDoc = get(/databases/$(database)/documents/users/$(request.auth.uid));
      return userDoc.data.userType == 'business' || 
             userDoc.data.stats.totalProducts < 100;
    }
    
    function hasExistingReview() {
      return exists(/databases/$(database)/documents/reviews/$(request.auth.uid + '_' + request.resource.data.targetId));
    }
  }
}
```

## Cloud Functions

### 1. User Statistics Update
```typescript
// Triggered when products/services/reviews are created/deleted
export const updateUserStats = functions.firestore
  .document('{collection}/{docId}')
  .onWrite(async (change, context) => {
    // Update user statistics in users collection
  });
```

### 2. Search Index Maintenance
```typescript
// Update search keywords when products/services are modified
export const updateSearchIndex = functions.firestore
  .document('products/{productId}')
  .onWrite(async (change, context) => {
    // Generate and update search keywords
  });
```

### 3. Review Aggregation
```typescript
// Update average ratings when reviews are added/modified
export const updateRatings = functions.firestore
  .document('reviews/{reviewId}')
  .onWrite(async (change, context) => {
    // Calculate and update average ratings
  });
```

## Indexes Required

```javascript
// Composite indexes for efficient queries
{
  "collectionGroup": "products",
  "queryScope": "COLLECTION",
  "fields": [
    {"fieldPath": "category", "order": "ASCENDING"},
    {"fieldPath": "location", "order": "ASCENDING"},
    {"fieldPath": "createdAt", "order": "DESCENDING"}
  ]
},
{
  "collectionGroup": "services",
  "queryScope": "COLLECTION", 
  "fields": [
    {"fieldPath": "category", "order": "ASCENDING"},
    {"fieldPath": "location", "order": "ASCENDING"},
    {"fieldPath": "provider.rating", "order": "DESCENDING"}
  ]
},
{
  "collectionGroup": "reviews",
  "queryScope": "COLLECTION",
  "fields": [
    {"fieldPath": "targetId", "order": "ASCENDING"},
    {"fieldPath": "createdAt", "order": "DESCENDING"}
  ]
}
```

## Implementation Notes

1. **Denormalization**: User information is denormalized in products, services, and reviews for better read performance
2. **Pagination**: Use Firestore's `startAfter()` for efficient pagination
3. **Real-time Updates**: Leverage Firestore's real-time listeners for live updates
4. **Offline Support**: Firestore provides automatic offline support
5. **Scalability**: Structure supports horizontal scaling as user base grows

This data model provides a solid foundation for the Lumo marketplace while maintaining flexibility for future enhancements.