import { Message } from "../lib/gemini/service";
import { ChatConversation } from "../lib/chat-service";
import { HealthMode } from "../lib/health-modes";

export interface ChatContextType {
  messages: Message[];
  isLoading: boolean;
  activeConversationId: string | null;
  conversations: ChatConversation[];
  currentHealthMode: HealthMode;
  language: 'en' | 'hi';
  sendMessage: (content: string, healthMode?: HealthMode) => Promise<string | null>;
  clearChat: () => void;
  newConversation: () => void;
  loadConversation: (conversationId: string) => Promise<void>;
  loadUserConversations: () => Promise<void>;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setActiveConversationId: React.Dispatch<React.SetStateAction<string | null>>;
  setCurrentHealthMode: (mode: HealthMode) => void;
  setLanguage: (language: 'en' | 'hi') => void;
}

// User health profile interface for personalized suggestions
export interface UserHealthProfile {
  id: string;
  userId: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  height?: number; // in cm
  weight?: number; // in kg
  bloodGroup?: string;
  allergies?: string[];
  medications?: string[];
  medicalConditions?: string[];
  emergencyContact?: {
    name: string;
    phone: string;
    relation: string;
  };
  preferences?: {
    dietType?: 'vegetarian' | 'non-vegetarian' | 'vegan';
    exerciseLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
    sleepHours?: number;
    stressLevel?: 'low' | 'medium' | 'high';
  };
  createdAt: Date;
  updatedAt: Date;
}
