import { createContext } from "react";
import { Message } from "../lib/gemini/service";

type ChatResponse = string | { text: string; imageUrl?: string };

export interface MessageContextType {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  isLoading: boolean;
  handleMessage: (
    content: string,
    responseHandler: (messages: Message[]) => Promise<ChatResponse>,
    conversationId: string,
    onSuccess?: () => Promise<void>
  ) => Promise<void>;
}

export const MessageContext = createContext<MessageContextType | undefined>(
  undefined
);
