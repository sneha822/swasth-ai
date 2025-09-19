import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { User } from "firebase/auth";
import { ChatConversation } from "../../lib/chat-service";
import { UserData } from "../../lib/auth";
import {
  X,
  Trash2,
  User as UserIcon,
  Plus,
  MessageSquare,
  Lock,
  Heart,
  ChevronRight,
  Shield,
  Sparkles,
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

  const { user, userData } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<
    string | null
  >(null);
  const [avatarError, setAvatarError] = useState(false);
  const [securityInfoOpen, setSecurityInfoOpen] = useState(false);

  // Save active conversation to localStorage
  useEffect(() => {
    if (activeConversationId) {
      localStorage.setItem("lastActiveConversation", activeConversationId);
    }
  }, [activeConversationId]);

  // Restore last active conversation on mount (but NOT on /new to avoid flashing)
  useEffect(() => {
    const savedConversation = localStorage.getItem("lastActiveConversation");
    const onNewPage = location.pathname === "/new";
    if (
      !onNewPage &&
      savedConversation &&
      !activeConversationId &&
      conversations.some((c) => c.id === savedConversation)
    ) {
      loadConversation(savedConversation);
    }
  }, [
    activeConversationId,
    conversations,
    loadConversation,
    location.pathname,
  ]);

  const handleNewChat = () => {
    navigate("/new");
    if (onClose) onClose();
  };

  const handleSelectConversation = (conversationId: string) => {
    navigate(`/chat/${conversationId}`);
    if (onClose) onClose();
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
        if (conversationToDelete === activeConversationId) {
          clearChat();
          if (location.pathname === `/chat/${conversationToDelete}`) {
            navigate("/new");
          }
        }
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

  const displayName =
    userData?.displayName || user?.email?.split("@")[0] || "User";

  const isActiveConversation = (conversationId: string) => {
    return location.pathname === `/chat/${conversationId}`;
  };

  // Mobile overlay backdrop
  if (isMobile && isOpen) {
    return (
      <>
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />

        {/* Mobile Sidebar */}
        <motion.aside
          initial={{ x: "-100%" }}
          animate={{ x: 0 }}
          exit={{ x: "-100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed left-0 top-0 bottom-0 z-50 w-80 bg-gradient-to-b from-[#0a1121] to-[#0f1629] border-r border-[#1e3a5f]/40 shadow-2xl lg:hidden"
        >
          <SidebarContent
            isMobile={true}
            onClose={onClose}
            onOpenProfile={onOpenProfile}
            {...{
              isLoading,
              activeConversationId,
              conversations,
              user,
              userData,
              displayName,
              avatarError,
              setAvatarError,
              handleNewChat,
              handleSelectConversation,
              handleDeleteClick,
              isActiveConversation,
              isDeleting,
              conversationToDelete,
              setSecurityInfoOpen,
            }}
          />
        </motion.aside>

        {/* Dialogs */}
        <DeleteConversationDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          isDeleting={isDeleting}
        />
        <SecurityInfoDialog
          open={securityInfoOpen}
          onOpenChange={setSecurityInfoOpen}
        />
      </>
    );
  }

  // Desktop sidebar
  if (isDesktop) {
    return (
      <>
        <aside className="w-80 h-full bg-gradient-to-b from-[#0a1121] to-[#0f1629] border-r border-[#1e3a5f]/40 shadow-xl">
          <SidebarContent
            isMobile={false}
            onClose={onClose}
            onOpenProfile={onOpenProfile}
            {...{
              isLoading,
              activeConversationId,
              conversations,
              user,
              userData,
              displayName,
              avatarError,
              setAvatarError,
              handleNewChat,
              handleSelectConversation,
              handleDeleteClick,
              isActiveConversation,
              isDeleting,
              conversationToDelete,
              setSecurityInfoOpen,
            }}
          />
        </aside>

        {/* Dialogs */}
        <DeleteConversationDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          isDeleting={isDeleting}
        />
        <SecurityInfoDialog
          open={securityInfoOpen}
          onOpenChange={setSecurityInfoOpen}
        />
      </>
    );
  }

  return (
    <>
      {/* Dialogs for mobile when sidebar is closed */}
      <DeleteConversationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isDeleting={isDeleting}
      />
      <SecurityInfoDialog
        open={securityInfoOpen}
        onOpenChange={setSecurityInfoOpen}
      />
    </>
  );
}

// Settings Button Component with Dialog

// Shared sidebar content component
interface SidebarContentProps {
  isMobile: boolean;
  onClose?: () => void;
  onOpenProfile?: () => void;
  isLoading: boolean;
  conversations: ChatConversation[];
  user: User | null;
  userData: UserData | null;
  displayName: string;
  avatarError: boolean;
  setAvatarError: (error: boolean) => void;
  handleNewChat: () => void;
  handleSelectConversation: (id: string) => void;
  handleDeleteClick: (e: React.MouseEvent, id: string) => void;
  isActiveConversation: (id: string) => boolean;
  isDeleting: boolean;
  conversationToDelete: string | null;
  setSecurityInfoOpen: (open: boolean) => void;
}

function SidebarContent({
  isMobile,
  onClose,
  onOpenProfile,
  isLoading,
  conversations,
  user,
  userData,
  displayName,
  avatarError,
  setAvatarError,
  handleNewChat,
  handleSelectConversation,
  handleDeleteClick,
  isActiveConversation,
  isDeleting,
  conversationToDelete,
  setSecurityInfoOpen,
}: SidebarContentProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="py-2 px-2 border-b border-[#1e3a5f]/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#89f7fe] to-[#66a6ff] flex items-center justify-center shadow-lg">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <div className="text-lg font-semibold text-white">Swasth AI</div>
          </div>
          {isMobile && (
            <Button
              onClick={onClose}
              className="w-8 h-8 p-0 rounded-lg bg-[#1e3a5f]/20 hover:bg-[#1e3a5f]/40 border border-[#1e3a5f]/40"
            >
              <X className="w-4 h-4 text-gray-400" />
            </Button>
          )}
        </div>

        {/* New Chat Button */}
        <Button
          onClick={handleNewChat}
          className="w-full h-12 bg-gradient-to-r from-[#89f7fe] to-[#66a6ff] hover:from-[#0ea5e9] hover:to-[#3b82f6] text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
          disabled={isLoading}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
          <Plus className="w-4 h-4 mr-2 relative z-10" />
          <span className="relative z-10">New Health Chat</span>
          <Sparkles className="w-3 h-3 ml-2 opacity-70 relative z-10" />
        </Button>
      </div>

      {/* Conversations */}
      <ScrollArea className="flex-1 px-2 py-1">
        {isLoading ? (
          <div className="flex items-center justify-center h-16">
            <div className="w-6 h-6 border-2 border-[#89f7fe] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : conversations && conversations.length > 0 ? (
          <div className="space-y-0.5">
            <AnimatePresence>
              {conversations.map(
                (conversation: ChatConversation, index: number) => (
                  <motion.div
                    key={conversation.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className={cn(
                      "group relative p-2.5 rounded-lg cursor-pointer transition-all duration-200",
                      isActiveConversation(conversation.id)
                        ? "bg-gradient-to-r from-[#89f7fe]/10 to-[#66a6ff]/10 border border-[#89f7fe]/30 shadow-md"
                        : "hover:bg-[#1e3a5f]/20 border border-transparent"
                    )}
                    onClick={() => handleSelectConversation(conversation.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <MessageSquare
                            className={cn(
                              "w-3.5 h-3.5 flex-shrink-0",
                              isActiveConversation(conversation.id)
                                ? "text-[#89f7fe]"
                                : "text-gray-400"
                            )}
                          />
                          <h3 className="text-sm font-medium text-white truncate leading-tight">
                            {conversation.title || "New Conversation"}
                          </h3>
                        </div>
                        <p className="text-xs text-gray-400 truncate leading-tight">
                          {conversation.updatedAt &&
                            formatDistanceToNow(
                              (
                                conversation.updatedAt as unknown as Timestamp
                              ).toDate(),
                              { addSuffix: true }
                            )}
                        </p>
                      </div>

                      <Button
                        onClick={(e) => handleDeleteClick(e, conversation.id)}
                        disabled={
                          isDeleting && conversationToDelete === conversation.id
                        }
                        className="w-7 h-7 p-0 rounded-md bg-red-500/5 hover:bg-red-500/15 border border-red-500/10 hover:border-red-500/30 opacity-0 group-hover:opacity-100 transition-all duration-200 group/delete"
                      >
                        {isDeleting &&
                        conversationToDelete === conversation.id ? (
                          <div className="w-3 h-3 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5 text-red-400 hover:text-red-300 group-hover/delete:scale-110 transition-all duration-200" />
                        )}
                      </Button>
                    </div>
                  </motion.div>
                )
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-32 text-center px-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1e3a5f]/20 to-[#89f7fe]/10 flex items-center justify-center mb-3">
              <MessageSquare className="w-6 h-6 text-gray-500" />
            </div>
            <h3 className="text-sm font-medium text-gray-400 mb-1">
              No conversations yet
            </h3>
            <p className="text-xs text-gray-500">
              Start your first health conversation!
            </p>
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-[#1e3a5f]/30 space-y-3">
        {/* Quick Actions */}
          <Button
            onClick={() => setSecurityInfoOpen(true)}
            className="h-9 bg-[#1e3a5f]/15 hover:bg-[#1e3a5f]/30 border w-full border-[#1e3a5f]/30 hover:border-[#89f7fe]/40 rounded-lg transition-all duration-200 group"
            title="Security & Privacy"
          >
            <Shield className="w-4 h-4 text-[#89f7fe] group-hover:scale-110 transition-transform duration-200" />
          </Button>

        {/* User Profile */}
        {user && (
          <div
            onClick={onOpenProfile}
            className="flex items-center gap-3 p-3 bg-[#1e3a5f]/20 hover:bg-[#1e3a5f]/30 border border-[#1e3a5f]/40 rounded-xl cursor-pointer transition-all duration-200"
          >
            <Avatar className="w-10 h-10 border-2 border-[#89f7fe]/30">
              {userData?.photoURL && !avatarError ? (
                <AvatarImage
                  src={userData.photoURL}
                  alt={displayName}
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <AvatarFallback className="bg-gradient-to-br from-[#22d3ee]/20 to-[#60a5fa]/20">
                  <UserIcon className="w-5 h-5 text-[#89f7fe]" />
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {displayName}
              </p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#89f7fe] group-hover:translate-x-1 transition-all duration-200" />
          </div>
        )}
      </div>
    </div>
  );
}

// Delete Conversation Dialog Component
interface DeleteConversationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}

function DeleteConversationDialog({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  isDeleting,
}: DeleteConversationDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-gradient-to-b from-[#0f1629] to-[#0a1121] border border-[#1e3a5f]/60 shadow-2xl max-w-md">
        <AlertDialogHeader className="text-center pb-4">
          <div className="mx-auto w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
            <Trash2 className="w-6 h-6 text-red-400" />
          </div>
          <AlertDialogTitle className="text-white text-lg font-semibold">
            Delete Conversation?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-400 text-sm leading-relaxed">
            This will permanently delete this health conversation and all of its
            messages.
            <br />
            <span className="text-red-400/80 font-medium">
              This action cannot be undone.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex gap-3 pt-4">
          <AlertDialogCancel
            onClick={onCancel}
            className="flex-1 bg-[#1e3a5f]/20 hover:bg-[#1e3a5f]/30 border-[#1e3a5f]/40 text-white hover:text-white transition-all duration-200"
          >
            Keep Conversation
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white transition-all duration-200 shadow-lg hover:shadow-red-500/20"
          >
            {isDeleting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-2" />
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Security Info Dialog Component
interface SecurityInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function SecurityInfoDialog({ open, onOpenChange }: SecurityInfoDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-gradient-to-b from-[#0f1629] to-[#0a1121] border border-[#1e3a5f]/60 shadow-2xl max-w-lg">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#22d3ee]/20 to-[#60a5fa]/20 flex items-center justify-center ring-2 ring-[#89f7fe]/10">
              <Shield className="w-6 h-6 text-[#89f7fe]" />
            </div>
            <div>
              <AlertDialogTitle className="text-white text-lg font-semibold">
                Security & Privacy
              </AlertDialogTitle>
              <p className="text-xs text-[#89f7fe]/80">
                Your health data is protected
              </p>
            </div>
          </div>
          <AlertDialogDescription className="space-y-4 text-left">
            <div className="p-4 bg-gradient-to-r from-[#1e3a5f]/15 to-[#89f7fe]/5 rounded-xl border border-[#1e3a5f]/30">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center">
                  <Lock className="w-3 h-3 text-green-400" />
                </div>
                <h4 className="text-sm font-semibold text-white">
                  End-to-End Security
                </h4>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">
                Your health conversations are secured with Firebase
                Authentication and encrypted storage. Only you can access your
                personal health data and conversation history.
              </p>
            </div>
            <div className="p-4 bg-gradient-to-r from-[#1e3a5f]/15 to-[#89f7fe]/5 rounded-xl border border-[#1e3a5f]/30">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-blue-400" />
                </div>
                <h4 className="text-sm font-semibold text-white">
                  AI Processing
                </h4>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">
                Your messages are processed by Google's Gemini AI to provide
                personalized health insights. We use anonymized data to improve
                our health recommendations.
              </p>
            </div>
            <div className="p-3 bg-yellow-500/5 rounded-lg border border-yellow-500/20">
              <p className="text-xs text-yellow-200/80 leading-relaxed">
                <strong>Medical Disclaimer:</strong> Swasth AI provides health
                information for educational purposes only. Always consult
                qualified healthcare professionals for medical advice,
                diagnosis, or treatment.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction className="bg-gradient-to-r from-[#89f7fe] to-[#66a6ff] hover:from-[#0ea5e9] hover:to-[#3b82f6] text-white shadow-lg hover:shadow-[#89f7fe]/20 transition-all duration-200">
            <Shield className="w-4 h-4 mr-2" />
            Understood
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}



// Helper function to delete a conversation
async function deleteConversation(conversationId: string): Promise<void> {
  const { deleteConversation } = await import("../../lib/chat-service");
  return deleteConversation(conversationId);
}
