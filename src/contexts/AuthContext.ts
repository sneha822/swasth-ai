import { createContext } from "react";
import { User } from "firebase/auth";
import { UserData } from "../lib/auth";

export interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  isLoading: boolean;
  refreshUserData: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  isLoading: true,
  refreshUserData: async () => {},
});
