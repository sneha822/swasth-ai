import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleAuthSuccess = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#111111] p-4">
      <div className="w-full max-w-md mx-auto">
        {infoMessage && (
          <div className="mb-4 bg-yellow-500/10 text-yellow-500 p-3 rounded-md text-sm">
            {infoMessage}
          </div>
        )}
        {isLogin ? (
          <div>
            <LoginForm
              onLoginSuccess={handleAuthSuccess}
              onGoogleCancelled={() => setInfoMessage("Google sign cancelled")}
            />
            <div className="text-center mt-4 text-sm">
              <p>
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => setIsLogin(false)}
                  className="text-blue-500 hover:underline"
                >
                  Sign up
                </button>
              </p>
            </div>
          </div>
        ) : (
          <RegisterForm
            onRegisterSuccess={handleAuthSuccess}
            switchToLogin={() => setIsLogin(true)}
          />
        )}
      </div>
    </div>
  );
}
