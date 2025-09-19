import { useState } from "react";
import { Message } from "../lib/gemini/service";
import { useChatContext } from "@/hooks/useChatContext";
import { saveMessage } from "../lib/chat-service";

type ChatResponse = string | { text: string; imageUrl?: string };

export function useMessageHandler() {
  const { messages, activeConversationId, setMessages, loadUserConversations } =
    useChatContext();
  const [isLoading, setIsLoading] = useState(false);

  const handleMessage = async (
    content: string,
    responseHandler: (messages: Message[]) => Promise<ChatResponse>
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
      await saveMessage(activeConversationId!, userMessage);
      const response = await responseHandler([...messages, userMessage]);

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
      await saveMessage(activeConversationId!, assistantMessage);
      await loadUserConversations();
    } catch (error) {
      console.error("Error handling message:", error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Sorry, I couldn't process your request. Please try again.",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      await saveMessage(activeConversationId!, errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    handleMessage,
  };
}
