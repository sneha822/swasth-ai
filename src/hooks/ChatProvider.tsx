import { useState, ReactNode, useEffect, useCallback } from "react";
import { getChatResponse } from "../lib/gemini/service";
import { useAuth } from "./useAuth";
import {
  createConversation,
  getUserConversations,
  getConversationMessages,
  ChatConversation,
} from "../lib/chat-service";
import { useMessageContext } from "./useMessageContext";
import { ChatContext } from "../contexts/ChatContext";
import { HealthMode, DEFAULT_MODE } from "../lib/health-modes";

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { messages, setMessages, isLoading, handleMessage } =
    useMessageContext();
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [currentHealthMode, setCurrentHealthMode] = useState<HealthMode>(DEFAULT_MODE);
  const [language, setLanguage] = useState<'en' | 'hi'>(() => {
    // Load language from localStorage, default to 'en'
    const savedLanguage = localStorage.getItem('swasth-ai-language');
    return (savedLanguage === 'hi' || savedLanguage === 'en') ? savedLanguage : 'en';
  });

  const loadUserConversations = useCallback(async () => {
    if (!user) return;
    try {
      const userConversations = await getUserConversations(user.uid);
      setConversations(userConversations);
      // Do not auto-load the first conversation here to avoid flashing on /new.
      // Let the route-driven logic load a conversation when the URL contains an id.
    } catch (error) {
      console.error("Error loading conversations:", error);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadUserConversations();
    } else {
      setConversations([]);
      setMessages([]);
      setActiveConversationId(null);
    }
  }, [user, loadUserConversations, setMessages]);

  const newConversation = useCallback(() => {
    setMessages([]);
    setActiveConversationId(null);
  }, [setMessages]);

  const loadConversation = useCallback(
    async (conversationId: string) => {
      if (!user) return;
      try {
        const conversationMessages = await getConversationMessages(
          conversationId
        );
        setMessages(conversationMessages);
        setActiveConversationId(conversationId);
      } catch (error) {
        console.error("Error loading conversation:", error);
      }
    },
    [user, setMessages]
  );

  const sendMessage = useCallback(
    async (content: string, healthMode?: HealthMode) => {
      if (!content.trim() || !user) return null;

      // Use provided health mode or current one
      const modeToUse = healthMode || currentHealthMode;

      let currentConversationId = activeConversationId;
      const isNewConversation = !currentConversationId;
      if (isNewConversation) {
        currentConversationId = await createConversation(user.uid, content);
        setActiveConversationId(currentConversationId);
        // Ensure clean slate for the new conversation
        setMessages([]);
      }

      // Create a custom response handler that includes health mode and language
      const healthResponseHandler = async (messages: { id: string; role: "user" | "assistant"; content: string; timestamp: number }[]) => {
        return await getChatResponse(messages, modeToUse, language, user.uid);
      };

      // If this is a brand new conversation (e.g., from /new), start processing
      // the AI response but return immediately so the UI can navigate and render
      // the user's message while the assistant "thinks".
      if (isNewConversation) {
        // Fire and forget; MessageContext manages isLoading state
        void handleMessage(content, healthResponseHandler, currentConversationId!);
        // Optimistically refresh sidebar so the new chat appears immediately
        void loadUserConversations();
        return currentConversationId;
      } else {
        // Existing conversation flow remains awaited
        await handleMessage(content, healthResponseHandler, currentConversationId!);
        return currentConversationId;
      }
    },
    [
      user,
      activeConversationId,
      currentHealthMode,
      language,
      handleMessage,
      loadUserConversations,
      setMessages,
    ]
  );

  const clearChat = useCallback(() => {
    setMessages([]);
    setActiveConversationId(null);
  }, [setMessages]);

  // Enhanced setLanguage function that saves to localStorage
  const setLanguageWithPersistence = useCallback((newLanguage: 'en' | 'hi') => {
    setLanguage(newLanguage);
    localStorage.setItem('swasth-ai-language', newLanguage);
  }, []);

  return (
    <ChatContext.Provider
      value={{
        messages,
        isLoading,
        activeConversationId,
        conversations,
        currentHealthMode,
        language,
        sendMessage,
        clearChat,
        newConversation,
        loadConversation,
        loadUserConversations,
        setMessages,
        setActiveConversationId,
        setCurrentHealthMode,
        setLanguage: setLanguageWithPersistence,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}
