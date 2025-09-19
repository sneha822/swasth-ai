import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase, ref, onValue, set, get } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
};

// Initialize Firebase only if it hasn't been initialized already
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();
const database = getDatabase(app);

// Reference to the heart counter in the database
const heartCounterRef = ref(database, "stats/heartCounter");

// Heart counter functionality
export async function getHeartCount(): Promise<number> {
  try {
    const snapshot = await get(heartCounterRef);
    return snapshot.exists() ? snapshot.val() : 0;
  } catch (error) {
    console.error("Error getting heart count:", error);
    return 0;
  }
}

export async function incrementHeartCount(): Promise<number> {
  try {
    // Get current count
    const snapshot = await get(heartCounterRef);
    const currentCount = snapshot.exists() ? snapshot.val() : 0;

    // Increment the count
    const newCount = currentCount + 1;
    await set(heartCounterRef, newCount);

    return newCount;
  } catch (error) {
    console.error("Error incrementing heart count:", error);
    return 0;
  }
}

// Subscribe to real-time updates
export function subscribeToHeartCount(
  callback: (count: number) => void
): () => void {
  const unsubscribe = onValue(heartCounterRef, (snapshot) => {
    const count = snapshot.exists() ? snapshot.val() : 0;
    callback(count);
  });

  return unsubscribe;
}

export { app, auth, db, googleProvider };
