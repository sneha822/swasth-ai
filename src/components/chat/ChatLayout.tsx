import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ChatContainer } from "./ChatContainer";
import { ChatInput } from "./ChatInput";
import { useChatContext } from "@/hooks/useChatContext";
import { ChatProvider } from "@/hooks/ChatProvider";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "../layout/DashboardLayout";

function ChatLayoutContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const { conversationId } = useParams();
  const { newConversation, loadConversation, messages, conversations } =
    useChatContext();
  const [chatError, setChatError] = useState<string | null>(null);

  // Handle routing based on URL
  useEffect(() => {
    const initializeChat = async () => {
      if (location.pathname === "/new") {
        setChatError(null);
        if (messages.length > 0) {
          newConversation();
        }
      } else if (conversationId) {
        // Check if the conversation exists
        const conversationExists = conversations.some(
          (conv) => conv.id === conversationId
        );
        if (!conversationExists) {
          setChatError("This chat doesn't exist or has been deleted");
          return;
        }
        setChatError(null);
        await loadConversation(conversationId);
      }
    };
    initializeChat();
  }, [
    location.pathname,
    conversationId,
    newConversation,
    loadConversation,
    messages.length,
    conversations,
  ]);

  return (
    <DashboardLayout>
      <div className="h-full flex flex-col relative">
        {chatError ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="bg-[#1A1A1A] border border-[#333]/60 rounded-lg p-6 max-w-md mx-4 text-center">
              <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">
                Chat Not Found
              </h3>
              <p className="text-gray-400 mb-4">{chatError}</p>
              <Button
                onClick={() => navigate("/new")}
                className="bg-gradient-to-r from-[#89f7fe] to-[#66a6ff] text-white hover:from-[#89f7fe]/90 hover:to-[#66a6ff]/90"
              >
                Start New Chat
              </Button>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col relative">
            <div className="flex-1 overflow-y-auto pb-24">
              <ChatContainer />
            </div>
            <div className="absolute bottom-0 left-0 right-0">
              <ChatInput />
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export function ChatLayout() {
  return (
    <ChatProvider>
      <ChatLayoutContent />
    </ChatProvider>
  );
}
