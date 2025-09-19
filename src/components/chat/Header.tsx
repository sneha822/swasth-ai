import { Button } from "../ui/button";
import {
  Hand,
  Github,
  ExternalLink,
  LogOut,
  User as UserIcon,
  Menu,
  PanelLeft,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { logoutUser } from "../../lib/auth";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { useNavigate } from "react-router-dom";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { useEffect } from "react";

interface HeaderProps {
  onOpenSidebar?: () => void;
  onOpenProfile?: () => void;
  isDesktopSidebarOpen?: boolean;
}

export function Header({
  onOpenSidebar,
  onOpenProfile,
  isDesktopSidebarOpen = true,
}: HeaderProps) {
  const { user, userData, refreshUserData } = useAuth();
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  // Force refresh of user data once on mount to ensure we have the latest data
  useEffect(() => {
    if (user) {
      refreshUserData();
    }
  }, [refreshUserData, user]);

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate("/auth");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // Get display name from the user data
  const displayName =
    userData?.displayName || user?.email?.split("@")[0] || "User";

  return (
    <header className="sticky top-0 z-50 bg-[#121212]/90 backdrop-blur-xl border-b border-[#333]/20">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          {(isMobile || isDesktop) && onOpenSidebar && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onOpenSidebar}
              className="hover:bg-[#333333]/20 transition-colors rounded-xl"
              title={
                isDesktop
                  ? isDesktopSidebarOpen
                    ? "Hide sidebar"
                    : "Show sidebar"
                  : "Menu"
              }
            >
              {isDesktop ? (
                <PanelLeft
                  className={`h-5 w-5 transition-transform duration-200 ${
                    isDesktopSidebarOpen ? "" : "transform rotate-180"
                  }`}
                />
              ) : (
                <Menu className="h-5 w-5" />
              )}
              <span className="sr-only">
                {isDesktop ? "Toggle sidebar" : "Menu"}
              </span>
            </Button>
          )}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#e67553] to-[#d86a4a] shadow-lg shadow-[#e67553]/10">
              <Hand className="h-5 w-5 text-white" />
            </div>
            <div className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300/90">
              Swasth AI
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Desktop-only links */}
          {!isMobile && (
            <div className="flex items-center gap-4 mr-2">
              <a
                href="https://github.com/itskrish01"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                aria-label="Github Profile"
              >
                <Github className="h-4 w-4" />
                <span className="hidden sm:inline font-medium">GitHub</span>
              </a>
              <a
                href="https://krishtasood.in"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                aria-label="Portfolio Website"
              >
                <ExternalLink className="h-4 w-4" />
                <span className="hidden sm:inline font-medium">Portfolio</span>
              </a>
             
            </div>
          )}

          {user && (
            <div className="flex items-center gap-2 pl-2 border-l border-[#333]/40">
              <div
                className="flex items-center gap-2 px-2 py-2 rounded-full bg-[#222]/70 hover:bg-[#333]/30 transition-colors cursor-pointer"
                onClick={onOpenProfile ? onOpenProfile : undefined}
                title={displayName}
              >
                <Avatar className="h-8 w-8 ring-2 ring-[#444]/30">
                  {userData?.photoURL ? (
                    <AvatarImage src={userData?.photoURL} alt={displayName} />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-[#e67553]/50 to-[#d86a4a]/50">
                      <UserIcon className="h-4 w-4 text-white" />
                    </AvatarFallback>
                  )}
                </Avatar>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-xl bg-[#222]/50 hover:bg-red-600/10 hover:text-red-400 transition-colors"
                onClick={handleLogout}
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
                <span className="sr-only">Log Out</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
