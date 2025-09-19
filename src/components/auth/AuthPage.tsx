import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const handleAuthSuccess = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#111111] p-4">
      <div className="w-full max-w-md mx-auto">
        {isLogin ? (
          <div>
            <LoginForm onLoginSuccess={handleAuthSuccess} />
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
