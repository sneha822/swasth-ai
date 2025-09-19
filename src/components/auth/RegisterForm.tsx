import { useState } from "react";
import { registerWithEmail, loginWithGoogle } from "../../lib/auth";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { FirebaseError } from "firebase/app";

interface RegisterFormProps {
  onRegisterSuccess: () => void;
  switchToLogin: () => void;
}

export function RegisterForm({
  onRegisterSuccess,
  switchToLogin,
}: RegisterFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await registerWithEmail(email, password);
      onRegisterSuccess();
    } catch (err) {
      if (err instanceof FirebaseError) {
        if (err.code === "auth/email-already-in-use") {
          setError("Email is already in use. Please try logging in.");
        } else if (err.code === "auth/weak-password") {
          setError("Password is too weak. It should be at least 6 characters.");
        } else {
          setError("An error occurred during registration");
        }
      } else {
        setError("An error occurred during registration");
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setIsLoading(true);
    setError(null);

    try {
      await loginWithGoogle();
      onRegisterSuccess();
    } catch (err) {
      setError("Error signing in with Google");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md space-y-6 p-8 bg-[#1A1A1A] rounded-lg border border-[#333333] shadow-md">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Create an Account</h2>
        <p className="text-muted-foreground mt-2">Sign up to get started</p>
      </div>

      {error && (
        <div className="bg-red-500/10 text-red-500 p-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            required
            disabled={isLoading}
            className="bg-[#222222] border-[#333333]"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            disabled={isLoading}
            className="bg-[#222222] border-[#333333]"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="text-sm font-medium">
            Confirm Password
          </label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            required
            disabled={isLoading}
            className="bg-[#222222] border-[#333333]"
          />
        </div>

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Creating account..." : "Create Account"}
        </Button>
      </form>

      <div className="relative flex items-center justify-center">
        <hr className="w-full border-[#333333]" />
        <span className="absolute bg-[#1A1A1A] px-2 text-xs text-muted-foreground">
          OR
        </span>
      </div>

      <Button
        type="button"
        variant="outline"
        disabled={isLoading}
        onClick={handleGoogleLogin}
        className="w-full border-[#333333] hover:bg-[#222222]"
      >
        <svg
          className="mr-2 h-4 w-4"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Sign up with Google
      </Button>

      <div className="text-center text-sm">
        <p>
          Already have an account?{" "}
          <button
            type="button"
            onClick={switchToLogin}
            className="text-blue-500 hover:underline"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}
