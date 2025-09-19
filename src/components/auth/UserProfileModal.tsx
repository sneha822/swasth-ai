import { useState, useEffect } from "react";
import {
  User as UserIcon,
  X,
  Trash,
  Pencil,
  Check,
  Loader2,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { updateUserProfile } from "../../lib/auth";
import { deleteAllUserConversations } from "../../lib/chat-service";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserProfileModal({ isOpen, onClose }: UserProfileModalProps) {
  const { user, userData, refreshUserData } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeletingChats, setIsDeletingChats] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Update local state when userData changes
  useEffect(() => {
    if (userData) {
      setDisplayName(userData.displayName || "");
    }
  }, [userData]);

  if (!isOpen || !user) return null;

  const handleUpdateProfile = async () => {
    if (!user) return;

    setIsUpdating(true);
    setUpdateSuccess(false);

    try {
      await updateUserProfile(user.uid, {
        displayName: displayName.trim() || null,
      });
      await refreshUserData();
      setUpdateSuccess(true);
      setIsEditing(false);

      // Reset success message after 3 seconds
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteAllChats = async () => {
    if (!user) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete all your chat history? This action cannot be undone."
    );

    if (!confirmed) return;

    setIsDeletingChats(true);
    setDeleteSuccess(false);

    try {
      await deleteAllUserConversations(user.uid);
      setDeleteSuccess(true);

      // Reset success message after 3 seconds
      setTimeout(() => setDeleteSuccess(false), 3000);
    } catch (error) {
      console.error("Error deleting chat history:", error);
    } finally {
      setIsDeletingChats(false);
    }
  };

  const cancelEdit = () => {
    setDisplayName(userData?.displayName || "");
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-gradient-to-b from-[#1c1c1c] to-[#141414] rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-[#333333]">
        <div className="flex items-center justify-between p-5 border-b border-[#333333]">
          <h2 className="text-xl font-semibold text-white">User Profile</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-full hover:bg-[#333333] transition-colors"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-7">
          <div className="flex flex-col items-center space-y-4 text-center">
            <Avatar className="h-24 w-24 border-2 border-[#444] ring-2 ring-blue-500/30 shadow-xl">
              {userData?.photoURL ? (
                <AvatarImage
                  src={userData.photoURL}
                  alt={userData.displayName || "User"}
                />
              ) : (
                <AvatarFallback className="bg-gradient-to-br from-[#333] to-[#222]">
                  <UserIcon className="h-12 w-12 text-gray-400" />
                </AvatarFallback>
              )}
            </Avatar>

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white">
                {userData?.displayName ||
                  userData?.email?.split("@")[0] ||
                  "User"}
              </h3>
              <p className="text-sm text-gray-400">{userData?.email}</p>
              <p className="text-xs text-gray-500 px-4 py-1 rounded-full bg-[#222222] inline-block mt-2">
                {userData?.provider === "google"
                  ? "Google Account"
                  : "Email Account"}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3 bg-[#1A1A1A]/60 rounded-lg p-4 border border-[#333333]">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="displayName"
                  className="text-sm font-medium text-gray-300"
                >
                  Display Name
                </label>
                {!isEditing ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="h-8 px-2 text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                  >
                    <Pencil className="h-3.5 w-3.5 mr-1" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={cancelEdit}
                      className="h-7 px-2 text-xs text-gray-400 hover:text-gray-300 hover:bg-gray-800/30"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleUpdateProfile}
                      disabled={isUpdating}
                      className="h-7 px-2 text-xs bg-blue-600 hover:bg-blue-700"
                    >
                      {isUpdating ? (
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      ) : (
                        <Check className="h-3.5 w-3.5 mr-1" />
                      )}
                      Save
                    </Button>
                  </div>
                )}
              </div>

              {isEditing ? (
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your display name"
                  className="bg-[#222222] border-[#444444] focus:border-blue-600 h-9"
                  disabled={isUpdating}
                />
              ) : (
                <div className="text-sm bg-[#222222] border border-[#333333] rounded-md p-2.5 px-3 text-gray-300">
                  {userData?.displayName || "Not set"}
                </div>
              )}

              {updateSuccess && (
                <p className="text-green-500 text-xs flex items-center mt-1">
                  <Check className="h-3.5 w-3.5 mr-1" />
                  Profile updated successfully!
                </p>
              )}
            </div>

            <div className="pt-4 border-t border-[#333333]">
              <h4 className="text-sm font-medium mb-3 text-gray-300 flex items-center">
                <Trash className="h-3.5 w-3.5 mr-2 text-red-500" />
                Danger Zone
              </h4>
              <div className="bg-red-900/20 rounded-lg p-4 border border-red-900/30">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-medium text-red-400">
                      Delete Chat History
                    </h5>
                    <p className="text-xs text-gray-400 mt-1">
                      This will permanently delete all your conversations.
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDeleteAllChats}
                    disabled={isDeletingChats}
                    className="bg-red-600 hover:bg-red-700 text-xs h-8"
                  >
                    {isDeletingChats ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash className="h-3.5 w-3.5 mr-1" />
                        Delete All
                      </>
                    )}
                  </Button>
                </div>
                {deleteSuccess && (
                  <p className="text-green-500 text-xs flex items-center mt-2">
                    <Check className="h-3.5 w-3.5 mr-1" />
                    Chat history deleted successfully!
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
