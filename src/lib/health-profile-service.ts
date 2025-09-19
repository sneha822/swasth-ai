import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { UserHealthProfile } from "../types";

// Get user health profile
export async function getUserHealthProfile(userId: string): Promise<UserHealthProfile | null> {
  try {
    const profileDoc = await getDoc(doc(db, "healthProfiles", userId));
    
    if (profileDoc.exists()) {
      const data = profileDoc.data();
      return {
        ...data,
        id: profileDoc.id,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as UserHealthProfile;
    }
    
    return null;
  } catch (error) {
    console.error("Error getting user health profile:", error);
    return null;
  }
}

// Create or update user health profile
export async function saveUserHealthProfile(
  userId: string,
  profile: Partial<UserHealthProfile>
): Promise<void> {
  try {
    const profileRef = doc(db, "healthProfiles", userId);
    const existingProfile = await getDoc(profileRef);
    
    const profileData = {
      ...profile,
      userId,
      updatedAt: serverTimestamp(),
      ...(existingProfile.exists() ? {} : { createdAt: serverTimestamp() }),
    };
    
    if (existingProfile.exists()) {
      await updateDoc(profileRef, profileData);
    } else {
      await setDoc(profileRef, profileData);
    }
  } catch (error) {
    console.error("Error saving user health profile:", error);
    throw error;
  }
}

// Health suggestion interface
export interface HealthSuggestion {
  id: string;
  userId: string;
  type: 'diet' | 'exercise' | 'medication' | 'checkup' | 'lifestyle' | 'emergency';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  dueDate?: Date;
  completed: boolean;
  createdAt: Date;
  completedAt?: Date;
}

// Save personalized health suggestion
export async function saveHealthSuggestion(
  userId: string,
  suggestion: Omit<HealthSuggestion, 'id' | 'userId' | 'createdAt' | 'completed'>
): Promise<string> {
  try {
    const suggestionData = {
      ...suggestion,
      userId,
      completed: false,
      createdAt: serverTimestamp(),
      dueDate: suggestion.dueDate ? Timestamp.fromDate(suggestion.dueDate) : null,
    };
    
    const docRef = await addDoc(collection(db, "healthSuggestions"), suggestionData);
    return docRef.id;
  } catch (error) {
    console.error("Error saving health suggestion:", error);
    throw error;
  }
}

// Get user health suggestions
export async function getUserHealthSuggestions(userId: string): Promise<HealthSuggestion[]> {
  try {
    const q = query(
      collection(db, "healthSuggestions"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        dueDate: data.dueDate?.toDate() || undefined,
        completedAt: data.completedAt?.toDate() || undefined,
      } as HealthSuggestion;
    });
  } catch (error) {
    console.error("Error getting user health suggestions:", error);
    return [];
  }
}

// Mark health suggestion as completed
export async function completeHealthSuggestion(suggestionId: string): Promise<void> {
  try {
    const suggestionRef = doc(db, "healthSuggestions", suggestionId);
    await updateDoc(suggestionRef, {
      completed: true,
      completedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error completing health suggestion:", error);
    throw error;
  }
}

// Emergency contact interface
export interface EmergencyContact {
  id: string;
  userId: string;
  name: string;
  phone: string;
  relation: string;
  isPrimary: boolean;
  createdAt: Date;
}

// Save emergency contact
export async function saveEmergencyContact(
  userId: string,
  contact: Omit<EmergencyContact, 'id' | 'userId' | 'createdAt'>
): Promise<string> {
  try {
    const contactData = {
      ...contact,
      userId,
      createdAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(collection(db, "emergencyContacts"), contactData);
    return docRef.id;
  } catch (error) {
    console.error("Error saving emergency contact:", error);
    throw error;
  }
}

// Get user emergency contacts
export async function getUserEmergencyContacts(userId: string): Promise<EmergencyContact[]> {
  try {
    const q = query(
      collection(db, "emergencyContacts"),
      where("userId", "==", userId),
      orderBy("isPrimary", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
      } as EmergencyContact;
    });
  } catch (error) {
    console.error("Error getting user emergency contacts:", error);
    return [];
  }
}
