// Firestore Security Rules for Lumo Marketplace
// Copy this content to your Firebase Console > Firestore Database > Rules

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users Collection
    match /users/{userId} {
      // Users can read and write their own data
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Allow reading other user profiles only if they have publicProfile set to true
      // Check if resource.data exists before accessing its properties
      allow read: if request.auth != null && 
        resource.data != null &&
        resource.data.publicProfile == true;
    }
    
    // Products Collection
    match /products/{productId} {
      // Anyone can read products
      allow read: if true;
      
      // Authenticated users can create products
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.ownerId &&
        validateProductData();
      
      // Only product owner can update/delete
      allow update, delete: if request.auth != null && 
        request.auth.uid == resource.data.ownerId;
    }
    
    // Services Collection
    match /services/{serviceId} {
      // Anyone can read services
      allow read: if true;
      
      // Authenticated users can create services
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.providerId &&
        validateServiceData();
      
      // Only service provider can update/delete
      allow update, delete: if request.auth != null && 
        request.auth.uid == resource.data.providerId;
    }
    
    // Reviews Collection
    match /reviews/{reviewId} {
      // Anyone can read reviews
      allow read: if true;
      
      // Authenticated users can create reviews (one per item)
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.reviewerId &&
        validateReviewData();
      
      // Only reviewer can update/delete their review
      allow update, delete: if request.auth != null && 
        request.auth.uid == resource.data.reviewerId;
    }
    
    // Conversations Collection
    match /conversations/{conversationId} {
      // Only participants can read conversations
      allow read: if request.auth != null && 
        request.auth.uid in resource.data.participants;
      
      // Authenticated users can create conversations
      allow create: if request.auth != null && 
        request.auth.uid in request.resource.data.participants;
      
      // Participants can update conversations
      allow update: if request.auth != null && 
        request.auth.uid in resource.data.participants;
    }
    
    // Messages Subcollection
    match /conversations/{conversationId}/messages/{messageId} {
      // Only conversation participants can read messages
      allow read: if request.auth != null && 
        request.auth.uid in get(/databases/$(database)/documents/conversations/$(conversationId)).data.participants;
      
      // Only sender can create messages
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.senderId &&
        request.auth.uid in get(/databases/$(database)/documents/conversations/$(conversationId)).data.participants;
      
      // Only sender can update their messages
      allow update: if request.auth != null && 
        request.auth.uid == resource.data.senderId;
    }
    
    // Favorites Collection
    match /favorites/{favoriteId} {
      // Users can only read/write their own favorites
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
    }
    
    // Helper Functions
    function validateProductData() {
      let data = request.resource.data;
      return data.name is string && data.name.size() > 0 &&
             data.description is string && data.description.size() > 0 &&
             data.price is number && data.price > 0 &&
             data.category is string &&
             data.location is string;
    }
    
    function validateServiceData() {
      let data = request.resource.data;
      return data.name is string && data.name.size() > 0 &&
             data.description is string && data.description.size() > 0 &&
             data.category is string &&
             data.location is string;
    }
    
    function validateReviewData() {
      let data = request.resource.data;
      return data.rating is number && 
             data.rating >= 1 && 
             data.rating <= 5 &&
             data.comment is string &&
             data.targetType in ['product', 'service'];
    }
  }
}