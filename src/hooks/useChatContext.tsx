import { useState, ReactNode, useContext, useEffect, useCallback } from "react";
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

export function useChatContext() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { messages, setMessages, isLoading, handleMessage } =
    useMessageContext();
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const loadUserConversations = useCallback(async () => {
    if (!user) return;
    try {
      const userConversations = await getUserConversations(user.uid);
      setConversations(userConversations);
      if (userConversations.length > 0) {
        await loadConversation(userConversations[0].id);
      } else {
        newConversation();
      }
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
    async (content: string) => {
      if (!content.trim() || !user) return null;
      let currentConversationId = activeConversationId;
      if (!currentConversationId) {
        currentConversationId = await createConversation(user.uid, content);
        setActiveConversationId(currentConversationId);
        setMessages([]);
      }

      await handleMessage(content, getChatResponse, currentConversationId);

      if (!activeConversationId) {
        await loadUserConversations();
      }

      return currentConversationId;
    },
    [
      user,
      activeConversationId,
      handleMessage,
      loadUserConversations,
      setMessages,
    ]
  );

  const generateImageFromPrompt = useCallback(
    async (prompt: string) => {
      if (!prompt.trim() || !user) return null;
      let currentConversationId = activeConversationId;
      if (!currentConversationId) {
        currentConversationId = await createConversation(
          user.uid,
          `Generate image: ${prompt}`
        );
        setActiveConversationId(currentConversationId);
        setMessages([]);
      }
      setIsGeneratingImage(true);
      try {
        await handleMessage(
          `Generate image: ${prompt}`,
          getChatResponse,
          currentConversationId
        );
        if (!activeConversationId) {
          await loadUserConversations();
        }
        return currentConversationId;
      } finally {
        setIsGeneratingImage(false);
      }
    },
    [
      user,
      activeConversationId,
      handleMessage,
      loadUserConversations,
      setMessages,
    ]
  );

  const clearChat = useCallback(() => {
    setMessages([]);
    setActiveConversationId(null);
  }, [setMessages]);

  return (
    <ChatContext.Provider
      value={{
        messages,
        isLoading,
        isGeneratingImage,
        activeConversationId,
        conversations,
        sendMessage,
        generateImageFromPrompt,
        clearChat,
        newConversation,
        loadConversation,
        loadUserConversations,
        setMessages,
        setActiveConversationId,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}
