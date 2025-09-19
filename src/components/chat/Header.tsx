import { Button } from "../ui/button";
import {
  Heart,
  LogOut,
  User as UserIcon,
  Menu,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { logoutUser } from "../../lib/auth";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { useNavigate } from "react-router-dom";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { useEffect } from "react";
import { HealthModeSelector } from "../health/HealthModeSelector";
import { useChatContext } from "../../hooks/useChatContext";
import { HEALTH_MODES } from "../../lib/health-modes";

interface HeaderProps {
  onOpenSidebar?: () => void;
  onOpenProfile?: () => void;
}

export function Header({
  onOpenSidebar,
  onOpenProfile,
}: HeaderProps) {
  const { user, userData, refreshUserData } = useAuth();
  const { currentHealthMode, language } = useChatContext();
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Get current mode details
  const currentMode = HEALTH_MODES[currentHealthMode];
  const currentModeName = language === 'hi' ? currentMode.nameHindi : currentMode.name;

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
    <header className="sticky top-0 z-50 bg-gradient-to-r from-[#0a1121]/95 to-[#0f1629]/95 backdrop-blur-xl border-b border-[#1e3a5f]/30 shadow-lg">
      <div className="flex h-16 items-center justify-between px-3 sm:px-6">
        <div className="flex items-center gap-2 sm:gap-4">
          {onOpenSidebar && isMobile && (
            <Button
              onClick={onOpenSidebar}
            
              className="h-9 w-9 rounded-xl p-0 bg-[#0f1629] hover:bg-[#111b2e] active:bg-[#0d1426] transition-all duration-200 flex items-center justify-center border border-[#1e3a5f]/50 ring-1 ring-[#0b1530]/40 hover:border-[#89f7fe]/50 hover:ring-[#89f7fe]/30 group"
              title={"Open Menu"}
            >
              <Menu className="h-6 w-6 sm:h-7 sm:w-7 text-gray-300 group-hover:text-[#89f7fe] transition-colors duration-200" />
            </Button>
          )}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#89f7fe] to-[#66a6ff] shadow-lg shadow-[#89f7fe]/20 ring-2 ring-[#89f7fe]/10">
              <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-white drop-shadow-sm" />
            </div>
            <div className="flex flex-col">
              <div className="font-bold text-lg sm:text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-[#89f7fe] to-white">
                Swasth AI
              </div>
              <div className="flex items-center gap-1 text-xs text-[#89f7fe]/80 font-medium">
                <span className="hidden sm:inline">{currentMode.icon}</span>
                <span className="truncate max-w-[120px] sm:max-w-none">
                  {isMobile ? currentMode.icon : currentModeName}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Health Mode Selector */}
          <HealthModeSelector />
          
          {user && (
            <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 border-l border-[#1e3a5f]/30">
              {!isMobile && (
                <div
                  className="flex items-center gap-3 px-3 py-2 rounded-xl bg-[#1e3a5f]/10 hover:bg-[#1e3a5f]/20 transition-all duration-200 cursor-pointer border border-[#1e3a5f]/20 hover:border-[#89f7fe]/30 group"
                  onClick={onOpenProfile ? onOpenProfile : undefined}
                  title={`${displayName} - Click to view profile`}
                >
                  <Avatar className="h-8 w-8 ring-2 ring-[#89f7fe]/20 group-hover:ring-[#89f7fe]/40 transition-all duration-200">
                    {userData?.photoURL ? (
                      <AvatarImage src={userData?.photoURL} alt={displayName} />
                    ) : (
                      <AvatarFallback className="bg-gradient-to-br from-[#89f7fe]/30 to-[#66a6ff]/30">
                        <UserIcon className="h-4 w-4 text-white" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-white group-hover:text-[#89f7fe] transition-colors">
                      {displayName}
                    </span>
                    <span className="text-xs text-gray-400">
                      Health Profile
                    </span>
                  </div>
                </div>
              )}

              {isMobile && (
                <div
                  onClick={onOpenProfile ? onOpenProfile : undefined}
                  className="cursor-pointer"
                  title={`${displayName} - Click to view profile`}
                >
                  <Avatar className="h-8 w-8 ring-2 ring-[#89f7fe]/20 hover:ring-[#89f7fe]/40 transition-all duration-200">
                    {userData?.photoURL ? (
                      <AvatarImage src={userData?.photoURL} alt={displayName} />
                    ) : (
                      <AvatarFallback className="bg-gradient-to-br from-[#89f7fe]/30 to-[#66a6ff]/30">
                        <UserIcon className="h-4 w-4 text-white" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                </div>
              )}

              <Button
                className="h-10 w-10 sm:h-11 sm:w-11 p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-400 hover:text-red-300 transition-all duration-200 flex items-center justify-center group"
                onClick={handleLogout}
                title="Sign out of Swasth AI"
              >
                <LogOut className="h-6 w-6 sm:h-7 sm:w-7 group-hover:scale-110 transition-transform duration-200" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
