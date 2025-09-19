import { User as UserIcon } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { logoutUser } from "../../lib/auth";
import { useNavigate } from "react-router-dom";

export function UserProfile() {
  const { user, userData } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate("/auth");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  if (!user) return null;

  return (
    <div className="p-4 bg-[#1A1A1A] rounded-lg border border-[#333333] shadow-md">
      <div className="flex items-center space-x-4">
        <Avatar className="h-12 w-12 border border-[#333333]">
          {userData?.photoURL ? (
            <AvatarImage
              src={userData.photoURL}
              alt={userData.displayName || "User"}
            />
          ) : (
            <AvatarFallback className="bg-[#222222]">
              <UserIcon className="h-6 w-6" />
            </AvatarFallback>
          )}
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {userData?.displayName || userData?.email || "User"}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {userData?.email}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Sign in method: {userData?.provider || "Unknown"}
          </p>
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600"
        >
          Sign Out
        </Button>
      </div>
    </div>
  );
}
