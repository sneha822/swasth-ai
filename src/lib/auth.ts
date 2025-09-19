import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  User,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "./firebase";

export interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  provider: string;
  createdAt: number;
  lastLogin: number;
}

// Cache for user data to reduce database reads
const userDataCache = new Map<string, { data: UserData; timestamp: number }>();
const CACHE_TTL = 60000; // 1 minute cache lifetime

export async function registerWithEmail(
  email: string,
  password: string
): Promise<UserData | null> {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    const userData = createUserData(user, "email");
    await saveUserToFirestore(userData);
    return userData;
  } catch (error) {
    console.error("Error during email registration:", error);
    throw error;
  }
}

export async function loginWithEmail(
  email: string,
  password: string
): Promise<UserData | null> {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    const userData = createUserData(user, "email");
    await updateUserLastLogin(user.uid);
    return userData;
  } catch (error) {
    console.error("Error during email login:", error);
    throw error;
  }
}

export async function loginWithGoogle(): Promise<UserData | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    const existingUserData = await getUserData(user.uid);

    const userData = createUserData(user, "google");

    if (existingUserData) {
      await updateUserLastLogin(user.uid);

      if (
        user.photoURL !== existingUserData.photoURL ||
        user.displayName !== existingUserData.displayName
      ) {
        await updateUserProfile(user.uid, {
          photoURL: user.photoURL,
          displayName: user.displayName,
        });
      }
    } else {
      await saveUserToFirestore(userData);
    }

    return userData;
  } catch (error) {
    console.error("Error during Google login:", error);
    throw error;
  }
}

export async function logoutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error during logout:", error);
    throw error;
  }
}

export async function getUserData(uid: string): Promise<UserData | null> {
  try {
    // Check if we have a valid cached version
    const now = Date.now();
    const cached = userDataCache.get(uid);

    if (cached && now - cached.timestamp < CACHE_TTL) {
      // Use cached data if it's fresh
      return cached.data;
    }

    // If not cached or expired, fetch from Firestore
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      const userData = userDoc.data() as UserData;

      // Cache the result
      userDataCache.set(uid, { data: userData, timestamp: now });

      return userData;
    }
    return null;
  } catch (error) {
    console.error("Error getting user data:", error);
    return null;
  }
}

export async function updateUserProfile(
  uid: string,
  profileData: { displayName?: string | null; photoURL?: string | null }
): Promise<void> {
  try {
    await updateDoc(doc(db, "users", uid), profileData);

    if (auth.currentUser && auth.currentUser.uid === uid) {
      await updateProfile(auth.currentUser, {
        displayName: profileData.displayName || auth.currentUser.displayName,
        photoURL: profileData.photoURL || auth.currentUser.photoURL,
      });
    }
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
}

async function updateUserLastLogin(uid: string): Promise<void> {
  try {
    await updateDoc(doc(db, "users", uid), {
      lastLogin: Date.now(),
    });
  } catch (error) {
    console.error("Error updating last login time:", error);
  }
}

function createUserData(user: User, provider: string): UserData {
  const now = Date.now();
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    provider,
    createdAt: now,
    lastLogin: now,
  };
}

async function saveUserToFirestore(userData: UserData): Promise<void> {
  try {
    await setDoc(doc(db, "users", userData.uid), userData, { merge: true });
  } catch (error) {
    console.error("Error saving user to Firestore:", error);
    throw error;
  }
}
