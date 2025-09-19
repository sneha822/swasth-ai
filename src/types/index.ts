import { Message } from "../lib/gemini/service";
import { ChatConversation } from "../lib/chat-service";

export interface ChatContextType {
  messages: Message[];
  isLoading: boolean;
  isGeneratingImage: boolean;
  activeConversationId: string | null;
  conversations: ChatConversation[];
  sendMessage: (content: string) => Promise<string | null>;
  generateImageFromPrompt: (prompt: string) => Promise<string | null>;
  clearChat: () => void;
  newConversation: () => void;
  loadConversation: (conversationId: string) => Promise<void>;
  loadUserConversations: () => Promise<void>;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setActiveConversationId: React.Dispatch<React.SetStateAction<string | null>>;
}
