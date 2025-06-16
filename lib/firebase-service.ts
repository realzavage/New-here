// Firebase Service Layer for Lumo Marketplace
// This provides a clean API for interacting with Firebase

import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  DocumentSnapshot,
  QueryConstraint,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { httpsCallable } from 'firebase/functions';

import { db, auth, storage, functions } from './firebase-config';
import {
  User,
  Product,
  Service,
  Review,
  Conversation,
  Message,
  Favorite,
  SearchQuery,
  PaginatedResponse,
  ApiResponse
} from '@/types/database';

// Authentication Services
export class AuthService {
  static async signUp(email: string, password: string, userData: Partial<User>): Promise<ApiResponse<User>> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Create user document in Firestore
      const newUser: User = {
        userId: firebaseUser.uid,
        email: firebaseUser.email!,
        fullName: userData.fullName!,
        phoneNumber: userData.phoneNumber,
        userType: userData.userType!,
        location: userData.location!,
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        businessName: userData.businessName,
        businessIdNumber: userData.businessIdNumber,
        businessCategory: userData.businessCategory,
        businessDescription: userData.businessDescription,
        preferences: {
          notifications: true,
          publicProfile: true,
          language: 'en'
        },
        stats: {
          totalProducts: 0,
          totalServices: 0,
          averageRating: 0,
          totalReviews: 0
        }
      };
      
      await this.createUserDocument(newUser);
      
      // Update Firebase Auth profile
      await updateProfile(firebaseUser, {
        displayName: userData.fullName
      });
      
      return { success: true, data: newUser };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
  
  static async signIn(email: string, password: string): Promise<ApiResponse<User>> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userData = await this.getUserData(userCredential.user.uid);
      
      if (!userData) {
        throw new Error('User data not found');
      }
      
      return { success: true, data: userData };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
  
  static async signOut(): Promise<ApiResponse<void>> {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
  
  static async getCurrentUser(): Promise<User | null> {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return null;
    
    return await this.getUserData(firebaseUser.uid);
  }
  
  private static async createUserDocument(userData: User): Promise<void> {
    const userRef = doc(db, 'users', userData.userId);
    await updateDoc(userRef, {
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }
  
  private static async getUserData(userId: string): Promise<User | null> {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) return null;
    
    const data = userDoc.data();
    return {
      ...data,
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate()
    } as User;
  }
}

// Product Services
export class ProductService {
  static async createProduct(productData: Omit<Product, 'productId' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Product>> {
    try {
      const docRef = await addDoc(collection(db, 'products'), {
        ...productData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        metrics: {
          views: 0,
          favorites: 0,
          inquiries: 0
        }
      });
      
      const product = { ...productData, productId: docRef.id } as Product;
      return { success: true, data: product };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
  
  static async getProducts(searchQuery?: SearchQuery): Promise<PaginatedResponse<Product>> {
    try {
      let queryConstraints: QueryConstraint[] = [
        where('isAvailable', '==', true),
        orderBy('createdAt', 'desc')
      ];
      
      if (searchQuery?.filters.category) {
        queryConstraints.push(where('category', '==', searchQuery.filters.category));
      }
      
      if (searchQuery?.filters.location) {
        queryConstraints.push(where('location', '==', searchQuery.filters.location));
      }
      
      if (searchQuery?.limit) {
        queryConstraints.push(limit(searchQuery.limit));
      }
      
      const q = query(collection(db, 'products'), ...queryConstraints);
      const snapshot = await getDocs(q);
      
      const products = snapshot.docs.map(doc => ({
        productId: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as Product[];
      
      return {
        items: products,
        totalCount: products.length,
        hasMore: products.length === (searchQuery?.limit || 20)
      };
    } catch (error) {
      return { items: [], totalCount: 0, hasMore: false };
    }
  }
  
  static async getProduct(productId: string): Promise<Product | null> {
    try {
      const docSnap = await getDoc(doc(db, 'products', productId));
      if (!docSnap.exists()) return null;
      
      // Increment view count
      await updateDoc(docSnap.ref, {
        'metrics.views': increment(1)
      });
      
      const data = docSnap.data();
      return {
        productId: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      } as Product;
    } catch (error) {
      return null;
    }
  }
  
  static async updateProduct(productId: string, updates: Partial<Product>): Promise<ApiResponse<void>> {
    try {
      await updateDoc(doc(db, 'products', productId), {
        ...updates,
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
  
  static async deleteProduct(productId: string): Promise<ApiResponse<void>> {
    try {
      await deleteDoc(doc(db, 'products', productId));
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}

// Service Services
export class ServiceService {
  static async createService(serviceData: Omit<Service, 'serviceId' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Service>> {
    try {
      const docRef = await addDoc(collection(db, 'services'), {
        ...serviceData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      const service = { ...serviceData, serviceId: docRef.id } as Service;
      return { success: true, data: service };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
  
  static async getServices(category?: string, location?: string): Promise<Service[]> {
    try {
      let queryConstraints: QueryConstraint[] = [
        where('isActive', '==', true),
        orderBy('provider.rating', 'desc')
      ];
      
      if (category) {
        queryConstraints.push(where('category', '==', category));
      }
      
      if (location) {
        queryConstraints.push(where('location', '==', location));
      }
      
      const q = query(collection(db, 'services'), ...queryConstraints);
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        serviceId: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as Service[];
    } catch (error) {
      return [];
    }
  }
}

// Review Services
export class ReviewService {
  static async createReview(reviewData: Omit<Review, 'reviewId' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Review>> {
    try {
      const docRef = await addDoc(collection(db, 'reviews'), {
        ...reviewData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        metadata: {
          helpfulVotes: 0,
          reportCount: 0,
          isHidden: false
        }
      });
      
      const review = { ...reviewData, reviewId: docRef.id } as Review;
      return { success: true, data: review };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
  
  static async getReviews(targetId: string): Promise<Review[]> {
    try {
      const q = query(
        collection(db, 'reviews'),
        where('targetId', '==', targetId),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        reviewId: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as Review[];
    } catch (error) {
      return [];
    }
  }
}

// Storage Services
export class StorageService {
  static async uploadImage(file: File, path: string): Promise<string> {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  }
  
  static async deleteImage(url: string): Promise<void> {
    const imageRef = ref(storage, url);
    await deleteObject(imageRef);
  }
}

// Business Validation Service
export class BusinessService {
  static async validateBusiness(businessIdNumber: string, businessName: string): Promise<ApiResponse<boolean>> {
    try {
      const validateBusinessFunction = httpsCallable(functions, 'validateBusiness');
      const result = await validateBusinessFunction({ businessIdNumber, businessName });
      
      return {
        success: true,
        data: result.data.isValid,
        message: result.data.message
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}