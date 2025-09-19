import { useState, useEffect, ReactNode } from "react";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { Sidebar } from "../chat/Sidebar";
import { Header } from "../chat/Header";
import { UserProfileModal } from "../auth/UserProfileModal";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  // Load desktop sidebar state from localStorage on mount
  useEffect(() => {
    if (isDesktop) {
      const savedState = localStorage.getItem("sidebarOpen");
      if (savedState !== null) {
        setDesktopSidebarOpen(savedState === "true");
      }
    }
  }, [isDesktop]);

  const toggleMobileSidebar = () => {
    setShowMobileSidebar(!showMobileSidebar);
  };

  const toggleDesktopSidebar = () => {
    const newState = !desktopSidebarOpen;
    setDesktopSidebarOpen(newState);
    localStorage.setItem("sidebarOpen", newState.toString());
  };

  const closeProfileModal = () => {
    setShowProfileModal(false);
  };

  return (
    <div className="flex h-[100dvh] overflow-hidden">
      {/* Sidebar - different behavior for mobile vs desktop */}
      {isMobile ? (
        <Sidebar
          isMobile={true}
          isOpen={showMobileSidebar}
          onClose={toggleMobileSidebar}
          onOpenProfile={() => setShowProfileModal(true)}
        />
      ) : (
        <Sidebar
          isOpen={desktopSidebarOpen}
          onToggle={toggleDesktopSidebar}
          onOpenProfile={() => setShowProfileModal(true)}
        />
      )}

      {/* Main content area */}
      <div className="flex flex-col w-full h-full relative">
        <Header
          onOpenSidebar={isMobile ? toggleMobileSidebar : toggleDesktopSidebar}
          onOpenProfile={() => setShowProfileModal(true)}
        />
        <main className="flex-1 overflow-hidden relative">{children}</main>
      </div>

      {/* User profile modal */}
      <UserProfileModal isOpen={showProfileModal} onClose={closeProfileModal} />
    </div>
  );
}
