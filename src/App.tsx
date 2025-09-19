import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { ChatLayout } from "./components/chat/ChatLayout";
import { AuthPage } from "./components/auth/AuthPage";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { MessageProvider } from "./hooks/useMessageContext";
import { ChatProvider } from "./hooks/useChatContext";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <MessageProvider>
          <ChatProvider>
            <Routes>
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Navigate to="/new" replace />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/new"
                element={
                  <ProtectedRoute>
                    <ChatLayout />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/chat/:conversationId"
                element={
                  <ProtectedRoute>
                    <ChatLayout />
                  </ProtectedRoute>
                }
              />
              <Route path="/auth" element={<AuthPage />} />
            </Routes>
          </ChatProvider>
        </MessageProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
