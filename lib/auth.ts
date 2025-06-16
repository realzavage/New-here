import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';

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

export interface SignUpData {
  fullName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  userType: 'individual' | 'business';
  location: string;
  businessName?: string;
  businessIdNumber?: string;
  businessCategory?: string;
  businessDescription?: string;
}

// Sign up new user
export const signUp = async (userData: SignUpData): Promise<{ success: boolean; user?: User; error?: string }> => {
  try {
    console.log('Starting sign up process for:', userData.email);
    
    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
    const firebaseUser = userCredential.user;
    
    console.log('Firebase user created:', firebaseUser.uid);

    // Update Firebase Auth profile
    await updateProfile(firebaseUser, {
      displayName: userData.fullName
    });

    // Create user document in Firestore
    const newUser: Omit<User, 'userId'> = {
      email: userData.email,
      fullName: userData.fullName,
      phoneNumber: userData.phoneNumber,
      userType: userData.userType,
      location: userData.location,
      isVerified: false,
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
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log('Creating Firestore document for user:', firebaseUser.uid);
    
    await setDoc(doc(db, 'users', firebaseUser.uid), {
      ...newUser,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    console.log('User document created successfully');

    const user: User = {
      userId: firebaseUser.uid,
      ...newUser
    };

    return { success: true, user };
  } catch (error: any) {
    console.error('Sign up error:', error);
    
    // Provide more specific error messages
    let errorMessage = error.message;
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'An account with this email already exists. Please try logging in instead.';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Password is too weak. Please choose a stronger password.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Please enter a valid email address.';
    } else if (error.code === 'auth/network-request-failed') {
      errorMessage = 'Network error. Please check your internet connection and try again.';
    }
    
    return { success: false, error: errorMessage };
  }
};

// Sign in existing user
export const signIn = async (email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> => {
  try {
    console.log('Starting sign in process for:', email);
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    console.log('Firebase sign in successful:', firebaseUser.uid);

    // Refresh the authentication token to ensure it's valid
    await firebaseUser.getIdToken(true);

    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    
    if (!userDoc.exists()) {
      console.error('User document not found in Firestore');
      throw new Error('User profile not found. Please contact support.');
    }

    const userData = userDoc.data();
    const user: User = {
      userId: firebaseUser.uid,
      ...userData,
      createdAt: userData.createdAt?.toDate() || new Date(),
      updatedAt: userData.updatedAt?.toDate() || new Date()
    } as User;

    console.log('User data retrieved successfully');
    return { success: true, user };
  } catch (error: any) {
    console.error('Sign in error:', error);
    
    // Provide more specific error messages
    let errorMessage = error.message;
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'No account found with this email. Please check your email or sign up for a new account.';
    } else if (error.code === 'auth/wrong-password') {
      errorMessage = 'Incorrect password. Please try again.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Please enter a valid email address.';
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = 'Too many failed attempts. Please try again later.';
    } else if (error.code === 'auth/network-request-failed') {
      errorMessage = 'Network error. Please check your internet connection and try again.';
    }
    
    return { success: false, error: errorMessage };
  }
};

// Sign out user
export const signOut = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('Signing out user');
    await firebaseSignOut(auth);
    console.log('Sign out successful');
    return { success: true };
  } catch (error: any) {
    console.error('Sign out error:', error);
    return { success: false, error: error.message };
  }
};

// Get current user data
export const getCurrentUser = async (): Promise<User | null> => {
  const firebaseUser = auth.currentUser;
  if (!firebaseUser) {
    console.log('No Firebase user found');
    return null;
  }

  try {
    console.log('Getting current user data for:', firebaseUser.uid);
    
    // Refresh the authentication token to ensure it's valid for Firestore access
    await firebaseUser.getIdToken(true);
    
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    
    if (!userDoc.exists()) {
      console.log('User document not found in Firestore, creating basic profile...');
      
      // Create a basic user document with default values
      const basicUser: Omit<User, 'userId'> = {
        email: firebaseUser.email || '',
        fullName: firebaseUser.displayName || 'User',
        userType: 'individual',
        location: '',
        isVerified: false,
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
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Save the basic user document to Firestore
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        ...basicUser,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      console.log('Basic user document created successfully');

      const user: User = {
        userId: firebaseUser.uid,
        ...basicUser
      };

      return user;
    }

    const userData = userDoc.data();
    const user: User = {
      userId: firebaseUser.uid,
      ...userData,
      createdAt: userData.createdAt?.toDate() || new Date(),
      updatedAt: userData.updatedAt?.toDate() || new Date()
    } as User;

    console.log('Current user data retrieved successfully');
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Auth state listener
export const onAuthStateChange = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};