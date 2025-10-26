
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyCWhpu5xPzjh4ZjHBB3aTGoWzmeVoUU-_0",
  authDomain: "creperie-kinder5.firebaseapp.com",
  projectId: "creperie-kinder5",
  storageBucket: "creperie-kinder5.firebasestorage.app",
  messagingSenderId: "391049828865",
  appId: "1:391049828865:web:92ff17de37932290a2fe00",
  measurementId: "G-T1BNS329KS"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
console.log('✅ تم تهيئة Firebase بنجاح');

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
console.log('✅ تم تهيئة Firestore بنجاح');

// Initialize Analytics (only in browser environment)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
