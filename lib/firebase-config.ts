// Firebase Configuration for Lumo Marketplace
// This file should be configured with your actual Firebase project credentials

import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

// Your Firebase config object
// Replace with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "lumo-marketplace.firebaseapp.com",
  projectId: "lumo-marketplace",
  storageBucket: "lumo-marketplace.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

// Connect to emulators in development
if (__DEV__) {
  // Uncomment these lines to use Firebase emulators in development
  // connectFirestoreEmulator(db, 'localhost', 8080);
  // connectAuthEmulator(auth, 'http://localhost:9099');
  // connectStorageEmulator(storage, 'localhost', 9199);
  // connectFunctionsEmulator(functions, 'localhost', 5001);
}

export default app;