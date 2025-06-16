import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, Auth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { initializeAuth as initializeAuthRN } from '@react-native-firebase/auth';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBQlfed8jnmYEQJGRqqR2hTkBVgvi0y-Zg",
  authDomain: "lumo-2.firebaseapp.com",
  projectId: "lumo-2",
  storageBucket: "lumo-2.firebasestorage.app",
  messagingSenderId: "457005605462",
  appId: "1:457005605462:web:73bb614e432d70202d11f7",
  measurementId: "G-RCSKFHLG3N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with persistence for React Native
let auth: Auth;
if (Platform.OS === 'web') {
  auth = getAuth(app);
} else {
  auth = initializeAuth(app);
}

// Initialize Firestore
export const db = getFirestore(app);

// For development, you can connect to the Firestore emulator
// Uncomment the following lines if you're using the Firebase emulator
// if (__DEV__ && Platform.OS === 'web') {
//   try {
//     connectFirestoreEmulator(db, 'localhost', 8080);
//   } catch (error) {
//     console.log('Firestore emulator already connected');
//   }
// }

// Initialize Firebase Storage
export const storage = getStorage(app);

// Export auth
export { auth };

export default app;