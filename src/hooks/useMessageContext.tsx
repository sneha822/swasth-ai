import { useContext, useState, ReactNode, useEffect } from "react";
import { Message } from "../lib/gemini/service";
import { saveMessage } from "../lib/chat-service";
import { MessageContext } from "../contexts/MessageContext";

type ChatResponse = string | { text: string; imageUrl?: string };

export function useMessageContext() {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error("useMessageContext must be used within a MessageProvider");
  }
  return context;
}

export function MessageProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Listen for custom AI message events
  useEffect(() => {
    const handleAddAIMessage = (event: any) => {
      const aiMessage = event.detail;
      setMessages((prev) => [...prev, aiMessage]);
    };

    window.addEventListener('addAIMessage', handleAddAIMessage);
    return () => window.removeEventListener('addAIMessage', handleAddAIMessage);
  }, []);

  const handleMessage = async (
    content: string,
    responseHandler: (messages: Message[]) => Promise<ChatResponse>,
    conversationId: string,
    onSuccess?: () => Promise<void>
  ) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      await saveMessage(conversationId, userMessage);

      const recentMessages = [...messages, userMessage].slice(-10);
      const response = await responseHandler(recentMessages);

      const assistantMessage: Message =
        typeof response === "string"
          ? {
              id: crypto.randomUUID(),
              role: "assistant",
              content: response,
              timestamp: Date.now(),
            }
          : {
              id: crypto.randomUUID(),
              role: "assistant",
              content: response.text,
              imageUrl: response.imageUrl,
              timestamp: Date.now(),
            };

      setMessages((prev) => [...prev, assistantMessage]);
      await saveMessage(conversationId, assistantMessage);
      if (onSuccess) {
        await onSuccess();
      }
    } catch (error) {
      console.error("Error handling message:", error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Sorry, I couldn't process your request. Please try again.",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      await saveMessage(conversationId, errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MessageContext.Provider
      value={{
        messages,
        setMessages,
        isLoading,
        handleMessage,
      }}
    >
      {children}
    </MessageContext.Provider>
  );
}
