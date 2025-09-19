import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  X,
  Trash2,
  User as UserIcon,
  Plus,
  PanelRight,
  Lock,
  ChevronRight,
  Settings,
  Info,
  MessageSquare,
  HelpCircle,
  Shield,
  AlertTriangle,
  Github,
  ExternalLink,
  Heart,
} from "lucide-react";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { useAuth } from "../../hooks/useAuth";
import { formatDistanceToNow } from "date-fns";
import { Timestamp } from "firebase/firestore";
import { useChatContext } from "@/hooks/useChatContext";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { cn } from "../../lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { HeartCounter } from "../HeartCounter";

interface SidebarProps {
  className?: string;
  isMobile?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
  onClose?: () => void;
  onOpenProfile?: () => void;
}

export function Sidebar({
  isMobile = false,
  isOpen = true,
  onClose,
  onOpenProfile,
}: SidebarProps) {
  const {
    isLoading,
    activeConversationId,
    conversations,
    clearChat,
    loadConversation,
    loadUserConversations,
  } = useChatContext();

  // Use useAuth only once
  const { user, userData } = useAuth();

  // Use useMemo for complex operations
  const navigate = useNavigate();
  const location = useLocation();

  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<
    string | null
  >(null);
  const [avatarError, setAvatarError] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [securityInfoOpen, setSecurityInfoOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  // Save sidebar collapsed state to localStorage
  useEffect(() => {
    if (isDesktop) {
      const savedCollapsed =
        localStorage.getItem("sidebarCollapsed") === "true";
      if (isCollapsed !== savedCollapsed) {
        setIsCollapsed(savedCollapsed);
      }
    }
  }, [isDesktop, isCollapsed]);

  // Save active conversation to localStorage
  useEffect(() => {
    if (activeConversationId) {
      localStorage.setItem("lastActiveConversation", activeConversationId);
    }
  }, [activeConversationId]);

  // Restore last active conversation on mount
  useEffect(() => {
    const savedConversation = localStorage.getItem("lastActiveConversation");
    if (
      savedConversation &&
      !activeConversationId &&
      conversations.some((c) => c.id === savedConversation)
    ) {
      loadConversation(savedConversation);
    }
  }, []);

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("sidebarCollapsed", newState.toString());
  };

  const handleNewChat = () => {
    navigate("/new");
    if (onClose) {
      onClose();
    }
  };

  const handleSelectConversation = (conversationId: string) => {
    navigate(`/chat/${conversationId}`);
    if (onClose) {
      onClose();
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation();
    setConversationToDelete(conversationId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (conversationToDelete) {
      setIsDeleting(true);
      try {
        await deleteConversation(conversationToDelete);
        // If we deleted the active conversation, clear the chat
        if (conversationToDelete === activeConversationId) {
          clearChat();
          // Navigate to new chat if we're on the deleted chat's page
          if (location.pathname === `/chat/${conversationToDelete}`) {
            navigate("/new");
          }
        }
        // Refresh the conversations list
        if (user) {
          await loadUserConversations();
        }
      } catch (error) {
        console.error("Error deleting conversation:", error);
      } finally {
        setIsDeleting(false);
        setDeleteDialogOpen(false);
        setConversationToDelete(null);
      }
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setConversationToDelete(null);
  };

  // Get display name from the user data
  const displayName =
    userData?.displayName || user?.email?.split("@")[0] || "User";

  // Generate a color based on conversation id for visual differentiation
  const getConversationColor = (id: string) => {
    const colors = [
      "from-rose-500/30 to-orange-500/30",
      "from-emerald-500/30 to-teal-500/30",
      "from-blue-500/30 to-indigo-500/30",
      "from-violet-500/30 to-purple-500/30",
      "from-pink-500/30 to-rose-500/30",
      "from-amber-500/30 to-yellow-500/30",
    ];
    const colorIndex =
      [...id].reduce((acc, char) => acc + char.charCodeAt(0), 0) %
      colors.length;
    return colors[colorIndex];
  };

  const sidebarClass = cn(
    `flex flex-col ${
      isMobile ? "h-[100dvh]" : "h-full"
    } bg-[#121212] border-r border-[#333]/40 shadow-xl`,
    "transition-[width] duration-200 ease-in-out",
    {
      "w-full max-w-xs": !isCollapsed,
      "w-14": isCollapsed,
      "translate-x-0": isOpen,
      "-translate-x-full": !isOpen && onClose,
    }
  );

  if (isMobile && !isOpen) {
    return null;
  }

  // Update the conversation items to highlight based on current route
  const isActiveConversation = (conversationId: string) => {
    return location.pathname === `/chat/${conversationId}`;
  };

  // Render expanded or collapsed sidebar
  if (isDesktop && isCollapsed) {
    return (
      <>
        <aside className={sidebarClass}>
          <div className="flex flex-col h-full overflow-hidden relative z-[1000]">
            {/* Header with logo and controls */}
            <div className="p-3 border-b border-[#333]/40">
              <div className="flex flex-col items-center gap-3">
                {/* Logo/New Chat button */}
                <Button
                  onClick={handleNewChat}
                  className="h-10 w-10 p-0 rounded-full bg-gradient-to-br from-[#e67553] to-[#d86a4a] hover:from-[#e67553]/90 hover:to-[#d86a4a]/90 text-white shadow-lg hover:shadow-[#e67553]/20 hover:shadow-xl transition-all duration-300"
                  disabled={isLoading}
                  title="New Chat"
                >
                  <Plus className="h-4 w-4" />
                </Button>

                {/* Toggle button */}
                <Button
                  onClick={toggleCollapse}
                  className="h-8 w-8 p-0 rounded-full bg-[#222] hover:bg-[#2a2a2a] transition-all duration-300 hover:shadow-md border border-[#333]/50 group"
                  title="Expand sidebar"
                >
                  <ChevronRight
                    size={16}
                    className="text-[#e67553] group-hover:translate-x-0.5 transition-transform duration-300"
                  />
                </Button>
              </div>
            </div>

            {/* Conversations */}
            <ScrollArea className="flex-1 py-2">
              {isLoading ? (
                <div className="flex justify-center items-center h-16">
                  <div className="h-4 w-4 rounded-full border-2 border-[#e67553] border-t-transparent animate-spin" />
                </div>
              ) : conversations && conversations.length > 0 ? (
                <div className="flex flex-col items-center gap-2 px-2">
                  {conversations.map((conversation) => (
                    <button
                      key={conversation.id}
                      className={cn(
                        "w-full h-9 rounded-full flex justify-center items-center transition-all",
                        isActiveConversation(conversation.id)
                          ? "bg-[#333] shadow-md"
                          : "hover:bg-[#222]/80"
                      )}
                      onClick={() => handleSelectConversation(conversation.id)}
                      title={conversation.title || "Conversation"}
                    >
                      <MessageSquare
                        className={cn(
                          "h-4 w-4",
                          isActiveConversation(conversation.id)
                            ? "text-[#e67553]"
                            : "text-gray-400"
                        )}
                      />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex justify-center py-4">
                  <HelpCircle className="h-4 w-4 text-gray-500" />
                </div>
              )}
            </ScrollArea>

            {/* Quick actions */}
            <div className="flex flex-col items-center gap-2 py-3 border-t border-[#333]/40">
              <button
                onClick={() => setSecurityInfoOpen(true)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#222]/70 transition-colors"
                title="Security & Privacy"
              >
                <Lock className="h-4 w-4 text-[#e67553]" />
              </button>
              <button
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#222]/70 transition-colors"
                title="Settings"
              >
                <Settings className="h-4 w-4 text-gray-400" />
              </button>
              <button
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#222]/70 transition-colors"
                title="Help & FAQ"
              >
                <Info className="h-4 w-4 text-gray-400" />
              </button>
            </div>

            {/* User profile */}
            {user && (
              <div className="flex justify-center p-3 mt-auto border-t border-[#333]/40 bg-gradient-to-b from-transparent to-[#151515]">
                <button
                  className="w-8 h-8 rounded-full overflow-hidden border border-[#444] shadow-md"
                  onClick={onOpenProfile}
                  title={displayName}
                >
                  {userData?.photoURL && !avatarError ? (
                    <img
                      src={userData.photoURL}
                      alt={displayName}
                      className="h-full w-full object-cover"
                      onError={() => setAvatarError(true)}
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-[#e67553]/50 to-[#d86a4a]/50">
                      <UserIcon className="h-3 w-3 text-white" />
                    </div>
                  )}
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* Dialog components */}
        <AlertDialog open={securityInfoOpen} onOpenChange={setSecurityInfoOpen}>
          <AlertDialogContent className="bg-[#161616] border border-[#333] max-w-xl">
            <AlertDialogHeader>
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-[#e67553]" />
                <AlertDialogTitle>Security & Privacy</AlertDialogTitle>
              </div>
              <AlertDialogDescription className="space-y-4 text-left">
                <div className="bg-[#222]/50 p-4 rounded-lg border border-[#333]/80">
                  <h3 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                    <Lock className="h-4 w-4 text-[#e67553]" />
                    End-to-End Encryption
                  </h3>
                  <p className="text-sm text-gray-400">
                    Your conversations are secured with Firebase Authentication
                    and Firestore security rules. Only you can access your chat
                    history.
                  </p>
                </div>

                <div className="bg-[#222]/50 p-4 rounded-lg border border-[#333]/80">
                  <h3 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    Data Usage
                  </h3>
                  <p className="text-sm text-gray-400">
                    Your conversations may be processed by our AI services to
                    generate responses. We may use anonymized data to improve
                    our AI models.
                  </p>
                </div>

                <p className="text-xs text-gray-500 pt-2">
                  For more details, please review our Privacy Policy and Terms
                  of Service. You can request deletion of your data at any time
                  through your profile settings.
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction className="bg-[#222] hover:bg-[#333] border-[#444]">
                Close
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  // Expanded sidebar
  return (
    <>
      <aside className={sidebarClass}>
        <div className="flex flex-col h-full overflow-hidden relative">
          <div className="p-3 border-b border-[#333]/40">
            <div className="flex items-center gap-2">
              {/* New Chat button */}
              <Button
                onClick={handleNewChat}
                className="flex-1 flex items-center gap-2 py-5 rounded-lg bg-gradient-to-br from-[#e67553] to-[#d86a4a] hover:from-[#e67553]/90 hover:to-[#d86a4a]/90 text-white transition-all duration-300 shadow-lg hover:shadow-[#e67553]/20 hover:shadow-xl"
                disabled={isLoading}
              >
                <Plus className="h-4 w-4" />
                <span className="font-medium">New Chat</span>
              </Button>

              {/* Toggle button */}
              {isDesktop ? (
                <Button
                  onClick={toggleCollapse}
                  className="h-10 w-10 p-0 rounded-full bg-[#222] hover:bg-[#2a2a2a] transition-colors duration-200 hover:shadow-md border border-[#333]/50 group"
                  title="Collapse sidebar"
                >
                  <ChevronRight
                    className="rotate-180 text-[#e67553] group-hover:-translate-x-0.5 transition-transform duration-200"
                    size={16}
                  />
                </Button>
              ) : onClose ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full hover:bg-[#333]/20 transition-all duration-300"
                  onClick={onClose}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </Button>
              ) : null}
            </div>
          </div>

          <ScrollArea className="flex-1 overflow-y-auto px-2 py-3">
            {isLoading ? (
              <div className="flex justify-center items-center h-16">
                <div className="h-5 w-5 rounded-full border-2 border-[#e67553] border-t-transparent animate-spin" />
              </div>
            ) : conversations && conversations.length > 0 ? (
              <AnimatePresence initial={false}>
                {conversations.map((conversation) => (
                  <motion.div
                    key={conversation.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div
                      className={cn(
                        "flex items-center justify-between p-3 my-1.5 rounded-md cursor-pointer group relative overflow-hidden",
                        isActiveConversation(conversation.id)
                          ? "bg-[#2a2a2a] border-l-2 border-[#e67553]"
                          : "hover:bg-[#222]"
                      )}
                      onClick={() => handleSelectConversation(conversation.id)}
                    >
                      {/* Subtle gradient background for non-active items */}
                      {!isActiveConversation(conversation.id) && (
                        <div
                          className={cn(
                            "absolute inset-0 opacity-10 pointer-events-none",
                            getConversationColor(conversation.id)
                          )}
                        />
                      )}

                      <div className="flex-1 overflow-hidden">
                        <div className="text-sm font-medium truncate">
                          {conversation.title || "New Conversation"}
                        </div>
                        <div className="text-xs text-gray-400 truncate mt-0.5">
                          {conversation.updatedAt &&
                            formatDistanceToNow(
                              (
                                conversation.updatedAt as unknown as Timestamp
                              ).toDate(),
                              { addSuffix: true }
                            )}
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity",
                          isDeleting && conversationToDelete === conversation.id
                            ? "opacity-100"
                            : ""
                        )}
                        onClick={(e) => handleDeleteClick(e, conversation.id)}
                        disabled={
                          isDeleting && conversationToDelete === conversation.id
                        }
                      >
                        {isDeleting &&
                        conversationToDelete === conversation.id ? (
                          <div className="h-4 w-4 rounded-full border-2 border-red-500 border-t-transparent animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500 transition-colors" />
                        )}
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            ) : (
              <div className="text-center py-6 px-4">
                <div className="bg-gradient-to-r from-[#222] to-[#1a1a1a] rounded-lg p-4 shadow-inner">
                  <p className="text-sm text-gray-400 mb-2">
                    No conversations yet
                  </p>
                  <p className="text-xs text-gray-500">
                    Click the "New Chat" button to start a conversation with
                    Swasth AI
                  </p>
                </div>
              </div>
            )}
          </ScrollArea>

          <div className="px-2 py-2 border-t border-[#333]/40">
            {/* Mobile-only links */}
            {isMobile && (
              <div className="space-y-1 mb-2">
                <a
                  href="https://github.com/itskrish01"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#222]/70 transition-colors"
                >
                  <Github className="h-4 w-4 text-[#e67553]" />
                  <span className="text-sm">GitHub</span>
                </a>
                <a
                  href="https://krishtasood.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#222]/70 transition-colors"
                >
                  <ExternalLink className="h-4 w-4 text-[#e67553]" />
                  <span className="text-sm">Portfolio</span>
                </a>
                <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#222]/70 transition-colors">
                  <Heart className="h-4 w-4 text-[#e67553]" />
                  <span className="text-sm">Likes</span>
                  <div className="ml-auto">
                    <HeartCounter />
                  </div>
                </div>
              </div>
            )}

            <div
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#222]/70 transition-colors cursor-pointer mb-1"
              onClick={() => setSecurityInfoOpen(true)}
            >
              <Lock className="h-4 w-4 text-[#e67553]" />
              <span className="text-sm">Security & Privacy</span>
            </div>
          </div>

          {/* User profile section */}
          {user && (
            <div className="p-3 mt-auto border-t border-[#333]/40 bg-gradient-to-b from-transparent to-[#151515]">
              <div
                className="flex items-center gap-2 p-2 rounded-lg bg-[#1a1a1a] hover:bg-[#222] transition-colors cursor-pointer border border-[#333]/40"
                onClick={onOpenProfile}
              >
                <Avatar className="h-8 w-8 border border-[#444]">
                  {userData?.photoURL && !avatarError ? (
                    <AvatarImage
                      src={userData.photoURL}
                      alt={displayName}
                      onError={() => setAvatarError(true)}
                    />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-[#e67553]/50 to-[#d86a4a]/50">
                      <UserIcon className="h-4 w-4 text-white" />
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <div className="text-sm font-medium truncate">
                    {displayName}
                  </div>
                  <div className="text-xs text-gray-400 truncate">
                    {user.email}
                  </div>
                </div>
                <PanelRight className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Delete Conversation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-[#161616] border border-[#333]">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this conversation and all of its
              messages. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="bg-[#222] hover:bg-[#333] border-[#444]"
              onClick={handleCancelDelete}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleConfirmDelete}
            >
              {isDeleting ? (
                <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin mx-4" />
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Security Info Dialog */}
      <AlertDialog open={securityInfoOpen} onOpenChange={setSecurityInfoOpen}>
        <AlertDialogContent className="bg-[#161616] border border-[#333] max-w-xl">
          <AlertDialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-[#e67553]" />
              <AlertDialogTitle>Security & Privacy</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="space-y-4 text-left">
              <div className="bg-[#222]/50 p-4 rounded-lg border border-[#333]/80">
                <h3 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                  <Lock className="h-4 w-4 text-[#e67553]" />
                  End-to-End Encryption
                </h3>
                <p className="text-sm text-gray-400">
                  Your conversations are secured with Firebase Authentication
                  and Firestore security rules. Only you can access your chat
                  history.
                </p>
              </div>

              <div className="bg-[#222]/50 p-4 rounded-lg border border-[#333]/80">
                <h3 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  Data Usage
                </h3>
                <p className="text-sm text-gray-400">
                  Your conversations may be processed by our AI services to
                  generate responses. We may use anonymized data to improve our
                  AI models.
                </p>
              </div>

              <p className="text-xs text-gray-500 pt-2">
                For more details, please review our Privacy Policy and Terms of
                Service. You can request deletion of your data at any time
                through your profile settings.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction className="bg-[#222] hover:bg-[#333] border-[#444]">
              Close
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// Helper function to delete a conversation
async function deleteConversation(conversationId: string): Promise<void> {
  const { deleteConversation } = await import("../../lib/chat-service");
  return deleteConversation(conversationId);
}
