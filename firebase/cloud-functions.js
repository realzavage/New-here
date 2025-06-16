// Cloud Functions for Lumo Marketplace
// Deploy these functions to Firebase Functions

const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

// Update user statistics when products/services/reviews change
exports.updateUserStats = functions.firestore
  .document('{collection}/{docId}')
  .onWrite(async (change, context) => {
    const { collection, docId } = context.params;
    
    if (!['products', 'services', 'reviews'].includes(collection)) {
      return null;
    }
    
    const before = change.before.exists ? change.before.data() : null;
    const after = change.after.exists ? change.after.data() : null;
    
    let userId;
    if (collection === 'products') {
      userId = after?.ownerId || before?.ownerId;
    } else if (collection === 'services') {
      userId = after?.providerId || before?.providerId;
    } else if (collection === 'reviews') {
      // Update stats for the reviewed item owner
      const targetId = after?.targetId || before?.targetId;
      const targetType = after?.targetType || before?.targetType;
      
      if (targetType === 'product') {
        const productDoc = await db.collection('products').doc(targetId).get();
        userId = productDoc.data()?.ownerId;
      } else if (targetType === 'service') {
        const serviceDoc = await db.collection('services').doc(targetId).get();
        userId = serviceDoc.data()?.providerId;
      }
    }
    
    if (!userId) return null;
    
    // Calculate new statistics
    const [productsSnapshot, servicesSnapshot, reviewsSnapshot] = await Promise.all([
      db.collection('products').where('ownerId', '==', userId).get(),
      db.collection('services').where('providerId', '==', userId).get(),
      db.collection('reviews').where('targetId', 'in', [
        ...productsSnapshot.docs.map(doc => doc.id),
        ...servicesSnapshot.docs.map(doc => doc.id)
      ]).get()
    ]);
    
    const totalProducts = productsSnapshot.size;
    const totalServices = servicesSnapshot.size;
    const totalReviews = reviewsSnapshot.size;
    
    let averageRating = 0;
    if (totalReviews > 0) {
      const totalRating = reviewsSnapshot.docs.reduce((sum, doc) => sum + doc.data().rating, 0);
      averageRating = totalRating / totalReviews;
    }
    
    // Update user stats
    await db.collection('users').doc(userId).update({
      'stats.totalProducts': totalProducts,
      'stats.totalServices': totalServices,
      'stats.totalReviews': totalReviews,
      'stats.averageRating': Math.round(averageRating * 10) / 10,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return null;
  });

// Generate search keywords for products
exports.updateProductSearchIndex = functions.firestore
  .document('products/{productId}')
  .onWrite(async (change, context) => {
    const after = change.after.exists ? change.after.data() : null;
    
    if (!after) return null;
    
    // Generate search keywords from title, description, and category
    const keywords = new Set();
    
    // Add words from title and description
    const text = `${after.title} ${after.description} ${after.category}`.toLowerCase();
    const words = text.match(/\b\w+\b/g) || [];
    
    words.forEach(word => {
      if (word.length > 2) {
        keywords.add(word);
        // Add partial matches
        for (let i = 3; i <= word.length; i++) {
          keywords.add(word.substring(0, i));
        }
      }
    });
    
    // Add location keywords
    if (after.location) {
      const locationWords = after.location.toLowerCase().split(' ');
      locationWords.forEach(word => keywords.add(word));
    }
    
    // Update the document with search keywords
    await change.after.ref.update({
      searchKeywords: Array.from(keywords),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return null;
  });

// Update average ratings for products and services
exports.updateItemRatings = functions.firestore
  .document('reviews/{reviewId}')
  .onWrite(async (change, context) => {
    const before = change.before.exists ? change.before.data() : null;
    const after = change.after.exists ? change.after.data() : null;
    
    const targetId = after?.targetId || before?.targetId;
    const targetType = after?.targetType || before?.targetType;
    
    if (!targetId || !targetType) return null;
    
    // Get all reviews for this item
    const reviewsSnapshot = await db.collection('reviews')
      .where('targetId', '==', targetId)
      .get();
    
    const totalReviews = reviewsSnapshot.size;
    let averageRating = 0;
    
    if (totalReviews > 0) {
      const totalRating = reviewsSnapshot.docs.reduce((sum, doc) => sum + doc.data().rating, 0);
      averageRating = totalRating / totalReviews;
    }
    
    // Update the item's rating
    const collection = targetType === 'product' ? 'products' : 'services';
    const updateField = targetType === 'product' ? 'seller.rating' : 'provider.rating';
    const reviewCountField = targetType === 'product' ? 'seller.reviewCount' : 'provider.totalReviews';
    
    await db.collection(collection).doc(targetId).update({
      [updateField]: Math.round(averageRating * 10) / 10,
      [reviewCountField]: totalReviews,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return null;
  });

// Send notification when new message is received
exports.sendMessageNotification = functions.firestore
  .document('conversations/{conversationId}/messages/{messageId}')
  .onCreate(async (snap, context) => {
    const message = snap.data();
    const { conversationId } = context.params;
    
    // Get conversation details
    const conversationDoc = await db.collection('conversations').doc(conversationId).get();
    const conversation = conversationDoc.data();
    
    if (!conversation) return null;
    
    // Get recipient user tokens for push notifications
    const recipients = conversation.participants.filter(id => id !== message.senderId);
    
    // Here you would implement push notification logic
    // using Firebase Cloud Messaging (FCM)
    
    return null;
  });

// Clean up old conversations and messages
exports.cleanupOldData = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Delete inactive conversations older than 30 days
    const oldConversations = await db.collection('conversations')
      .where('isActive', '==', false)
      .where('updatedAt', '<', thirtyDaysAgo)
      .get();
    
    const batch = db.batch();
    oldConversations.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    
    console.log(`Cleaned up ${oldConversations.size} old conversations`);
    return null;
  });

// Validate business registration
exports.validateBusiness = functions.https.onCall(async (data, context) => {
  // Ensure user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }
  
  const { businessIdNumber, businessName } = data;
  
  // Here you would implement actual business validation
  // against Gambian business registry APIs
  
  // For now, return a mock validation
  const isValid = businessIdNumber && businessIdNumber.length >= 8;
  
  if (isValid) {
    // Update user verification status
    await db.collection('users').doc(context.auth.uid).update({
      isVerified: true,
      'businessIdNumber': businessIdNumber,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  }
  
  return { isValid, message: isValid ? 'Business verified successfully' : 'Invalid business registration' };
});