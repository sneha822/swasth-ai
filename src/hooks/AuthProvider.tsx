import {
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useRef,
} from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../lib/firebase";
import { UserData, getUserData } from "../lib/auth";
import { AuthContext } from "../contexts/AuthContext";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Add cache timeout to prevent excessive calls
  const lastFetchRef = useRef<number>(0);
  const cacheTimeoutMs = 60000; // 1 minute cache

  const fetchUserData = useCallback(
    async (uid: string, force = false) => {
      try {
        const now = Date.now();
        // Skip fetching if we've fetched recently, unless force=true
        if (
          !force &&
          lastFetchRef.current > 0 &&
          now - lastFetchRef.current < cacheTimeoutMs
        ) {
          console.log("Using cached user data");
          return userData;
        }

        console.log("Fetching fresh user data");
        const userDataFromFirestore = await getUserData(uid);
        if (userDataFromFirestore) {
          setUserData(userDataFromFirestore);
          lastFetchRef.current = now;
        }
        return userDataFromFirestore;
      } catch (error) {
        console.error("Error fetching user data:", error);
        return null;
      }
    },
    [userData]
  );

  const refreshUserData = useCallback(async () => {
    if (user) {
      await fetchUserData(user.uid, true); // force refresh
    }
  }, [user, fetchUserData]);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (!isMounted) return;

      if (authUser) {
        setUser(authUser);
        // Fetch additional user data from Firestore
        await fetchUserData(authUser.uid);
      } else {
        setUser(null);
        setUserData(null);
      }
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [fetchUserData]);

  return (
    <AuthContext.Provider
      value={{ user, userData, isLoading, refreshUserData }}
    >
      {children}
    </AuthContext.Provider>
  );
}
