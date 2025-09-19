import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  doc,
  writeBatch,
  updateDoc,
  Timestamp,
  increment,
} from "firebase/firestore";
import { db } from "./firebase";
import { Message } from "./gemini/service";
import { v4 as uuidv4 } from "uuid";

// Interface for chat conversation
export interface ChatConversation {
  id: string;
  userId: string;
  title: string;
  createdAt: Timestamp; // Firebase Timestamp
  updatedAt: Timestamp; // Firebase Timestamp
  messageCount: number;
}

// Function to create a new conversation
export async function createConversation(
  userId: string,
  firstMessage: string
): Promise<string> {
  try {
    // Create a chat title based on the first message (limited to 30 chars)
    const title =
      firstMessage.length > 30
        ? `${firstMessage.substring(0, 27)}...`
        : firstMessage;

    const docRef = await addDoc(collection(db, "conversations"), {
      userId,
      title,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      messageCount: 0,
    });

    return docRef.id;
  } catch (error) {
    console.error("Error creating conversation:", error);
    throw error;
  }
}

// Function to get all conversations for a user
export async function getUserConversations(
  userId: string
): Promise<ChatConversation[]> {
  try {
    const q = query(
      collection(db, "conversations"),
      where("userId", "==", userId)
      // Removed the orderBy to avoid requiring a composite index
      // We'll sort client-side instead
    );

    const querySnapshot = await getDocs(q);
    const conversations = querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as ChatConversation)
    );

    // Sort by updatedAt descending (newer conversations first)
    return conversations.sort((a, b) => {
      if (!a.updatedAt) return 1;
      if (!b.updatedAt) return -1;
      // Convert to milliseconds for comparison
      const timeA = a.updatedAt.toMillis ? a.updatedAt.toMillis() : 0;
      const timeB = b.updatedAt.toMillis ? b.updatedAt.toMillis() : 0;
      return timeB - timeA;
    });
  } catch (error) {
    console.error("Error getting user conversations:", error);
    return [];
  }
}

// Function to save a message to a conversation
export async function saveMessage(
  conversationId: string,
  message: Message
): Promise<string> {
  try {
    // Add message to 'messages' subcollection
    const messageData = {
      id: message.id || uuidv4(),
      role: message.role,
      content: message.content,
      timestamp: message.timestamp || Date.now(),
      imageUrl: message.imageUrl || null,
    };

    await addDoc(
      collection(db, "conversations", conversationId, "messages"),
      messageData
    );

    // Update the conversation metadata using atomic increment
    const conversationRef = doc(db, "conversations", conversationId);
    await updateDoc(conversationRef, {
      updatedAt: serverTimestamp(),
      messageCount: increment(1),
    });

    return messageData.id;
  } catch (error) {
    console.error("Error saving message:", error);
    throw error;
  }
}

// Function to get all messages for a conversation
export async function getConversationMessages(
  conversationId: string
): Promise<Message[]> {
  try {
    const q = query(
      collection(db, "conversations", conversationId, "messages"),
      orderBy("timestamp", "asc")
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => doc.data() as Message);
  } catch (error) {
    console.error("Error getting conversation messages:", error);
    return [];
  }
}

// Function to delete a conversation and all its messages
export async function deleteConversation(
  conversationId: string
): Promise<void> {
  try {
    const batch = writeBatch(db);

    // Delete all messages in the conversation
    const messagesSnapshot = await getDocs(
      collection(db, "conversations", conversationId, "messages")
    );

    messagesSnapshot.docs.forEach((messageDoc) => {
      batch.delete(messageDoc.ref);
    });

    // Delete the conversation document
    batch.delete(doc(db, "conversations", conversationId));

    // Commit the batch
    await batch.commit();
  } catch (error) {
    console.error("Error deleting conversation:", error);
    throw error;
  }
}

// Function to delete all conversations for a user
export async function deleteAllUserConversations(
  userId: string
): Promise<void> {
  try {
    const conversations = await getUserConversations(userId);

    for (const conversation of conversations) {
      await deleteConversation(conversation.id);
    }
  } catch (error) {
    console.error("Error deleting all user conversations:", error);
    throw error;
  }
}

// Function to update a conversation title
export async function updateConversationTitle(
  conversationId: string,
  newTitle: string
): Promise<void> {
  try {
    const conversationRef = doc(db, "conversations", conversationId);
    await updateDoc(conversationRef, {
      title: newTitle,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating conversation title:", error);
    throw error;
  }
}
